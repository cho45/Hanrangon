import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * 設定: 環境に合わせて変更してください
 */
const AVIF_DIR = '/data/public/images';
const JPG_DIR = '/data/public/images.bak0';

// avifencのコマンドテンプレート
const AVIFENC_CMD = 'avifenc --jobs 3 --speed 6 --yuv 444 -q 80 -a tune=ssim --nclx 1/1/1';

function main() {
    if (!fs.existsSync(AVIF_DIR) || !fs.existsSync(JPG_DIR)) {
        console.error('エラー: ディレクトリが見つかりません。');
        console.error(`AVIF_DIR: ${AVIF_DIR}`);
        console.error(`JPG_DIR: ${JPG_DIR}`);
        process.exit(1);
    }

    console.log(`スキャン中: ${AVIF_DIR}...`);

    const allFiles = fs.readdirSync(AVIF_DIR)
        .filter(file => file.toLowerCase().endsWith('.avif'));

    // 最初に改善対象をすべてリストアップする
    const targets = [];
    for (const file of allFiles) {
        const avifPath = path.join(AVIF_DIR, file);
        const baseName = path.basename(file, '.avif');
        
        let jpgFile = `${baseName}.jpg`;
        let jpgPath = path.join(JPG_DIR, jpgFile);
        
        if (!fs.existsSync(jpgPath)) {
            jpgFile = `${baseName}.jpeg`;
            jpgPath = path.join(JPG_DIR, jpgFile);
        }

        if (fs.existsSync(jpgPath)) {
            const avifStat = fs.statSync(avifPath);
            const jpgStat = fs.statSync(jpgPath);

            if (avifStat.size > jpgStat.size) {
                targets.push({
                    file,
                    avifPath,
                    jpgPath,
                    avifSize: avifStat.size,
                    jpgSize: jpgStat.size
                });
            }
        }
    }

    const total = targets.length;
    console.log(`スキャン完了: 全 ${allFiles.length} ファイル中、改善対象は ${total} 件です.\n`);

    if (total === 0) {
        console.log('改善が必要なファイルはありませんでした。');
        return;
    }

    let refinedCount = 0;

    for (let i = 0; i < total; i++) {
        const { file, avifPath, jpgPath, avifSize, jpgSize } = targets[i];
        const progress = `[${i + 1}/${total}]`;

        console.log(`${progress} 処理中: ${file}`);
        console.log(`  サイズ比較: AVIF(${(avifSize / 1024 / 1024).toFixed(2)}MB) > JPG(${(jpgSize / 1024 / 1024).toFixed(2)}MB)`);
        
        const cmd = `${AVIFENC_CMD} "${jpgPath}" "${avifPath}"`;
        console.log(`  実行: ${cmd}`);

        try {
            execSync(cmd, { stdio: 'inherit' });
            
            const newStat = fs.statSync(avifPath);
            const reduction = ((1 - newStat.size / avifSize) * 100).toFixed(1);
            console.log(`  結果: ${(newStat.size / 1024 / 1024).toFixed(2)}MB (${reduction}% 削減)\n`);
            refinedCount++;
        } catch (err) {
            console.error(`  エラー: ${file} の処理に失敗しました: ${err.message}\n`);
        }
    }

    console.log(`完了: ${total} 個の対象のうち、${refinedCount} 個を再エンコードしました。`);
}

main();
