DROP TABLE IF EXISTS favmovies;

CREATE TABLE IF NOT EXISTS favmovies(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    original_title VARCHAR(255),
    vote_count INTEGER,
    poster_path VARCHAR(10000),
    overview VARCHAR(10000),
    release_date VARCHAR(255)
    );
    //add 