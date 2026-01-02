import https from 'node:https';
import imageSize from 'image-size';

/**
 * HTTPS GET リクエストを実行
 * @param {string} url - リクエスト URL
 * @param {object} options - リクエストオプション
 * @param {number} options.timeout - タイムアウト（ミリ秒、デフォルト: 5000）
 * @returns {Promise<{statusCode: number, headers: object, body: string}>}
 */
export async function httpsGet(url, options = {}) {
  const timeout = options.timeout || 5000;

  return new Promise((resolve, reject) => {
    let req;
    const timeoutId = setTimeout(() => {
      if (req) req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    }, timeout);

    let body = '';

    req = https.get(url, options, (res) => {
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeoutId);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

/**
 * 画像の URL から画像サイズを取得
 * HTTP Range リクエストで先頭 128KB のみダウンロードして解析
 * @param {string} imgUrl - 画像 URL
 * @param {number} timeout - タイムアウト（ミリ秒、デフォルト: 5000）
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageSize(imgUrl, timeout = 5000) {
  return new Promise((resolve, reject) => {
    let req;
    const timeoutId = setTimeout(() => {
      if (req) req.destroy();
      reject(new Error(`Image size request timeout: ${imgUrl}`));
    }, timeout);

    const chunks = [];

    req = https.get(imgUrl, {
      headers: {
        'Range': 'bytes=0-131071'  // 先頭 128KB のみリクエスト
      }
    }, (res) => {
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        clearTimeout(timeoutId);

        try {
          const buffer = Buffer.concat(chunks);
          const size = imageSize(buffer);
          resolve({
            width: size.width,
            height: size.height
          });
        } catch (err) {
          reject(new Error(`Failed to get image size: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}
