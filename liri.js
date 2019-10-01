const env = require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');


const spotifyApi = new Spotify(keys.spotify);

spotifyApi.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
   
    data.tracks.items.forEach(item =>{
        console.log(item);
    });
//   console.log(data); 
  });