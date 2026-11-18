import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GitHubService } from './server/github.js';
import { StaticAnalyzer } from './server/staticAnalyzer.js';
import { GeminiService } from './server/gemini.js';
import { MemoryCache } from './server/cache.js';
import {
  PRELOADED_EXPRESS_ANALYSIS,
  PRELOADED_FLASK_ANALYSIS,
  PRELOADED_FASTIFY_ANALYSIS,
  SAMPLE_REPOS_LIST,
} from './server/samples.js';
import { CodebaseAnalysisResult, FileNode, FileRole } from './src/types/index.js';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.use(express.json({ limit: '15mb' }));

const github = new GitHubService();
const gemini = new GeminiService();

// Bounded in-memory cache with TTL (2 hours) & size limits (max 25 entries)
const analysisCache = new MemoryCache<CodebaseAnalysisResult>(25, 2 * 60 * 60 * 1000);
const fileContentCache = new MemoryCache<Map<string, string>>(25, 2 * 60 * 60 * 1000);

function sanitizeErrorMessage(rawMsg: string): string {
  if (!rawMsg || typeof rawMsg !== 'string') return 'An unexpected error occurred.';
  // Strip API tokens, keys, and internal secrets
  let safe = rawMsg.replace(/AIza[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_API_KEY]');
  safe = safe.replace(/AQ\.[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_API_KEY]');
  safe = safe.replace(/token\s+[a-zA-Z0-9_\-]+/gi, 'token [REDACTED]');
  safe = safe.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]');
  return safe;
}

function seedSampleIntoCache(key: string, data: CodebaseAnalysisResult) {
  analysisCache.set(key, data);
  const fileMap = new Map<string, string>();
  for (const [p, file] of Object.entries(data.analyzedFiles)) {
    if (file.rawCode) fileMap.set(p, file.rawCode);
  }
  fileContentCache.set(key, fileMap);
}

// Seed all samples into cache
seedSampleIntoCache('expressjs/express', PRELOADED_EXPRESS_ANALYSIS);
seedSampleIntoCache('pallets/flask', PRELOADED_FLASK_ANALYSIS);
seedSampleIntoCache('fastify/fastify', PRELOADED_FASTIFY_ANALYSIS);

// Helper: build nested tree from flat list of GitHub tree blobs
function buildFileTree(
  items: { path: string; type: 'blob' | 'tree'; size?: number }[],
  analyzedMap: Record<string, FileRole>
): FileNode {
  const root: FileNode = { path: '', name: 'root', type: 'tree', children: [] };

  for (const item of items) {
    const parts = item.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1 && item.type === 'blob';
      const curPath = parts.slice(0, i + 1).join('/');

      if (!current.children) current.children = [];
      let existing = current.children.find(c => c.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: curPath,
          type: isFile ? 'blob' : 'tree',
          size: isFile ? item.size : undefined,
          isAnalyzed: isFile ? Boolean(analyzedMap[curPath]) : false,
          role: isFile ? analyzedMap[curPath] : undefined,
          children: isFile ? undefined : [],
        };
        current.children.push(existing);
      }
      current = existing;
    }
  }

  // Recursive sort: directories first, then alphabetical
  const sortNodes = (node: FileNode) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'tree' ? -1 : 1;
      });
      node.children.forEach(sortNodes);
    }
  };
  sortNodes(root);

  return root;
}

// GET /api/models - Returns all available Gemini API models (live API + full catalog)
app.get('/api/models', async (_req, res) => {
  try {
    const models = await gemini.listAvailableModels();
    res.json({
      defaultModel: gemini.getModel(),
      models,
    });
  } catch (err: any) {
    console.warn('[CodeAtlas AI] Failed to list models:', err?.message);
    res.json({
      defaultModel: gemini.getModel(),
      models: [],
    });
  }
});

// GET /api/samples
app.get('/api/samples', (_req, res) => {
  res.json(SAMPLE_REPOS_LIST);
});

