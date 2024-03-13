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
                var e = this.loc["prev"][this.loc["prev"].length - 1]
                var b = ((e.substring(e.length-2, e.length) == "ID") ? e.substring(0, e.length - 2) : e)
                if(v.substring(v.length-2, v.length) == "ID" && (b == "albums")){
                    this.setHeader("Songs in "+window.fetchedData.getAlbum(this.loc["id"]).displayName)
                }else if(v.substring(v.length-2, v.length) == "ID" && (b == "playlists")){
                    this.setHeader("Songs in "+window.prefs.getPlaylist(this.loc["id"]).displayName)
                }else{
                    this.setHeader("Songs")
                }
                break;
        
            default:
                break;
        }
        this.addTooltips()
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
                    try{
                        this.setHeader("Albums by "+window.fetchedData.getArtist(this.loc["id"]).displayName)
                    }catch(e){
                        try{
                            this.setHeader("Albums by "+window.fetchedData.getArtist(window.fetchedData.getAlbum(this.loc["id"]).artistId).displayName)
                        }catch{
                            this.setHeader("Albums")
                        }
                    }
                }else{
                    this.setHeader("Albums")
                }
                break;
            case "songs":
                var e = this.loc["prev"][this.loc["prev"].length - 1]
                var b = ((e.substring(e.length-2, e.length) == "ID") ? e.substring(0, e.length - 2) : e)
                if(v.substring(v.length-2, v.length) == "ID" && (b == "albums")){
                    this.setHeader("Songs in "+window.fetchedData.getAlbum(this.loc["id"]).displayName)
                }else if(v.substring(v.length-2, v.length) == "ID" && (b == "playlists")){
                    this.setHeader("Songs in "+window.prefs.getPlaylist(this.loc["id"]).displayName)
                }else{
                    this.setHeader("Songs")
                }
                break;
        
            default:
                break;
        }
        this.addTooltips()
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

    addTooltips(){
        tippy("[data-tippy-content]")
    }
}

