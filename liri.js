const env = require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const axios = require("axios");
const moment = require("moment");

const spotify = new Spotify(keys.spotify);
const action = process.argv[2];
const lookupItem = process.argv[3];

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
      // console.log(response.data);

      console.log(`Event Results for ${band}`);
      response.data.forEach(event => {
        const eventDate = moment(event.datetime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY [at] hh:mm:ss a");
        // console.log(eventDate);
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

      // Dump raw data to log
      // console.log(data);
      // console.log(data.tracks.items[0]);
      // console.log(data.tracks.items[0].artists);

      console.log(`Artist${artistNames.includes(",") ? "s" : ""}: ${artistNames}`);
      console.log(`Song: ${songResult.name}`);
      console.log(`Album: ${songResult.album.name}`);
      songResult.preview_url ? console.log(`Listen to a Preview: ${songResult.preview_url}`)
        : console.log(`Listen on Spotify: ${songResult.external_urls.spotify}`);
    });
}


function getMovieInfo(query, movie) {
  const queryUrl = `http://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&r=json`;

  query.get(queryUrl)
    .then(response => {
      console.log(response.data);
    })
}