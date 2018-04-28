// app.js
const express = require('express')
const app     = express()
const hbs     = require('hbs')
const path    = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bodyParser = require('body-parser');


mongoose.connect('mongodb://localhost/video')
  .then(() => {
    console.log('Connected to Mongo!')
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });


const movieSchema = new Schema({
  title: String,
  director: String,
  year: String,
  rate: String,
  duration: String,
  genre: [String]
})


const MovieCollection = mongoose.model('movies', movieSchema);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));



//////////////////////////////////////// home page with all the movies
app.get('/movies', function (req, res) {

  MovieCollection.find({})
  .then((movies) => {

    let data = {};
    data.theList = movies;

    res.render('index', data)

  })

  .catch((err) => { console.log('An error happened:', err) });

})

//////////////////////////////////////////////shows individual movie
app.get('/movies/show/:theIdThing', function (req, res) {

  const theId = req.params.theIdThing
  MovieCollection.findById(theId)

  .then(movie => {

    let data = {};
    data.theMovie = movie;

    res.render('movieshow', data)

  })

  .catch(err => { console.log('An error happened:', err) });

})


////////////////////// page with all the movies by director ":director"
app.get('/movies/director/:director', function (req, res) {

  const theDirector = req.params.director
  MovieCollection.find({director: theDirector})

  .then(movies =>{

    let data = {}
    data.directorList = movies;
    data.directorName = theDirector;

    res.render('moviesbydirector', data)

  })
})


/ ///////////////////// Page with all the movies published in year ":year"
app.get('/movies/year/:year', function (req, res) {

  const theYear = req.params.year

  MovieCollection.find({year: theYear})
  .then(movies =>{

    let data = {}
    data.yearList = movies;
    data.yearValue = theYear;

    res.render('moviesbyyear', data)

  })
})


/////////// Page that renders a form to insert a new movie in the database
app.get('/movies/new', function (req, res) {

  res.render('newMovie')

})


// Adds the new movie into the database and navigates to that movies individual page
app.post('/movies/create', function (req, res){

  const theActualTitle = req.body.theTitle;
  const theActualDirector = req.body.theDirector;
  const theActualYear = req.body.theYear;
  const theActualRate = req.body.theRate;
  const theActualDuration = req.body.theDuration;

  const newMovie = new MovieCollection({
    title: theActualTitle,
    director: theActualDirector,
    year: theActualYear,
    rate: theActualRate,
    duration: theActualDuration,
  })

  newMovie.save()
  .then(movie => {

    const theId = newMovie._id;
    res.redirect('/movies/show/' + theId);

  })
  .catch((err) => { console.log('error:', err) });

})


// Deletes movie from the database/button is only on the index page right now
app.post('/movies/delete/:id', function(req, res){
  
  const movieId = req.params.id;

  MovieCollection.findByIdAndRemove(movieId)
  .then(movie =>{

    res.redirect('/movies')

  })
  .catch((err) => { console.log('error:', err) });

})


// Renders page with form to change the info about a movie in the database
app.get('/movies/edit/:id', function (req, res) {
  
  MovieCollection.findById(req.params.id)
  .then(theMovie =>{

    res.render('editMovie', {movie: theMovie}) 

  })
})


//////////////////////// Handles the updating of the movie in the database
app.post('/movies/update/:id', function (req, res){

  const id = req.params.id

  MovieCollection.findByIdAndUpdate(id,{
    title: req.body.title,
    director: req.body.director,
    year: req.body.year,
    rate: req.body.rate,
    duration: req.body.duration,
  })
  .then(movie => {

    res.redirect('/movies/show/' + id)

  })
  .catch((err) => { console.log('An error happened:', err) });
})




app.listen(3000, () => console.log('Example app listening on port 3000!'))
