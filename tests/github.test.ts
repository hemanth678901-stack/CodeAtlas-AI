import { describe, it, expect } from 'vitest';
import { GitHubService } from '../server/github';

describe('GitHubService URL Parser', () => {
  const gh = new GitHubService();

  it('should parse standard GitHub HTTPS URLs', () => {
    const res = gh.parseRepoUrl('https://github.com/facebook/react');
    expect(res).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should parse URLs with trailing slashes and .git extensions', () => {
    const res1 = gh.parseRepoUrl('https://github.com/expressjs/express.git/');
    expect(res1).toEqual({ owner: 'expressjs', repo: 'express' });

    const res2 = gh.parseRepoUrl('https://github.com/pallets/flask.git');
    expect(res2).toEqual({ owner: 'pallets', repo: 'flask' });
  });

  it('should parse shorthand "owner/repo" input', () => {
    const res = gh.parseRepoUrl('fastify/fastify');
    expect(res).toEqual({ owner: 'fastify', repo: 'fastify' });
  });

  it('should parse GitHub URLs without protocol', () => {
    const res = gh.parseRepoUrl('github.com/torvalds/linux');
    expect(res).toEqual({ owner: 'torvalds', repo: 'linux' });
  });

  it('should parse deep branch tree URLs', () => {
    const res = gh.parseRepoUrl('https://github.com/expressjs/express/tree/master/lib');
    expect(res).toEqual({ owner: 'expressjs', repo: 'express' });
  });

  it('should reject invalid or non-GitHub URLs', () => {
    expect(() => gh.parseRepoUrl('https://gitlab.com/owner/repo')).toThrow(
      /Only GitHub repositories are currently supported/i
    );
    expect(() => gh.parseRepoUrl('not-a-valid-url')).toThrow();
  });
});

describe('GitHubService File Filtering and Scoring', () => {
  const gh = new GitHubService();

  it('should ignore binary files, lockfiles, and node_modules', () => {
    const dummyTree = [
      { path: 'node_modules/express/index.js', mode: '100644', type: 'blob' as const, sha: '1', url: '' },
      { path: 'package-lock.json', mode: '100644', type: 'blob' as const, sha: '2', url: '' },
      { path: 'assets/logo.png', mode: '100644', type: 'blob' as const, sha: '3', url: '' },
      { path: 'src/index.ts', mode: '100644', type: 'blob' as const, sha: '4', url: '' },
      { path: 'package.json', mode: '100644', type: 'blob' as const, sha: '5', url: '' },
    ];

    const { selected, skipped } = gh.filterImportantFiles(dummyTree);
    const selectedPaths = selected.map(s => s.path);

    expect(selectedPaths).toContain('src/index.ts');
    expect(selectedPaths).toContain('package.json');
    expect(selectedPaths).not.toContain('node_modules/express/index.js');
    expect(selectedPaths).not.toContain('package-lock.json');
    expect(selectedPaths).not.toContain('assets/logo.png');
  });

  it('should prioritize entry points and manifest files', () => {
    const dummyTree = [
      { path: 'src/utils/math.ts', mode: '100644', type: 'blob' as const, sha: '1', url: '' },
      { path: 'src/main.ts', mode: '100644', type: 'blob' as const, sha: '2', url: '' },
      { path: 'package.json', mode: '100644', type: 'blob' as const, sha: '3', url: '' },
    ];

    const { selected } = gh.filterImportantFiles(dummyTree);
    expect(selected[0].path).toBe('package.json');
    expect(selected[1].path).toBe('src/main.ts');
  });

  it('respects configurable maxFiles limit', () => {
    const dummyTree = Array.from({ length: 50 }, (_, i) => ({
      path: `src/file_${i}.ts`,
      mode: '100644',
      type: 'blob' as const,
      sha: `${i}`,
      url: '',
    }));

    const resultDefault = gh.filterImportantFiles(dummyTree);
    expect(resultDefault.selected.length).toBe(40);
    expect(resultDefault.skipped.length).toBe(10);

    const resultCustom = gh.filterImportantFiles(dummyTree, 15);
    expect(resultCustom.selected.length).toBe(15);
    expect(resultCustom.skipped.length).toBe(35);
  });

  it('calculates real language percentages from repository file extensions', () => {
    const dummyTree = [
      { path: 'src/index.ts', mode: '100644', type: 'blob' as const, sha: '1', size: 3000, url: '' },
      { path: 'src/app.tsx', mode: '100644', type: 'blob' as const, sha: '2', size: 3000, url: '' },
      { path: 'server.py', mode: '100644', type: 'blob' as const, sha: '3', size: 4000, url: '' },
    ];

    const distribution = gh.calculateLanguageDistribution(dummyTree);
    expect(distribution.TypeScript).toBe(60);
    expect(distribution.Python).toBe(40);
  });
});
