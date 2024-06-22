//Just some crazy stuff I found in a Stack Overflow
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const path = require('path');
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const jsmt = require('jsmediatags');
import schemas from './schemas.js';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const SpottyDL = require('spottydl-better');
const ffprobe = util.promisify(ffmpeg.ffprobe);
const http = require('http');
const { Server } = require("socket.io");
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const clientID = "0a65ebdec6ec4983870a7d2f51af2aa1";
const secretKey = "22714014e04f46cebad7e03764beeac8";

const { RxDBDevModePlugin } = require('rxdb/plugins/dev-mode');
const { createRxDatabase, addRxPlugin } = require('rxdb');
import { getRxStorageMongoDB } from 'rxdb/plugins/storage-mongodb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

const db = await createRxDatabase({
  name: 'rxdb-taxi',
  storage: getRxStorageMongoDB({
    connection: 'mongodb://rxdb-taxi:dexiewasbad@192.168.30.36:27017/?authSource=admin',
  }),
});

await schemas.register(db, 1);
console.log("Added collections");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
const port = 3000;
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));

app.use('/',express.static(path.join(__dirname, 'static')));

app.post('/latestCommit', async function (req, res) {
    exec('git rev-parse HEAD', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            res.send({"commit": "error"})
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            res.send({"commit": "error"})
            return;
        }
        res.send({"commit": stdout.replace("\n", "")})
    })
})

app.post('/status', function (req, res) {
    res.send({"status": "ok"})
})

app.get('/status', function (req, res) {
    res.send({"status": "ok"})
})

app.post('/auth', async function (req, res) {
    var authed = false
    var authtoken = "";
    var result = await db.auth.findOne({selector: {"loginName": req.body.username}}).exec();
    var username = result.loginName
    authed = await (async ()=>{
        if(!result || result.loginName != req.body.username){
            console.error("Wat da refrigerator is going on here");
            return Promise.resolve(false);
        }
        
        if(result.password == req.body.password){
            console.log("Authorizing user "+result.loginName)
            authtoken = crypto.randomBytes(64).toString('hex');
            await result.patch({
                authtoken: authtoken,
            })
            return Promise.resolve(true);
        }else if(result.password == ""){
            console.log("Authorizing user "+result.loginName+" and changing password to "+req.body.password);
            authtoken = crypto.randomBytes(64).toString('hex');
            await result.patch({
                password: req.body.password,
                authtoken: authtoken,
            })
            return Promise.resolve(true);
        }else{
            return Promise.resolve(false);
        }
    })();
    
    if(authed == false){
        console.log("Failed to authorize user "+req.body.username)
    }
    res.send({"authorized": authed, "authtoken": authtoken, "username": username})
});

app.post('/authtoken', async function (req, res) {
    const result = await db.auth.findOne({selector: {"authtoken": req.body.authtoken}}).exec();
    var username = "";
    var authtoken = "";
    var authed = await (async ()=>{
        if(!result){
            return Promise.resolve(false);
        }
        username = result.loginName
        authtoken = (username == "testguy") ? "1234567890" : crypto.randomBytes(64).toString('hex');
        await result.patch({
            authtoken: authtoken,
        });
        return Promise.resolve(true);
    })();
    
    res.send({"authorized": authed, "authtoken": authtoken, "username": username})
})

app.post('/username', async function (req, res) {
    const result = await db.auth.findOne({selector: {"authtoken": req.body.authtoken}}).exec();
    var username = "";
    var authtoken = "";
    var authed = await (async ()=>{
        if(!result){
            return Promise.resolve(false);
        }
        username = result.loginName
        authtoken = result.authtoken
        return Promise.resolve(true);
    })();
    
    res.send({"authorized": authed, "authtoken": authtoken, "username": username})
})

///   THIS IS USELESS IDK WHY ITS STILL HERE   ///
// app.post('/info/all', async function (req, res) {
//     if((await checkAuth(req.body.authtoken)) == false){
//         res.send({"authed": false});
//         return
//     }
//     // var resp = await db.songs.find().exec();
//     res.send({"authorized": true, "entries": {}});
// });

app.get('/placeholder', function (req, res) {
    res.sendFile(path.join(__dirname, "config", 'images', 'placeholder.jpg'));
})

