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


const app = express();
const port = 3000;
app.use(cors());
app.use(express.urlencoded({
    extended: true
}))

app.use('/music', express.static(path.join(__dirname, 'music')));

app.use('/',express.static(path.join(__dirname, 'static')));

app.post('/auth', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, "config", 'auth.json'), 'utf-8');
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
                fs.writeFileSync(path.join(__dirname, "config", 'auth.json'), JSON.stringify(data,null,4));
                break
            }else if(data["users"][x]["password"] == ""){
                console.log("Authorizing user "+data["users"][x]["displayName"]+" and changing password to "+req.body.password)
                authed = true
                authtoken = crypto.randomBytes(64).toString('hex');
                data["users"][x]["authtoken"] = authtoken;
                data["users"][x]["password"] = req.body.password;
                fs.writeFileSync(path.join(__dirname, "config", 'auth.json'), JSON.stringify(data,null,4));
                break
            }
        }
    }
    res.send({"authorized": authed, "authtoken": authtoken})
});

app.post('/authtoken', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, "config", 'auth.json'), 'utf-8');
    data = JSON.parse(data);
    var authed = false
    var authtoken = ""
    for(var x = 0; x < data["users"].length; x++){
        if(data["users"][x]["authtoken"] == req.body.authtoken){
            console.log("Authorizing user "+data["users"][x]["displayName"]+" based on auth token")
            authed = true
            authtoken = crypto.randomBytes(64).toString('hex');
            data["users"][x]["authtoken"] = authtoken;
            fs.writeFileSync(path.join(__dirname, "config", 'auth.json'), JSON.stringify(data,null,4));
            break
        }
    }
    res.send({"authorized": authed, "authtoken": authtoken})
})

app.post('/info/all', function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }
    
    res.sendFile(path.join(__dirname, "config", 'all.json'));
});

app.get('/placeholder', function (req, res) {
    res.sendFile(path.join(__dirname, "config", 'images', 'placeholder.jpg'));
})

app.post('/info/albums', async function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }

    //Read data
    var data = fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);

    //Update if needed
    if((data["last_updated"]) != hash(JSON.stringify(all))){
        await updateAlbums(hash,all)
        data = JSON.parse(fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8'));
    }

    //Send data
    res.send(data);
});

app.post('/info/artists', function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }
    
    //Read data
    var data = fs.readFileSync(path.join(__dirname, "config", 'artists.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);

    //Update if needed
    if((data["last_updated"]) != hash(JSON.stringify(all))){
        updateArtists(hash,all)
        data = JSON.parse(fs.readFileSync(path.join(__dirname, "config", 'artists.json'), 'utf-8'));
    }

    //Send data
    res.send(data);
});

app.post('/info/songs', async function (req, res) {
    if(checkAuth(req, res) == false){
        return
    }

    //Read data
    var data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);

    //This is only needed if the file changed
    if((data["last_updated"] != hash(JSON.stringify(all)))){
        await updateSongs(hash,all,data)
        data = JSON.parse(fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8'));
    }

    //Send data
    res.send(data);
});

