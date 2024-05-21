CREATE TABLE IF NOT EXISTS "userToLinkId" (
        user_id INTEGER NOT NULL,
        link_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, link_id),
        FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
        FOREIGN KEY (link_id) REFERENCES "links"(id) ON DELETE CASCADE
    );