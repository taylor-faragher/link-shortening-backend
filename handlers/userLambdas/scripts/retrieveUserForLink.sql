SELECT u.* FROM linkuser u
JOIN linkuseridtolinksid lt ON u.user_id = lt.user_id
WHERE lt.link_id = 1;