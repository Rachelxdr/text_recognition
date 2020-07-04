DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pictures;
DROP TABLE IF EXISTS results;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
    bucket_name TEXT
    album_name TEXT
);

-- CREATE TABLE pictures (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     picture_name TEXT NOT NULL,
--     owner_id INTEGER NOT NULL,
--     bucket TEXT NOT NULL,
--     FOREIGN KEY (owner_id) REFERENCES users (id)
-- );

CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    return_name TEXT NOT NULL,
    origin_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
     FOREIGN KEY (owner_id) REFERENCES users (id)
);