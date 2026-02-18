import { BaseProcessor } from './base.js';

/**
 * WidgetProcessor
 * - YouTube iframe の HTTPS 化
 */
export class WidgetProcessor extends BaseProcessor {
  static appliesRegexp = /(?:<iframe\b|subtech\.g\.hatena\.ne\.jp\/cho45\/\d{8}\/\d+)/;

  applies(dom) {
    return !!dom.querySelector('iframe, a[href*="subtech.g.hatena.ne.jp/cho45/"]');
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

    // 2. subtech旧URLのリンク正規化（hrefのみ）
    {
      const links = dom.querySelectorAll('a[href*="subtech.g.hatena.ne.jp/cho45/"]');
      console.error(`[widgets] Found ${links.length} subtech links`);
      for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        let url;
        try {
          url = new URL(href, 'http://dummy.local');
        } catch (_) {
          continue;
        }

        if (url.hostname !== 'subtech.g.hatena.ne.jp') continue;
        if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;

        const m = url.pathname.match(/^\/cho45\/(\d{4})(\d{2})(\d{2})\/(\d+)\/?$/);
        if (!m) continue;

        link.setAttribute('href', `/${m[1]}/${m[2]}/${m[3]}/${m[4]}`);
      }
    }

    console.error(`[widgets] Completed in ${Date.now() - startTime}ms`);
  }
}
