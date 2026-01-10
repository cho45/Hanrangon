import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs/promises';
import path from 'path';

const SRC_SVG = '../docs/hanrangen.svg';
const STATIC_DIR = '../static';
const IMAGE_DIR = path.join(STATIC_DIR, 'images');

/**
 * 非正方形の画像を、アスペクト比を維持したまま
 * 指定された正方形サイズのキャンバスの中央に配置する
 */
async function resizeToSquare(buffer, targetSize, isOpaque, noPadding = false) {
  const metadata = await sharp(buffer).metadata();
  const padding = noPadding ? 0 : Math.round(targetSize * 0.15);
  const maxInnerSize = targetSize - padding * 2;

  // 元画像が縦長か横長かに応じて、収まるようにリサイズ
  const scale = Math.min(maxInnerSize / metadata.width, maxInnerSize / metadata.height);
  const width = Math.round(metadata.width * scale);
  const height = Math.round(metadata.height * scale);

  const bgColor = isOpaque 
    ? { r: 255, g: 255, b: 255, alpha: 1 } 
    : { r: 255, g: 255, b: 255, alpha: 0 };

  let image = sharp(buffer)
    .resize(width, height)
    .extend({
      top: Math.floor((targetSize - height) / 2),
      bottom: Math.ceil((targetSize - height) / 2),
      left: Math.floor((targetSize - width) / 2),
      right: Math.ceil((targetSize - width) / 2),
      background: bgColor
    });

  if (isOpaque) {
    image = image.flatten({ background: { r: 255, g: 255, b: 255 } });
  }

  return image.png();
}

async function generate() {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
  const svgBuffer = await fs.readFile(SRC_SVG);

  // 1. icon.svg
  const svgText = svgBuffer.toString();
  const modernSvg = svgText
    .replace(/fill:#000000/g, 'fill:currentColor')
    .replace('</svg>', `  <style>:root{color:#000}@media(prefers-color-scheme:dark){:root{color:#fff}}</style></svg>`);
  await fs.writeFile(path.join(IMAGE_DIR, 'icon.svg'), modernSvg);
  console.log('Generated: icon.svg');

  // 2. apple-touch-icon.png (不透明・白背景)
  const appleIcon = await resizeToSquare(svgBuffer, 180, true);
  await appleIcon.toFile(path.join(IMAGE_DIR, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');

  // 3. Android / Manifest用 PNG (透過)
  for (const size of [192, 512]) {
    const png = await resizeToSquare(svgBuffer, size, false);
    await png.toFile(path.join(IMAGE_DIR, `web-app-manifest-${size}.png`));
    console.log(`Generated: web-app-manifest-${size}.png`);
  }

  // 4. favicon.ico (パディングなし)
  const icoPngs = await Promise.all([16, 32, 48].map(size => resizeToSquare(svgBuffer, size, false, true).then(s => s.toBuffer())));
  const icoBuffer = await pngToIco(icoPngs);
  await fs.writeFile(path.join(IMAGE_DIR, 'favicon.ico'), icoBuffer);
  console.log('Generated: favicon.ico (no padding)');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});