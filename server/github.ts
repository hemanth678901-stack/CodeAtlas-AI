export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  'target',
  'bin',
  'obj',
  'tmp',
  '.idea',
  '.vscode',
  'assets/vendor',
]);

const IGNORED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'ico',
  'webp',
  'pdf',
  'zip',
  'tar',
  'gz',
  '7z',
  'rar',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'mp4',
  'mov',
  'mp3',
  'wav',
  'exe',
  'dll',
  'so',
  'dylib',
  'lock',
  'map',
  'min.js',
  'min.css',
  'sqlite',
  'db',
]);

const MAX_FILE_SIZE_BYTES = 100_000; // ~100KB per file
export const DEFAULT_MAX_ANALYZED_FILES = 40;

export class GitHubService {
  private token?: string;

  constructor(token?: string) {
    this.token = GitHubService.normalizeToken(
      token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN
    );
  }

  public static normalizeToken(rawToken?: string): string | undefined {
    if (!rawToken || typeof rawToken !== 'string') return undefined;
    let cleaned = rawToken.trim().replace(/^["']|["']$/g, '').trim();
    cleaned = cleaned.replace(/^(Bearer|token)\s+/i, '').trim();
    if (
      !cleaned ||
      cleaned.toLowerCase() === 'your-github-token' ||
      cleaned.toLowerCase() === 'ghp_xxxxxxxxxxxxxxxxxxxx'
    ) {
      return undefined;
    }
    return cleaned;
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeAtlas-AI-Analyzer',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      headers['Cache-Control'] = 'no-cache, no-store';
      headers.Pragma = 'no-cache';
    }
    return headers;
  }

  public parseRepoUrl(urlStr: string): { owner: string; repo: string } {
    try {
      let clean = urlStr.trim();
      // Remove trailing slash and .git
      clean = clean.replace(/\.git\/?$/, '').replace(/\/+$/, '');

      // Handle raw "owner/repo"
      if (!clean.includes('://') && clean.split('/').length === 2 && !clean.includes('github.com')) {
        const parts = clean.split('/');
        return { owner: parts[0], repo: parts[1] };
      }

      // If user pasted without protocol
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }

      const parsed = new URL(clean);
      if (!parsed.hostname.includes('github.com')) {
        throw new Error('Only GitHub repositories are currently supported (e.g., github.com/owner/repo)');
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        throw new Error('Please enter both owner and repository name (e.g. github.com/owner/repo)');
      }

      const owner = pathParts[0];
      const repo = pathParts[1];

      return { owner, repo };
    } catch (err: any) {
      throw new Error(err.message || 'Invalid GitHub repository URL.');
    }
  }

