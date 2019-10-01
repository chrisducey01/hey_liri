const env = require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');


const spotify = new Spotify(keys.spotify);

const action = process.argv[2];
const lookupItem = process.argv[3];

switch (action) {
  case "spotify-this-song":
    spotifySongSearch(spotify, lookupItem);
    break;
  default:
    console.log(`Error: Unknown option specified on input: ${action}`);
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
