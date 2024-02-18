class Location {
    constructor(){}
    addHist(n){
        if(this.home){
            console.log("Skipping")
            this.home = false
            return
        }
        this.loc["prev"].push(n)
    }
    
    getHist(){
        return this.loc["prev"]
    }

    set(loc){
        this.loc = loc
        if(loc["location"] == "home"){
            document.getElementById("sidebar").setAttribute("home", "true")
        }else{
            document.getElementById("sidebar").setAttribute("home", "false")
        }
        var v = this.loc["location"]
        switch ((v.substring(v.length-2, v.length) == "ID") ? v.substring(0, v.length - 2) : v) {
            case "home":
                this.setHeader("Home")
                break;
            case "settings":
                this.setHeader("Settings")
                break;
            case "artists":
                this.setHeader("Artists")
                break;
            case "albums":
                if(v.substring(v.length-2, v.length) == "ID"){
                    this.setHeader("Albums by "+window.fetchedData.getArtist(this.loc["id"]).displayName)
                }else{
                    this.setHeader("Albums")
                }
                break;
            case "songs":
                if(v.substring(v.length-2, v.length) == "ID"){
                    this.setHeader("Songs in "+window.fetchedData.getAlbum(this.loc["id"]).displayName)
                }else{
                    this.setHeader("Songs")
                }
                break;
        
            default:
                break;
        }
    }

    setHeader(h){
        document.getElementById("header-title").innerHTML = h
    }

    prevPop(){
        var i = this.loc
        if(i["prev"][i["prev"].length-1] == "home"){
            console.log("Cannot go back.  At home")
            return
        }else{
            console.log("Popping "+i["prev"].pop())
            this.loc = i
        }
    }
    
    setLocation(loc){
        this.loc["location"] = loc
        if(loc["location"] == "home"){
            document.getElementById("sidebar").setAttribute("home", "true")
        }else{
            document.getElementById("sidebar").setAttribute("home", "false")
        }
        var v = this.loc["location"]
        switch ((v.substring(v.length-2, v.length) == "ID") ? v.substring(0, v.length - 2) : v) {
            case "home":
                this.setHeader("Home")
                break;
            case "settings":
                this.setHeader("Settings")
                break;
            case "artists":
                this.setHeader("Artists")
                break;
            case "albums":
                if(v.substring(v.length-2, v.length) == "ID"){
                    // this.setHeader("Albums by "+window.fetchedData.getArtist(this.loc["id"]).displayName)
                }else{
                    this.setHeader("Albums")
                }
                break;
            case "songs":
                if(v.substring(v.length-2, v.length) == "ID"){
                    // this.setHeader("Songs in "+window.fetchedData.getAlbum(this.loc["id"]).displayName)
                }else{
                    this.setHeader("Songs")
                }
                break;
        
            default:
                break;
        }
    }

    setHome(val){
        this.home = val
    }
    getHome(){
        return this.home
    }

    get(){
        return this.loc
    }
}

class FetchedData {
    constructor(){
        var t = this
        axios.get('http://localhost:3000/info/artists')
        .then(function (response) {
            var data = JSON.parse(JSON.stringify(response.data));
            t.artists = data["artists"];
            axios.get('http://localhost:3000/info/albums')
            .then(function (response) {
                var data = JSON.parse(JSON.stringify(response.data));
                t.albums = data["albums"];
                axios.get('http://localhost:3000/info/songs')
                .then(function (response) {
                    var data = JSON.parse(JSON.stringify(response.data));
                    t.songs = data["songs"];
                    axios.get('http://localhost:3000/info/all')
                    .then(function (response) {
                        var data = JSON.parse(JSON.stringify(response.data));
                        t.all = data["entries"];
                        t.onInit()
                    })
                })
            })
        })
    }
    onceInitalized(d){
        this.onInit = d
    }
    setArtists(data){
        this.artists = data
    }
    setAlbums(data){
        this.albums = data
    }
    setSongs(data){
        this.songs = data
    }
    getArtists(){
        return this.artists
    }
    getAlbums(){
        return this.albums
    }
    getSongs(){
        return this.songs
    }
    getArtist(id){
        for(var x = 0; x < this.artists.length; x++){
            if(this.artists[x]["id"] == id){
                return this.artists[x]
            }
        }
    }
    getAlbum(id){
        for(var x = 0; x < this.albums.length; x++){
            if(this.albums[x]["id"] == id){
                return this.albums[x]
            }
        }
    }
    getSong(id){
        for(var x = 0; x < this.songs.length; x++){
            if(this.songs[x]["id"] == id){
                return this.songs[x]
            }
        }
    }
    getAlbumsByArtist(id){
        var albums = []
        for(var x = 0; x < this.albums.length; x++){
            if(this.albums[x]["artistId"] == id){
                albums.push(this.albums[x])
            }
        }
        return albums
    }
    getSongsByAlbum(id){
        var songs = []
        for(var x = 0; x < this.songs.length; x++){
            if(this.songs[x]["albumId"] == id){
                songs.push(this.songs[x])
            }
        }
        return songs
    }
    getSongsByArtist(id){
        var songs = []
        for(var x = 0; x < this.songs.length; x++){
            if(this.songs[x]["artistId"] == id){
                songs.push(this.songs[x])
            }
        }
        return songs
    }
}

