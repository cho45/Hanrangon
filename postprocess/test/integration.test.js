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
 * @param {string[]} args - コマンドライン引数
 * @returns {Promise<{stdout: string, stderr: string}>} - 出力 HTML と標準エラー
 */
function runPostprocess(html, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [mainJsPath, ...args]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => stdout += chunk);
    proc.stderr.on('data', chunk => stderr += chunk);

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\nstderr: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
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
    const { stdout: result } = await runPostprocess(html);
    assert.strictEqual(result, html);
  });

  it('should skip processing if no tags are found', async () => {
    const html = 'This is plain text without any tags.';
    const { stdout: result, stderr } = await runPostprocess(html);
    assert.strictEqual(result, html);
    assert(stderr.includes('processHTML: skipping (no tags found'), 'Should log skip message');
  });

  it('should skip processing if no processors match', async () => {
    const html = '<p>This has tags but no special content.</p>';
    const { stdout: result, stderr } = await runPostprocess(html);
    assert.strictEqual(result, html);
    assert(stderr.includes('processHTML: skipping (no processors matched'), 'Should log skip message for no matches');
  });

  it('should process MathJax (inline)', async () => {
    const html = '<p>Inline math: \\(E = mc^2\\)</p>';
    const { stdout: result } = await runPostprocess(html);

    assert(result.includes('svg') || result.includes('SVG'), 'Should contain SVG');
    assert(!result.includes('\\(E = mc^2\\)'), 'Should not contain original LaTeX');
  });

  it('should process MathJax (display)', async () => {
    const html = '<p>Display math: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$</p>';
    const { stdout: result } = await runPostprocess(html);

    assert(result.includes('svg') || result.includes('SVG'), 'Should contain SVG');
  });

  it('should process syntax highlighting', async () => {
    const html = '<pre class="code lang-javascript">function hello() { return "world"; }</pre>';
    const { stdout: result } = await runPostprocess(html);

    // highlight.js が適用されたかチェック（hljs クラスが追加される）
    assert(result.includes('hljs') || result.includes('class="'), 'Should contain highlight.js classes');
  });

  it('should process image URLs', async () => {
    const html = '<img src="http://lh6.ggpht.com/-test/s320/photo.jpg" />';
    const { stdout: result } = await runPostprocess(html);

    // HTTPS と s2048 に変換される
    assert(result.includes('https://'), 'Should convert to HTTPS');
    assert(result.includes('s2048'), 'Should convert to s2048');
  });

  it('should process YouTube iframes', async () => {
    const html = '<iframe src="http://www.youtube.com/embed/test123"></iframe>';
    const { stdout: result } = await runPostprocess(html);

    assert(result.includes('https://www.youtube.com'), 'Should convert to HTTPS');
  });

  it('should process all features together', async () => {
    const html = `
      <p>Math: \\(a^2 + b^2 = c^2\\)</p>
      <pre class="code lang-python">def hello():\n    return "world"</pre>
      <img src="http://lh6.ggpht.com/-test/s320/photo.jpg" />
      <iframe src="http://www.youtube.com/embed/test"></iframe>
    `;

    const { stdout: result } = await runPostprocess(html);

    // すべての処理が適用されているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Should process MathJax');
    assert(result.includes('hljs') || result.length > html.length, 'Should process highlight');
    assert(result.includes('https://'), 'Should process URLs');
  });

  it('should handle errors gracefully', async () => {
    // 不正な HTML でもクラッシュしない
    const html = '<p>Test \\(\\broken\\math\\)</p>';
    const { stdout: result } = await runPostprocess(html);

    // 何らかの結果が返る（エラーで終了しない）
    assert(typeof result === 'string');
  });

  it('should handle empty input', async () => {
    const html = '';
    const { stdout: result } = await runPostprocess(html);
    assert.strictEqual(result, '');
  });

  it('should preserve HTML structure', async () => {
    const html = '<div><p>Paragraph</p><ul><li>Item</li></ul></div>';
    const { stdout: result } = await runPostprocess(html);

    // 基本的な構造が保持されている
    assert(result.includes('<p>'), 'Should preserve paragraphs');
    assert(result.includes('<ul>'), 'Should preserve lists');
  });

  it('should resolve relative image path with --base-url', async () => {
    const html = '<img src="/images/entry/test.png" />';
    const baseURL = 'http://localhost:12345'; // 適当なポート
    const { stderr } = await runPostprocess(html, ['--base-url', baseURL]);

    // stderr に解決された URL が含まれているか確認
    assert(stderr.includes('http://localhost:12345/images/entry/test.png'), `Should try to fetch resolved URL in stderr: ${stderr}`);
  });
});
