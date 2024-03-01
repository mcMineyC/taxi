const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jsmt = require('jsmediatags');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = util.promisify(ffmpeg.ffprobe);
const  jsmt_read = util.promisify(jsmt.read);


const app = express();
const port = 3000;
app.use(cors());
app.use(express.urlencoded({
    extended: true
}))

var authData = fs.readFileSync(path.join(__dirname, 'auth.json'), 'utf-8');
authData = JSON.parse(authData);
var needToWrite = false
for(var x = 0; x < authData["users"].length; x++){
    if(authData["users"][x]["authtoken"] == ""){
        console.log("Generating authtoken for "+authData["users"][x]["displayName"])
        var authtoken = crypto.randomBytes(64).toString('hex');
        authData["users"][x]["authtoken"] = authtoken;
        needToWrite = true
    }
    if(!fs.existsSync(path.join(__dirname, "playlists", 'playlists_'+authData["users"][x]["loginName"]+'.json'))){
        fs.writeFileSync(path.join(__dirname, "playlists", 'playlists_'+authData["users"][x]["loginName"]+'.json'), JSON.stringify({"playlists":[]},null,4));
    }
}
if(needToWrite){
    fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify(authData,null,4));
    console.log("Fixed auth.json")
}

if(!fs.existsSync(path.join(__dirname, 'images'))){
    fs.mkdirSync(path.join(__dirname, 'images'));
}
if(!fs.existsSync(path.join(__dirname, 'images', 'albums'))){
    fs.mkdirSync(path.join(__dirname, 'images', 'albums'));
}
if(!fs.existsSync(path.join(__dirname, 'images', 'artists'))){
    fs.mkdirSync(path.join(__dirname, 'images', 'artists'));
}
if(!fs.existsSync(path.join(__dirname, 'images', 'songs'))){
    fs.mkdirSync(path.join(__dirname, 'images', 'songs'));
}
if(!fs.existsSync(path.join(__dirname, 'music'))){
    fs.mkdirSync(path.join(__dirname, 'music'));
}
if(!fs.existsSync(path.join(__dirname, 'songs.json'))){
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    all = JSON.parse(all);
    fs.writeFileSync(path.join(__dirname, 'songs.json'), JSON.stringify({"last_updated": hash5(JSON.stringify(all))},null,4));
    var songs = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    if(songs != undefined){
        songs = JSON.parse(songs);
    }
    var albums_arr = [];
    updateSongs(undefined,all,songs).then(() => {
        console.log("Updated songs.json")
    })
}else{
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    all = JSON.parse(all);
    var songs = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    if(songs != undefined){
        songs = JSON.parse(songs);
    }
    if(songs["last_updated"] != hash5(JSON.stringify(all))){
        updateSongs(undefined,all,songs).then(() => {
            console.log("Updated songs.json")
        })
    }
}
if(!fs.existsSync(path.join(__dirname, 'albums.json'))){
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    all = JSON.parse(all);
    var albums_data = {
        "last_updated": all,
    }
    var albums_arr = [];

        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]); //artist
            for (var album in artist["albums"]) {
                var albumid = album;
                var album = artist["albums"][album];
                console.log("\t" + album["displayName"]); //album
                var warr = {
                    "id": albumid,
                    "displayName": album["displayName"],
                    "artist": artist["displayName"],
                    "artistId": artist["id"]
                }
                albums_arr.push(warr)
            }
        }
        albums_data["albums"] = albums_arr
        console.log("\n\n")
        console.log(albums_data)
        fs.writeFile(path.join(__dirname, 'albums.json'), JSON.stringify(albums_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
}
if(!fs.existsSync(path.join(__dirname, 'artists.json'))){
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    all = JSON.parse(all);
    var artist_data = {
        "last_updated": all,
    }
    var artist_arr = [];

        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]);
            var warr = {
                "id": artist["id"],
                "displayName": artist["displayName"],
            }
            artist_arr.push(warr)
        }
        artist_data["artists"] = artist_arr
        console.log("\n\n")
        console.log(artist_data)
        fs.writeFile(path.join(__dirname, 'artists.json'), JSON.stringify(artist_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
}
if(!fs.existsSync(path.join(__dirname, 'auth.json'))){
    fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify({"users":[]},null,4));
}
if(!fs.existsSync(path.join(__dirname, 'playlists.json'))){
    fs.writeFileSync(path.join(__dirname, 'playlists.json'), JSON.stringify({"playlists":[]},null,4));
}