function artistClick(id){
    console.log("Clicked on artist: " + id);
    document.getElementById("content").innerHTML = "";
    getAlbumsByArtist(id);
    window.navigationInfo.addHist("artistsID")
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "albumsID",
        "id": id,
        "screen": "albums"
    })
}

function artistClickSongs(id){
    console.log("Clicked on artist: " + id);
    document.getElementById("content").innerHTML = "";
    getSongsByArtist(id);
    window.navigationInfo.addHist("artists")
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "songsID",
        "id": id,
        "screen": "songs"
    })
}

function albumClick(id){
    console.log("Clicked on album: " + id);
    document.getElementById("content").innerHTML = "";
    getSongsByAlbum(id);
    window.navigationInfo.addHist("albumsID")
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "songsID",
        "id": id,
        "screen": "songs"
    })
}

function getHome(place) {
    reset()
    sPlace = localStorage.getItem("configuredHomeScreen")
    if(typeof(place) == "undefined"){
        place = localStorage.getItem("configuredHomeScreen")
    }else if(sPlace == null || sPlace == undefined || sPlace == "" || sPlace == "null" || sPlace == "undefined"){
        place = localStorage.getItem("configuredHomeScreen")
    }
    var homeScreen = place

    window.navigationInfo = new Location()
    window.navigationInfo.setHome(true)
    window.navigationInfo.set({
        "prev": ["home"],
        "location": "home",
        "id": "MURP"
    })

    switch (homeScreen) {
        case "artists":
            getArtists()
            break;
        case "albums":
            getAlbums()
            break;
        case "songs":
            getSongs()
            break;
    
        default:
            console.log("Unknown screen: " + homeScreen)
            break;
    }
    
}

function reset(){
    document.getElementById("content").innerHTML = "";
}

function back(){
    var i = window.navigationInfo.get();
    reset()
    console.log("Going back")
    window.navigationInfo.setLocation(i["prev"][i["prev"].length - 1])
    var v = window.navigationInfo.get()["location"]
    switch ((v.substring(v.length-2, v.length) == "ID") ? v.substring(0, v.length - 2) : v) {
        case "artists":
            console.log(v.substring(-2, v.length))
            getArtists()
            break;
        case "albums":
            if(v.substring(v.length-2, v.length) == "ID"){
                getAlbumsBySameArtist(window.navigationInfo.get()["id"])
            }else{
                getAlbums()
            }
            break;
        case "songs":
            if(v.substring(v.length-2, v.length) == "ID"){
                getSongsByAlbum(window.navigationInfo.get()["id"])
            }else{
                getSongs()
            }
            break;
        case "home":
            getHome()
    }
    window.navigationInfo.prevPop()
}

function settingsClick(){
    console.log("Opening settings");
    reset()
    document.getElementById("content").innerHTML = `
    <md-list id="settings-list">
        <md-list-item>
            <span slot="start">Dark Mode</span>
            <md-switch id="settings-toggle-dark-mode" class="settings-switch" ${(window.prefs.getDarkMode() ? "selected" : "")} slot="end"></md-switch>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Add song to queue when playing another one</span>
            <md-switch id="settings-toggle-add-to-queue" class="settings-switch" ${(window.prefs.getAddToQueue() ? "selected" : "")} slot="end"></md-switch>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Home page</span>
            <md-tabs slot="end">
                <md-primary-tab class="settings-homepage-artists">Artists</md-primary-tab>
                <md-primary-tab class="settings-homepage-albums">Albums</md-primary-tab>
                <md-primary-tab class="settings-homepage-songs">Songs (not recommended)</md-primary-tab>
            </md-tabs>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Theme color hex code (in the form #RRGGBB)</span>
            <md-filled-button id="settings-theme-hex-code-save" slot="end">Save</md-filled-button>
            <md-outlined-text-field id="settings-theme-hex-code" label="" slot="end"></md-outlined-text-field>
        </md-list-item>
    </md-list>
    `
    console.log("Adding settings actions")
    addSettingsActions()
    window.navigationInfo.addHist(window.navigationInfo.get()["location"])
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "settings",
        "id": window.navigationInfo.get()["id"],
    })
}