app.post('/info/albums', async function (req, res) {
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "albums": []});
        return
    }

    const data = await db.albums.find({sort: [{artistId: "asc"}, {added: "asc"}]}).exec();
   res.send({"authed": true, "albums": data});
});

app.post('/info/artists', async function (req, res) {
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "artists": []});
        return
    }
    
    const data = await db.artists.find({
        sort: [
            {displayName: "asc"}
        ]
    }).exec();
    res.send({"authed": true, "artists": data});
});

app.post('/info/songs', async function (req, res) {
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "songs": []});
        return
    }

    const data = await db.songs.find({sort: [{"artistId": "asc"}, {"albumId": "asc"}]}).exec();
    res.send({"authed": true, "songs": data});
});

app.post('/info/songs/batch', async function (req, res) {
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "results": {}});
        return;
    }
    
    var ids = req.body.ids
    var results = {}
    for(var i = 0; i < ids.length; i++){
        results[ids[i]] = await db.songs.findOne({selector: {"id": ids[i]}}).exec();
    }
    res.send({"authed": true, "results": results});
});

app.post('/info/songs/:id', async function (req, res) {
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "songs": []});
        return
    }

    const result = await db.songs.findOne({selector: {"id": req.params.id}}).exec();
    res.send({"authed": true, "song": (result) ? result : {} }); 
});

app.get('/info/songs/:id/image', async function (req, res) {
    var file = "";

    if(!fs.existsSync(path.join(__dirname, "config", "images", "songs", req.params.id+".png"))){
        //Find file
        file = await db.songs.findOne({selector: {"id": req.params.id}}).exec();
        file = (file == null) ? "" : file.file;

        //Check if file was found
        if(file == ""){
            console.log("No file associated with "+req.params.id)
            res.sendFile(path.join(__dirname, "config", "images", "placeholder.jpg"));
            return
        }

        //Extract image
        await extractSongImage(file, path.join(__dirname, "config", "images", "songs", req.params.id+".png"));
        if(!(fs.existsSync(path.join(__dirname, "config", "images", "songs", req.params.id+".png")))){
            console.log("File still doesn't exist, trying to infer based on other songs in album...");
            await inferSongImage(file, req.params.id);
        }
    }

    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "config", "images", "songs", req.params.id+".png"))){
        res.sendFile(path.join(__dirname, "config", "images", "songs", req.params.id+".png"));
    } else{
        console.log("Still couldn't conjure image for "+req.params.id+".  Sending placeholder")
        res.sendFile(path.join(__dirname, "config", "images", "placeholder.jpg"));
    }
});

app.get('/info/albums/:id/image', async function (req, res) {
    if(!(fs.existsSync(path.join(__dirname, "config", "images", "albums", req.params.id+".png")))){
        await extractAlbumImage(req.params.id)
    }
    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "config", "images", "albums", req.params.id+".png"))){
        res.sendFile(path.join(__dirname, "config", "images" , "albums", req.params.id+".png"));
    } else{
        console.log("Still couldn't conjure image for "+req.params.id+".  Sending placeholder")
        res.sendFile(path.join(__dirname, "config", "images" , "placeholder.jpg"));
    }
});

app.get('/info/artists/:id/image', async function (req, res) {
    var data = {}
    var url = "";
    if(!(fs.existsSync(path.join(__dirname, "config", "images", "artists", req.params.id+".png")))){
        var name = (await db.artists.findOne({selector: {"id": req.params.id}}).exec()).displayName
        console.log(name)
        console.log("Artist image doesn't exist, downloading...");
        const { stdout, stderr } = await exec('python3 find_artist_profile_url.py "'+name+'"')
        console.log(stdout)
        try{
            data = JSON.parse(stdout)
            
            if(data["success"]){
                url = data["url"];
                await downloadFile(url, path.join(__dirname, "config", "images", "artists", req.params.id+".png"));
            }
            if(!data["success"]){
                console.log("\tFailed to get image for "+req.params.id+".")
                var albumid = (await db.albums.findOne({selector: {"artistId": req.params.id}}).exec()).id
                console.log("\t\tExtracting image from album "+albumid)
                await extractAlbumImage(albumid, path.join(__dirname, "config", "images", "artists", req.params.id+".png"))
                console.log("\t\tImage extracted.")
            }
        }catch (err){
            console.log(err)
            res.sendFile(path.join(__dirname, "config", "images" , "placeholder.jpg"));
            return
        }
    }

    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "config", "images", "artists", req.params.id+".png"))){
        console.log("Sending image for "+req.params.id+".")
        res.sendFile(path.join(__dirname, "config", "images" , "artists", req.params.id+".png"));
    } else{
        console.log("Couldn't conjure image for "+req.params.id+".  Sending placeholder")
        res.sendFile(path.join(__dirname, "config", "images" , "placeholder.jpg"));
    }
})

