DROP TABLE IF EXISTS favMovies;

CREATE TABLE IF NOT EXISTS favMovies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    releaseDate VARCHAR(255),
    posterPath VARCHAR(255),
    overview VARCHAR(10000)
        
);