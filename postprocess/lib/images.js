import { BaseProcessor } from './base.js';
import { getImageSize } from './utils.js';

/**
 * ImageProcessor
 * - URL の正規化（Google Photos, Hatena, Amazon）
 * - 画像サイズの自動取得
 */
export class ImageProcessor extends BaseProcessor {
  static appliesRegexp = /<img\b/;

  applies(dom) {
    return !!dom.querySelector('img[src]');
  }

  async process(dom, baseURL) {
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

    // 4. 画像サイズの自動取得と表示最適化属性の追加
    const promises = [];
    {
      const imgs = dom.querySelectorAll('img[src]');
      imgs.forEach((img, index) => {
        if (!img.src) return;

        // 1. decoding="async" は副作用がほぼないため全画像に適用
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }

        // 2. loading="lazy" は最初の1枚を避ける（LCP 悪化防止）
        // 既に属性がある場合は尊重する
        if (!img.hasAttribute('loading') && index > 0) {
          img.setAttribute('loading', 'lazy');
        }

        if (img.width || img.height) return;  // 既にサイズが設定されている場合はスキップ

        let imgUrl = img.src;
        if (imgUrl.startsWith('/') && baseURL) {
          imgUrl = baseURL.replace(/\/$/, '') + imgUrl;
        }

        const promise = getImageSize(imgUrl, 5000)
          .then((size) => {
            img.width = size.width;
            img.height = size.height;
            console.error(`[images] Got size for ${imgUrl}: ${size.width}x${size.height}`);
          })
          .catch((err) => {
            // エラーは無視（サイズ取得できなくても続行）
            console.error(`[images] Failed to get image size for ${imgUrl}: ${err.message}`);
          });

        promises.push(promise);
      });
      console.error(`[images] Fetching size for ${promises.length} images in parallel`);
    }

    // すべての画像サイズ取得を並行実行
    await Promise.all(promises);

    console.error(`[images] Completed in ${Date.now() - startTime}ms`);
  }
}
