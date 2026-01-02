import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { JSDOM } from 'jsdom';
import { processWidgets } from '../lib/widgets.js';

describe('processWidgets', () => {
  describe('YouTube HTTPS conversion', () => {
    it('should convert YouTube iframe to HTTPS', async () => {
      const html = `
        <iframe width="560" height="315" src="http://www.youtube.com/embed/MGt25mv4-2Q" frameborder="0" allowfullscreen></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processWidgets(dom);

      const iframe = dom.querySelector('iframe');
      assert.strictEqual(
        iframe.src,
        'https://www.youtube.com/embed/MGt25mv4-2Q'
      );
    });

    it('should handle multiple YouTube iframes', async () => {
      const html = `
        <iframe src="http://www.youtube.com/embed/video1"></iframe>
        <iframe src="http://www.youtube.com/embed/video2"></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processWidgets(dom);

      const iframes = dom.querySelectorAll('iframe');
      assert.strictEqual(iframes.length, 2);
      iframes.forEach(iframe => {
        assert(iframe.src.startsWith('https://'), `${iframe.src} should use HTTPS`);
      });
    });

    it('should preserve other iframe attributes', async () => {
      const html = `
        <iframe
          width="560"
          height="315"
          src="http://www.youtube.com/embed/test"
          frameborder="0"
          allow="accelerometer; autoplay"
          allowfullscreen
        ></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processWidgets(dom);

      const iframe = dom.querySelector('iframe');
      assert.strictEqual(iframe.width, '560');
      assert.strictEqual(iframe.height, '315');
      assert.strictEqual(iframe.frameBorder, '0');
      assert.strictEqual(iframe.allowFullscreen, true);
    });

    it('should not affect non-YouTube iframes', async () => {
      const html = `
        <iframe src="http://example.com/video"></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processWidgets(dom);

      const iframe = dom.querySelector('iframe');
      assert.strictEqual(iframe.src, 'http://example.com/video');
    });
  });

  describe('GitHub Gist expansion', () => {
    it('should not crash when no script tags exist', async () => {
      const html = `<div>No scripts here</div>`;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      // エラーが発生しないことを確認
      await processWidgets(dom);

      assert(dom.querySelector('div'));
    });

    it('should not affect non-Gist scripts', async () => {
      const html = `
        <div><script src="https://example.com/script.js"></script></div>
      `;

      const { window } = new JSDOM(html, {
        runScripts: 'outside-only',  // script の自動実行を無効化
        resources: 'usable'
      });
      const dom = window.document.body;

      const scriptsBefore = dom.querySelectorAll('script').length;

      await processWidgets(dom);

      const scriptsAfter = dom.querySelectorAll('script').length;

      // script タグの数が変わっていないことを確認
      assert.strictEqual(scriptsAfter, scriptsBefore, 'Non-Gist scripts should not be affected');
    });

    it('should expand GitHub Gist script', async () => {
      const html = `
        <div><script src="https://gist.github.com/cho45/12345.js"></script></div>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      const mockResponse = new EventEmitter();
      mockResponse.statusCode = 200;
      const mockRequest = new EventEmitter();
      mockRequest.destroy = () => {};

      mock.method(https, 'get', (url, options, callback) => {
        callback(mockResponse);
        setTimeout(() => {
          mockResponse.emit('data', 'document.write(\'<div class="gist-content">Hello Gist</div>\')');
          mockResponse.emit('end');
        }, 10);
        return mockRequest;
      });

      await processWidgets(dom);

      const expanded = dom.querySelector('.gist-github-com-js');
      assert(expanded, 'Should have expanded gist div');
      assert.strictEqual(expanded.innerHTML, '<div class="gist-content">Hello Gist</div>');
      assert(!dom.querySelector('script'), 'Original script should be removed');

      mock.restoreAll();
    });

    // 注: 実際の Gist 展開のテストは統合テストで行う
    // ここでは基本的な動作のみをテストする

    it('should handle invalid Gist URLs gracefully', async () => {
      const html = `
        <div><script src="https://gist.github.com/invalid-gist-that-does-not-exist.js"></script></div>
      `;

      const { window } = new JSDOM(html, {
        runScripts: 'outside-only',
        resources: 'usable'
      });
      const dom = window.document.body;

      // エラーが発生せず、処理が完了することを確認
      await processWidgets(dom);

      // エラーが発生しなければOK（script タグがそのまま残る）
      const elementsAfterCount = dom.querySelectorAll('script, div.gist-github-com-js').length;
      assert(elementsAfterCount >= 1, 'Should have at least one element after processing');
    });
  });

  describe('Mixed content', () => {
    it('should handle both YouTube and scripts together', async () => {
      const html = `
        <iframe src="http://www.youtube.com/embed/test"></iframe>
        <script src="https://example.com/script.js"></script>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      await processWidgets(dom);

      const iframe = dom.querySelector('iframe');
      const script = dom.querySelector('script');

      assert.strictEqual(iframe.src, 'https://www.youtube.com/embed/test');
      assert.strictEqual(script.src, 'https://example.com/script.js');
    });
  });
});
