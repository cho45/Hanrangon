import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { WidgetProcessor } from '../lib/widgets.js';

describe('WidgetProcessor', () => {
  it('applies() should detect iframes', async () => {
    const processor = new WidgetProcessor();
    assert.strictEqual(processor.applies(new JSDOM('<iframe></iframe>').window.document.body), true);
    assert.strictEqual(processor.applies(new JSDOM('<p>Plain text</p>').window.document.body), false);
  });

  describe('YouTube HTTPS conversion', () => {
    it('should convert YouTube iframe to HTTPS', async () => {
      const html = `
        <iframe width="560" height="315" src="http://www.youtube.com/embed/MGt25mv4-2Q" frameborder="0" allowfullscreen></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      const processor = new WidgetProcessor();
      await processor.run(dom);

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

      const processor = new WidgetProcessor();
      await processor.run(dom);

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

      const processor = new WidgetProcessor();
      await processor.run(dom);

      const iframe = dom.querySelector('iframe');
      assert.strictEqual(iframe.width, '560');
      assert.strictEqual(iframe.height, '315');
      assert.strictEqual(iframe.frameBorder, '0');
      assert.strictEqual(iframe.allowFullscreen, true);
    });

    it('should add loading="lazy" to YouTube iframes', async () => {
      const html = `
        <iframe src="http://www.youtube.com/embed/test"></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      const processor = new WidgetProcessor();
      await processor.run(dom);

      const iframe = dom.querySelector('iframe');
      assert.strictEqual(iframe.getAttribute('loading'), 'lazy');
    });

    it('should not affect non-YouTube iframes', async () => {
      const html = `
        <iframe src="http://example.com/video"></iframe>
      `;

      const { window } = new JSDOM(html);
      const dom = window.document.body;

      const processor = new WidgetProcessor();
      await processor.run(dom);

      const iframe = dom.querySelector('iframe');
      assert.strictEqual(iframe.src, 'http://example.com/video');
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

      const processor = new WidgetProcessor();
      await processor.run(dom);

      const iframe = dom.querySelector('iframe');
      const script = dom.querySelector('script');

      assert.strictEqual(iframe.src, 'https://www.youtube.com/embed/test');
      assert.strictEqual(script.src, 'https://example.com/script.js');
    });
  });
});
