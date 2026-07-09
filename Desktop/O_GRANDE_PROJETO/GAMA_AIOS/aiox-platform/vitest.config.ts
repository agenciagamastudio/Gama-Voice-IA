import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: __dirname,
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
