import vm from 'node:vm';
import { httpsGet } from './utils.js';

/**
 * ウィジェット処理
 * - YouTube iframe の HTTPS 化
 * - GitHub Gist の展開
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

  // 2. GitHub Gist の展開
  const promises = [];
  {
    // getElementsByTagName は live collection なので、Array.from で配列に変換
    const scripts = Array.from(dom.getElementsByTagName('script'));
    const gistScripts = scripts.filter(s => s.src && s.src.match(/^https:\/\/gist\.github\.com\/[^.]+?\.js$/));
    console.error(`[widgets] Found ${gistScripts.length} GitHub Gist scripts`);

    for (const script of gistScripts) {
      const promise = httpsGet(script.src, { timeout: 10000 })
        .then((res) => {
          if (res.statusCode !== 200) {
            throw new Error(`HTTP ${res.statusCode}`);
          }

          console.error(`[widgets] Expanding Gist: ${script.src}`);

          // document.write をキャプチャするためのサンドボックス
          let written = '';
          const sandbox = {
            document: {
              write: function (str) {
                written += str;
              }
            }
          };

          // Gist スクリプトを実行して document.write をキャプチャ
          vm.runInNewContext(res.body, sandbox, {
            timeout: 5000  // スクリプト実行のタイムアウト
          });

          // script タグを div に置換
          const div = dom.ownerDocument.createElement('div');
          div.innerHTML = written;
          div.className = 'gist-github-com-js';
          script.parentNode.replaceChild(div, script);

          console.error(`[widgets] Gist expanded successfully: ${script.src}`);
        })
        .catch((err) => {
          // エラーは無視（script タグをそのまま残す）
          console.error(`[widgets] Failed to fetch Gist: ${script.src}, ${err.message}`);
        });

      promises.push(promise);
    }
  }

  // すべての Gist 展開を並行実行
  await Promise.all(promises);

  console.error(`[widgets] Completed in ${Date.now() - startTime}ms`);
  return dom;
}