  public async getRepoDetails(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          'GitHub authentication failed (401 Bad credentials). Your GitHub token may be stale, expired, or malformed — please update or clear it in Settings.'
        );
      }
      if (res.status === 404) {
        throw new Error(
          `Repository "${owner}/${repo}" was not found or is private. If this is a private repository, please provide a GitHub Personal Access Token in Settings.`
        );
      }
      if (res.status === 403) {
        const scopes = res.headers.get('x-oauth-scopes');
        if (this.token && scopes !== null && !scopes.includes('repo') && !scopes.includes('public_repo')) {
          throw new Error(
            `GitHub token lacks required "public_repo" or "repo" scope permissions (detected: "${scopes || 'none'}").`
          );
        }
        const rateLimitReset = res.headers.get('x-ratelimit-reset');
        let resetMinutes = 60;
        if (rateLimitReset) {
          const resetMs = Number(rateLimitReset) * 1000;
          if (!Number.isNaN(resetMs) && resetMs > Date.now()) {
            resetMinutes = Math.max(1, Math.ceil((resetMs - Date.now()) / 60000));
          }
        }
        throw new Error(
          `GitHub API rate limit exceeded (resets in ~${resetMinutes} min). Add your personal access token in Settings to increase limit to 5,000 requests/hour.`
        );
      }
      throw new Error(`GitHub API error: ${res.statusText} (${res.status})`);
    }

    return await res.json();
  }

  public async getRepoTree(owner: string, repo: string, defaultBranch: string): Promise<GitHubTreeItem[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const res = await fetch(url, { headers: this.headers });

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error(`The repository "${owner}/${repo}" appears to be empty or has no commits on the default branch.`);
      }
      if (res.status === 404) {
        throw new Error(`Default branch "${defaultBranch}" was not found in repository "${owner}/${repo}".`);
      }
      throw new Error(`Failed to retrieve file tree: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      throw new Error('Unexpected GitHub tree response format.');
    }

    return data.tree as GitHubTreeItem[];
  }

  public filterImportantFiles(
    tree: GitHubTreeItem[],
    maxFiles = DEFAULT_MAX_ANALYZED_FILES
  ): { selected: GitHubTreeItem[]; skipped: string[] } {
    const validBlobs = tree.filter(item => {
      if (item.type !== 'blob') return false;
      const parts = item.path.split('/');

      // Ignore standard build, test, and package folders
      if (parts.some(p => IGNORED_DIRECTORIES.has(p))) return false;

      const ext = item.path.split('.').pop()?.toLowerCase() || '';
      if (IGNORED_EXTENSIONS.has(ext)) return false;

      const fileName = parts[parts.length - 1].toLowerCase();
      if (
        fileName === 'package-lock.json' ||
        fileName === 'yarn.lock' ||
        fileName === 'pnpm-lock.yaml' ||
        fileName === 'cargo.lock' ||
        fileName === 'poetry.lock' ||
        fileName === 'composer.lock'
      ) {
        return false;
      }

      if (item.size && item.size > MAX_FILE_SIZE_BYTES) return false;

      return true;
    });

    // Intelligent heuristic weighting for repository source modules
    const scoreItem = (item: GitHubTreeItem): number => {
      const p = item.path.toLowerCase();
      const parts = p.split('/');
      let score = 10;

      // Configuration & manifest files
      if (
        p.endsWith('package.json') ||
        p.endsWith('cargo.toml') ||
        p.endsWith('requirements.txt') ||
        p.endsWith('pyproject.toml') ||
        p.endsWith('go.mod') ||
        p.endsWith('pom.xml') ||
        p.endsWith('build.gradle')
      ) {
        score += 120;
      }

      // Primary entry points
      if (
        p.endsWith('index.ts') ||
        p.endsWith('index.js') ||
        p.endsWith('main.ts') ||
        p.endsWith('main.js') ||
        p.endsWith('app.ts') ||
        p.endsWith('app.js') ||
        p.endsWith('server.ts') ||
        p.endsWith('server.js') ||
        p.endsWith('main.py') ||
        p.endsWith('app.py') ||
        p.endsWith('main.go') ||
        p.endsWith('main.rs') ||
        p.endsWith('src/app.tsx') ||
        p.endsWith('src/main.tsx')
      ) {
        score += 100;
      }

      // Architecture layers
      if (p.includes('/routes/') || p.includes('/router') || p.includes('/controllers/')) score += 60;
      if (p.includes('/services/') || p.includes('/handlers/') || p.includes('/api/')) score += 55;
      if (p.includes('/models/') || p.includes('/schema') || p.includes('/db/')) score += 50;
      if (p.includes('/middleware/') || p.includes('/auth/')) score += 45;
      if (p.includes('/components/') || p.includes('/views/')) score += 40;
      if (p.includes('/utils/') || p.includes('/lib/')) score += 30;

      // Penalize deep nesting
      score -= Math.min(parts.length * 5, 30);

      return score;
    };

    const sorted = [...validBlobs].sort((a, b) => scoreItem(b) - scoreItem(a));
    const limit = Math.max(5, Math.min(maxFiles, 100));
    const selected = sorted.slice(0, limit);
    const skipped = sorted.slice(limit).map(f => f.path);

    return { selected, skipped };
  }

  public async getLatestCommitSha(owner: string, repo: string, defaultBranch: string): Promise<string | undefined> {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${defaultBranch}`, {
        headers: this.headers,
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return typeof data.sha === 'string' ? data.sha : undefined;
    } catch {
      return undefined;
    }
  }

  public calculateLanguageDistribution(
    tree: GitHubTreeItem[],
    primaryLanguage?: string
  ): Record<string, number> {
    const extMap: Record<string, string> = {
      ts: 'TypeScript',
      tsx: 'TypeScript',
      js: 'JavaScript',
      jsx: 'JavaScript',
      mjs: 'JavaScript',
      cjs: 'JavaScript',
      py: 'Python',
      go: 'Go',
      rs: 'Rust',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      cs: 'C#',
      php: 'PHP',
      rb: 'Ruby',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      sql: 'SQL',
      sh: 'Shell',
      bash: 'Shell',
    };

    const counts: Record<string, number> = {};
    let totalIdentified = 0;

    for (const item of tree) {
      if (item.type !== 'blob') continue;
      const ext = item.path.split('.').pop()?.toLowerCase() || '';
      const lang = extMap[ext];
      if (lang) {
        counts[lang] = (counts[lang] || 0) + (item.size || 1);
        totalIdentified += item.size || 1;
      }
    }

    if (totalIdentified === 0) {
      return { [primaryLanguage || 'Code']: 100 };
    }

    const percentages: Record<string, number> = {};
    for (const [lang, size] of Object.entries(counts)) {
      const pct = Math.round((size / totalIdentified) * 100);
      if (pct > 0) percentages[lang] = pct;
    }

    if (Object.keys(percentages).length === 0) {
      return { [primaryLanguage || 'Code']: 100 };
    }

    return percentages;
  }

  public async fetchRawContent(owner: string, repo: string, branch: string, path: string): Promise<string> {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      headers['Cache-Control'] = 'no-cache, no-store';
    }

    const res = await fetch(rawUrl, { headers });
    if (!res.ok) {
      throw new Error(`Failed to load ${path}: ${res.statusText}`);
    }

    return await res.text();
  }
}
