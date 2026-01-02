import { getImageSize } from './utils.js';

/**
 * 画像処理
 * - URL の正規化（Google Photos, Hatena, Amazon）
 * - 画像サイズの自動取得
 * @param {Document} dom - JSDOM の document.body
 * @returns {Promise<Document>}
 */
export async function processImages(dom) {
  const startTime = Date.now();
  const allImages = dom.querySelectorAll('img[src]');
  console.error(`[images] Found ${allImages.length} images`);

  // 1. Google Photos / ggpht の URL 正規化
  {
    const imgs = dom.querySelectorAll('img[src*="googleusercontent"], img[src*="ggpht"]');
    console.error(`[images] Normalizing ${imgs.length} Google Photos URLs`);
    for (const img of imgs) {
      img.src = img.src
        .replace(/^http:/, 'https:')  // HTTPS 化
        .replace(/\/s\d+\//g, '/s2048/');  // サイズを s2048 に統一
    }
  }

  // 2. Hatena Fotolife の URL 正規化
  {
    const imgs = dom.querySelectorAll('img[src*="cdn-ak.f.st-hatena.com"]');
    console.error(`[images] Normalizing ${imgs.length} Hatena Fotolife URLs`);
    for (const img of imgs) {
      img.src = img.src.replace(/^http:/, 'https:');  // HTTPS 化
    }
  }

  // 3. Amazon 画像の URL 正規化
  {
    const imgs = dom.querySelectorAll('img[src*="ecx.images-amazon.com"]');
    console.error(`[images] Normalizing ${imgs.length} Amazon image URLs`);
    for (const img of imgs) {
      img.src = img.src.replace(
        /^http:\/\/ecx\.images-amazon\.com/,
        'https://images-na.ssl-images-amazon.com'
      );
    }
  }

  // 4. 画像サイズの自動取得
  const promises = [];
  {
    const imgs = dom.querySelectorAll('img[src]');
    for (const img of imgs) {
      if (!img.src) continue;
      if (img.width || img.height) continue;  // 既にサイズが設定されている場合はスキップ

      const promise = getImageSize(img.src, 5000)
        .then((size) => {
          img.width = size.width;
          img.height = size.height;
          console.error(`[images] Got size for ${img.src}: ${size.width}x${size.height}`);
        })
        .catch((err) => {
          // エラーは無視（サイズ取得できなくても続行）
          console.error(`[images] Failed to get image size for ${img.src}: ${err.message}`);
        });

      promises.push(promise);
    }
    console.error(`[images] Fetching size for ${promises.length} images in parallel`);
  }

  // すべての画像サイズ取得を並行実行
  await Promise.all(promises);

  console.error(`[images] Completed in ${Date.now() - startTime}ms`);
  return dom;
}