class FetchedData {
    constructor(){
        this.artists = []
        this.albums = []
        this.songs = []
        this.playlists = []
        this.userPlaylists = []
        this.all = []
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
            if(data["authorized"] == false || data["authed"] == false){
                window.location = window.authSettings.getAuthPageUrl()
                return
            }
            if(data == undefined){
                window.location = window.authSettings.getAuthPageUrl()
                return
            }
            t.artists = data["artists"];
            t.artists.sort(function(a, b){
                if(a.displayName < b.displayName) return -1
                if(a.displayName > b.displayName) return 1
                return 0
            })
            axios.post(window.prefs.getBackendUrl()+'/info/albums', authParams)
            .then(function (response) {
                var data = JSON.parse(JSON.stringify(response.data));
                if(data["authorized"] == false){
                    window.location = window.authSettings.getAuthPageUrl()
                    return
                }
                if(data == undefined){
                    window.location = window.authSettings.getAuthPageUrl()
                    return
                }
                t.albums = data["albums"];
                t.albums.sort(function(a, b){
                    if(a.displayName < b.displayName) return -1
                    if(a.displayName > b.displayName) return 1
                    return 0
                })
                axios.post(window.prefs.getBackendUrl()+'/info/songs', authParams)
                .then(function (response) {
                    var data = JSON.parse(JSON.stringify(response.data));
                    if(data["authorized"] == false){
                        window.location = window.authSettings.getAuthPageUrl()
                        return
                    }
                    if(data == undefined){
                        window.location = window.authSettings.getAuthPageUrl()
                        return
                    }
                    t.songs = data["songs"];
                    t.songs.sort(function(a, b){
                        if(a.displayName < b.displayName) return -1
                        if(a.displayName > b.displayName) return 1
                        return 0
                    })
                    axios.post(window.prefs.getBackendUrl()+'/info/all', authParams)
                    .then(function (response) {
                        var data = JSON.parse(JSON.stringify(response.data));
                        if(data["authorized"] == false){
                            window.location = window.authSettings.getAuthPageUrl()
                            return
                        }
                        if(data == undefined){
                            window.location = window.authSettings.getAuthPageUrl()
                            return
                        }
                        console.log(data)
                        t.all = data["entries"];
                        axios.post(window.prefs.getBackendUrl()+'/playlists', authParams)
                        .then(function (response) {
                            var data = JSON.parse(JSON.stringify(response.data));
                            if(data["authorized"] == false){
                                window.location = window.authSettings.getAuthPageUrl()
                                return
                            }
                            if(data == undefined){
                                window.location = window.authSettings.getAuthPageUrl()
                                return
                            }
                            console.log(data)
                            t.playlists = data["playlists"];
                            axios.post(window.prefs.getBackendUrl()+'/playlists/user/'+window.authSettings.getUsername(), authParams)
                            .then(function (response) {
                                    var data = JSON.parse(JSON.stringify(response.data));
                                    if(data["authorized"] == false){
                                        window.location = window.authSettings.getAuthPageUrl()
                                        return
                                    }
                                    if(data == undefined){
                                        window.location = window.authSettings.getAuthPageUrl()
                                        return
                                    }
                                    console.log(data)
                                    t.userPlaylists = data;
                                    t.onInit()
                            }).catch(function (error) {
                                if(error.code == "ERR_NETWORK"){
                                    window.location = window.authSettings.getAuthPageUrl()
                                    return
                                }else{
                                    console.log(error)
                                }
                            })
                        }).catch(function (error) {
                            if(error.code == "ERR_NETWORK"){
                                window.location = window.authSettings.getAuthPageUrl()
                                return
                            }else{
                                console.log(error)
                            }
                        })
                    }).catch(function (error) {
                        if(error.code == "ERR_NETWORK"){
                            window.location = window.authSettings.getAuthPageUrl()
                            return
                        }else{
                            console.log(error)
                        }
                    })
                }).catch(function (error) {
                    if(error.code == "ERR_NETWORK"){
                        window.location = window.authSettings.getAuthPageUrl()
                        return
                    }else{
                        console.log(error)
                    }
                })
            }).catch(function (error) {
                if(error.code == "ERR_NETWORK"){
                    window.location = window.authSettings.getAuthPageUrl()
                    return
                }else{
                    console.log(error)
                }
            })
        }).catch(function (error) {
            if(error.code == "ERR_NETWORK"){
                window.location = window.authSettings.getAuthPageUrl()
                return
            }else{
                console.log(error)
            }
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
    getUserPlaylists(){
        return this.userPlaylists
    }
    getPlaylists(){
        return this.playlists
    }
    modUserPlaylist(playlist){
        var usp = new URLSearchParams({
            "id": playlist["id"],
            "name": playlist["displayName"],
            "public": playlist["public"],
            "description": playlist["description"],
            "songs": JSON.stringify(playlist["songs"])
        })
        axios.post(window.prefs.getBackendUrl()+'/playlists/user/'+window.authSettings.getUsername()+"/"+playlist["id"], usp).then(function (response) {
            var data = JSON.parse(JSON.stringify(response.data));
            if(data["authorized"] == false){
                window.location = window.authSettings.getAuthPageUrl()
                return
            }
            if(data == undefined){
                window.location = window.authSettings.getAuthPageUrl()
                return
            }
            console.log(data)
        }).catch(function (error) {
            if(error.code == "ERR_NETWORK"){
                window.location = window.authSettings.getAuthPageUrl()
                return
            }else{
                console.log(error)
            }
        })
    }
}

class VisibleContent{
    constructor(){
        this.content = document.getElementById("content")
        this.bottomOfPage = () => {console.log("Bottom of page")}
        this.counter = 0

      this.bottomVisible = (offset) =>
        document.getElementById("content-container").scrollTop > document.getElementById("content-container").scrollHeight - offset
    }
    getContent(){
        return this.content
    }
    setContent(c){
        this.content = c
    }
    setCounter(c){
        this.counter = c
    }
    getCounter(){
        return this.counter
    }
    bottomOfPage(){
        this.bottomOfPage()
    }
    setBottomOfPage(c){
        this.bottomOfPage = c
    }
    
}

async function getQueue(currPlaying, end){
    if(typeof(window.localPlayer) == "undefined"){
        console.log("No queue instance");
    }else if(window.localPlayer.getQueue().length == 0){
        console.log("Queue is empty")
        reset()
        document.getElementById("content").innerHTML = `
            <h1 class="loading-text-placeholder">Nothing in queue...</h1>
        `
    }else{
        reset()
        var innerhtml = "";
        for(var x = currPlaying; x < (typeof(end) == "undefined" ? window.localPlayer.getQueue().length : end); x++){
            var sInfo = window.fetchedData.getSong(window.localPlayer.getQueue()[x])
            innerhtml += `
                <m3-queue-list-item image="${window.prefs.getBackendUrl()+"/info/songs/" + sInfo["id"] + "/image"}" song="${sInfo["displayName"]}" album="${sInfo["albumId"]}" artist="${sInfo["artistId"]}" albumClick="albumClick('${sInfo["albumId"]}')" artistClick="artistClick('${sInfo["artistId"]}')" duration="${Math.floor(Math.round(sInfo["duration"]) / 60)+":"+Math.round(sInfo["duration"] % 60).toString().padStart(2, '0')}"></m3-queue-list-item>`
        }
        document.getElementById("content").innerHTML = `
            <div id="queue-header">
                <div id="queue-header-left" class="oneline">
                    <span>Save queue</span>
                    <md-chip-set>
                        <md-assist-chip id="queue-save-button" onclick="window.localPlayer.saveQueue()" label="To this browser"></md-assist-chip>
                        <md-assist-chip id="queue-save-playlist-button" onclick="saveQueueToPlaylistDialog()" label="To playlist"></md-assist-chip>
                    </md-chip-set>
                </div>
                <div id="queue-header-right">
                    <md-outlined-button id="queue-clear-button" onclick="window.localPlayer.clearQueue(true)">Clear Queue</md-outlined-button>
                </div>
            </div>
            <md-list id="queue-list">
                ${innerhtml}
            </md-list>
        `
        // console.log(innerhtml)
    }
}

async function getPlaylists(){
    reset()
    var d = document.getElementById("content")
    console.log("Getting playlists...")
    var p = window.prefs.getPlaylists()
    console.log("Playlists: " + p.length)
    console.log(p)
    d.innerHTML = `
        <h1 class="loading-text-placeholder">Loading...</h1>
    `
    if(p.length == 0){
        d.innerHTML = `
            <h1 class="loading-text-placeholder">No playlists...</h1>
        `
        return
    }
    reset()
    var inhtml = ``
    for(var x = 0; x < p.length; x++){
        var i = p[x]
        console.log(i["displayName"])
        inhtml += `
            <m3-list-item thingtype="playlist" thingid="${i["id"]}" text="${i["displayName"]}" endText="" onclick="playlistClicked('${i["id"]}')" image="${window.prefs.getBackendUrl()+"/placeholder"}"></m3-list-item>
        `
        if(x != p.length-1){
            inhtml += `
                <md-divider style="margin-left: 8px; margin-right: 8px; width: calc(100% - 16px);"></md-divider>
            `
        }
    }
    d.innerHTML = `
        <md-list id="list">
            ${inhtml}
        </md-list>
    `

}

async function artistClick(id){
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

async function albumClick(id){
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

async function settingsClick(){
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
            <span slot="start">Save queue on exit</span>
            <md-switch id="settings-toggle-save-queue-exit" class="settings-switch" ${(window.prefs.getSaveQueueOnExit() ? "selected" : "")} slot="end"></md-switch>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Save queue on change</span>
            <md-switch id="settings-toggle-save-queue-change" class="settings-switch" ${(window.prefs.getSaveQueueOnChange() ? "selected" : "")} slot="end"></md-switch>
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
        <md-divider></md-divider>
        <md-list-item>
            <span slot="start">Clear authtoken and username</span>
            <md-filled-button id="logout-button" slot="end">Logout</md-filled-button>
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

async function queueClick(){
    console.log("Opening queue");
    reset()
    getQueue(window.localPlayer.getQueuePos(),window.localPlayer.getQueue().length)
    window.navigationInfo.setHeader("Queue")
    window.navigationInfo.addHist(window.navigationInfo.get()["location"])
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "queue",
        "id": window.navigationInfo.get()["id"],
    })
}

async function downloadClick(){
    showSnackbar("Download not yet implemented")
}

async function searchClick(){
    console.log("Opening search");
    showSnackbar("Search not yet implemented")
}

async function playlistClick(){
    console.log("Opening playlists");
    reset()
    getPlaylists()
    window.navigationInfo.setHeader("Playlists")
    window.navigationInfo.addHist(window.navigationInfo.get()["location"])
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "playlists",
        "id": window.navigationInfo.get()["id"],
    })
}