app.use('/music', express.static(path.join(__dirname, 'music')));

app.use('/',express.static(path.join(__dirname, 'static')));

app.post('/auth', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, 'auth.json'), 'utf-8');
    data = JSON.parse(data);
    var authed = false
    var authtoken = "";
    for(var x = 0; x < data["users"].length; x++){
        if(data["users"][x]["loginName"] == req.body.username){
            if(data["users"][x]["password"] == req.body.password){
                console.log("Authorizing user "+data["users"][x]["displayName"])
                authed = true
                authtoken = crypto.randomBytes(64).toString('hex');
                data["users"][x]["authtoken"] = authtoken;
                fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify(data,null,4));
                break
            }else if(data["users"][x]["password"] == ""){
                console.log("Authorizing user "+data["users"][x]["displayName"]+" and changing password to "+req.body.password)
                authed = true
                authtoken = crypto.randomBytes(64).toString('hex');
                data["users"][x]["authtoken"] = authtoken;
                data["users"][x]["password"] = req.body.password;
                fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify(data,null,4));
                break
            }
        }
    }
    res.send({"authorized": authed, "authtoken": authtoken})
});

app.post('/authtoken', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, 'auth.json'), 'utf-8');
    data = JSON.parse(data);
    var authed = false
    var authtoken = ""
    for(var x = 0; x < data["users"].length; x++){
        if(data["users"][x]["authtoken"] == req.body.authtoken){
            console.log("Authorizing user "+data["users"][x]["displayName"]+" based on auth token")
            authed = true
            authtoken = crypto.randomBytes(64).toString('hex');
            data["users"][x]["authtoken"] = authtoken;
            fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify(data,null,4));
            break
        }
    }
    res.send({"authorized": authed, "authtoken": authtoken})
})

app.post('/info/all', function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }
    console.log(checkAuth(req, res))
    res.sendFile(path.join(__dirname, 'all.json'));
});

app.get('/placeholder', function (req, res) {
    res.sendFile(path.join(__dirname, 'images', 'placeholder.jpg'));
})

app.post('/info/albums', function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }
    console.log(checkAuth(req, res))
    var data = fs.readFileSync(path.join(__dirname, 'albums.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var albums_data = {
        "last_updated": all,
    }
    var albums_arr = [];

    //This is only needed if the file changed
    if((JSON.stringify(data["last_updated"]) != JSON.stringify(all))){
        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]); //artist
            for (var album in artist["albums"]) {
                var albumid = album;
                var album = artist["albums"][album];
                console.log("\t" + album["displayName"]); //album
                var warr = {
                    "id": albumid,
                    "displayName": album["displayName"],
                    "artist": artist["displayName"],
                    "artistId": artist["id"]
                }
                albums_arr.push(warr)
            }
        }
        albums_data["albums"] = albums_arr
        console.log("\n\n")
        console.log(albums_data)
        fs.writeFile(path.join(__dirname, 'albums.json'), JSON.stringify(albums_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = albums_data
    }
    res.send(data);
});

app.post('/info/artists', function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }
    console.log(checkAuth(req, res))
    var data = fs.readFileSync(path.join(__dirname, 'artists.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var artist_data = {
        "last_updated": all,
    }
    var artist_arr = [];

    //This is only needed if the file changed
    if((JSON.stringify(data["last_updated"]) != JSON.stringify(all))){
        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]);
            var warr = {
                "id": artist["id"],
                "displayName": artist["displayName"],
            }
            artist_arr.push(warr)
        }
        artist_data["artists"] = artist_arr
        console.log("\n\n")
        console.log(artist_data)
        fs.writeFile(path.join(__dirname, 'artists.json'), JSON.stringify(artist_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = artist_data
    }
    res.send(data);
});

