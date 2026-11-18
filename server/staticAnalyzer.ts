import { ExtractedFunction, FileRole } from '../src/types/index.js';

export interface StaticAnalysisItem {
  path: string;
  imports: string[];
  functions: ExtractedFunction[];
  role: FileRole;
  lineCount: number;
}

export class StaticAnalyzer {
  public static analyzeFile(path: string, content: string): StaticAnalysisItem {
    const lines = content.split('\n');
    const lineCount = lines.length;
    const imports = this.extractImports(content, path);
    const functions = this.extractFunctions(lines, path);
    const role = this.determineRole(path, content);

    return { path, imports, functions, role, lineCount };
  }

  public static extractImports(code: string, filePath: string): string[] {
    const results = new Set<string>();
    const ext = filePath.split('.').pop()?.toLowerCase() || '';

    // JavaScript / TypeScript ES6 imports: import ... from '...'; import '...'
    if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
      const es6Regex = /import\s+(?:[\w*\s{},$]+\s+from\s+)?['"]([^'"]+)['"]/g;
      let match: RegExpExecArray | null;
      while ((match = es6Regex.exec(code)) !== null) {
        if (match[1]) results.add(match[1]);
      }

      // CommonJS require
      const cjsRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = cjsRegex.exec(code)) !== null) {
        if (match[1]) results.add(match[1]);
      }

      // Dynamic import
      const dynRegex = /import\(['"]([^'"]+)['"]\)/g;
      while ((match = dynRegex.exec(code)) !== null) {
        if (match[1]) results.add(match[1]);
      }
    }

    // Python imports
    if (['py'].includes(ext)) {
      const pyRegex1 = /(?:from\s+([a-zA-Z0-9_.]+)\s+import)/g;
      const pyRegex2 = /(?:^|\n)\s*import\s+([a-zA-Z0-9_., ]+)/g;
      let match: RegExpExecArray | null;
      while ((match = pyRegex1.exec(code)) !== null) {
        if (match[1]) results.add(match[1]);
      }
      while ((match = pyRegex2.exec(code)) !== null) {
        if (match[1]) {
          match[1].split(',').forEach(sub => {
            const trimmed = sub.trim().split(/\s+as\s+/)[0];
            if (trimmed) results.add(trimmed);
          });
        }
      }
    }

    // Go imports
    if (['go'].includes(ext)) {
      const goImportRegex = /import\s+\(\s*([^)]+)\s*\)|import\s+"([^"]+)"/g;
      let match: RegExpExecArray | null;
      while ((match = goImportRegex.exec(code)) !== null) {
        if (match[2]) {
          results.add(match[2]);
        } else if (match[1]) {
          const innerLines = match[1].split('\n');
          for (const line of innerLines) {
            const m = /"([^"]+)"/.exec(line);
            if (m && m[1]) results.add(m[1]);
          }
        }
      }
    }

    // Rust use statements
    if (['rs'].includes(ext)) {
      const rustRegex = /use\s+([a-zA-Z0-9_:]+)/g;
      let match: RegExpExecArray | null;
      while ((match = rustRegex.exec(code)) !== null) {
        if (match[1]) results.add(match[1]);
      }
    }

    return Array.from(results);
  }

  public static extractFunctions(lines: string[], filePath: string): ExtractedFunction[] {
    const list: ExtractedFunction[] = [];
    const ext = filePath.split('.').pop()?.toLowerCase() || '';

    // Standard function declaration: function foo(...)
    const fnRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/;
    // Arrow function or expression: const foo = async (...) =>
    const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/;
    // Class method or object method
    const methodRegex = /^\s*(?:async\s+|public\s+|private\s+|protected\s+|static\s+)*([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*(?::\s*[^;{]+)?\s*\{/;
    // Class definition
    const classRegex = /class\s+([a-zA-Z0-9_$]+)/;

    // Python def & class
    const pyDefRegex = /^\s*def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/;
    const pyClassRegex = /^\s*class\s+([a-zA-Z0-9_]+)/;

    // Go func
    const goFuncRegex = /^func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\s*\(/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
        let match = fnRegex.exec(trimmed);
        if (match && match[1] && !this.isReservedKeyword(match[1])) {
          list.push({
            name: match[1],
            signature: `${match[1]}(${match[2] || ''})`,
            startLine: i + 1,
          });
          continue;
        }

        match = arrowRegex.exec(trimmed);
        if (match && match[1] && !this.isReservedKeyword(match[1])) {
          list.push({
            name: match[1],
            signature: `${match[1]}()`,
            startLine: i + 1,
          });
          continue;
        }

        match = classRegex.exec(trimmed);
        if (match && match[1]) {
          list.push({
            name: `class ${match[1]}`,
            signature: `class ${match[1]}`,
            startLine: i + 1,
          });
          continue;
        }

        match = methodRegex.exec(line);
        if (match && match[1] && !this.isReservedKeyword(match[1])) {
          list.push({
            name: match[1],
            signature: `${match[1]}(${match[2] || ''})`,
            startLine: i + 1,
          });
          continue;
        }
      } else if (ext === 'py') {
        let match = pyDefRegex.exec(line);
        if (match && match[1]) {
          list.push({
            name: match[1],
            signature: `def ${match[1]}(${match[2] || ''})`,
            startLine: i + 1,
          });
          continue;
        }
        match = pyClassRegex.exec(line);
        if (match && match[1]) {
          list.push({
            name: `class ${match[1]}`,
            signature: `class ${match[1]}`,
            startLine: i + 1,
          });
          continue;
        }
      } else if (ext === 'go') {
        const match = goFuncRegex.exec(line);
        if (match && match[1]) {
          list.push({
            name: match[1],
            signature: `func ${match[1]}()`,
            startLine: i + 1,
          });
          continue;
        }
      }
    }

    return list.slice(0, 15);
  }

  private static isReservedKeyword(word: string): boolean {
    return [
      'if',
      'else',
      'for',
      'while',
      'do',
      'switch',
      'case',
      'catch',
      'finally',
      'return',
      'try',
      'throw',
      'typeof',
      'instanceof',
      'void',
      'delete',
      'in',
      'of',
      'yield',
      'await',
      'async',
      'import',
      'export',
      'default',
      'function',
      'class',
      'const',
      'let',
      'var',
      'new',
      'this',
      'super',
      'debugger',
      'describe',
      'it',
      'test',
      'expect',
      'constructor',
      'def',
      'elif',
      'except',
      'pass',
      'lambda',
      'with',
      'from',
    ].includes(word);
  }

  public static determineRole(path: string, content: string): FileRole {
    const p = path.toLowerCase();
    const fileName = p.split('/').pop() || '';

    // Entry points
    if (
      fileName.startsWith('index.') ||
      fileName.startsWith('main.') ||
      fileName.startsWith('app.') ||
      fileName.startsWith('server.') ||
      p.endsWith('src/main.tsx') ||
      p.endsWith('src/app.tsx')
    ) {
      return 'entry';
    }

    // Config files
    if (
      p.endsWith('package.json') ||
      p.endsWith('tsconfig.json') ||
      p.endsWith('vite.config.ts') ||
      p.endsWith('vite.config.js') ||
      p.endsWith('webpack.config.js') ||
      p.endsWith('cargo.toml') ||
      p.endsWith('requirements.txt') ||
      p.endsWith('dockerfile') ||
      p.endsWith('.env.example') ||
      p.includes('/config/')
    ) {
      return 'config';
    }

    // Middleware
    if (p.includes('/middleware') || p.includes('/middlewares') || fileName.includes('middleware')) {
      return 'middleware';
    }

    // Routes / API Controllers
    if (p.includes('/routes/') || p.includes('/router') || fileName.includes('route')) {
      return 'route';
    }
    if (p.includes('/controllers/') || fileName.includes('controller') || fileName.includes('handler')) {
      return 'controller';
    }

    // Services
    if (p.includes('/services/') || fileName.includes('service') || p.includes('/providers/')) {
      return 'service';
    }

    // Models & DB Schema
    if (
      p.includes('/models/') ||
      p.includes('/entities/') ||
      p.includes('/schema') ||
      p.includes('/db/') ||
      fileName.includes('schema') ||
      fileName.includes('model')
    ) {
      return 'model';
    }

    // UI Components
    if (
      p.includes('/components/') ||
      p.includes('/views/') ||
      p.includes('/pages/') ||
      p.endsWith('.tsx') ||
      p.endsWith('.jsx')
    ) {
      return 'component';
    }

    // Utils & Helpers
    if (p.includes('/utils/') || p.includes('/helpers/') || p.includes('/lib/') || p.includes('/common/')) {
      return 'util';
    }

    // Styles
    if (p.endsWith('.css') || p.endsWith('.scss') || p.endsWith('.less')) {
      return 'style';
    }

    // Tests
    if (p.includes('/test/') || p.includes('/tests/') || fileName.includes('.test.') || fileName.includes('.spec.')) {
      return 'test';
    }

    return 'other';
  }

  public static resolveImportPath(importStr: string, currentFilePath: string, allFiles: string[]): string | null {
    if (!importStr.startsWith('.')) {
      return null; // External package
    }

    const currentDir = currentFilePath.split('/').slice(0, -1).join('/');
    const cleanImport = importStr.replace(/^[./]+/, '');
    const segments = currentFilePath.split('/').slice(0, -1);

    const importParts = importStr.split('/');
    for (const part of importParts) {
      if (part === '..') {
        segments.pop();
      } else if (part !== '.') {
        segments.push(part);
      }
    }

    const resolvedBase = segments.join('/');
    const candidates = [
      resolvedBase,
      `${resolvedBase}.ts`,
      `${resolvedBase}.tsx`,
      `${resolvedBase}.js`,
      `${resolvedBase}.jsx`,
      `${resolvedBase}.py`,
      `${resolvedBase}/index.ts`,
      `${resolvedBase}/index.js`,
      `${resolvedBase}/index.tsx`,
    ];

    for (const candidate of candidates) {
      const match = allFiles.find(f => f.toLowerCase() === candidate.toLowerCase());
      if (match) return match;
    }

    // Fallback: substring matching
    const fuzzy = allFiles.find(f => f.includes(cleanImport) && f !== currentFilePath);
    return fuzzy || null;
  }

  public static buildDependencyMatrix(
    filePaths: string[],
    staticMap: Record<string, StaticAnalysisItem>
  ): {
    dependencies: { from: string; to: string; isInternal: boolean }[];
    circularDependencies: string[][];
  } {
    const dependencies: { from: string; to: string; isInternal: boolean }[] = [];
    const adj = new Map<string, Set<string>>();

    for (const path of filePaths) {
      adj.set(path, new Set());
    }

    for (const [filePath, data] of Object.entries(staticMap)) {
      for (const rawImp of data.imports) {
        const resolved = this.resolveImportPath(rawImp, filePath, filePaths);
        const isInternal = Boolean(resolved);
        const target = resolved || rawImp;

        dependencies.push({
          from: filePath,
          to: target,
          isInternal,
        });

        if (isInternal && resolved && adj.has(filePath)) {
          adj.get(filePath)?.add(resolved);
        }
      }
    }

    // Detect cycles using DFS
    const circularDependencies: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const currentPath: string[] = [];

    const dfs = (node: string) => {
      visited.add(node);
      recStack.add(node);
      currentPath.push(node);

      const neighbors = adj.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recStack.has(neighbor)) {
          const cycleStart = currentPath.indexOf(neighbor);
          if (cycleStart !== -1) {
            const cycle = currentPath.slice(cycleStart).concat([neighbor]);
            circularDependencies.push(cycle);
          }
        }
      }

      currentPath.pop();
      recStack.delete(node);
    };

    for (const path of filePaths) {
      if (!visited.has(path)) {
        dfs(path);
      }
    }

    return { dependencies, circularDependencies };
  }
}