async function playlistClicked(id){
    console.log("Clicked on playlist: " + id);
    document.getElementById("content").innerHTML = "";
    getSongsByPlaylist(id)
    window.navigationInfo.addHist("playlistsID")
    window.navigationInfo.set({
        "prev": window.navigationInfo.getHist(),
        "location": "songsID",
        "id": id
    })
}

async function createPlaylistDialog(type, id){
    addPlaylistClick((d) => {
        console.log("Created playlist: " + d.displayName)
        switch(type){
            case "album":
                console.log("album")
                window.prefs.addListToPlaylist(d.id, window.fetchedData.getSongsByAlbum(id).map(entry => entry.id))
                break;
            case "artist":
                console.log("artist")
                window.prefs.addListToPlaylist(d.id, window.fetchedData.getSongsByArtist(id).map(entry => entry.id))
                break;
            case "playlist":
                console.log("playlist")
                break;
            case "song":
                console.log("song")
                window.prefs.addToPlaylist(d.id, id)
                break;
        }
    })
}

async function saveQueueToPlaylistDialog(){
    
    var listHtml = ``
    listHtml += `
    <div class="add-playlist-choose-item">
        <md-radio id="createPlaylist" name="addplaylist" value="new" checked></md-radio>
        <label for="createPlaylist">New</label>
    </div>`
    var p = window.prefs.getPlaylists();
    if(p.length > 0){
        //listHtml = `<md-list-item value="createPlaylist"><md-icon>playlist_add</md-icon>Create playlist</li>`
        for (var x = 0; x < (p.length < 25 ? p.length : 25); x++) {
            listHtml += `
                        <div class="add-playlist-choose-item">
                            <md-radio id="${p[x]["id"]}" name="addplaylist" value="${p[x]["id"]}"></md-radio>
                            <label for="${p[x]["id"]}">${p[x]["displayName"]}</label>
                        </div>`
        }
    }
    let inHtml = `
        <md-dialog id="dialogger">
            <div slot="headline">
              Add to playlist
            </div>
            <form slot="content" id="add-playlist-choose-form">
                ${listHtml}
            </form>
            <div slot="actions">
              <md-text-button onclick="closeDialog()">Add</md-text-button>
            </div>
        </md-dialog>
    `
    let d = document.querySelector("#dialog-box")
    d.innerHTML = inHtml
    document.querySelector("#dialogger").open = true
    document.querySelector("#dialogger").addEventListener("closed", async ()=>{
        let d = document.querySelector("#dialog-box").querySelector("md-dialog")
        let selId = ""
        for (let x = 0; x < d.querySelectorAll("md-radio[name=addplaylist]").length; x++) {
            if(d.querySelectorAll("md-radio[name=addplaylist]")[x].checked){
                selId = d.querySelectorAll("md-radio[name=addplaylist]")[x].value
            }
        }
        console.log({"id":selId})
        if(selId == ""){
            showSnackbar("Please choose a playlist")
            return
        }else if(selId == "new"){
            console.log("Creating new playlist")
            addPlaylistClick((d) => {
                console.log("Created playlist: " + d.displayName)
                window.prefs.addListToPlaylist(d.id, window.localPlayer.getQueue())
            })
        }else{
            console.log("Adding to playlist: " + window.prefs.getPlaylist(selId)["displayName"])
            window.prefs.addListToPlaylist(selId, window.localPlayer.getQueue())
        }
    })
}