app.post('/info/songs', function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }
    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var albums_data = {
        "last_updated": all,
    }
    var albums_arr = [];

    //This is only needed if the file changed
    if((data["last_updated"] != hash5(JSON.stringify(all)))){
        updateSongs({},all,data)
    }
    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    data = JSON.parse(data);
    res.send(data);
});

app.get('/info/songs/:id/image', async function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    data = JSON.parse(data);
    var file = "";

    //Find file
    for (var x = 0; x < (data["songs"].length); x++) {
        if (data["songs"][x]["id"] == req.params.id) {
            file = data["songs"][x]["file"];
        }
    }
    if(file == ""){
        console.log("No file associated with "+req.params.id)
        res.sendFile(path.join(__dirname, "images", "placeholder.jpg"));
        return
    }
    await extractSongImage(file, req.params.id);
    console.log("Continuing...")
    //Attempt to infer image based on other songs in album
    if(!(fs.existsSync(path.join(__dirname, "images", "songs", req.params.id+".png")))){
        console.log("File still doesn't exist, trying to infer based on other songs in album...");
        var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
        data = JSON.parse(data);
        var albumid = "";
        //Get album id
        for(var x = 0; x < data["songs"].length; x++) {
            if(data["songs"][x]["id"] == req.params.id){
                albumid = data["songs"][x]["albumId"];
            }
        }
        //Try to extract image again
        for(var x = 0; x < data["songs"].length; x++) {
            //Find first song that is in the same album and not the same song
            if((data["songs"][x]["albumId"] == albumid) && (data["songs"][x]["id"] != req.params.id)){
                file = data["songs"][x]["file"];

                //Attempt to extract image from metadata
                if(!(fs.existsSync(path.join(__dirname, "images", "songs", req.params.id+".png")))){
                    var v = await new Promise((resolve, reject) => {
                        new jsmt.Reader(path.join(__dirname, file))
                        .read({
                            onSuccess: (tag) => {
                                console.log('Success!');
                                resolve(tag);
                            },
                            onError: (error) => {
                                console.log('Error');
                                reject(error);
                            }
                        });
                    })
                    var resu = v
                    if(typeof(resu.tags.picture) == "undefined"){
                        console.log("No picture in metadata for "+file)
                        return
                    }
                    const { data, format } = resu.tags.picture;
                    let base64String = "";
                    for (var i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    fs.writeFileSync(path.join(__dirname, "images", "songs", req.params.id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
                    console.log("Done!")
                }
            }
        }
    }

    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "images", "songs", req.params.id+".png"))){
        res.sendFile(path.join(__dirname, "images", "songs", req.params.id+".png"));
    } else{
        console.log("Still couldn't conjure image for "+req.params.id+".  Sending placeholder")
        res.sendFile(path.join(__dirname, "images", "placeholder.jpg"));
    }
});

