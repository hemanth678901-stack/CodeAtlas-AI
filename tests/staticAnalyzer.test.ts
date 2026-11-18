import { describe, it, expect } from 'vitest';
import { StaticAnalyzer } from '../server/staticAnalyzer';

describe('StaticAnalyzer Import Extraction', () => {
  it('should extract JavaScript and TypeScript ES6 imports', () => {
    const code = `
      import express from 'express';
      import { Router, Request } from './router';
      import '../config/database';
      const path = require('path');
    `;
    const imports = StaticAnalyzer.extractImports(code, 'src/server.ts');
    expect(imports).toContain('express');
    expect(imports).toContain('./router');
    expect(imports).toContain('../config/database');
    expect(imports).toContain('path');
  });

  it('should extract Python imports', () => {
    const pyCode = `
      import os
      import sys, math
      from flask import Flask, request, jsonify
      from .database import get_db
    `;
    const imports = StaticAnalyzer.extractImports(pyCode, 'app.py');
    expect(imports).toContain('os');
    expect(imports).toContain('sys');
    expect(imports).toContain('math');
    expect(imports).toContain('flask');
    expect(imports).toContain('.database');
  });
});

describe('StaticAnalyzer Function Extraction', () => {
  it('should extract functions, methods, and arrow functions with lines', () => {
    const code = `
      function authenticateUser(req, res) {
        return true;
      }

      const calculateMetrics = async (data) => {
        return data.length;
      };

      class AuthService {
        validateSession(token) {
          return !!token;
        }
      }
    `;
    const lines = code.split('\n');
    const functions = StaticAnalyzer.extractFunctions(lines, 'src/auth.ts');
    const names = functions.map(f => f.name);

    expect(names).toContain('authenticateUser');
    expect(names).toContain('calculateMetrics');
    expect(names).toContain('validateSession');
  });

  it('should ignore reserved keywords when extracting function names', () => {
    const code = `
      if (typeof x === 'string') {
        return;
      }
      for (const item of list) {}
      while (true) {}
      switch (val) {}
    `;
    const functions = StaticAnalyzer.extractFunctions(code.split('\n'), 'src/test.ts');
    const names = functions.map(f => f.name);
    expect(names).not.toContain('if');
    expect(names).not.toContain('for');
    expect(names).not.toContain('while');
    expect(names).not.toContain('switch');
    expect(names).not.toContain('typeof');
  });
});

describe('StaticAnalyzer Role Detection', () => {
  it('should detect file roles based on path and naming convention', () => {
    expect(StaticAnalyzer.determineRole('src/index.ts', '')).toBe('entry');
    expect(StaticAnalyzer.determineRole('src/routes/users.ts', '')).toBe('route');
    expect(StaticAnalyzer.determineRole('src/controllers/userController.ts', '')).toBe('controller');
    expect(StaticAnalyzer.determineRole('src/services/mailService.ts', '')).toBe('service');
    expect(StaticAnalyzer.determineRole('src/models/user.ts', '')).toBe('model');
    expect(StaticAnalyzer.determineRole('src/components/Button.tsx', '')).toBe('component');
    expect(StaticAnalyzer.determineRole('package.json', '')).toBe('config');
    expect(StaticAnalyzer.determineRole('src/middleware/auth.ts', '')).toBe('middleware');
  });
});

describe('StaticAnalyzer Dependency Matrix & Circular Detection', () => {
  it('should build dependency matrix and detect circular dependencies', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
    const staticMap = {
      'src/a.ts': {
        path: 'src/a.ts',
        imports: ['./b'],
        functions: [],
        role: 'service' as const,
        lineCount: 10,
      },
      'src/b.ts': {
        path: 'src/b.ts',
        imports: ['./a'],
        functions: [],
        role: 'service' as const,
        lineCount: 15,
      },
      'src/c.ts': {
        path: 'src/c.ts',
        imports: ['express'],
        functions: [],
        role: 'service' as const,
        lineCount: 8,
      },
    };

    const { dependencies, circularDependencies } = StaticAnalyzer.buildDependencyMatrix(files, staticMap);

    expect(dependencies.length).toBeGreaterThanOrEqual(3);
    expect(circularDependencies.length).toBeGreaterThanOrEqual(1);

    const firstCycle = circularDependencies[0];
    expect(firstCycle).toContain('src/a.ts');
    expect(firstCycle).toContain('src/b.ts');
  });
});
