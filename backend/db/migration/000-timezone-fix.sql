-- Migration: Add JST (+09:00) timezone suffix to existing DATETIME strings in entries table
-- sqlite> select id, created_at from entries order by created_at DESC LIMIT 5;
-- 22063|2026-01-03 01:46:52.86038+09:00
-- 22062|2026-01-02 00:47:27.148676+09:00
-- 22061|2026-01-02 00:47:20.216969+09:00
-- 22060|2025-12-30 12:27:14
-- 22059|2025-12-27 01:36:33
-- 
-- 元の Perl の 実装では created_at, modified_at は 2025-12-30 12:27:14 (タイムゾーン表記なしのJST) で保存されていた
-- 今の golang の実装では 2026-01-02 00:47:20.216969+09:00 とフル形式での保存になっている

UPDATE entries SET
    created_at = created_at || '+09:00'
WHERE created_at NOT LIKE '%+09:00' AND created_at NOT LIKE '%Z';

UPDATE entries SET
    modified_at = modified_at || '+09:00'
WHERE modified_at NOT LIKE '%+09:00' AND modified_at NOT LIKE '%Z';

UPDATE entries SET
    publish_at = publish_at || '+09:00'
WHERE publish_at IS NOT NULL AND publish_at NOT LIKE '%+09:00' AND publish_at NOT LIKE '%Z';
