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
        if(loc == "home"){
            document.getElementById("sidebar").setAttribute("home", "true")
        }else{
            document.getElementById("sidebar").setAttribute("home", "false")
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
    console.log("Ama banana "+window.navigationInfo.get()["id"])
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
            getSongs()
            break;
        case "home":
            getHome()
    }
    window.navigationInfo.prevPop()
}

function settingsClick(){
    // reset();
    // var c = document.getElementById("content");
    // c.style.flexDirection = "column";
    showSnackbar("Settings coming soon!")
}