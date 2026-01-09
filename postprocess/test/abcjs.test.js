import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { ABCProcessor } from '../lib/abcjs.js';

test('ABCProcessor.applies detects ABC blocks', async () => {
  const processor = new ABCProcessor();
  
  assert.strictEqual(processor.applies(new JSDOM('<pre class="lang-abc"></pre>').window.document.body), true);
  assert.strictEqual(processor.applies(new JSDOM('<pre class="code lang-abc"></pre>').window.document.body), true);
  assert.strictEqual(processor.applies(new JSDOM('<p>Plain text</p>').window.document.body), false);
  assert.strictEqual(processor.applies(new JSDOM('<pre class="code lang-js"></pre>').window.document.body), false);
});

test('ABCProcessor converts pre.lang-abc to SVG container', async () => {
  const html = `
    <p>Music starts here:</p>
    <pre class="lang-abc">
X:1
K:C
C D E F | G A B c |
    </pre>
    <p>Music ends here.</p>
  `;
  
  const { window } = new JSDOM(html);
  const dom = window.document.body;
  
  const processor = new ABCProcessor();
  await processor.run(dom);
  
  const container = dom.querySelector('.abc-render');
  assert.ok(container, 'Should have a container with class abc-render');
  
  const svg = container.querySelector('svg');
  assert.ok(svg, 'Should contain an SVG element');
  
  // Check if <pre> is gone
  const pre = dom.querySelector('pre.lang-abc');
  assert.strictEqual(pre, null, 'The original pre element should be replaced');
});

test('ABCProcessor handles empty or invalid ABC', async () => {
  const html = `
    <pre class="lang-abc"></pre>
  `;
  
  const { window } = new JSDOM(html);
  const dom = window.document.body;
  
  const processor = new ABCProcessor();
  await processor.run(dom);
  
  const container = dom.querySelector('.abc-render');
  // It might still create a container but without meaningful SVG, or skip it
  // Current implementation skips empty content
  assert.strictEqual(container, null, 'Empty ABC block should be skipped');
});
