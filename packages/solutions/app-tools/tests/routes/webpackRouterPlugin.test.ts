import path from 'path';
import { fs } from '@modern-js/utils';
import { ROUTE_MANIFEST_FILE } from '@modern-js/utils/constants';
import { RouterPlugin } from '../../src/builder/shared/bundlerPlugins';
import { compiler } from './compiler';

describe('webpack-router-plugin', () => {
  test('basic usage', async () => {
    const app = path.join(__dirname, './fixtures/router-plugin1');
    const distDir = path.join(app, 'dist');
    const entryFile = path.join(app, 'index.js');
    const stats = await compiler({
      entry: entryFile,
      context: app,
      mode: 'development',
      target: 'web',
      output: {
        path: distDir,
        filename: '[name].js',
        chunkFilename: '[name].js',
      },
      plugins: [new RouterPlugin()],
    });

    const res = stats?.toJson();
    const { outputPath } = res!;
    const mainBundle = path.join(outputPath!, 'main.js');
    const bundleContent = await fs.readFile(mainBundle);
    expect(bundleContent.includes('_MODERNJS_ROUTE_MANIFEST')).toBe(true);
    const manifestFile = path.join(distDir, ROUTE_MANIFEST_FILE);
    const manifest = await import(manifestFile);
    expect(manifest.routeAssets).toHaveProperty('main');
    expect(manifest.routeAssets).toHaveProperty('bar');

    await fs.remove(distDir);
  });

  test('should not create manifest', async () => {
    const app = path.join(__dirname, './fixtures/router-plugin2');
    const distDir = path.join(app, 'dist');
    const entryFile = path.join(app, 'index.js');
    const stats = await compiler({
      entry: entryFile,
      context: app,
      mode: 'development',
      target: 'web',
      output: {
        path: distDir,
        filename: '[name].js',
        chunkFilename: '[name].js',
      },
    });

    const res = stats?.toJson();
    const { outputPath } = res!;
    const mainBundle = path.join(outputPath!, 'main.js');
    const bundleContent = await fs.readFile(mainBundle);
    expect(bundleContent.includes('_MODERNJS_ROUTE_MANIFEST')).toBe(false);
    const manifestFile = path.join(distDir, ROUTE_MANIFEST_FILE);
    expect(await fs.pathExists(manifestFile)).toBeFalsy();

    await fs.remove(distDir);
  });
});
