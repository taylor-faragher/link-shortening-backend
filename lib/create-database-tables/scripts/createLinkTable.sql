CREATE TABLE IF NOT EXISTS "Links" (
        id SERIAL PRIMARY KEY,
        url VARCHAR(2048) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )