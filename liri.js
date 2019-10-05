const env = require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

const logFile = "./logfile.log";
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
      let output = [];

      output.push(`Event Results for ${band}`);      
      response.data.forEach(event => {
        const eventDate = moment(event.datetime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY [at] hh:mm:ss a");
        
        let eventOutput = `${event.venue.name} - ${event.venue.city}, `;
        event.venue.region.length > 0 ? eventOutput += `${event.venue.region}, ` : null;
        eventOutput += `${event.venue.country} - ${eventDate}`;

        output.push(eventOutput);
      })
      printAndLog(output,'Bands In Town event search');
    })
}


function spotifySongSearch(spotify, song = "The Sign") {
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

      let output = [];
      output.push(`Artist${artistNames.includes(",") ? "s" : ""}: ${artistNames}`);
      output.push(`Song: ${songResult.name}`);
      output.push(`Album: ${songResult.album.name}`);
      songResult.preview_url ? output.push(`Listen to a Preview: ${songResult.preview_url}`)
        : output.push(`Listen on Spotify: ${songResult.external_urls.spotify}`);

      printAndLog(output,'Spotify song search');
    });
}


function getMovieInfo(query, movie = "Mr. Nobody") {
  const queryUrl = `http://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&r=json`;

  query.get(queryUrl)
    .then(response => {
      let output = [];
      output.push(`Title: ${response.data.Title}`);
      output.push(`Released: ${response.data.Year}`);
      output.push(`IMDB Rating: ${response.data.imdbRating}`);
      output.push(`Rotten Tomatoes Score: ${response.data.Ratings.find(rating=>{return rating.Source === "Rotten Tomatoes"}).Value}`);
      output.push(`Made in: ${response.data.Country}`);
      output.push(`Language: ${response.data.Language}`);
      output.push(`Plot: ${response.data.Plot}`);
      output.push(`Actors: ${response.data.Actors}`);

      printAndLog(output,'OMDB movie search');
    })
}


function doWhatItSays(fs,filename){
  const result = fs.readFileSync(filename,'utf8').split(",");
  return { action: result[0].trim(), lookupItem: result[1].trim() };
}


function printAndLog(outputArr, type){
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  fs.appendFileSync(logFile,`\n***** ${timestamp} - Returning ${type} information *****\n`);

  outputArr.forEach(output=>{
    fs.appendFile(logFile,`${output}\n`,err=>{
      if(err){
        console.log("ERROR - printAndLog - Unable to write data to log file.");
      }
    })
    console.log(output);
  })
}