app.get('/info/songs/:id/audio', async function (req, res) {
    var id = req.params.id
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns a zero-based index, so add 1
    const day = now.getDate();
    if(month == 4 && day == 1 && getRandomInt(0,100) > 690){
        console.log("Making chaos")
        var inty = getRandomInt(0, data["songs"].length-1);
        if(data["songs"][inty]["artistId"] == "939644cef5b866870668f6cb59a0db900853c63ac1b97348e832c65e271964fd"){
            res.sendFile(path.join(__dirname, "music/sorted/1d822fde641a597beb59ba197388b85e40eafb39d007be53f1c1da9b36d6a8df/00879b25b7e52685100c540611c16c5974b224ef79c692a9f58e43764532064d/Never Gonna Give You Up.mp3"))
        }else{
            res.sendFile(path.join(__dirname, data["songs"][inty]["file"])); // data["songs"][inty]["file"]
            console.log(data["songs"][inty]["file"])
        }
        if(getRandomInt(0,1) == 0){
            console.log("No Chaoz")
            return
        }
    }
    var file = "";

    //Find file
    var file = (await db.songs.findOne({selector: {"id": id}}).exec()).file
    if(typeof(req.query.uname) != "undefined"){
        console.log("Adding "+id+" to recently played for "+req.query.uname);
        addToRecentlyPlayed(req.query.uname, id);
    }
    console.log(path.join(__dirname, file))
    if(fs.existsSync(path.join(__dirname, file))){
        res.sendFile(path.join(__dirname, file));
    } else{
        res.send("error");
    }
})

// there were some unused endpoints in here pertaining to querying albums/songs by album/artist, those are removed

app.post('/playlists', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "playlists": []});
        return
    }

    var u = await getUser(req.body.authtoken);
    var playlists = await db.playlists.find({selector: {$or: [{owner: u}, {public: true}]}}).exec();
    res.send({"authed": true, "playlists": playlists})
})

app.post('/playlists/user/:id', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "playlists": []});
        return
    }
    var u = await getUser(req.body.authtoken);
    if(u != req.params.id){
        // res.send({authed: false, "error": "Not authorized", "success": false})
        // return
    }

    var d = await db.playlists.find({selector: {owner: req.params.id}}).exec();
    res.send({"authed": true, "playlists": d});
})

app.post('/playlists/modify/:playlist', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false});
        return
    }
    var u = await getUser(req.body.authtoken);
    var p = await db.playlists.findOne({selector: {id: req.params.playlist}}).exec();
    if(p == null){
        console.log("Playlist does not exist. Creating new playlist.")
        p = await db.playlists.upsert({
            id: req.params.playlist || "banana",
            owner: u || "testguy",
            displayName: req.body.name || "Banana",
            description: req.body.description || "Banana",
            public: req.body.public || false,
            songs: req.body.songs || [],
        })
    }else{
        if(p.owner == undefined || p.owner == null){
            await p.incrementalPatch({owner: u});
        }else if(u != p.owner){
            res.send({authed: false, "error": "Not authorized", "success": false})
            return;
        }
        var newdata = {}
        console.log("Attempting to modify playlist "+req.params.playlist)
        if(req.body.name !== undefined){
            console.log("Name: "+req.body.name)
            newdata["displayName"] = req.body.name
        }else{
           newdata["displayName"] = p.displayName
        }
        if(req.body.description !== undefined){
           console.log("Description: "+req.body.public)
           newdata["description"] = req.body.description
        }else{
            newdata["description"] = p.description
        }
        if(req.body.public !== undefined){
            console.log("Public: "+req.body.public)
            newdata["public"] = JSON.parse(req.body.public)
        }else{
            newdata["public"] = p.public
        }
        if(typeof req.body.songs !== "undefined" && req.body.songs != null && req.body.songs.length > 0){
            newdata["songs"] = req.body.songs
        }else{
            newdata["songs"] = p.songs
        }
        console.log("Patching existing playlist")
        await p.patch(newdata);
    }
    res.send({authed: true, "success": true, playlists: await db.playlists.find({selector: {$or: [{owner: u}, {public: true}]}}).exec()});
})

