import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import { createStaticServer, projectRoot } from '../scripts/serve.mjs';
import '../scripts/build.mjs';

const resultsDirectory = path.join(projectRoot, 'test-results');
await mkdir(resultsDirectory, { recursive: true });
const server = createStaticServer({ root: path.join(projectRoot, 'dist'), base: '/BesSoftware/' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = 'http://127.0.0.1:' + server.address().port;
const url = origin + '/BesSoftware/';
const channel = process.env.BES_BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : '');
const errors = [];
const externalRequests = [];
const badResponses = [];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let browser;

try {
  browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
  const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, colorScheme: 'light' });
  await context.route('**/*', route => {
    if (!route.request().url().startsWith(origin + '/')) {
      externalRequests.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) badResponses.push(response.url()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('[data-map-switch]:enabled').waitFor();
  assert.match(await page.title(), /Bes 软件/);
  assert.equal(await page.locator('.bes-work').count(), 5);
  assert.equal(await page.locator('.bes-tools .bes-work-foot a').getAttribute('href'), 'https://bensonlaur.github.io/BesTools/');
  assert.equal(await page.locator('.bes-tool-launch').getAttribute('href'), 'https://bensonlaur.github.io/BesTools/tools/password/');
  assert.ok(await page.locator('svg.lucide').count() > 10);
  assert.match(await page.locator('.bes-section-heading h2').innerText(), /热爱，慢慢有了模样/);
  assert.equal(await page.locator('#bes-support-panel').isVisible(), false);

  for (let index = 0; index < 3; index += 1) await page.locator('[data-mark]').click();
  assert.match(await page.locator('[data-lyric-status]').innerText(), /三句都记录好了/);
  assert.match(await page.locator('[data-stamp="2"]').innerText(), /^\[\d+:\d{2}\.\d{2}\]$/);
  await page.locator('[data-mark]').click();
  assert.equal(await page.locator('[data-stamp="0"]').innerText(), '[待标记]');
  await page.locator('#bes-distance').fill('200');
  assert.equal(await page.locator('[data-cost]').innerText(), '105.00');
  await page.locator('[data-desktop-play]').click();
  assert.match(await page.locator('[data-desktop-status]').innerText(), /伸了个懒腰/);
  const firstMap = await page.locator('.bes-land').getAttribute('d');
  assert.ok(firstMap.length > 1000);
  await page.locator('[data-map-switch]').click();
  assert.notEqual(await page.locator('.bes-land').getAttribute('d'), firstMap);
  assert.match(await page.locator('[data-map-status]').innerText(), /Mercator/);
  await page.locator('[data-map-switch]').click();

  const tree = page.locator('.bes-plant-art');
  const canvas = page.locator('.bes-tree-canvas');
  const growth = target => page.waitForFunction(value => Number(document.querySelector('.bes-plant-art').dataset.growth) === value, target);
  const initialTree = await canvas.evaluate(element => element.toDataURL());
  await page.locator('[data-open-support]').click();
  assert.equal(await page.locator('#bes-support-panel').isVisible(), true);
  assert.equal(await tree.getAttribute('data-growth'), '0.000');
  assert.equal(await tree.evaluate(element => element.classList.contains('is-watering')), true);
  await growth(1);
  assert.notEqual(await canvas.evaluate(element => element.toDataURL()), initialTree);
  await page.locator('.bes-support').screenshot({ path: path.join(resultsDirectory, 'support-grown.png') });
  await page.locator('[data-open-support]').click();
  await page.waitForFunction(() => {
    const value = Number(document.querySelector('.bes-plant-art').dataset.growth);
    return value > 0 && value < .7;
  });
  await growth(0);
  assert.equal(await canvas.evaluate(element => element.toDataURL()), initialTree);

  // 验证快速切换不会让旧计时器把已收起的树再次撑开。
  await page.locator('[data-open-support]').click();
  await page.waitForFunction(() => Number(document.querySelector('.bes-plant-art').dataset.growth) > .3);
  await page.locator('[data-open-support]').click();
  const reversedAt = Number(await tree.getAttribute('data-growth'));
  assert.ok(reversedAt > 0 && reversedAt < 1);
  await page.locator('[data-open-support]').click();
  await growth(1);

  for (const method of ['wechat', 'alipay']) {
    await page.locator('[data-payment-method="' + method + '"]').click();
    const picture = page.locator('[data-payment-image]');
    await picture.evaluate(element => element.decode());
    const pictureUrl = await picture.evaluate(element => element.src);
    assert.ok(pictureUrl.startsWith(url + 'assets/support/'));
    const response = await context.request.get(pictureUrl);
    const expected = await readFile(path.join(projectRoot, 'assets/support', method + '.png'));
    assert.equal(hash(await response.body()), hash(expected));
    assert.equal(await page.locator('[data-payment-method="' + method + '"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-payment-original]').evaluate(element => element.href), pictureUrl);
  }
  await page.locator('[data-payment-method="alipay"]').press('Escape');
  assert.equal(await page.locator('#bes-support-panel').isVisible(), false);
  assert.equal(await page.locator('[data-open-support]').evaluate(element => element === document.activeElement), true);
  await growth(0);

  const widths = [1024, 736, 608, 375, 320];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const overflow = await page.locator('#bes-software').evaluate(root => Array.from(root.querySelectorAll('*'))
      .filter(element => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 2 && !['svg', 'path'].includes(element.tagName))
      .map(element => element.className));
    assert.deepEqual(overflow, [], 'Overflow at ' + width + 'px');
  }
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(resultsDirectory, 'desktop.png'), fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.locator('[data-open-support]').click();
  assert.equal(await tree.getAttribute('data-growth'), '1.000');
  await page.locator('[data-close-support]').click();
  assert.equal(await tree.getAttribute('data-growth'), '0.000');
  await page.screenshot({ path: path.join(resultsDirectory, 'dark.png'), fullPage: true });

  const mobile = await browser.newContext({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const mobilePage = await mobile.newPage();
  mobilePage.on('pageerror', error => errors.push(error.message));
  await mobilePage.goto(url, { waitUntil: 'networkidle' });
  await mobilePage.locator('[data-open-support]').tap();
  await mobilePage.locator('[data-payment-method="alipay"]').tap();
  await mobilePage.locator('[data-payment-image]').evaluate(element => element.decode());
  assert.ok(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.equal(await mobilePage.locator('.bes-plant-art').getAttribute('data-growth'), '1.000');
  await mobilePage.locator('.bes-support').screenshot({ path: path.join(resultsDirectory, 'mobile-support.png') });
  await mobilePage.locator('[data-close-support]').tap();
  await mobilePage.evaluate(() => scrollTo(0, 0));
  await mobilePage.screenshot({ path: path.join(resultsDirectory, 'mobile.png'), fullPage: true });

  assert.deepEqual(externalRequests, []);
  assert.deepEqual(badResponses, []);
  assert.deepEqual(errors, []);
  const report = { basePath: '/BesSoftware/', widths, allFourExperiences: true, besToolsEntry: true, reversibleTree: true, originalPaymentImages: true, touch: true, reducedMotion: true, runtimeErrors: errors, externalRequests, badResponses };
  await writeFile(path.join(resultsDirectory, 'report.json'), JSON.stringify(report, null, 2).replace(/\n/g, '\r\n') + '\r\n');
  console.log('浏览器验证通过：四个体验、可逆生长、收款图、子路径、深浅色、键盘和手机布局。');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
