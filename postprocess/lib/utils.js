import http from 'node:http';
import https from 'node:https';
import imageSize from 'image-size';

/**
 * HTTP/HTTPS GET リクエストを実行
 * @param {string} url - リクエスト URL
 * @param {object} options - リクエストオプション
 * @param {number} options.timeout - タイムアウト（ミリ秒、デフォルト: 5000）
 * @returns {Promise<{statusCode: number, headers: object, body: string}>}
 */
export async function httpsGet(url, options = {}) {
  const timeout = options.timeout || 5000;
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    let req;
    const timeoutId = setTimeout(() => {
      if (req) req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    }, timeout);

    let body = '';

    req = protocol.get(url, options, (res) => {
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
 * HTTP Range リクエストで先頭 256KB のみリクエスト
 * Range を無視して全データを送ってくるサーバーに対しては 256KB 受信時点で強制切断する
 * @param {string} imgUrl - 画像 URL
 * @param {number} timeout - タイムアウト（ミリ秒、デフォルト: 5000）
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageSize(imgUrl, timeout = 5000) {
  const protocol = imgUrl.startsWith('https') ? https : http;
  const MAX_RECEIVE_SIZE = 262144; // 256KB

  return new Promise((resolve, reject) => {
    let req;
    let receivedBytes = 0;
    const chunks = [];
    let completed = false;

    const timeoutId = setTimeout(() => {
      if (req) req.destroy();
      reject(new Error(`Image size request timeout: ${imgUrl}`));
    }, timeout);

    const finish = () => {
      if (completed) return;
      completed = true;
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
    };

    req = protocol.get(imgUrl, {
      headers: {
        'Range': `bytes=0-${MAX_RECEIVE_SIZE - 1}`
      }
    }, (res) => {
      res.on('data', (chunk) => {
        chunks.push(chunk);
        receivedBytes += chunk.length;

        if (receivedBytes >= MAX_RECEIVE_SIZE) {
          req.destroy();
          finish();
        }
      });

      res.on('end', finish);
    });

    req.on('error', (err) => {
      if (completed) return;
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