app.get('/info/songs/:id/image', async function (req, res) {
    //Read data
    var data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
    data = JSON.parse(data);
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    all = JSON.parse(all);

    var file = "";

    //Reupdate data if needed
    if(data["last_updated"] != hash(JSON.stringify(all))){
        updateSongs(hash,all,data)
        data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
        data = JSON.parse(data);
    }

    //Find file
    for (var x = 0; x < (data["songs"].length); x++) {
        if (data["songs"][x]["id"] == req.params.id) {
            file = data["songs"][x]["file"];
        }
    }

    //Check if file was found
    if(file == ""){
        console.log("No file associated with "+req.params.id)
        res.sendFile(path.join(__dirname, "config", "images", "placeholder.jpg"));
        return
    }

    //Extract image
    await extractSongImage(file, req.params.id);
    if(!(fs.existsSync(path.join(__dirname, "config", "images", "songs", req.params.id+".png")))){
        console.log("File still doesn't exist, trying to infer based on other songs in album...");
        await inferSongImage(file, req.params.id, data);
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
        //Read data
        var data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
        data = JSON.parse(data);
        var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
        all = JSON.parse(all);

        //Reupdate data if needed
        if(data["last_updated"] != hash(JSON.stringify(all))){
            updateAlbums(hash,all,data)
            data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
            data = JSON.parse(data);
        }

        //Try to extract image from first song in album
        await extractAlbumImage(req.params.id, data)
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
    if(!(fs.existsSync(path.join(__dirname, "config", "images", "artists", req.params.id+".png")))){
        var js = JSON.parse(fs.readFileSync(path.join(__dirname, "config", "artists.json"), 'utf-8'))["artists"];
        var name = ""
        for (var x = 0; x < js.length; x++) {
            if (js[x]["id"] == req.params.id){
                name = js[x]["displayName"]
            }
        }
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
                var albums = JSON.parse(fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8'));
                var songs = JSON.parse(fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8'));
                var albumid = "";
                //Get album id
                for(var x = 0; x < albums["albums"].length; x++){
                    if(albums["albums"][x]["artistId"] == req.params.id){
                        albumid = albums["albums"][x]["id"]
                    }
                }
                console.log("\t\tExtracting image from album "+albumid)
                await extractAlbumImage(albumid, songs, path.join(__dirname, "config", "images", "artists", req.params.id+".png"))
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

app.get('/info/songs/:id/audio', function (req, res) {
    var data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
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

app.post('/info/albums/by/artist/:id', async function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var albums_arr = [];

    //This is only needed if the file changed
    if(data["last_updated"] != hash(JSON.stringify(all))){
        updateAlbums(hash,all,data)
        data = fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8');
        data = JSON.parse(data);
    }

    for(var x = 0; x < data["albums"].length; x++){
        var album = data["albums"][x];
        if(album["artistId"] == req.params.id){
            albums_arr.push(album)
        }
    }
    res.send(albums_arr);
})

app.post('/info/albums/:id', async function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var albums_arr = [];

    if(data["last_updated"] != hash(JSON.stringify(all))){
        updateAlbums(hash,all,data)
        data = fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8');
        data = JSON.parse(data);
    }
    
    for(var x = 0; x < data["albums"].length; x++){
        var album = data["albums"][x];
        if(album["id"] == req.params.id){
            albums_arr.push(album)
        }
    }
    res.send(albums_arr);
})

app.post('/info/songs/by/album/:id', async function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);
    var songs_arr = [];

    //This is only needed if the file changed
    
    if(data["last_updated"] != hash(JSON.stringify(all))){
        await updateSongs(hash,all,data)
        data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
        data = JSON.parse(data);
    }

    for(var x = 0; x < data["songs"].length; x++){
        var song = data["songs"][x];
        if(song["albumId"] == req.params.id){
            songs_arr.push(song)
        }
    }
    res.send(songs_arr);
})

app.post('/info/songs/by/artist/:id', async function(req, res){
    if(checkAuth(req, res) == false){
        return
    }

    var data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    data = JSON.parse(data);
    all = JSON.parse(all);

    var songs_arr = [];

    if(data["last_updated"] != hash(JSON.stringify(all))){
        await updateSongs(hash,all,data)
        data = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
        data = JSON.parse(data);
    }
    
    for(var x = 0; x < data["songs"].length; x++){
        var song = data["songs"][x];
        if(song["artistId"] == req.params.id){
            songs_arr.push(song)
        }
    }
    res.send(songs_arr);
})

app.post('/playlists', async function(req, res){
    if(checkAuth(req, res) == false){
        res.send({"error": "Not authorized", "authed": false})
        return
    }

    //Read data
    var data = fs.readFileSync(path.join(__dirname, "config", "playlists", "playlists.json"), 'utf-8');
    data = JSON.parse(data);
    var all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    all = JSON.parse(all);

    //Update if needed
    if(data["last_updated"] != hash(JSON.stringify(all))){
        await updatePlaylists(hash,all)
    }

    //Send playlists
    res.sendFile(path.join(__dirname, "config", "playlists", "playlists.json"));
})

app.post('/playlists/user/:id', function(req, res){
    if(checkAuth(req, res) == false){
        res.send({"error": "Not authorized", "authed": false})
        return
    }
    var u = getUser(req.body.authtoken);

    var data = fs.readFileSync(path.join(__dirname, "config", "playlists", "playlists_"+req.params.id+".json"), 'utf-8');
    data = JSON.parse(data);
    var d = [];
    for(var x = 0; x < data["playlists"].length; x++){
        if(data["playlists"][x]["public"] == true || u["loginName"] == req.params.id){
            d.push(data["playlists"][x])
        }
    }
    res.send(d)
})

app.post('/playlists/user/:id/modify/:playlist', async function(req, res){
    if(checkAuth(req, res) == false){
        res.send({"error": "Not authorized", "authed": false})
        return
    }
    var u = getUser(req.body.authtoken);
    if(u["loginName"] != req.params.id){
        res.send({"error": "Not authorized", "success": false})
    }

    var data = fs.readFileSync(path.join(__dirname, "config", "playlists", "playlists_"+req.params.id+".json"), 'utf-8');
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
                "id": hash(req.params.playlist),
                "name": req.body.name,
                "description": req.body.description,
                "public": req.body.public,
                "songs": JSON.parse(req.body.songs)
            })
        }catch(e){
            d.push({
                "id": hash(req.params.playlist),
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
    await fs.writeFile(path.join(__dirname, "playlists", "playlists_"+req.params.id+".json"), JSON.stringify(data, null, 4), function (err) {
        if (err) {
            console.log(err);
        }
    })

    res.send(d)
})

async function main(){
    await checkup()
    console.log("Checked and ready to start")
    app.listen(port, () => {
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
            fs.writeFileSync(dest, Buffer.from(base64String, 'binary'), 'binary');    
            console.log("Done!")
        }
    }
}

async function inferSongImage(file, id, data){
    var albumid = "";
        //Get album id
        for(var x = 0; x < data["songs"].length; x++) {
            if(data["songs"][x]["id"] == id){
                albumid = data["songs"][x]["albumId"];
            }
        }
        //Try to extract image again
        for(var x = 0; x < data["songs"].length; x++) {
            //Find first song that is in the same album and not the same song
            if((data["songs"][x]["albumId"] == albumid) && (data["songs"][x]["id"] != id)){
                file = data["songs"][x]["file"];

                //Attempt to extract image from metadata
                if(!(fs.existsSync(path.join(__dirname, "config", "images", "songs", id+".png")))){
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
                    fs.writeFileSync(path.join(__dirname, "config", "images" , "songs", id+".png"), Buffer.from(base64String, 'binary'), 'binary');    
                    console.log("Done!")
                }
            }
        }
}

async function extractAlbumImage(id, data, dest){
    var file = ""
    for(var x = 0; x < data["songs"].length; x++) {
        //Find first song that is in the album
        if((data["songs"][x]["albumId"] == id)){
            file = data["songs"][x]["file"];
            var success = false
            
            //Extract image
            await extractSongImage(file, (dest == undefined ? path.join(__dirname, "config", "images", "albums", id+".png") : dest));
            if(fs.existsSync(path.join(__dirname, "config", "images", "albums", id+".png"))){
                success = true
            }

            if (success){
                console.log("Success extacting "+id+".")
            }else{
                console.log("Trying again")
            }
        }
    }
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

function checkAuth(req, res){
    if(typeof(req.body.authtoken) == "undefined"){
        res.send({"error": "No authtoken provided"})
        return
    }else{
        var authdata = fs.readFileSync(path.join(__dirname, "config", 'auth.json'), 'utf-8');
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
    var authdata = fs.readFileSync(path.join(__dirname, "config", 'auth.json'), 'utf-8');
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
    if(!fs.existsSync(path.join(__dirname, "config", 'playlists'))){
        fs.mkdirSync(path.join(__dirname, "config", 'playlists'));
    }
}

async function updatePlaylists(hashFunc, all){
    var data = fs.readFileSync(path.join(__dirname, "config", "playlists", "playlists.json"), 'utf-8');
    data = JSON.parse(data);
    if(data["last_updated"] != hash(JSON.stringify(all))){
        fs.writeFileSync(path.join(__dirname, "config", "playlists", "playlists.json"), JSON.stringify({"last_updated": hash(JSON.stringify(all))},null,4));
    }
}

async function updateSongs(hashFunc, all, songs){
    //This is only needed if the file changed
    console.log("Updating songs.json")
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
        "last_updated": hashFunc(JSON.stringify(all)),
        "songs": albums_arr
    }
    try{
        fs.writeFileSync(path.join(__dirname, "config", 'songs.json'), JSON.stringify(songs_data,null,4), 'utf-8');
    }catch(err){
        console.log("Error writing songs.json, retrying...")
        try{
            fs.mkdirSync(path.join(__dirname, 'config'));
            fs.writeFileSync(path.join(__dirname, "config", 'songs.json'), JSON.stringify(songs_data,null,4), 'utf-8');
        }catch(err){
            console.log(err)
        }
    }
    console.log("Done updating songs!")
}

async function updateAlbums(hashFunc, all){
    var albums_arr = [];

    console.log("Updating albums.json")
    for(var x = 0; x < (all["entries"].length); x++){
        artist = all["entries"][x]
        for (var album in artist["albums"]) {
            var albumid = album;
            var album = artist["albums"][album];
            console.log("Found album: " + album["displayName"]); //album
            var warr = {
                "id": albumid,
                "displayName": album["displayName"],
                "artist": artist["displayName"],
                "artistId": artist["id"]
            }
            albums_arr.push(warr)
        }
    }
    var albums_data = {
        "last_updated": hashFunc(JSON.stringify(all)),
    }
    albums_data["albums"] = albums_arr
    try{
        fs.writeFileSync(path.join(__dirname, "config", 'albums.json'), JSON.stringify(albums_data,null,4), 'utf-8');
    }catch(err){
        console.log("Error writing songs.json, retrying...")
        try{
            fs.mkdirSync(path.join(__dirname, 'config'));
            fs.writeFileSync(path.join(__dirname, "config", 'albums.json'), JSON.stringify(albums_data,null,4), 'utf-8');
        }catch(err){
            console.log(err)
        }
    }
    console.log("Done updating albums!")
}

async function updateArtists(hashFunc, all){
    //This is only needed if the file changed
    var artist_arr = [];
    for(var x = 0; x < (all["entries"].length); x++){
        artist = all["entries"][x]
        var warr = {
            "id": artist["id"],
            "displayName": artist["displayName"],
        }
        artist_arr.push(warr)
    }
    var artist_data = {
        "last_updated": hashFunc(JSON.stringify(all)),
        "artists": artist_arr
    }
    console.log("Writing file...")
    try{
        fs.writeFileSync(path.join(__dirname, "config", 'artists.json'), JSON.stringify(artist_data,null,4), 'utf-8');
    }catch(err){
        console.log(err)
        console.log("Error writing artists.json, retrying...")
        try{
            fs.writeFileSync(path.join(__dirname, "config", 'artists.json'), JSON.stringify(artist_data,null,4), 'utf-8');
        }catch(err){
            console.log(err)
        }
    }
    console.log("Done updating artists!")
}

async function updateAuth(authData){
    var needToWrite = false
    for(var x = 0; x < authData["users"].length; x++){
        if(authData["users"][x]["authtoken"] == ""){
            console.log("Generating authtoken for "+authData["users"][x]["displayName"])
            var authtoken = crypto.randomBytes(64).toString('hex');
            authData["users"][x]["authtoken"] = authtoken;
            needToWrite = true
        }
        if(!fs.existsSync(path.join(__dirname, "config", "playlists", 'playlists_'+authData["users"][x]["loginName"]+'.json'))){
            fs.writeFileSync(path.join(__dirname, "config", "playlists", 'playlists_'+authData["users"][x]["loginName"]+'.json'), JSON.stringify({"playlists":[]},null,4));
        }
    }
    if(needToWrite){
        fs.writeFileSync(path.join(__dirname, "config", 'auth.json'), JSON.stringify(authData,null,4));
        console.log("Fixed auth.json")
    }
}

async function updateAll(hashFunc, all){
    var updated = false;

    /// ALBUMS
    if(!fs.existsSync(path.join(__dirname, "config", 'albums.json'))){
        await updateAlbums(hash,all)
        updated = true
    }else{
        var albums = fs.readFileSync(path.join(__dirname, "config", 'albums.json'), 'utf-8');
        if(albums != undefined){
            albums = JSON.parse(albums);
            if(albums["last_updated"] != hash(JSON.stringify(all))){
                await updateAlbums(hash,all)
                console.log("Updated albums.json")
                updated = true
            }
        }
    }

    /// ARTISTS
    if(!fs.existsSync(path.join(__dirname, "config", 'artists.json'))){
        fs.writeFileSync(path.join(__dirname, 'artists.json'), JSON.stringify({"last_updated": hash(JSON.stringify(all))},null,4));
        await updateArtists(hash,all)
        console.log("Updated artists.json")
        updated = true
    }else{
        var artists = fs.readFileSync(path.join(__dirname, "config", 'artists.json'), 'utf-8');
        if(artists != undefined){
            artists = JSON.parse(artists);
            if(artists["last_updated"] != hash(JSON.stringify(all))){
                await updateArtists(hash,all)
                console.log("Updated artists.json")
                updated = true
            }
        }
    }

    /// SONGS
    if(!fs.existsSync(path.join(__dirname, "config", 'songs.json'))){
        let all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
        all = JSON.parse(all);
        fs.writeFileSync(path.join(__dirname, "config", 'songs.json'), JSON.stringify({"last_updated": hash(JSON.stringify(all))},null,4));
        var songs = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
        if(songs != undefined){
            songs = JSON.parse(songs);
        }
        var albums_arr = [];
        updateSongs(hash,all,songs).then(() => {
            console.log("Updated songs.json")
        })
    }else{
        let all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
        all = JSON.parse(all);
        var songs = fs.readFileSync(path.join(__dirname, "config", 'songs.json'), 'utf-8');
        if(songs != undefined){
            songs = JSON.parse(songs);
        }
        if(songs["last_updated"] != hash(JSON.stringify(all))){
            updateSongs(hash,all,songs).then(() => {
                console.log("Updated songs.json")
            })
        }
    }

    /// AUTH
    if(!fs.existsSync(path.join(__dirname, "config", 'auth.json'))){
        fs.writeFileSync(path.join(__dirname, "config", 'auth.json'), JSON.stringify({"users":[]},null,4));
    }else{
        var auth = fs.readFileSync(path.join(__dirname, "config", 'auth.json'), 'utf-8');
        if(auth != undefined){
            auth = JSON.parse(auth);
            await updateAuth(auth)
        }
    }

    /// PUBLIC PLAYLISTS
    if(!fs.existsSync(path.join(__dirname, "config", 'playlists.json'))){
        fs.writeFileSync(path.join(__dirname, "config", 'playlists.json'), JSON.stringify({"playlists":[]},null,4));
    }

    if(updated) console.log("Done updating everything!")
}

async function checkup(){
    // CHECK DIRS
    await checkDirs();

    // Check info files
    // Make sure all.json exists
    if(!fs.existsSync(path.join(__dirname, "config", 'all.json'))){
        fs.writeFileSync(path.join(__dirname, "config", 'all.json'), JSON.stringify({"last_updated": 0,"entries":[]},null,4));
    }

    // Now update all
    let all = fs.readFileSync(path.join(__dirname, "config", 'all.json'), 'utf-8');
    if(all != undefined){
        all = JSON.parse(all);
    }
    await updateAll(hash, all)
}