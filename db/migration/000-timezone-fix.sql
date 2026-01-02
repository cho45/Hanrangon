-- Migration: Add JST (+09:00) timezone suffix to existing DATETIME strings in entries table

UPDATE entries SET
    created_at = created_at || '+09:00'
WHERE created_at NOT LIKE '%+09:00' AND created_at NOT LIKE '%Z';

UPDATE entries SET
    modified_at = modified_at || '+09:00'
WHERE modified_at NOT LIKE '%+09:00' AND modified_at NOT LIKE '%Z';

UPDATE entries SET
    publish_at = publish_at || '+09:00'
WHERE publish_at IS NOT NULL AND publish_at NOT LIKE '%+09:00' AND publish_at NOT LIKE '%Z';