app.post('/playlists/remove/:playlist', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "songs": []});
        return
    }
    var u = await getUser(req.body.authtoken);
    var p = await db.playlists.findOne({selector: {id: req.params.playlist}}).exec();
    if(p == null){
        res.send({authed: true, "success": true, "playlists": await db.playlists.find({selector: {$or: [{owner: u}, {public: true}]}}).exec()});
        return;
    }
    if(u != p.owner){
        res.send({authed: false, "error": "Not authorized", "success": false})
        return
    }
    await p.remove();
    res.send({authed: true, "success": true, "playlists": await db.playlists.find({selector: {$or: [{owner: u}, {public: true}]}}).exec()});
})

app.post('/recently-played/:user/add', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, "success": false})
        return
    }
    var u = await getUser(req.body.authtoken);
    var user = req.params.user;
    console.log(user, "r==a", u);
    if(user != u){
        res.send({"error": "Unauthorized", "authed": true, "success": false})
        return
    }
    await addToRecentlyPlayed(user, req.body.id);
    res.send({"authed": true, "success": true})
})

app.post('/recently-played/:user', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, played: []});
        return
    }
    var u = await getUser(req.body.authtoken);
    var user = req.params.user;
    console.log(user, "r==a" ,u)
    if(user != u){
        // res.send({"error": "Not authorized", "authed": false, "success": false, "played": []})
        // return
    }
    var played = await db.played.findOne({selector: {owner: req.params.user}}).exec();
    res.send({"played": played.songs.filter(n => n).filter(n => n != "idklol") || [], "authed": true, "success": true})
});

