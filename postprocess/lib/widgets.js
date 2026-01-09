import { BaseProcessor } from './base.js';

/**
 * WidgetProcessor
 * - YouTube iframe の HTTPS 化
 */
export class WidgetProcessor extends BaseProcessor {
  static appliesRegexp = /<iframe\b/;

  applies(dom) {
    return !!dom.querySelector('iframe');
  }

  async process(dom, baseURL) {
    const startTime = Date.now();
    console.error('[widgets] Starting widget processing');

    // 1. YouTube iframe の HTTPS 化と遅延読み込み
    {
      const iframes = dom.querySelectorAll('iframe[src*="www.youtube.com"]');
      console.error(`[widgets] Found ${iframes.length} YouTube iframes`);
      for (const iframe of iframes) {
        iframe.src = iframe.src.replace(/^http:/, 'https:');
        if (!iframe.hasAttribute('loading')) {
          iframe.setAttribute('loading', 'lazy');
        }
      }
    }

    console.error(`[widgets] Completed in ${Date.now() - startTime}ms`);
  }
}
