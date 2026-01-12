const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

    const files = fs.readdirSync(AVIF_DIR);
    let processCount = 0;
    let refinedCount = 0;

    for (const file of files) {
        if (!file.toLowerCase().endsWith('.avif')) continue;

        const avifPath = path.join(AVIF_DIR, file);
        const baseName = path.basename(file, '.avif');
        
        // 対応するJPG/JPEGを探す
        let jpgFile = baseName + '.jpg';
        let jpgPath = path.join(JPG_DIR, jpgFile);
        
        if (!fs.existsSync(jpgPath)) {
            jpgFile = baseName + '.jpeg';
            jpgPath = path.join(JPG_DIR, jpgFile);
        }

        if (!fs.existsSync(jpgPath)) {
            // console.log(`スキップ: 元ファイルが見つかりません (${file})`);
            continue;
        }

        processCount++;

        const avifStat = fs.statSync(avifPath);
        const jpgStat = fs.statSync(jpgPath);

        // ファイルサイズの比較 (AVIF > JPG だったら再エンコード)
        if (avifStat.size > jpgStat.size) {
            console.log(`
[改善対象発見] ${file}`);
            console.log(`  AVIF: ${(avifStat.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  JPG : ${(jpgStat.size / 1024 / 1024).toFixed(2)} MB`);
            
            const cmd = `${AVIFENC_CMD} "${jpgPath}" "${avifPath}"`;
            console.log(`  実行: ${cmd}`);

            try {
                execSync(cmd, { stdio: 'inherit' });
                
                const newStat = fs.statSync(avifPath);
                const reduction = ((1 - newStat.size / avifStat.size) * 100).toFixed(1);
                console.log(`  結果: ${(newStat.size / 1024 / 1024).toFixed(2)} MB (${reduction}% 削減)`);
                refinedCount++;
            } catch (err) {
                console.error(`  エラー: ${file} の処理に失敗しました: ${err.message}`);
            }
        }
    }

    console.log(`
完了: ${processCount} 個のファイルをチェックし、${refinedCount} 個を再エンコードしました。`);
}

main();