async function addPlaylistClick(doNext){
    let inHtml = `
        <md-dialog id="dialogger">
            <div slot="headline">
              Create playlist
            </div>
            <form slot="content" id="add-playlist-form" method="dialog" class="dialog-form">
                <md-outlined-text-field id="playlist-name" label="Name"></md-outlined-text-field>
                <div>
                    <label for="playlist-public-switch">Public</label>
                    <md-switch id="playlist-public-switch">Public</md-switch>
                </div>
                <div>
                    <label for="playlist-sync-switch">Sync playlist</label>
                    <md-switch id="playlist-sync-switch"></md-switch>
                </div>
            </form>
            <div slot="actions">
              <md-text-button onclick="closeDialog()">Create</md-text-button>
            </div>
        </md-dialog>
    `
    let d = document.querySelector("#dialog-box")
    d.innerHTML = inHtml
    document.querySelector("#dialogger").open = true
    var closedHandler = async ()=>{
        let d = document.querySelector("#dialog-box").querySelector("md-dialog")
        let name = d.querySelector("md-outlined-text-field#playlist-name").value
        let public = d.querySelector("md-switch#playlist-public-switch").selected
        let u = window.authSettings.getUsername()
        if(name == ""){
            showSnackbar("Please enter a name")
            addPlaylistClick()
            return
        }
        var id = u+"_"+name
        var hashed = await hash(id)
        var data = {
            "id": hashed, 
            "displayName": name, 
            "public": public,
            "songs": []
        }
        console.log(data)
        d.close(data)
        window.prefs.addPlaylist(data)
        if(doNext != undefined){
            doNext(data)
        }
    }
    document.querySelector("#dialogger").addEventListener("cancel", ()=>{
        document.querySelector("#dialogger").removeEventListener("closed", closedHandler)
    })
    document.querySelector("#dialogger").addEventListener("closed", closedHandler)
    await getPromiseFromEvent(document.querySelector("#dialogger"), "closed")
    // console.log("Dialog result: " + t)
}

function closeDialog(){
    document.querySelector("#dialogger").close()
}

async function getHome(place) {
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
            await getArtists()
            break;
        case "albums":
            await getAlbums()
            break;
        case "songs":
            await getSongs()
            break;
    
        default:
            console.log("Unknown screen: " + homeScreen)
            break;
    }
    // console.log(document.querySelectorAll("#overlay"))
    tippy("[data-tippy-content]")
}

async function reset(){
    tippy.hideAll()
    document.getElementById("content").innerHTML = "";
    document.querySelectorAll("#overlay").forEach(x => x._tippy.destroy())
}

async function back(){
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
            window.navigationInfo.setHeader("Queue")
            getQueue(0,window.localPlayer.getQueue().length)
            break;
        case "playlists":
            getPlaylists()
            window.navigationInfo.setHeader("Playlists")
            break;
        case "settings":
            settingsClick()
            break;
    }
    window.navigationInfo.prevPop()
    window.navigationInfo.addTooltips()
}  

function getPromiseFromEvent(item, event) {
    return new Promise((resolve) => {
      const listener = () => {
        item.removeEventListener(event, listener);
        resolve();
      }
      item.addEventListener(event, listener);
    })
}

    
async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
}