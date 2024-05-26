BEGIN;

DELETE FROM linkuseridtolinksid
USING linkuser
WHERE linkuseridtolinksid.user_id = linkuser.user_id
AND linkuser.user_id = 1;

DELETE FROM links
WHERE link_id IN (
    SELECT link_id FROM linkuseridtolinksid WHERE user_id = 1
);

DELETE FROM linkuser
WHERE user_id = 1;

COMMIT;