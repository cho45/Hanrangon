import { BaseProcessor } from './base.js';

/**
 * HighlightProcessor
 * シンタックスハイライトを適用
 */
export class HighlightProcessor extends BaseProcessor {
  constructor() {
    super();
    this.hljs = null;
  }

  applies(dom) {
    return !!dom.querySelector('pre.code');
  }

  async prepare() {
    const { default: hljs } = await import('highlight.js');
    this.hljs = hljs;
  }

  async process(dom, baseURL) {
    const codes = dom.querySelectorAll('pre.code');
    console.error(`[highlight] Found ${codes.length} code blocks`);

    const startTime = Date.now();
    let highlighted = 0;

    for (const code of codes) {
      if (/lang-(\S+)/.test(code.className)) {
        const lang = code.className.match(/lang-(\S+)/)[1];
        // highlight.js でハイライトを適用
        // highlightBlock は deprecated なので highlightElement を使用
        this.hljs.highlightElement(code);
        highlighted++;
        console.error(`[highlight] Highlighted code block (${lang})`);
      }
    }

    console.error(`[highlight] Completed in ${Date.now() - startTime}ms (highlighted ${highlighted}/${codes.length} blocks)`);
  }
}
