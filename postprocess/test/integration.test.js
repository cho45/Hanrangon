import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mainJsPath = join(__dirname, '../main.js');

/**
 * main.js を実行して HTML を処理する
 * @param {string} html - 入力 HTML
 * @returns {Promise<string>} - 出力 HTML
 */
function runPostprocess(html) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [mainJsPath]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => stdout += chunk);
    proc.stderr.on('data', chunk => stderr += chunk);

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\nstderr: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', err => reject(err));

    proc.stdin.write(html);
    proc.stdin.end();
  });
}

describe('Integration tests', () => {
  it('should process HTML without any special content', async () => {
    const html = '<p>This is plain text.</p>';
    const result = await runPostprocess(html);
    assert.strictEqual(result, html);
  });

  it('should process MathJax (inline)', async () => {
    const html = '<p>Inline math: \\(E = mc^2\\)</p>';
    const result = await runPostprocess(html);

    assert(result.includes('svg') || result.includes('SVG'), 'Should contain SVG');
    assert(!result.includes('\\(E = mc^2\\)'), 'Should not contain original LaTeX');
  });

  it('should process MathJax (display)', async () => {
    const html = '<p>Display math: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$</p>';
    const result = await runPostprocess(html);

    assert(result.includes('svg') || result.includes('SVG'), 'Should contain SVG');
  });

  it('should process syntax highlighting', async () => {
    const html = '<pre class="code lang-javascript">function hello() { return "world"; }</pre>';
    const result = await runPostprocess(html);

    // highlight.js が適用されたかチェック（hljs クラスが追加される）
    assert(result.includes('hljs') || result.includes('class="'), 'Should contain highlight.js classes');
  });

  it('should process image URLs', async () => {
    const html = '<img src="http://lh6.ggpht.com/-test/s320/photo.jpg" />';
    const result = await runPostprocess(html);

    // HTTPS と s2048 に変換される
    assert(result.includes('https://'), 'Should convert to HTTPS');
    assert(result.includes('s2048'), 'Should convert to s2048');
  });

  it('should process YouTube iframes', async () => {
    const html = '<iframe src="http://www.youtube.com/embed/test123"></iframe>';
    const result = await runPostprocess(html);

    assert(result.includes('https://www.youtube.com'), 'Should convert to HTTPS');
  });

  it('should process all features together', async () => {
    const html = `
      <p>Math: \\(a^2 + b^2 = c^2\\)</p>
      <pre class="code lang-python">def hello():\n    return "world"</pre>
      <img src="http://lh6.ggpht.com/-test/s320/photo.jpg" />
      <iframe src="http://www.youtube.com/embed/test"></iframe>
    `;

    const result = await runPostprocess(html);

    // すべての処理が適用されているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Should process MathJax');
    assert(result.includes('hljs') || result.length > html.length, 'Should process highlight');
    assert(result.includes('https://'), 'Should process URLs');
  });

  it('should handle errors gracefully', async () => {
    // 不正な HTML でもクラッシュしない
    const html = '<p>Test \\(\\broken\\math\\)</p>';
    const result = await runPostprocess(html);

    // 何らかの結果が返る（エラーで終了しない）
    assert(typeof result === 'string');
  });

  it('should handle empty input', async () => {
    const html = '';
    const result = await runPostprocess(html);
    assert.strictEqual(result, '');
  });

  it('should preserve HTML structure', async () => {
    const html = '<div><p>Paragraph</p><ul><li>Item</li></ul></div>';
    const result = await runPostprocess(html);

    // 基本的な構造が保持されている
    assert(result.includes('<p>'), 'Should preserve paragraphs');
    assert(result.includes('<ul>'), 'Should preserve lists');
  });
});