// POST /api/load-sample
app.post('/api/load-sample', (req, res) => {
  const { id } = req.body;
  const cleanId = String(id || '').toLowerCase();
  if (cleanId === 'flask' || cleanId.includes('flask')) {
    return res.json(PRELOADED_FLASK_ANALYSIS);
  }
  if (cleanId === 'fastify' || cleanId.includes('fastify')) {
    return res.json(PRELOADED_FASTIFY_ANALYSIS);
  }
  return res.json(PRELOADED_EXPRESS_ANALYSIS);
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  try {
    const { url, githubToken, geminiApiKey, geminiModel, maxFiles } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'GitHub repository URL is required.' });
    }

    const ghService = githubToken ? new GitHubService(githubToken) : github;
    const { owner, repo } = ghService.parseRepoUrl(url);
    const cacheKey = `${owner}/${repo}`.toLowerCase();
    const targetMaxFiles = Math.max(10, Math.min(Number(maxFiles) || 40, 80));

    // 1. Fetch metadata & default branch from GitHub (always live)
    const repoData = await ghService.getRepoDetails(owner, repo);
    const defaultBranch = repoData.default_branch || 'main';

    // 2. Fetch recursive file tree & commit SHA in parallel
    const [rawTree, latestCommitSha] = await Promise.all([
      ghService.getRepoTree(owner, repo, defaultBranch),
      ghService.getLatestCommitSha(owner, repo, defaultBranch),
    ]);

    // 3. Filter and select the most crucial files for architectural analysis
    const { selected, skipped } = ghService.filterImportantFiles(rawTree, targetMaxFiles);

    // 4. Retrieve actual source code for selected files
    const repoFilesMap = new Map<string, string>();
    const staticMap: Record<string, ReturnType<typeof StaticAnalyzer.analyzeFile>> = {};
    const filesForGemini: {
      path: string;
      content: string;
      role: FileRole;
      staticFunctions: { name: string; signature?: string }[];
      imports: string[];
    }[] = [];

    await Promise.all(
      selected.map(async file => {
        try {
          const content = await ghService.fetchRawContent(owner, repo, defaultBranch, file.path);
          repoFilesMap.set(file.path, content);
          const staticInfo = StaticAnalyzer.analyzeFile(file.path, content);
          staticMap[file.path] = staticInfo;

          filesForGemini.push({
            path: file.path,
            content,
            role: staticInfo.role,
            staticFunctions: staticInfo.functions,
            imports: staticInfo.imports,
          });
        } catch (fetchErr) {
          console.warn(`[CodeAtlas AI] Could not fetch ${file.path}:`, fetchErr);
        }
      })
    );

    fileContentCache.set(cacheKey, repoFilesMap);

    // 5. Build static dependency matrix & circular dependency analysis
    const filePaths = selected.map(s => s.path);
    const { dependencies, circularDependencies } = StaticAnalyzer.buildDependencyMatrix(
      filePaths,
      staticMap
    );

    // 6. Gemini Codebase Architecture Synthesis
    const aiResult = await gemini.analyzeCodebase(`${owner}/${repo}`, filesForGemini, {
      apiKey: geminiApiKey,
      model: geminiModel,
    });

    // 7. Consolidate file analysis records
    const analyzedFiles: Record<string, any> = {};
    const analyzedRolesMap: Record<string, FileRole> = {};

    for (const file of selected) {
      const st = staticMap[file.path];
      const aiExp = aiResult.fileExplanations[file.path] || {};
      const importedByList = dependencies
        .filter(l => l.to === file.path)
        .map(l => l.from);

      const role = st?.role || 'other';
      analyzedRolesMap[file.path] = role;

      analyzedFiles[file.path] = {
        path: file.path,
        name: file.path.split('/').pop() || file.path,
        extension: file.path.split('.').pop() || '',
        purpose:
          aiExp.purpose ||
          `Module serving as ${role} containing ${st?.functions.length || 0} discovered symbols.`,
        responsibilities: aiExp.responsibilities || [
          `Implements application logic for ${file.path}`,
          `Provides ${st?.functions.length || 0} functions and methods`,
        ],
        keyFunctions: aiExp.keyFunctions || st?.functions || [],
        imports: st?.imports || [],
        importedBy: importedByList,
        role,
        rawCode: repoFilesMap.get(file.path) || '',
        inputOutput: aiExp.inputOutput || {
          input: 'Function parameters and incoming request/arguments',
          output: 'Processed result, exports, or dispatched event',
        },
        lineCount: st?.lineCount || 0,
      };
    }

    // 8. Build nested file tree
    const fileTree = buildFileTree(rawTree, analyzedRolesMap);

    // 9. Real language distribution from repository file tree
    const detectedLanguages = ghService.calculateLanguageDistribution(rawTree, repoData.language);

    // 10. Detect primary framework / tech stack
    let primaryFramework = repoData.language || 'Standard Library';
    const pkgJson = repoFilesMap.get('package.json');
    if (pkgJson) {
      try {
        const pkg = JSON.parse(pkgJson);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.react) primaryFramework = 'React Application';
        else if (deps.next) primaryFramework = 'Next.js App';
        else if (deps.express) primaryFramework = 'Express.js Backend';
        else if (deps.vue) primaryFramework = 'Vue.js Application';
        else if (deps.fastify) primaryFramework = 'Fastify Backend';
        else primaryFramework = 'Node.js Package';
      } catch {
        // ignore
      }
    } else if (repoFilesMap.has('requirements.txt') || repoFilesMap.has('pyproject.toml')) {
      primaryFramework = 'Python Application';
    } else if (repoFilesMap.has('go.mod')) {
      primaryFramework = 'Go Service';
    } else if (repoFilesMap.has('Cargo.toml')) {
      primaryFramework = 'Rust Crate';
    }

    const fullResult: CodebaseAnalysisResult = {
      metadata: {
        owner,
        repo,
        fullName: repoData.full_name,
        description: repoData.description || 'No description provided.',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        defaultBranch,
        license: repoData.license?.spdx_id || repoData.license?.name,
        detectedLanguages,
        primaryFramework,
        totalFiles: rawTree.filter(t => t.type === 'blob').length,
        analyzedFilesCount: selected.length,
        commitSha: latestCommitSha || rawTree[0]?.sha,
        repoUrl: `https://github.com/${owner}/${repo}`,
      },
      fileTree,
      analyzedFiles,
      mindMap: aiResult.mindMap,
      executionFlows: aiResult.executionFlows,
      dependencies,
      architectureSummary: aiResult.architectureSummary,
      skippedFiles: skipped,
      circularDependencies,
      source: 'live',
    };

    analysisCache.set(cacheKey, fullResult);
    res.json(fullResult);
  } catch (err: any) {
    const safeMsg = sanitizeErrorMessage(err?.message || 'An unexpected error occurred.');
    console.error('[CodeAtlas AI] Analysis error:', safeMsg);

    let statusCode = 500;
    if (safeMsg.includes('was not found or is private')) statusCode = 404;
    else if (safeMsg.includes('rate limit exceeded')) statusCode = 429;
    else if (safeMsg.includes('appears to be empty') || safeMsg.includes('Invalid GitHub repository URL')) statusCode = 400;

    res.status(statusCode).json({ error: safeMsg });
  }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { owner, repo, question, geminiApiKey, geminiModel } = req.body;
    if (!owner || !repo || !question) {
      return res.status(400).json({ error: 'owner, repo, and question are required.' });
    }

    const cacheKey = `${owner}/${repo}`.toLowerCase();
    const cachedAnalysis = analysisCache.get(cacheKey);
    const cachedContents = fileContentCache.get(cacheKey);

    if (!cachedAnalysis || !cachedContents) {
      return res.status(404).json({
        error: 'Repository analysis not found in cache. Please click "Analyze Repo" first.',
      });
    }

    // Keyword-based Code Context Retrieval
    const qTokens = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    const ranked = Object.values(cachedAnalysis.analyzedFiles).map(file => {
      let score = 0;
      const pathLower = file.path.toLowerCase();
      const nameLower = file.name.toLowerCase();

      for (const token of qTokens) {
        if (pathLower.includes(token)) score += 35;
        if (nameLower.includes(token)) score += 40;
        if (file.role && file.role.toLowerCase().includes(token)) score += 25;
        if (file.purpose && file.purpose.toLowerCase().includes(token)) score += 15;
        for (const fn of file.keyFunctions) {
          if (fn.name.toLowerCase().includes(token)) score += 30;
        }
      }

      if (file.role === 'entry') score += 10;
      return { file, score };
    });

    ranked.sort((a, b) => b.score - a.score);
    const topFiles = ranked.filter(r => r.score > 0).slice(0, 4).map(r => r.file);
    const contextFiles = (
      topFiles.length > 0 ? topFiles : Object.values(cachedAnalysis.analyzedFiles).slice(0, 3)
    ).map(f => ({
      path: f.path,
      content: cachedContents.get(f.path) || f.rawCode || '',
      purpose: f.purpose,
      role: f.role,
    }));

    const result = await gemini.answerQuestion(question, contextFiles, cachedAnalysis.metadata, {
      apiKey: geminiApiKey,
      model: geminiModel,
    });
    res.json(result);
  } catch (err: any) {
    const safeMsg = sanitizeErrorMessage(err?.message || 'Failed to generate assistant response.');
    console.error('[CodeAtlas AI] Chat error:', safeMsg);
    res.status(500).json({ error: safeMsg });
  }
});

// Setup Vite dev server or static prod serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CodeAtlas AI] Server actively listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
