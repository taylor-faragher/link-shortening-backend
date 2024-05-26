SELECT l.* FROM links l
JOIN linkuseridtolinksid lt ON l.link_id = lt.link_id
WHERE lt.user_id = 1;