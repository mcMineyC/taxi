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
                    var vv = window.fetchedData.getAlbum(this.loc["id"])
                    this.setHeader("Albums by "+window.fetchedData.getArtist((typeof(vv) == "undefined") ? this.loc["id"] : vv["artistId"]).displayName)
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
            case "queue":
                this.setHeader("Queue")
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
        console.log("Initializing fetched data with backend url "+window.prefs.getBackendUrl())
        var t = this
        var authParams = new URLSearchParams(
            {
                "authtoken": window.authSettings.getAuthToken()
            }
        )
        axios.post(window.prefs.getBackendUrl()+'/info/artists', authParams)
        .then(function (response) {
            var data = JSON.parse(JSON.stringify(response.data));
            if(data["authorized"] == false){
                window.location = window.authSettings.getAuthPageUrl()
            }
            t.artists = data["artists"];
            axios.post(window.prefs.getBackendUrl()+'/info/albums', authParams)
            .then(function (response) {
                var data = JSON.parse(JSON.stringify(response.data));
                if(data["authorized"] == false){
                    window.location = window.authSettings.getAuthPageUrl()
                }
                t.albums = data["albums"];
                axios.post(window.prefs.getBackendUrl()+'/info/songs', authParams)
                .then(function (response) {
                    var data = JSON.parse(JSON.stringify(response.data));
                    if(data["authorized"] == false){
                        window.location = window.authSettings.getAuthPageUrl()
                    }
                    t.songs = data["songs"];
                    axios.post(window.prefs.getBackendUrl()+'/info/all', authParams)
                    .then(function (response) {
                        var data = JSON.parse(JSON.stringify(response.data));
                        if(data["authorized"] == false){
                            window.location = window.authSettings.getAuthPageUrl()
                        }
                        console.log(data)
                        t.all = data["entries"];
                        t.onInit()
                    })
                })
            })
        })
    }
    getAll(){
        return this.all
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

function getQueue(){
    if(typeof(window.localQueue) == "undefined"){
        console.log("No queue instance");
    }else if(window.localQueue.get().length == 0){
        console.log("Queue is empty")
        reset()
        document.getElementById("content").innerHTML = `
            <h1 class="loading-text-placeholder">Nothing in queue...</h1>
        `
    }else{
        reset()
        var innerhtml = "";
        for(var x = 0; x < window.localQueue.get().length; x++){
            var sInfo = window.fetchedData.getSong(window.localQueue.get()[x])
            innerhtml += `
                <m3-queue-list-item image="${window.prefs.getBackendUrl()+"/info/songs/" + sInfo["id"] + "/image"}" song="${sInfo["displayName"]}" album="${window.fetchedData.getAlbum(sInfo["albumId"])["displayName"]}" artist="${window.fetchedData.getArtist(sInfo["artistId"])["displayName"]}" albumClick="albumClick('${sInfo["albumId"]}')" artistClick="artistClick('${sInfo["artistId"]}')" duration="00:42"></m3-queue-list-item>`
        }
        document.getElementById("content").innerHTML = `
            <md-list id="queue-list">
                ${innerhtml}
            </md-list>
        `
        // console.log(innerhtml)
    }
}

function artistClick(id){
    console.log("Clicked on artist: " + id);
    document.getElementById("content").innerHTML = "";
    getAlbumsByArtist(id);
    window.navigationInfo.addHist("artistsID")
    console.log({"artistId": id})
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "albumsID",
        "id": id,
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
        "id": id
    })
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
            <md-outlined-text-field id="settings-theme-hex-code" label="" value="${window.prefs.getThemeColor()}" slot="end"></md-outlined-text-field>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Backend URL to fetch data from (ADVANCED)</span>
            <md-filled-button id="settings-backend-url-save" slot="end">Save</md-filled-button>
            <md-outlined-text-field id="settings-backend-url" label="" value="${window.prefs.getBackendUrl()}" slot="end"></md-outlined-text-field>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Frontend URL to redirect to (ADVANCED)</span>
            <md-filled-button id="settings-frontend-url-save" slot="end">Save</md-filled-button>
            <md-outlined-text-field id="settings-frontend-url" label="" value="${window.prefs.getFrontendUrl()}" slot="end"></md-outlined-text-field>
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

function queueClick(){
    console.log("Opening queue");
    reset()
    window.navigationInfo.setHeader("Queue")
    window.navigationInfo.addHist(window.navigationInfo.get()["location"])
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "queue",
        "id": window.navigationInfo.get()["id"],
    })
    getQueue()
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
            getArtists()
            break;
        case "albums":
            if(v.substring(v.length-2, v.length) == "ID"){
                var vv = window.fetchedData.getAlbum(window.navigationInfo.get()["id"])
                getAlbumsByArtist((typeof(vv) == "undefined") ? window.navigationInfo.get()["id"] : vv["artistId"])
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
            break;
        case "queue":
            queueClick()
            break;
        case "settings":
            settingsClick()
            break;
    }
    window.navigationInfo.prevPop()
}
