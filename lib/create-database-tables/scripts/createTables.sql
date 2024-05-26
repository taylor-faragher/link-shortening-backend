CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        url VARCHAR(2048) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS linkuser (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        profileInfo JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile_info JSONB
    );

CREATE TABLE IF NOT EXISTS linkuseridtolinksid (
        user_id INTEGER NOT NULL,
        link_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, link_id),
        FOREIGN KEY (user_id) REFERENCES "linkuser"(id) ON DELETE CASCADE,
        FOREIGN KEY (link_id) REFERENCES "links"(id) ON DELETE CASCADE
    );