app.post('/favorites/:user', async function(req, res){
    if((await checkAuth(req.body.authtoken)) == false){
        res.send({"authed": false, songs: []});
        return
    }
    var u = await getUser(req.body.authtoken);
    var user = req.params.user;
    console.log(user,"r==a",u)
    if(user != u){
        // res.send({"error": "Not authorized", "authed": false, "success": false, "songs": []})
        // return
    }
    var favorite = await db.favorites.findOne({selector: {owner: user}}).exec();
    if(favorite == null){
        favorite = {owner: user, songs: [], count: 0}
        await db.favorites.upsert(favorite)
    }
    res.send({"songs": favorite.songs || [], "count": favorite.songs.length, "authed": true, "success": true})
})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit("authprompt", "3141592653589793238464")
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    var authed = false
    socket.on("auth", (msg) => {
        if(!checkAuth(msg.authtoken)){
            socket.emit("authresult", {"success": false, "error": "Invalid authtoken", "authorized": false})
            // socket.close()
            return
        }
        socket.emit("authresult", {"success": true, "authorized": true})
    })
    socket.on("search", async (msg) => {
        if(!authed){
            socket.emit("message", {"type": "auth", "success": false, "error": "Invalid authtoken", "authorized": false})
            // socket.close()
            return
        }
        if(msg.source == "spotify"){
            const api = SpotifyApi.withClientCredentials(
                clientID,
                secretKey
            );
            var page = 0
            if(typeof(msg.page) == "number"){
                page = msg.page
            }
            var items = []
            if(msg.mediaType == "all"){
                const trackItems = await api.search(msg.query, "track", undefined, 50, page);
                const albumItems = await api.search(msg.query, "album", undefined, 50, page);
                const artistItems = await api.search(msg.query, "artist", undefined, 50, page);
                const playlistItems = await api.search(msg.query, "playlist", undefined, 50, page);
                items = trackItems.tracks.items.concat(albumItems.albums.items).concat(artistItems.artists.items).concat(playlistItems.playlists.items)
            }else{
                items = await api.search(msg.query, msg.mediaType, undefined, 50, page);
                items = items[msg.mediaType+"s"].items
            }
            console.table(items.map((item) => ({
                name: item.name,
                type: item.type,
                popularity: item.popularity,
                id: item.id
            })));
            
            socket.emit("searchresults", items)
        }else if (msg.source == "youtube"){
            socket.emit("searchresults", [])
        }
    })
    socket.on("download", async (msg) => {
        if(!authed){
            socket.emit("message", {"type": "auth", "success": false, "error": "Invalid authtoken", "authorized": false})
            // socket.close()
            return
        }
        if(msg.source == "spotify"){
            var results = ""

            console.log("Starting download")
            socket.emit("downloadmessage", {"type": "status", "message": "Starting download", "percent": 0, "name": ""})
            if(msg.url.includes("track")){
                results = await SpottyDL.getTrack(msg.url)
                socket.emit("downloadmessage", {"type": "progress", "message": "Downloading track: " + results.title, "percent": 0, "name": results.title})
                var track = await SpottyDL.downloadTrack(results, "unsorted")
                if(track[0].status == "Success"){
                    socket.emit("downloadmessage", {"type": "success", "message": "Finished downloading track: " + results.title})
                }else{
                    socket.emit("downloadmessage", {"type": "error", "message": "Failed to download track: " + results.title})
                }
            }else if(msg.url.includes("album")){
                results = await SpottyDL.getAlbum(msg.url)
                var total = 1
                if(results.tracks != undefined) {total = results.tracks.length;}
                else{total = 1}
                var done = 0
                socket.emit("downloadmessage", {"type": "progress", "message": "Downloading album: " + results.name, "percent": 0, "name": results.name})
                var album = await SpottyDL.downloadAlbum(results, "unsorted", true, (stuff) => {
                    if(stuff.success){
                        done++
                        socket.emit("downloadmessage", {"type": "progress", "message": "Downloaded", "percent": Math.floor((done/total)*100), "name": stuff.name})
                    }else{
                        done++;
                        socket.emit("downloadmessage", {"type": "error", "message": "Failed to download track: " + stuff.name})
                    }
                })
                var success = true
                for (var x = 0; x < album.length; x++){
                    if(album[x].status != "Success"){
                        success = false
                    }
                }
                if(success){
                    socket.emit("downloadmessage", {"type": "success", "message": "Finished downloading playlist: " + results.name})
                }else{
                    socket.emit("downloadmessage", {"type": "error", "message": "Failed to download playlist: " + results.name})
                }
            }else if(msg.url.includes("artist")){
                socket.emit("downloadmessage", {"type": "error", "message": "Not implemented", "percent": 0, "name": ""})
                return
                results = await SpottyDL.getArtist(msg.url)
            }else if(msg.url.includes("playlist")){
                results = await SpottyDL.getPlaylist(msg.url)
                var done = 0
                var total = results.tracks.length
                socket.emit("downloadmessage", {"type": "progress", "message": "Downloading playlist:", "percent": Math.floor((done/total)*100), "name": results.name})
                var list = await SpottyDL.downloadPlaylist(results, "unsorted", (stuff) => {
                    if(stuff.success == true){
                        done++
                        socket.emit("downloadmessage", {"type": "progress", "message": "Downloaded", "percent": Math.floor((done/total)*100), "name": stuff.name})
                    }
                })
                var success = true
                for (var x = 0; x < list.length; x++){
                    if(list[x].status != "Success"){
                        success = false
                    }
                }
                if(success){
                    socket.emit("downloadmessage", {"type": "success", "message": "Finished downloading playlist: " + results.name})
                }else{
                    socket.emit("downloadmessage", {"type": "error", "message": "Failed to download playlist: " + results.name})
                }
            }
        }
        else if(msg.source == "youtube"){
            socket.emit("message", {"type": "auth", "success": false, "error": "Not implemented", "authorized": true}) // Not implemented
            // socket.close()
            return
        }
    })
})

async function main(){
    await checkDirs()
    console.log("Checked and ready to start")
    server.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
}

try{
    main()
}catch (e){
    console.log("Error: "+e)
}


// This is just all the random
// functions that I need to move
// to seperate files but haven't
// yet because modules and requiring
// is annoying so I probably
// won't move them anytime soon

