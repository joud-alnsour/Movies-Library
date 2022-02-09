/* eslint-disable no-undef */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const app = express();
const { default: axios } = require('axios'); // used to send requests to other APIs and get the data from
const pg = require('pg'); // will provide us a client
app.use(express.json());// use to parse the json language to readerable not json language so it solves the undefined inside the terminal
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL) || new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
// const client = new pg.Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

const movieData = require('./MovieData/data.json');


app.get('/',movieInfoHandler);


// app.get('/users',handleQuery);//new add

app.get('/favorite',favHandler);
app.get('/trending',trendingHandler);
app.get('/search',searchHandler);
app.get('/genre',genreHandler);
app.get('/region',regionHandler);

app.post('/addMovie',addMovieHandler);
app.get('/getMovies',getMoviesHandler);


app.put('/UPDATE/:id',updateidHandler); // notice the : after the /, you can have more than one to update /:name for ex
app.delete('/DELETE/:id',deleteidHandler);//new
app.get('/getOneMoive/:id',getOneMovieHandler);


app.get('*',notFoundHandler); // error from the client
app.use(errorHandler);// error from the server500


const url =`https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.APIKEY}`;

let urlSearchMovie = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=Spider-Man&page=1&include_adult=false&year=2022`;
let urlGenre = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.APIKEY}&language=en-US`;
let urlRegion = `https://api.themoviedb.org/3/watch/providers/regions?api_key=${process.env.APIKEY}&language=en-US`;


function Movie(title,poster_path,overview){
  this.title = title;
  this.posterPath = poster_path;
  this.overview = overview;

}
function Trending (id,title,release_date,poster_path,overview){
  this.id = id;
  this.title = title;
  this.releaseDate = release_date;
  this.posterPath = poster_path;
  this.overview = overview;

}

function Genre(id,name){
  this.id = id;
  this.name = name;

}


function Search (id,title,release_date,poster_path,overview){
  this.id = id;
  this.title = title;
  this.releaseDate = release_date;
  this.posterPath = poster_path;
  this.overview = overview;

}


function Region(iso_3166_1,english_name,native_name){
  this.iso_3166_1 = iso_3166_1;
  this.english_name = english_name;
  this.native_name = native_name;
}


function errorHandler(err, req, res) {
  const errorr = {
    status: 500,
    message: 'error',
  };
  res.status(500).send(errorr);
}


function regionHandler(req,res){
  axios.get(urlRegion)// you can only name one as you like and its the one next to then
    .then((result)=>{//axios will get me the api in a data// always console.log(result from then).data(from axios) then you will see if you need to add another .data or anything else
      // console.log(result.data.genres);
      let movieRegion = result.data.results.map(movie =>{//the data here is always the same because of the axios
        return new Region(movie.iso_3166_1,movie.english_name,movie.native_name);
      });
      res.status(200).json(movieRegion);

    }).catch((err) =>{
      errorHandler(err, req, res);

    });
}



function genreHandler(req,res){
  axios.get(urlGenre)
    .then((result)=>{
      // console.log(result.data.genres);
      let movieGenre = result.data.genres.map(movie =>{
        return new Genre(movie.id,movie.name);
      });
      res.status(200).json(movieGenre);

    }).catch((err) =>{
      errorHandler(err, req, res);

    });
}

function updateidHandler(req,res){//new
  const id = req.params.id;
  const movie = req.body;
  const sql = 'UPDATE favMovies SET title = $1,releaseDate = $2,overview = $3,posterPath = $4 WHERE id =$5 RETURNING *;';
  let values = [movie.title || '', movie.releaseDate || '', movie.overview || '', movie.posterPath || '',id];
  client.query(sql,values).then(date=>{
    res.status(200).json(date.rows);
  }).catch((err) =>{ //if it was before status200 it may execute the error and the status200 and cause a problem
    errorHandler(err, req, res);

  });

  // UPDATE favMovies
  // SET column = value1, column = value2
  // WHERE condition
}

function deleteidHandler(req,res){//.id must be the same as the endpoint i put, if movieid up there, it should be movieid here
  const id = req.params.id;//params is a parameter for the id or anything you want
  const sql = `DELETE FROM favMovies WHERE id=${id}`;
  client.query(sql).then(()=>{
    res.status(200).send('The movie has been deleted');
    // res.status(204).json({});//empty object to tell the devs about it being deleted
  }).catch((err) =>{ //if it was before status200 it may execute the error and the status200 and cause a problem
    errorHandler(err, req, res);

  });

}


function getOneMovieHandler(req,res){
  const id = req.params.id;//params is a parameter for the id or anything you want
  const sql = `SELECT * FROM favMovies WHERE id=${id}`;
  client.query(sql).then((data)=>{
    res.status(200).json(data.rows);

  }).catch((err) =>{ //if it was before status200 it may execute the error and the status200 and cause a problem
    errorHandler(err, req, res);

  });

}






function searchHandler(req,res){
  axios.get(urlSearchMovie)
    .then((result)=>{
      console.log(result.data.results);
      let movieSearch = result.data.results.map(movie =>{
        return new Search(movie.id,movie.title,movie.release_date,movie.poster_path,movie.overview);
      });
      res.status(200).json(movieSearch); // should be after the then promise so if executed it will do this as well

    }).catch((err) =>{ //if it was before status200 it may execute the error and the status200 and cause a problem
      errorHandler(err, req, res);

    });
}


function trendingHandler(req,res){
  axios.get(url)
    .then((result)=>{
      // console.log(result.data.results);
      let movieTrend = result.data.results.map(movie =>{
        return new Trending(movie.id,movie.title,movie.release_date,movie.poster_path,movie.overview);
      });
      res.status(200).json(movieTrend);

    }).catch((err) =>{
      errorHandler(err, req, res);

    });
}


function addMovieHandler(req,res){
  const movie = req.body;// return * all
  let sql = 'INSERT INTO favMovies(title,releaseDate,overview,posterPath) VALUES ($1,$2,$3,$4) RETURNING *;';
  let values =[movie.title || '',movie.releaseDate || '',movie.overview || '',movie.posterPath || ''];/*
  in case the movie doesnt have any of these values add an empty space not give an error*/
  client.query(sql,values).then(data => {//here query can only return data if RETURNING * is there!
    res.status(200).json(data.rows);//it should be rows[0] if we have more than one object to make sure we add all the objects in the body section not anywhere else
  }).catch(err => {//>>> and it will be at the top of the body as the newest edition there
    errorHandler(err, req, res);
  });

}

function getMoviesHandler(req,res){
  let sql = 'SELECT * FROM favMovies;';
  client.query(sql).then(data => {// query will return data which is select...
    res.status(200).json(data.rows);
    // let movies = data.rows.map(movie =>{
    //   return movie
    // }
  }).catch(err => {
    errorHandler(err, req, res);
  });
}


// function handleQuery(req, res) {//query is an object with key value pairs
//   console.log(req.query);
//   // res.send('working sucessfully');
//   res.json(req.query);
// }

function movieInfoHandler(req,res){
  let moviearray = [];
  movieData.data.forEach(movie => {
    let oneMovie = new Movie (movie.title,movie.poster_path,
      movie.overview);
    moviearray.push(oneMovie);

  });
  return res.status(200).json(moviearray);//return me the array in a json format
}

function favHandler(req,res){
  return res.status(200).send('Welcome to Favorite Page');
}

function notFoundHandler(req,res){
  return res.status(404).send('Sorry, something went wrong');
}
client.connect().then(()=>{
  app.listen(PORT,() => {
    console.log(`listening to port ${PORT}`);


  });
});