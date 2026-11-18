import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Assets & Compliance', () => {
  const publicDir = path.resolve(__dirname, '../public');

  it('should have all required SVG PWA icons in /public', () => {
    const requiredFiles = ['icon.svg', 'maskable-icon.svg'];

    for (const file of requiredFiles) {
      const filePath = path.join(publicDir, file);
      expect(fs.existsSync(filePath), `Missing asset: ${file}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });
});
