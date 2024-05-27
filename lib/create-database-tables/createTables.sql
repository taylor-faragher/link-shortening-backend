CREATE TABLE IF NOT EXISTS links (
        link_id VARCHAR(10) PRIMARY KEY,
        link_url VARCHAR(2048) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS linkuser (
        user_id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        profileInfo JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS linkuseridtolinksid (
        user_id VARCHAR NOT NULL,
        link_id VARCHAR NOT NULL,
        PRIMARY KEY (user_id, link_id),
        FOREIGN KEY (user_id) REFERENCES "linkuser"(user_id) ON DELETE CASCADE,
        FOREIGN KEY (link_id) REFERENCES "links"(link_id) ON DELETE CASCADE
    );