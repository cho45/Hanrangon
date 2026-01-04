
/**
 * ウィジェット処理
 * - YouTube iframe の HTTPS 化
 * @param {Document} dom - JSDOM の document.body
 * @returns {Promise<Document>}
 */
export async function processWidgets(dom) {
  const startTime = Date.now();
  console.error('[widgets] Starting widget processing');

  // 1. YouTube iframe の HTTPS 化
  {
    const iframes = dom.querySelectorAll('iframe[src*="www.youtube.com"]');
    console.error(`[widgets] Found ${iframes.length} YouTube iframes`);
    for (const iframe of iframes) {
      iframe.src = iframe.src.replace(/^http:/, 'https:');
    }
  }

  console.error(`[widgets] Completed in ${Date.now() - startTime}ms`);
  return dom;
}
