-- Verify tryout data
SELECT t.id, t.judul, t.status, 
       (SELECT COUNT(*) FROM tryout_subtes ts WHERE ts.tryout_id = t.id) as subtes_count,
       (SELECT COUNT(*) FROM tryout_soal tso 
        JOIN tryout_subtes ts2 ON tso.subtes_id = ts2.id 
        WHERE ts2.tryout_id = t.id) as soal_count
FROM tryout t;

-- Make sure all tryouts are published
UPDATE tryout SET status = 'published' WHERE status = 'draft';
