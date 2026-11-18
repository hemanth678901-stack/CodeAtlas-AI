import { describe, it, expect } from 'vitest';
import {
  SAMPLE_REPOS_LIST,
  PRELOADED_EXPRESS_ANALYSIS,
  PRELOADED_FLASK_ANALYSIS,
  PRELOADED_FASTIFY_ANALYSIS,
} from '../server/samples';

describe('Curated Sample Datasets', () => {
  it('should list all 3 supported sample repositories', () => {
    expect(SAMPLE_REPOS_LIST).toHaveLength(3);
    const ids = SAMPLE_REPOS_LIST.map(s => s.id);
    expect(ids).toContain('express');
    expect(ids).toContain('flask');
    expect(ids).toContain('fastify');
  });

  it('should have complete valid data for Express sample', () => {
    expect(PRELOADED_EXPRESS_ANALYSIS.metadata.owner).toBe('expressjs');
    expect(PRELOADED_EXPRESS_ANALYSIS.mindMap.nodes.length).toBeGreaterThan(0);
    expect(PRELOADED_EXPRESS_ANALYSIS.executionFlows.length).toBeGreaterThan(0);
    expect(Object.keys(PRELOADED_EXPRESS_ANALYSIS.analyzedFiles).length).toBeGreaterThan(0);
  });

  it('should have complete valid data for Flask sample', () => {
    expect(PRELOADED_FLASK_ANALYSIS.metadata.owner).toBe('pallets');
    expect(PRELOADED_FLASK_ANALYSIS.mindMap.nodes.length).toBeGreaterThan(0);
    expect(PRELOADED_FLASK_ANALYSIS.executionFlows.length).toBeGreaterThan(0);
    expect(Object.keys(PRELOADED_FLASK_ANALYSIS.analyzedFiles)).toContain('src/flask/app.py');
  });

  it('should have complete valid data for Fastify sample', () => {
    expect(PRELOADED_FASTIFY_ANALYSIS.metadata.owner).toBe('fastify');
    expect(PRELOADED_FASTIFY_ANALYSIS.mindMap.nodes.length).toBeGreaterThan(0);
    expect(PRELOADED_FASTIFY_ANALYSIS.executionFlows.length).toBeGreaterThan(0);
    expect(Object.keys(PRELOADED_FASTIFY_ANALYSIS.analyzedFiles)).toContain('fastify.js');
  });
});