app.get('/info/albums/:id/image', async function (req, res) {
    if(!(fs.existsSync(path.join(__dirname, "images", "albums", req.params.id+".png")))){
        console.log("File still doesn't exist, extracting...");
        var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
        data = JSON.parse(data);
        var albumid = "";
        //Get album id
        albumid = req.params.id
        //Try to extract image again
        for(var x = 0; x < data["songs"].length; x++) {
            //Find first song that is in the album
            if((data["songs"][x]["albumId"] == req.params.id)){
                file = data["songs"][x]["file"];
                var success = false
                //Attempt to extract image from metadata
                
                //Attempt to extract image from metadata
                if(!(fs.existsSync(path.join(__dirname, "images", "albums", req.params.id+".png")))){
                    var v = await new Promise((resolve, reject) => {
                        new jsmt.Reader(path.join(__dirname, file))
                        .read({
                            onSuccess: (tag) => {
                                console.log('Success!');
                                resolve(tag);
                            },
                            onError: (error) => {
                                console.log('Error');
                                reject(error);
                            }
                        });
                    })
                    var resu = v
                    if(typeof(resu.tags.picture) == "undefined"){
                        console.log("No picture in metadata for "+file)
                        return
                    }
                    const { data, format } = resu.tags.picture;
                    let base64String = "";
                    for (var i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    fs.writeFileSync(path.join(__dirname, "images", "albums", req.params.id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
                    console.log("Done!")
                }
                if (success){
                    console.log("Success extacting "+req.params.id+".")
                }else{
                    console.log("Trying again")
                }
            }
        }
    }
    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "images", "albums", req.params.id+".png"))){
        res.sendFile(path.join(__dirname, "images", "albums", req.params.id+".png"));
    } else{
        console.log("Still couldn't conjure image for "+req.params.id+".  Sending placeholder")
        res.sendFile(path.join(__dirname, "images", "placeholder.jpg"));
    }
});

app.get('/info/artists/:id/image', async function (req, res) {
    if(!(fs.existsSync(path.join(__dirname, "images", "artists", req.params.id+".png")))){
        var js = JSON.parse(fs.readFileSync(path.join(__dirname, "artists.json"), 'utf-8'))["artists"];
        var name = ""
        for (var x = 0; x < js.length; x++) {
            if (js[x]["id"] == req.params.id){
                name = js[x]["displayName"]
            }
        }
        console.log(name)
        console.log("File doesn't exist, downloading...");
        const { stdout, stderr } = await exec('python3 find_artist_profile_url.py "'+name+'"')
        console.log(stdout)
        try{
            data = JSON.parse(stdout)
            // console.log(data)
            if(!data["success"]){
                console.log("Failed to get image for "+req.params.id+".")

                var dataa = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
                var albums = JSON.parse(fs.readFileSync(path.join(__dirname, 'albums.json'), 'utf-8'));
                dataa = JSON.parse(dataa);
                var albumid = "";
                //Get album id
                for(var x = 0; x < albums["albums"].length; x++){
                    if(albums["albums"][x]["artistId"] == req.params.id){
                        albumid = albums["albums"][x]["id"]
                    }
                }
                console.log("Extracting image from album "+albumid)
                //Try to extract image from first 
                for(var x = 0; x < dataa["songs"].length; x++) {
                    //Find first song that is in the album
                    if((dataa["songs"][x]["albumId"] == albumid)){
                        file = dataa["songs"][x]["file"];
                        var success = false
                        console.log("Trying to extract image from "+file)
                        //Attempt to extract image from metadata
                        jsmt.read(fs.readFileSync(path.join(__dirname, file)), {
                            onSuccess: function(resu) {
                                if(typeof(resu.tags.picture) == "undefined"){
                                    console.log("No picture in metadata for "+file)
                                    return
                                }
                                const { data, format } = resu.tags.picture;
                                let base64String = "";
                                for (var i = 0; i < data.length; i++) {
                                    base64String += String.fromCharCode(data[i]);
                                }
                                fs.writeFileSync(path.join(__dirname, "images", "artists", req.params.id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
                                success = true
                            },
                            onError: function(err) {
                                console.log("Error on "+dataa["songs"][x]["id"]+".")
                                console.log(err);
                            }
                        })
                    }
                }
            }
        }catch (err){
            console.log(err)
            res.sendFile(path.join(__dirname, "images", "placeholder.jpg"));
            return
        }
        if(data["success"]){
            url = data["url"];
            await downloadFile(url, path.join(__dirname, "images", "artists", req.params.id+".png"));
        }
    }

    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "images", "artists", req.params.id+".png"))){
        console.log("Sending image for "+req.params.id+".")
        res.sendFile(path.join(__dirname, "images", "artists", req.params.id+".png"));
    } else{
        console.log("Still couldn't conjure image for "+req.params.id+".  Sending placeholder")
        res.sendFile(path.join(__dirname, "images", "placeholder.jpg"));
    }
})

