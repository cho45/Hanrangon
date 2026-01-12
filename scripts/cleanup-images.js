import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { promisify } from 'node:util';

/**
 * 設定
 */
const UPLOAD_DIR = '/data/public/images';
const DB_PATH = 'var/db/data.db';

async function main() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        console.error(`エラー: ディレクトリが見つかりません: ${UPLOAD_DIR}`);
        process.exit(1);
    }

    const db = new sqlite3.Database(DB_PATH);
    const get = promisify(db.get.bind(db));

    console.log(`スキャン中: ${UPLOAD_DIR}...`);
    const allFiles = fs.readdirSync(UPLOAD_DIR);
    const jpgFiles = allFiles.filter(f => /\.(jpe?g)$/i.test(f));

    console.log(`全 ${allFiles.length} ファイル中、JPG/JPEG は ${jpgFiles.length} 件です。`);
    console.log(`DB (${DB_PATH}) を参照して孤立したファイルを特定します...\n`);

    let orphanCount = 0;
    const orphans = [];

    for (const file of jpgFiles) {
        // 1. DB (entries) にファイル名が含まれているかチェック
        // body または formatted_body に含まれているか
        const query = 'SELECT id FROM entries WHERE body LIKE ? OR formatted_body LIKE ? LIMIT 1';
        const row = await get(query, [`%${file}%`, `%${file}%`]);

        if (!row) {
            // 2. 拡張子なしのベース名でもチェック (念のため)
            const baseName = path.basename(file, path.extname(file));
            
            // 3. すでに .avif が存在するか確認 (変換済みでJPGが残っているだけのケースを特定するため)
            const avifPath = path.join(UPLOAD_DIR, `${baseName}.avif`);
            const hasAVIF = fs.existsSync(avifPath);

            orphans.push({
                file,
                hasAVIF,
                path: path.join(UPLOAD_DIR, file)
            });
            
            const status = hasAVIF ? '[変換済み/不要]' : '[完全孤立/不明]';
            console.log(`${status} ${file}`);
            orphanCount++;
        }
    }

    console.log(`\n結果: ${orphanCount} 個の参照されていないファイルが見つかりました。`);
    
    if (orphanCount > 0) {
        console.log('\nこれらを削除するには以下のコマンドを実行してください（あるいはこのスクリプトを修正して unlink を有効にしてください）:');
        console.log('# rm ' + orphans.map(o => o.path).join(' '));
    }

    db.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
