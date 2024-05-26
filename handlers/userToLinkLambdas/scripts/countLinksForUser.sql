SELECT user_id, COUNT(*) AS link_count
FROM linkuseridtolinksid
WHERE user_id = 1
GROUP BY user_id;