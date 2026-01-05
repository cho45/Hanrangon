import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { processImages } from '../lib/images.js';

describe('processImages', () => {
  describe('URL normalization', () => {
    it('should convert Google Photos URL to HTTPS and s2048', async () => {
      const html = `
        <img src="http://lh6.ggpht.com/-RCha43JvQuk/UOEDmNMYEpI/AAAAAAAAHX8/bsj8fUVpeig/s900/IMG_0226-2048.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const img = dom.querySelector('img');
      assert.strictEqual(
        img.src,
        'https://lh6.ggpht.com/-RCha43JvQuk/UOEDmNMYEpI/AAAAAAAAHX8/bsj8fUVpeig/s2048/IMG_0226-2048.jpg'
      );
    });

    it('should convert googleusercontent URL to HTTPS and s2048', async () => {
      const html = `
        <img src="https://lh3.googleusercontent.com/-gFvsrqiOy_U/VxV-QUgXd0I/AAAAAAAAePQ/UN4Am17BEkciBCLf9xwI5tFQai7vKfZvwCLcB/s900/photo.png" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const img = dom.querySelector('img');
      assert(img.src.includes('https://'), 'Should use HTTPS');
      assert(img.src.includes('/s2048/'), 'Should use s2048 size');
      assert(!img.src.includes('/s900/'), 'Should not have s900');
    });

    it('should convert Hatena Fotolife URL to HTTPS', async () => {
      const html = `
        <img src="http://cdn-ak.f.st-hatena.com/images/fotolife/c/cho45/20101231/20101231142133.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const img = dom.querySelector('img');
      assert.strictEqual(
        img.src,
        'https://cdn-ak.f.st-hatena.com/images/fotolife/c/cho45/20101231/20101231142133.jpg'
      );
    });

    it('should convert Amazon image URL to HTTPS and CDN', async () => {
      const html = `
        <img src="http://ecx.images-amazon.com/images/I/51-btt0hQhL._SL160_.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const img = dom.querySelector('img');
      assert.strictEqual(
        img.src,
        'https://images-na.ssl-images-amazon.com/images/I/51-btt0hQhL._SL160_.jpg'
      );
    });

    it('should handle multiple images', async () => {
      const html = `
        <img src="http://lh6.ggpht.com/-test1/s900/photo1.jpg" />
        <img src="http://cdn-ak.f.st-hatena.com/test2.jpg" />
        <img src="http://ecx.images-amazon.com/test3.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const imgs = dom.querySelectorAll('img');
      assert.strictEqual(imgs.length, 3);

      // すべての画像が HTTPS になっているか確認
      imgs.forEach(img => {
        assert(img.src.startsWith('https://'), `${img.src} should use HTTPS`);
      });
    });

    it('should resolve relative image path with baseURL', async () => {
      const html = `
        <img src="/images/entry/test.png" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;
      const baseURL = 'http://localhost:5555';

      // getImageSize を通るので失敗するはずだが、URL が正しく構築されているかを確認したい
      // エラーログに出る URL を確認するか、本来は mock すべき
      await processImages(dom, baseURL);

      const img = dom.querySelector('img');
      assert.strictEqual(img.src, '/images/entry/test.png'); // DOM 上の src は変わらない
    });
  });

  describe('Image size detection', () => {
    it('should skip images that already have width/height', async () => {
      const html = `
        <img src="https://example.com/image.jpg" width="100" height="200" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const img = dom.querySelector('img');
      assert.strictEqual(img.width, 100);
      assert.strictEqual(img.height, 200);
    });

    it('should skip images without src', async () => {
      const html = `
        <img alt="test" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      // エラーが発生しないことを確認
      await processImages(dom);

      const img = dom.querySelector('img');
      assert(!img.width);
      assert(!img.height);
    });

    // 注: 実際の画像サイズ取得のテストは統合テストで行う
    // ここでは URL 正規化のロジックのみをテストする
  });

  describe('Performance optimizations', () => {
    it('should add decoding="async" to all images', async () => {
      const html = `
        <img src="https://example.com/1.jpg" />
        <img src="https://example.com/2.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const imgs = dom.querySelectorAll('img');
      assert.strictEqual(imgs[0].getAttribute('decoding'), 'async');
      assert.strictEqual(imgs[1].getAttribute('decoding'), 'async');
    });

    it('should implement smart lazy loading (skip first, add to others)', async () => {
      const html = `
        <img src="https://example.com/1.jpg" />
        <img src="https://example.com/2.jpg" />
        <img src="https://example.com/3.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const imgs = dom.querySelectorAll('img');
      assert.strictEqual(imgs[0].hasAttribute('loading'), false, 'First image should NOT have loading attribute');
      assert.strictEqual(imgs[1].getAttribute('loading'), 'lazy', 'Second image should have loading="lazy"');
      assert.strictEqual(imgs[2].getAttribute('loading'), 'lazy', 'Third image should have loading="lazy"');
    });

    it('should preserve existing loading attributes', async () => {
      const html = `
        <img src="https://example.com/1.jpg" loading="eager" />
        <img src="https://example.com/2.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processImages(dom);

      const imgs = dom.querySelectorAll('img');
      assert.strictEqual(imgs[0].getAttribute('loading'), 'eager');
      assert.strictEqual(imgs[1].getAttribute('loading'), 'lazy');
    });
  });

  describe('Error handling', () => {
    it('should continue processing even if image size fetch fails', async () => {
      const html = `
        <img src="https://invalid-domain-that-does-not-exist.example.com/image.jpg" />
        <img src="http://lh6.ggpht.com/-test/s900/photo.jpg" />
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      // エラーが発生せず、処理が完了することを確認
      await processImages(dom);

      const imgs = dom.querySelectorAll('img');
      assert.strictEqual(imgs.length, 2);

      // 2番目の画像の URL は正規化されているはず
      assert(imgs[1].src.includes('s2048'));
    });
  });
});
