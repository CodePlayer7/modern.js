import path from 'path';
import { expect } from '@modern-js/e2e/playwright';
import { allProviderTest } from '@scripts/helper';
import { build, getHrefByEntryName } from '@scripts/shared';
import { builderPluginNodePolyfill } from '@modern-js/builder-plugin-node-polyfill';

allProviderTest(
  'should add node-polyfill when add node-polyfill plugin',
  async ({ page }) => {
    const builder = await build({
      cwd: __dirname,
      entry: { index: path.resolve(__dirname, './src/index.js') },
      plugins: [builderPluginNodePolyfill()],
    });
    await page.goto(getHrefByEntryName('index', builder.port));

    await expect(
      page.evaluate(`document.getElementById('test').innerHTML`),
    ).resolves.toBe('Hello Builder!');

    await expect(
      page.evaluate(`document.getElementById('test-buffer').innerHTML`),
    ).resolves.toBe('120120120120');

    await expect(
      page.evaluate(`document.getElementById('test-querystring').innerHTML`),
    ).resolves.toBe('foo=bar');
  },
);
