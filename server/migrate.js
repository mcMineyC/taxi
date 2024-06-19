import { createRequire } from "module";
const require = createRequire(import.meta.url);

const path = require('path');
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fs = require('fs');
import schemas from './schemas.js';

const { RxDBDevModePlugin } = require('rxdb/plugins/dev-mode');
const { createRxDatabase, removeRxDatabase, addRxPlugin } = require('rxdb');
import { getRxStorageMongoDB } from 'rxdb/plugins/storage-mongodb';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBJsonDumpPlugin);

var dbName = "rxdb-taxi-dev";

// await removeRxDatabase(dbName, getRxStorageMongoDB({connection: 'mongodb://rxdb-taxi:dexiewasbad@192.168.30.36:27017/?authSource=admin'}));  console.log("Removed database");

const db = await createRxDatabase({
  name: dbName,
  storage: getRxStorageMongoDB({
    connection: 'mongodb://admin:supersecure123@192.168.30.36:27017/?authSource=admin',
  }),
});

await schemas.register(db);
console.log("Added collections");

var playlists = [];
var files = fs.readdirSync(path.join(__dirname, 'config', 'playlists'));
for (const file of files) {
  for (const list of JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'playlists', file)))["playlists"]){
    playlists.push(list);
  }
}

var songs = fs.readFileSync(path.join(__dirname, 'config', 'songs.json'));
songs = JSON.parse(songs);

var albums = fs.readFileSync(path.join(__dirname, 'config', 'albums.json'));
albums = JSON.parse(albums);

var artists = fs.readFileSync(path.join(__dirname, 'config', 'artists.json'));
artists = JSON.parse(artists);

var auth = fs.readFileSync(path.join(__dirname, 'config', 'auth.json'));
auth = JSON.parse(auth);

var recentlyPlayed = fs.readFileSync(path.join(__dirname, 'config', 'recently-played.json'));
recentlyPlayed = JSON.parse(recentlyPlayed);

var upserted = await db.songs.bulkUpsert(songs["songs"]);
console.log("Upserted", upserted.success.length, "songs");

var upserted = await db.albums.bulkUpsert(albums["albums"]);
console.log("Upserted", upserted.success.length, "albums");

var upserted = await db.artists.bulkUpsert(artists["artists"]);
console.log("Upserted", upserted.success.length, "artists");

var upserted = await db.playlists.bulkUpsert(playlists);
console.log("Upserted", upserted.success.length, "playlists");

var upserted = await db.auth.bulkUpsert(auth["users"]);
console.log("Upserted", upserted.success.length, "users");

var users = 0;
var songs = 0;
var played = [];
Object.keys(recentlyPlayed["recently-played"]).forEach((key) => {
  users++;
  songs += recentlyPlayed["recently-played"][key].length
  played.push({
    owner: key,
    songs: recentlyPlayed["recently-played"][key]
  });
});
var upserted = await db.played.bulkUpsert(played);
console.log("Upserted", songs, "recently played songs for", users, "users");

console.log("Database migrated");

// var doc = await db.played.findOne({
//   selector: {
//     owner: 'jedi'
//   }
// }).exec();
// doc.modify((doc) => {
//   doc.songs.push("5c3c8a7e-9f6e-4b5e-9a4f-7d5f5c3c8a7f");
//   return doc;
// });

// console.log("Dumping for diagnostic purposes");
// var dSongs = await db.songs.exportJSON();
// var dAlbums = await db.albums.exportJSON();
// var dArtists = await db.artists.exportJSON();
// var dPlaylists = await db.playlists.exportJSON();
// var dAuth = await db.auth.exportJSON();
// var dPlayed = await db.played.exportJSON();
// var dFavorites = await db.favorites.exportJSON();
// fs.writeFileSync(path.join(__dirname, 'dump', 'songs.json'), JSON.stringify(dSongs,null,2));
// fs.writeFileSync(path.join(__dirname, 'dump', 'albums.json'), JSON.stringify(dAlbums,null,2));
// fs.writeFileSync(path.join(__dirname, 'dump', 'artists.json'), JSON.stringify(dArtists,null,2));
// fs.writeFileSync(path.join(__dirname, 'dump', 'playlists.json'), JSON.stringify(dPlaylists,null,2));
// fs.writeFileSync(path.join(__dirname, 'dump', 'auth.json'), JSON.stringify(dAuth,null,2));
// fs.writeFileSync(path.join(__dirname, 'dump', 'played.json'), JSON.stringify(dPlayed,null,2));
// fs.writeFileSync(path.join(__dirname, 'dump', 'favorites.json'), JSON.stringify(dFavorites,null,2));
//
// console.log("Dumped");

await db.destroy();
