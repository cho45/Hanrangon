import { BaseProcessor } from './base.js';

/**
 * HighlightProcessor
 * シンタックスハイライトを適用
 */
export class HighlightProcessor extends BaseProcessor {
  static appliesRegexp = /\bcode\b/;

  constructor() {
    super();
    this.hljs = null;
  }

  applies(dom) {
    return !!(dom.querySelector('pre.code') || dom.querySelector('pre > code[class*="language-"]'));
  }

  async prepare() {
    const { default: hljs } = await import('highlight.js');
    this.hljs = hljs;
  }

  async process(dom, baseURL) {
    // Hatena-style: <pre class="code lang-javascript">
    const hatenaCodes = dom.querySelectorAll('pre.code');
    // Markdown-style: <pre><code class="language-javascript">
    const markdownCodes = dom.querySelectorAll('pre > code[class*="language-"]');

    console.error(`[highlight] Found ${hatenaCodes.length} Hatena code blocks and ${markdownCodes.length} Markdown code blocks`);

    const startTime = Date.now();
    let highlighted = 0;

    for (const code of hatenaCodes) {
      if (/lang-(\S+)/.test(code.className)) {
        const lang = code.className.match(/lang-(\S+)/)[1];
        this.hljs.highlightElement(code);
        highlighted++;
        console.error(`[highlight] Highlighted Hatena code block (${lang})`);
      }
    }

    for (const code of markdownCodes) {
      const langMatch = code.className.match(/language-(\S+)/);
      if (langMatch) {
        const lang = langMatch[1];
        this.hljs.highlightElement(code);
        highlighted++;
        console.error(`[highlight] Highlighted Markdown code block (${lang})`);
      }
    }

    console.error(`[highlight] Completed in ${Date.now() - startTime}ms (highlighted ${highlighted}/${hatenaCodes.length + markdownCodes.length} blocks)`);
  }
}