app.get('/info/songs/:id/audio', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    data = JSON.parse(data);
    var file = "";

    //Find file
    for (var x = 0; x < (data["songs"].length); x++) {
        if (data["songs"][x]["id"] == req.params.id) {
            file = data["songs"][x]["file"];
        }
    }
    console.log(path.join(__dirname, file))
    if(fs.existsSync(path.join(__dirname, file))){
        res.sendFile(path.join(__dirname, file));
    } else{
        res.send("error");
    }
})

app.post('/info/albums/by/artist/:id', function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, 'albums.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var albums_data = {
        "last_updated": all,
    }
    var albums_arr = [];

    //This is only needed if the file changed
    if((JSON.stringify(data["last_updated"]) != JSON.stringify(all))){
        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]); //artist
            for (var album in artist["albums"]) {
                var albumid = album;
                var album = artist["albums"][album];
                console.log("\t" + album["displayName"]); //album
                var warr = {
                    "id": albumid,
                    "displayName": album["displayName"],
                    "artist": artist["displayName"],
                    "artistId": artist["id"]
                }
            }
        }
        albums_data["albums"] = albums_arr
        console.log("\n\n")
        console.log(albums_data)
        fs.writeFile(path.join(__dirname, 'albums.json'), JSON.stringify(albums_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = albums_data
    }
    for(var x = 0; x < data["albums"].length; x++){
        var album = data["albums"][x];
        if(album["artistId"] == req.params.id){
            albums_arr.push(album)
        }
    }
    res.send(albums_arr);
})

app.post('/info/albums/:id', function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, 'albums.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var albums_data = {
        "last_updated": all,
    }
    var albums_arr = [];

    //This is only needed if the file changed
    if((JSON.stringify(data["last_updated"]) != JSON.stringify(all))){
        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]); //artist
            for (var album in artist["albums"]) {
                var albumid = album;
                var album = artist["albums"][album];
                console.log("\t" + album["displayName"]); //album
                var warr = {
                    "id": albumid,
                    "displayName": album["displayName"],
                    "artist": artist["displayName"],
                    "artistId": artist["id"]
                }
            }
        }
        albums_data["albums"] = albums_arr
        console.log("\n\n")
        console.log(albums_data)
        fs.writeFile(path.join(__dirname, 'albums.json'), JSON.stringify(albums_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = albums_data
    }
    for(var x = 0; x < data["albums"].length; x++){
        var album = data["albums"][x];
        if(album["id"] == req.params.id){
            albums_arr.push(album)
        }
    }
    res.send(albums_arr);
})

app.post('/info/songs/by/album/:id', function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var songs_data = {
        "last_updated": all,
    }
    var songs_arr = [];

    //This is only needed if the file changed
    if((JSON.stringify(data["last_updated"]) != JSON.stringify(all))){
        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]); //artist
            for (var album in artist["albums"]) {
                var albumid = album;
                var album = artist["albums"][album];
                console.log("\t" + album["displayName"]); //album
                Object.entries(album["songs"]).forEach((song) => {
                    var [key, v] = song;
                    console.log("\t\t" + v["title"] + ": " + v["file"] + ""); //song
                
                    var warr = {
                        "id": v["id"],
                        "displayName": v["title"],
                        "albumId": albumid,
                        "file": v["file"]
                    }
                    songs_arr.push(warr)
                });
            }
        }
        songs_data["songs"] = songs_arr
        console.log("\n\n")
        console.log(songs_data)
        fs.writeFile(path.join(__dirname, 'songs.json'), JSON.stringify(songs_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = songs_data
    }
    for(var x = 0; x < data["songs"].length; x++){
        var song = data["songs"][x];
        if(song["albumId"] == req.params.id){
            songs_arr.push(song)
        }
    }
    res.send(songs_arr);
})

