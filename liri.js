//Import node modules
const env = require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

//Setup arguments
const logFile = "./logfile.log";
const spotify = new Spotify(keys.spotify);
let action = process.argv[2];
let lookupItem = process.argv.slice(3).join(" ");

//Set lookup item to undefined if the user didn't pass in 
//a second parameter (what to search for).  This will allow
//the function being called to have its default value used 
//instead of passing in a blank string.
lookupItem = lookupItem === "" ? undefined : lookupItem;

//If user chooses the do-what-it-says command
//Call the doWhatItSays function to read the 
//random.txt file and get the parameters from the file
if (action === "do-what-it-says") {
  let result = doWhatItSays(fs, "./random.txt");
  action = result.action;
  lookupItem = result.lookupItem;
}

//Call the appropriate function based on user input
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


//****************************************************************
// function: getBandEvent
// 
// purpose:  search the Bands In Town API to get event
//   information based on a band passed into the function
//   and then print it out to the console and a log file
//
// arguments:
//   query - an axios object used to make the API request
//   band - a string containing the band to search the API for
//
//****************************************************************
function getBandEvent(query, band) {
  const queryUrl = `https://rest.bandsintown.com/artists/${band}/events?app_id=codingbootcamp`;
  query.get(queryUrl)
    .then(response => {
      let output = [];

      if (!Array.isArray(response.data) && response.data.includes("Not found")) {
        output.push(`No events found for ${band}`);
      }
      else{
        output.push(`Event Results for ${band}`);
        response.data.forEach(event => {
          const eventDate = moment(event.datetime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY [at] hh:mm:ss a");

          let eventOutput = `${event.venue.name} - ${event.venue.city}, `;
          event.venue.region.length > 0 ? eventOutput += `${event.venue.region}, ` : null;
          eventOutput += `${event.venue.country} - ${eventDate}`;

          output.push(eventOutput);
        })
      }

      printAndLog(output, 'Bands In Town event search');
    })
}


//****************************************************************
// function: spotifySongSearch
// 
// purpose:  Makes a request to the Spotify API to get 
//   information about a song and print it out to the console
//   and a log file.  The limit option will return up to 5 results.
//
// arguments:
//   spotify - a spotify object from the node-spotify api node module
//   song - a string containing the song to search the API for
//     (defaults to The Sign if a value isn't passed in)
//
//****************************************************************
function spotifySongSearch(spotify, song = "The Sign") {
  spotify.search(
    {
      type: 'track',
      query: song,
      limit: 5
    },
    (err, data) => {
      if (err) {
        return console.log('Error occurred: ' + err);
      }

      let output = [];
      data.tracks.items.forEach(item=>{
        const songResult = item;
        const artistNames = songResult.artists.map(artist => {
          return artist.name;
        }).join(", ");
  
        output.push(`Artist${artistNames.includes(",") ? "s" : ""}: ${artistNames}`);
        output.push(`Song: ${songResult.name}`);
        output.push(`Album: ${songResult.album.name}`);
        songResult.preview_url ? output.push(`Listen to a Preview: ${songResult.preview_url}`)
          : output.push(`Listen on Spotify: ${songResult.external_urls.spotify}`);  
        output.push(" ");
      })

      printAndLog(output, 'Spotify song search');
    });
}


//****************************************************************
// function: getMovieInfo
// 
// purpose:  Makes a request to the Spotify API to get 
//   information about a song and print it out to the console
//   and a log file.  The limit option will return up to 5 results.
//
// arguments:
//   query - an axios object used to make the API request
//   movie - a string containing the movie to search the API for
//     (defaults to Mr Nobody if a value isn't passed in)
//
//****************************************************************
function getMovieInfo(query, movie = "Mr. Nobody") {
  const queryUrl = `http://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&r=json`;

  query.get(queryUrl)
    .then(response => {
      let output = [];
      output.push(`Title: ${response.data.Title}`);
      output.push(`Released: ${response.data.Year}`);
      output.push(`IMDB Rating: ${response.data.imdbRating}`);
      output.push(`Rotten Tomatoes Score: ${response.data.Ratings.find(rating => { return rating.Source === "Rotten Tomatoes" }).Value}`);
      output.push(`Made in: ${response.data.Country}`);
      output.push(`Language: ${response.data.Language}`);
      output.push(`Plot: ${response.data.Plot}`);
      output.push(`Actors: ${response.data.Actors}`);

      printAndLog(output, 'OMDB movie search');
    })
}


//****************************************************************
// function: doWhatItSays
// 
// purpose:  Reads a file and parses into an object that mimics
//   parameters passed in from the command line.  File is expected
//   to only be one line and is two comma separated values.
//
// arguments:
//   fs - a file system node module used to read the input file
//   filename - input filename to read values from
//
// returns:  object:
// {
//   action: the action to perform (event/movie/song search),
//   lookupItem:  what to lookup in the search (band/song/movie)
// }
//
//****************************************************************
function doWhatItSays(fs, filename) {
  const result = fs.readFileSync(filename, 'utf8').split(",");
  return { action: result[0].trim(), lookupItem: result[1].trim() };
}


//****************************************************************
// function: printAndLog
// 
// purpose:  Prints array of strings passed in to the console and
//   also appends to a log file
//
// arguments:
//   outputArr - array of strings that contains results from api calls
//   type - what type of api call was executed (added to log)
//
//****************************************************************
function printAndLog(outputArr, type) {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  fs.appendFileSync(logFile, `\n***** ${timestamp} - Returning ${type} information *****\n`);

  outputArr.forEach(output => {
    fs.appendFile(logFile, `${output}\n`, err => {
      if (err) {
        console.log("ERROR - printAndLog - Unable to write data to log file.");
      }
    })
    console.log(output);
  })
}