async function extractSongImage(file, dest){
    if(!(fs.existsSync(dest))){
        console.log("File doesn't exist, creating...");
        var v = await new Promise((resolve, reject) => {
            new jsmt.Reader(path.join(__dirname, file))
              .read({
                onSuccess: (tag) => {
                  console.log('Success!');
                  resolve(tag);
                },
                onError: (error) => {
                  console.log('Error extracting metadata:', error);
                  reject(error);
                }
            });
        })
        var resu = v
        if(typeof(resu.tags.picture) == "undefined"){
            console.log("No picture in metadata for "+file)
            // return
        }else{
            const { data, format } = resu.tags.picture;
            let base64String = "";
            for (var i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
            }
            fs.writeFileSync(dest, Buffer.from(base64String, 'binary'), 'binary');    
            console.log("Done!")
        }
    }
}

async function inferSongImage(id){
    var albumid = "";
        //Get album id
        var song = await db.songs.findOne({selector: {"id": id}}).exec();
        albumid = song.albumId;
        song = await db.songs.findOne({
                selector: {
                    "albumId": albumid,
                    "id": {$ne: id}
                }
            }).exec();
        //Try to extract image
        await extractSongImage(song.file, path.join(__dirname, "config", "images", "songs", id+".png"));
}

async function extractAlbumImage(id, dest){
    var song = await db.songs.findOne({selector: {"albumId": id}}).exec();
    var file = song.file;
    await extractSongImage(file, (dest == undefined ? path.join(__dirname, "config", "images", "albums", id+".png") : dest));
}

function hash(string){
    return crypto.createHash('sha256').update(string).digest('hex');
}

async function withTimeout(promise, timeoutMs) {
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error({"code": "ETIMEDOUT"}));
      }, timeoutMs);
    });
  
    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (err) {
      throw err; // Rethrow the error for the caller to handle
    }
}

async function checkAuth(token){
    if(typeof(token) == "undefined"){
        return Promise.resolve(false); 
    }else{
        const result = await db.auth.findOne({selector: {"authtoken": token}}).exec()
        return Promise.resolve(result != null);
    }
}

async function getUser(authtoken){
    var result = await db.auth.findOne({selector: {"authtoken": authtoken}}).exec()
    return (result == 0) ? "" : result.loginName
}

async function addToRecentlyPlayed(user, songId){
    console.log("Adding to recent: ",user, songId)
    var recent = await db.played.findOne({selector: {"owner": user}}).exec();
    var newRecent = {owner: user, songs: []};
    if(recent == null){
        console.log("Recent is null")
        newRecent = {owner: user, songs: [songId]}
    }else{
        newRecent.songs = recent.songs;
        if(recent.songs.length >= 10){
            console.log("Too long")
            newRecent.songs.splice(0, 1);
        }
        newRecent.songs.push(songId);
    }
    await db.played.upsert(newRecent);
}

async function downloadFile(fileUrl, outputLocationPath) {
    const writer = fs.createWriteStream(outputLocationPath);
  
    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
  
      //ensure that the user can call `then()` only when the file has
      //been downloaded entirely.
  
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    });
}

function getRandomInt(min, max) {
    return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
}


// Update functions
// I should move 
// Them to seperate
// Files, but for
// now, who cares


async function checkDirs(){
    if(!fs.existsSync(path.join(__dirname, "config"))){
        fs.mkdirSync(path.join(__dirname, "config"));
    }
    if(!fs.existsSync(path.join(__dirname, "config", 'images'))){
        fs.mkdirSync(path.join(__dirname, "config", 'images'));
    }
    if(!fs.existsSync(path.join(__dirname, "config", 'images', 'albums'))){
        fs.mkdirSync(path.join(__dirname, "config", 'images', 'albums'));
    }
    if(!fs.existsSync(path.join(__dirname, "config", 'images', 'artists'))){
        fs.mkdirSync(path.join(__dirname, "config", 'images', 'artists'));
    }
    if(!fs.existsSync(path.join(__dirname, "config", 'images', 'songs'))){
        fs.mkdirSync(path.join(__dirname, "config", 'images', 'songs'));
    }
    if(!fs.existsSync(path.join(__dirname, 'music'))){
        fs.mkdirSync(path.join(__dirname, 'music'));
    }
}
