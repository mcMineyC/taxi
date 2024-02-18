const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jsmt = require('jsmediatags');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');


const app = express();
const port = 3000;
app.use(cors());

app.use('/music', express.static(path.join(__dirname, 'music')));

app.use('/',express.static(path.join(__dirname, 'static')));

app.get('/info/all', function (req, res) {
    res.sendFile(path.join(__dirname, 'all.json'));
});

app.get('/info/albums', function (req, res) {
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

app.get('/info/artists', function (req, res) {
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

app.get('/info/songs', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
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
            var artistId = artist["id"]
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
                        "artistId": artistId,
                        "file": v["file"]
                    }
                    albums_arr.push(warr)
                });
            }
        }
        albums_data["songs"] = albums_arr
        console.log("\n\n")
        console.log(albums_data)
        fs.writeFile(path.join(__dirname, 'songs.json'), JSON.stringify(albums_data), function (err) {
            if (err) {
                console.log(err);
            }
        })
        data = albums_data
    }
    res.send(data);
});

app.get('/info/songs/:id/image', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, 'songs.json'), 'utf-8');
    data = JSON.parse(data);
    var file = "";

    //Find file
    for (var x = 0; x < (data["songs"].length); x++) {
        if (data["songs"][x]["id"] == req.params.id) {
            file = data["songs"][x]["file"];
        }
    }
    //Attempt to extract image from metadata
    if(!(fs.existsSync(path.join(__dirname, "images", "songs", req.params.id+".png")))){
        console.log("File doesn't exist, creating...");
        jsmt.read(fs.readFileSync(path.join(__dirname, "music", file)), {
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
                fs.writeFileSync(path.join(__dirname, "images", "songs", req.params.id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
            },
            onError: function(err) {
                console.log("Error on "+req.params.id+".")
                console.log(err);
            }
        })
    }
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
                    jsmt.read(fs.readFileSync(path.join(__dirname, "music", file)), {
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
                            fs.writeFileSync(path.join(__dirname, "images", "songs", req.params.id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
                        },
                        onError: function(err) {
                            console.log("Error on "+req.params.id+".")
                            console.log(err);
                        }
                    })
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

app.get('/info/albums/:id/image', function (req, res) {
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
                if(!(fs.existsSync(path.join(__dirname, "images", "albums", req.params.id+".png")))){
                    jsmt.read(fs.readFileSync(path.join(__dirname, "music", file)), {
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
                            fs.writeFileSync(path.join(__dirname, "images", "albums", req.params.id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
                            success = true
                        },
                        onError: function(err) {
                            console.log("Error on "+req.params.id+".")
                            console.log(err);
                        }
                    })
                }
                if (success){
                    return
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
        }catch (err){
            console.log(err)
            res.sendFile(path.join(__dirname, "images", "placeholder.jpg"));
            return
        }
        url = data["url"];
        console.log(data["q"])
        await downloadFile(url, path.join(__dirname, "images", "artists", req.params.id+".png"));
    }

    //Send image or placeholder if it fails
    if(fs.existsSync(path.join(__dirname, "images", "artists", req.params.id+".png"))){
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
            file = "music/"+data["songs"][x]["file"];
        }
    }
    console.log(path.join(__dirname, file))
    if(fs.existsSync(path.join(__dirname, file))){
        res.sendFile(path.join(__dirname, file));
    } else{
        res.send("error");
    }
})

app.get('/info/albums/by/artist/:id', function(req, res){

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

app.get('/info/albums/:id', function(req, res){

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

app.get('/info/songs/by/album/:id', function(req, res){

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

app.get('/info/songs/by/artist/:id', function(req, res){

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

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})


// This is just all the random
// functions that I need to move
// to seperate files but haven't
// yet because modules and requiring
// is annoying so I probably
// won't move them anytime soon


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