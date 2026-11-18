import { describe, it, expect } from 'vitest';
import { MemoryCache } from '../server/cache';

describe('MemoryCache Bounded In-Memory Storage', () => {
  it('stores and retrieves cached items', () => {
    const cache = new MemoryCache<string>(5, 1000);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    expect(cache.has('key1')).toBe(true);
  });

  it('respects maxEntries capacity limit by evicting oldest (LRU)', () => {
    const cache = new MemoryCache<string>(3, 10000);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.size()).toBe(3);

    // Adding 4th item must evict 'a'
    cache.set('d', '4');
    expect(cache.size()).toBe(3);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
    expect(cache.get('d')).toBe('4');
  });

  it('refreshes entry position on access for true LRU behavior', () => {
    const cache = new MemoryCache<string>(3, 10000);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');

    // Access 'a' so it is no longer the oldest
    expect(cache.get('a')).toBe('1');

    // Adding 'd' should now evict 'b' instead of 'a'
    cache.set('d', '4');
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe('1');
    expect(cache.get('c')).toBe('3');
    expect(cache.get('d')).toBe('4');
  });

  it('expires entries after TTL elapsed', async () => {
    // 50ms TTL
    const cache = new MemoryCache<string>(5, 50);
    cache.set('temp', 'temporary-data');
    expect(cache.get('temp')).toBe('temporary-data');

    await new Promise(resolve => setTimeout(resolve, 75));
    expect(cache.get('temp')).toBeUndefined();
    expect(cache.has('temp')).toBe(false);
  });
});
