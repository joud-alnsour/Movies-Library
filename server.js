/* eslint-disable no-undef */
'use strict';

  
require('dotenv').config(); 
const express = require('express');  
 
const cors = require('cors');  
 
const movieData = require('./Movie Data/data.json');  
 
const { default: axios } = require('axios');
 
const PORT = process.env.PORT;
const app = express();  
app.use(cors());  

app.use(express.json());   
   

const pg = require('pg');  

 
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
 

app.get('/', homePageHandler); 
app.get('/Favorite', favouritePageHandler);  
app.get('/trending', trendingPageHandler);
app.get('/regions', regionsHandler);
app.get('/search', searchHandler);
app.get('/genre', genreHandler);

app.post('/addmovie', addMovieHandler); 
app.get('/getmyMovies', getMoviesHandler);  

 
app.put('/UPDATE/:id', movieUpdateHandler);  
app.delete('/DELETE/:id', movieDeleteHandler);
app.get('/getMovie/:id', specificMovieHandler);

app.get('*', notFoundHandler);  
app.use(errorHandler);  

 
function Favourite(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
}
function Searcher(id, backdrop_path, release_date) {
  this.id = id;
  this.backdrop_path = backdrop_path;
  this.release_date = release_date;
}

function Regioner(iso_3166_1, english_name, native_name) {
  this.iso_3166_1 = iso_3166_1;
  this.english_name = english_name;
  this.native_name = native_name;
}

function Genrer(id, name) {
  this.id = id;
  this.name = name;
}
 
function Error(status, responseText) {
  this.status = status;
  this.responseText = responseText;
}

 

let url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.APIKEY}`; 

function homePageHandler(req, res) {
  

  return res.status(200).send('welcome to home page');  
}

function favouritePageHandler(req, res) {
  return res.status(200).send('Welcome to the Favorite Page ');  
}
 
function trendingPageHandler(req, res) {
  axios
    .get(url)
    .then((dataApi) => {
      
      let obj = dataApi.data.results.map((ele) => {
        return new Favourite(ele.id, ele.title, ele.release_date, ele.poster_path, ele.overview); 
      });
      res.status(200).json(obj);
    })
    .catch((err) => {
      

      errorHandler(err, req, res);
    });
}

function searchHandler(req, res) {
  

  let urls = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=spiderman&page=1&include_adult=false`;
  axios
    .get(urls)
    .then((dataApi) => {
      let obj = dataApi.data.results.map((elee) => {
        return new Searcher(elee.id, elee.backdrop_path, elee.release_date);
      });
      res.status(200).json(obj);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}

function regionsHandler(req, res) {
  let urls = `https://api.themoviedb.org/3/watch/providers/regions?api_key=${process.env.APIKEY}&language=en-US`;
  axios
    .get(urls)
    .then((dataApi) => {
      let obj = dataApi.data.results.map((elee) => {
        return new Regioner(elee.iso_3166_1, elee.english_name, elee.native_name);
      });
      res.status(200).json(obj);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
function genreHandler(req, res) {
  let urls = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.APIKEY}&language=en-US`;
  axios
    .get(urls)
    .then((dataApi) => {
      let obj = dataApi.data.genres.map((elee) => {
        return new Genrer(elee.id, elee.name);
      });
      res.status(200).json(obj);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
 
function addMovieHandler(req, res) {
  let movies = req.body;
   
  let sql = 'INSERT INTO favmovies(title,original_title,vote_count,poster_path,overview,release_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;';
  let obj = [
    movies.title || '',
    movies.original_title || '',
    movies.vote_count || 0,
    movies.poster_path || '',
    movies.overview || '',
    movies.release_date || '',
  ];  
  console.log(obj);

  client
    .query(sql, obj)
    .then((data) => {
      res.status(200).json(data.rows);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
 
function getMoviesHandler(req, res) {
  // eslint-disable-next-line quotes
  let sql = `SELECT * FROM favmovies;`;
  client
    .query(sql)
    .then((data) => {
      res.status(200).json(data.rows);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
 
function movieUpdateHandler(req, res) {
  const id = req.params.id;
  let movies = req.body;
  
  const sql = `UPDATE favmovies SET title=$1,original_title=$2,vote_count=$3,poster_path=$4,overview=$5,release_date=6$  WHERE id=$7 RETURNING *;`;  
  let obj = [
    movies.title || '',
    movies.original_title || '',
    movies.vote_count || 0,
    movies.poster_path || '',
    movies.overview || '',
    movies.release_date || '',
    id,
  ];
  client
    .query(sql, obj)
    .then((data) => {
      res.status(200).json(data.rows);  
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
//Task14
function movieDeleteHandler(req, res) {
  const id = req.params.id;
  let sql = `DELTE FROM favmovies WHERE id=$1;`;  
  const obj = [id];
  client
    .query(sql, obj)
    .then(() => {
      res.status(200).send('the list has been updated');  
       
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}
//Task14
function specificMovieHandler(req, res) {
  const id = req.params.id;
  let sql = `SELECT * FROM favmovies WHERE id=$1;`;
  let obj = [id];
  client
    .query(sql, obj)
    .then((data) => {
      res.status(200).json(data.rows);
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}

function notFoundHandler(req, res) {
  let obj = new Error(404, 'Sorry, something went wrong,page not found error');
  res.status(404).send(obj);
}

function errorHandler(err, req, res) {
  const errorr = {
    status: 500,
    message: 'error',
  };
  res.status(500).send(errorr);
}
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listining to port ${PORT}`);
  });
});


setTimeout(() => {
  console.log('inside the setTimeout');
}, 0); 