app.post('/info/songs/by/artist/:id', function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var songs_data = {
        "last_updated": all,
    }
    var songs_arr = [];

    //This is only needed if the file changed
    if((JSON.stringify(data["last_updated"]) != JSON.stringify(all))){
        console.log("Updating")
        for(var x = 0; x < (all["entries"].length); x++){
            artist = all["entries"][x]
            console.log(artist["displayName"]); //artist
            for (var album in artist["albums"]) {
                var albumid = album;
                var album = artist["albums"][album];
                console.log("\t" + album["displayName"]); //album
                Object.entries(album["songs"]).forEach((song) => {
                    var [key, v] = song;
                    console.log("\t\t" + v["title"] + ": " + v["file"] + ""); //song
                
                    var warr = {
                        "id": v["id"],
                        "displayName": v["title"],
                        "albumId": albumid,
                        "file": v["file"]
                    }
                    songs_arr.push(warr)
                });
            }
        }
        songs_data["songs"] = songs_arr
        console.log("\n\n")
        console.log(songs_data)
        fs.writeFile(path.join(__dirname, 'songs.json'), JSON.stringify(songs_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = songs_data
    }
    for(var x = 0; x < data["songs"].length; x++){
        var song = data["songs"][x];
        if(song["artistId"] == req.params.id){
            songs_arr.push(song)
        }
    }
    res.send(songs_arr);
})

app.post('/playlists/user/:id', function(req, res){
    if(checkAuth(req, res) == false){
        res.send({"error": "Not authorized", "authed": false})
        return
    }
    var u = getUser(req.body.authtoken);

    var data = fs.readFileSync(path.join(__dirname, "playlists", "playlists_"+req.params.id+".json"), 'utf-8');
    data = JSON.parse(data);
    var d = [];
    for(var x = 0; x < data["playlists"].length; x++){
        if(data["playlists"][x]["public"] == true || u["loginName"] == req.params.id){
            d.push(data["playlists"][x])
        }
    }
    res.send(d)
})

app.post('/playlists/user/:id/modify/:playlist', function(req, res){
    if(checkAuth(req, res) == false){
        res.send({"error": "Not authorized", "authed": false})
        return
    }
    var u = getUser(req.body.authtoken);
    if(u["loginName"] != req.params.id){
        res.send({"error": "Not authorized", "success": false})
    }

    var data = fs.readFileSync(path.join(__dirname, "playlists", "playlists_"+req.params.id+".json"), 'utf-8');
    data = JSON.parse(data);
    var d = [];
    var found = false
    for(var x = 0; x < data["playlists"].length; x++){
        if(data["playlists"][x]["id"] == req.params.playlist){
            if(req.body.name != undefined){
                console.log("Name: "+req.body.public)
                data["playlists"][x]["name"] = req.body.name
            }
            if(req.body.description != undefined){
                console.log("Description: "+req.body.public)
                data["playlists"][x]["description"] = req.body.description
            }
            if(req.body.public != undefined){
                console.log("Public: "+req.body.public)
                data["playlists"][x]["public"] = req.body.public
            }
            found = true
        }
        d[x] = data["playlists"][x]
    }
    if(!found){
        try{
            d.push({
                "id": req.params.playlist,
                "name": req.body.name,
                "description": req.body.description,
                "public": req.body.public,
                "songs": JSON.parse(req.body.songs)
            })
        }catch(e){
            d.push({
                "id": req.params.playlist,
                "name": req.body.name,
                "description": req.body.description,
                "public": req.body.public
            })
        }
    }
    data = {
        "playlists": d
    }
    console.log("\n\n")
    fs.writeFile(path.join(__dirname, "playlists", "playlists_"+req.params.id+".json"), JSON.stringify(data, null, 4), function (err) {
        if (err) {
            console.log(err);
        }
    })

    res.send(d)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})


// This is just all the random
// functions that I need to move
// to seperate files but haven't
// yet because modules and requiring
// is annoying so I probably
// won't move them anytime soon
async function extractSongImage(file, id){
    if(!(fs.existsSync(path.join(__dirname, "images", "songs", id+".png")))){
        console.log("File doesn't exist, creating...");
        var v = await new Promise((resolve, reject) => {
            new jsmt.Reader(path.join(__dirname, file))
              .read({
                onSuccess: (tag) => {
                  console.log('Success!');
                  resolve(tag);
                },
                onError: (error) => {
                  console.log('Error');
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
            fs.writeFileSync(path.join(__dirname, "images", "songs", id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
            console.log("Done!")
        }
    }
}

async function updateSongs(once, all, songs){
    //This is only needed if the file changed
    console.log("Checking for updates")
    console.log(JSON.stringify(all,null,4))
    console.log("Updating")
    var albums_arr = [];
    for(var x = 0; x < (all["entries"].length); x++){
        artist = all["entries"][x]
        console.log(artist["displayName"]); //artist
        var artistId = artist["id"]
        for (var album in artist["albums"]) {
            var albumid = album;
            var album = artist["albums"][album];
            console.log("\t" + album["displayName"]); //album
            for(var song in album["songs"]) {
                var v = album["songs"][song];
                console.log("\t\t" + v["title"] + ": " + v["file"] + ""); //song
                
                if(fs.existsSync(path.join(__dirname, v["file"]))){
                    try{
                        var vv = {}
                        var found = false
                        var songer = songs["songs"]
                        if(songer != undefined){
                            for(var y = 0; y < songer.length; y++){
                                if(songer[y]["id"] == v["id"]){
                                    vv = songer[y]
                                    found = true;
                                    break;
                                }
                                // console.log({"id": v["id"], "iidd": songer[y]["id"]})
                            }
                        }
                        var z = ""
                        var dur = ""
                        if(!found && vv["duration"] == undefined){
                            console.log("\t\t\tProbing: "+v["file"])
                            z = await withTimeout(ffprobe(path.join(__dirname, v["file"])), 10000);
                            dur = z["format"]["duration"]   
                        }else{
                            console.log("\t\t\tUsing duration: "+vv["duration"])
                            dur = (vv["duration"] == undefined) ? 0 : vv["duration"]
                        }
                        
                        var warr = {
                            "id": v["id"],
                            "displayName": v["title"],
                            "albumId": albumid,
                            "artistId": artistId,
                            "duration": dur,
                            "file": v["file"]
                        }
                        albums_arr.push(warr)
                    }catch(err){
                        switch(err.code){
                            case "ENOENT":
                                console.log("File does not exist: "+v["file"])
                                break;
                            case "ETIMEDOUT":
                                console.log("Timed out trying to extract data from: "+v["file"])
                                break;
                            default:
                                console.log(err)
                        }
                    }
                }else{
                    console.log("File does not exist: "+v["file"])
                }
            };
        }
    }
    console.log("Writing file...")
    songs_data = {
        "last_updated": hash5(JSON.stringify(all)),
        "songs": albums_arr
    }
    fs.writeFile(path.join(__dirname, 'songs.json'), JSON.stringify(songs_data,null,4), function (err) {
        if (err) {
            console.log(err);
        }else{
            console.log("File written")
        }
    })
}

function hash5(string){
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

function checkAuth(req, res){
    if(typeof(req.body.authtoken) == "undefined"){
        res.send({"error": "No authtoken provided"})
        return
    }else{
        var authdata = fs.readFileSync(path.join(__dirname, 'auth.json'), 'utf-8');
        authdata = JSON.parse(authdata);
        var found = false
        for(var x = 0; x < authdata["users"].length; x++){
            if(authdata["users"][x]["authtoken"] == req.body.authtoken){
                found = true
                break
            }
        }
        if(!found){
            res.send({"error": "Invalid authtoken", "authed": false})
            return false
        }
    }
}

function getUser(authtoken){
    var authdata = fs.readFileSync(path.join(__dirname, 'auth.json'), 'utf-8');
    authdata = JSON.parse(authdata);
    for(var x = 0; x < authdata["users"].length; x++){
        if(authdata["users"][x]["authtoken"] == authtoken){
            return authdata["users"][x]
        }
    }
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