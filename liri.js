const env = require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

const spotify = new Spotify(keys.spotify);
let action = process.argv[2];
let lookupItem = process.argv[3];

if(action === "do-what-it-says"){
  let result = doWhatItSays(fs,"./random.txt");
  action = result.action;
  lookupItem = result.lookupItem;
}

switch (action) {
  case "concert-this":
    getBandEvent(axios, lookupItem);
    break;
  case "spotify-this-song":
    spotifySongSearch(spotify, lookupItem);
    break;
  case "movie-this":
    getMovieInfo(axios, lookupItem);
    break;
  default:
    console.log(`Error: Unknown option specified on input: ${action}`);
}


function getBandEvent(query, band) {
  const queryUrl = `https://rest.bandsintown.com/artists/${band}/events?app_id=codingbootcamp`;
  query.get(queryUrl)
    .then(response => {

      console.log(`Event Results for ${band}`);
      response.data.forEach(event => {
        const eventDate = moment(event.datetime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY [at] hh:mm:ss a");
        
        let eventOutput = `${event.venue.name} - ${event.venue.city}, `;
        event.venue.region.length > 0 ? eventOutput += `${event.venue.region}, ` : null;
        eventOutput += `${event.venue.country} - ${eventDate}`;

        console.log(eventOutput);
      })
    })
}


function spotifySongSearch(spotify, song) {
  spotify.search(
    {
      type: 'track',
      query: song,
      limit: 1
    },
    (err, data) => {
      if (err) {
        return console.log('Error occurred: ' + err);
      }

      const songResult = data.tracks.items[0];
      const artistNames = songResult.artists.map(artist => {
        return artist.name;
      }).join(", ");

      console.log(`Artist${artistNames.includes(",") ? "s" : ""}: ${artistNames}`);
      console.log(`Song: ${songResult.name}`);
      console.log(`Album: ${songResult.album.name}`);
      songResult.preview_url ? console.log(`Listen to a Preview: ${songResult.preview_url}`)
        : console.log(`Listen on Spotify: ${songResult.external_urls.spotify}`);
    });
}


function getMovieInfo(query, movie = "Mr. Nobody") {
  const queryUrl = `http://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&r=json`;

  query.get(queryUrl)
    .then(response => {
      console.log(`Title: ${response.data.Title}`);
      console.log(`Released: ${response.data.Year}`);
      console.log(`IMDB Rating: ${response.data.imdbRating}`);
      console.log(`Rotten Tomatoes Score: ${response.data.Ratings.find(rating=>{return rating.Source === "Rotten Tomatoes"}).Value}`);
      console.log(`Made in: ${response.data.Country}`);
      console.log(`Language: ${response.data.Language}`);
      console.log(`Plot: ${response.data.Plot}`);
      console.log(`Actors: ${response.data.Actors}`);
    })
}


function doWhatItSays(fs,filename){
  const result = fs.readFileSync(filename,'utf8').split(",");
  console.log(result);
  return { action: result[0].trim(), lookupItem: result[1].trim() };
}