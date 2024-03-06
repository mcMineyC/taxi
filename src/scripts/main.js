class PlayerQueue {
    constructor(){
        if(localStorage.getItem("stateLastShuffled") == null){
            console.log("Setting stateLastShuffled to true")
            window.localStorage.setItem("stateLastShuffled", true)
        }
        if(localStorage.getItem("stateLastLooped") == null){
            window.localStorage.setItem("stateLastLooped", true)
        }
        this.shuffled = (localStorage.getItem("stateLastShuffled") == "true")
        this.looped = (localStorage.getItem("stateLastLooped") == "true")
        this.pos = 0
        this.queue = []
        this.shuffleLock = false
        let loadedQueue = false
        if(localStorage.getItem("stateLastQueue") != null){
            try{
                this.queue = JSON.parse(localStorage.getItem("stateLastQueue"))
                this.pos = parseInt(localStorage.getItem("stateLastPos"))
                console.log("Loaded queue from local storage")
                loadedQueue = true
            }catch(e){
                console.log("Failed to load queue from local storage")
            }
        }
        if(loadedQueue){
            console.log("Force updating queue")
            this.update(true)
        }
    }
    set(queuer){
        console.log({"shuffled": this.shuffled})
        if(this.shuffled == true){
            console.log("Setting shuffled queue")
            this.queue = this.shuffist(queuer)
        }else{
            console.log("Setting unshuffled queue")
            this.queue = queuer
        }
    }
    get(){
        return this.queue
    }
    add(song){
        this.queue.push(song)
        showSnackbar("Added " + song + " to queue")
    }
    addList(list){
        if(this.shuffled == true){
            this.queue = this.queue.concat(this.shuffist(list))
        }else{
            this.queue = this.queue.concat(list)
        }
        showSnackbar("Added " + list.length + " songs to queue")
    }
    remove(song){
        var q = this.queue
        if(q.length == 0){
            return
        }
        if(q[0] == song){
            q.shift()
        }else{
            for(var i = 0; i < q.length; i++){
                if(q[i] == song){
                    q.splice(0, i)
                    break
                }
            }
        }
    }
    clear(click){
        this.queue = []

        if(click == true){
            window.localStorage.removeItem("stateLastQueue")
            window.localStorage.removeItem("stateLastPos")
            window.localStorage.removeItem("stateLastShuffled")
            window.localStorage.removeItem("stateLastLooped")
        
            this.changeInfo(true)
            this.update(true)
            Howler.stop()
            window.localPlaying.set(false)
        }

        if(window.navigationInfo.get()["location"] == "queue"){
            reset()
            getQueue()
        }
    }
    setPos(pos){
        if(this.pos+pos > this.queue.length-1){
            console.log("At the end of the queue")
            showSnackbar("At the end of the queue")
            if(this.looped){
                console.log("Looped")
                this.pos = 0
                this.queue = this.shuffist(this.queue)
                return true
            }else{
                console.log("Not looping")
                return false
            }
        }else{
            this.pos = this.pos + pos
            return true
        }
    }
    getPos(){
        return this.pos
    }
    async update(force){
        if (typeof(window.localPlaying) == "undefined") {
            console.log("Not playing");
        }else if(window.localPlaying.get() && (typeof(force) == "undefined" || force == false)){
            return
        }
        if(this.queue.length == 0){
            return
        }
        var song = this.queue[this.pos]
        playSong(song)
        this.currentSong = song
        this.changeInfo()
    }
    async shuffle(){
        if(this.shuffleLock == true){
            return
        }
        this.shuffleLock = true
        
        this.queue = this.shuffist(this.queue)

        if(window.navigationInfo.get()["location"] == "queue"){
            reset()
            getQueue()
        }

        this.shuffleLock = false
    }
    loop(val){
        localStorage.setItem("stateLastLooped", val)
        this.looped = val
    }
    next(){
        if(this.setPos(1)){
            this.update(true)
        }
    }
    previous(){
        if(this.setPos(-1)){
            this.update(true)
        }
    }
    changeInfo(clear){
        document.getElementById("playercontrols-box-info").style.visibility = "visible"
        document.getElementById("playercontrols-box-info").style.pointerEvents = "all"
        var title = document.getElementById("playercontrols-info-title")
        var album = document.getElementById("playercontrols-info-album")
        var artist = document.getElementById("playercontrols-info-artist")
        if(this.currentSong == undefined || clear == true){
            document.getElementById("playercontrols-box-info").style.visibility = "hidden"
            document.getElementById("playercontrols-box-info").style.pointerEvents = "none"
            return
        }else{
            document.getElementById("playercontrols-box-info").style.visibility = "visible"
            document.getElementById("playercontrols-box-info").style.pointerEvents = "all"
        }
        var cSong = window.fetchedData.getSong(this.currentSong)
        
        title.setAttribute("thingid", cSong["id"])
        album.setAttribute("thingid", cSong["albumId"])
        artist.setAttribute("thingid", cSong["artistId"])

        title.innerHTML = cSong["displayName"]
        album.innerHTML = window.fetchedData.getAlbum(cSong["albumId"])["displayName"]
        artist.innerHTML = window.fetchedData.getArtist(cSong["artistId"])["displayName"]
    }
    shuffist(array) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex > 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }
    save(){
        localStorage.setItem("stateLastQueue", JSON.stringify(this.queue))
        localStorage.setItem("stateLastPos", this.pos)
        localStorage.setItem("stateLastShuffled", this.shuffled)
        localStorage.setItem("stateLastLooped", this.looped)
    }
}

class Position {
    constructor(currPos){
        this.pos = currPos
    }
    set(pos){
        this.pos = pos
        window.setProgress(pos)
    }
    get(){
        return this.pos
    }
}

class Playing {
    constructor(currState){
        this.state = currState
    }
    set(state){
        this.state = state
        document.getElementById("playercontrols-bottom").setAttribute("playing", state);
    }
    get(){
        return this.state
    }
}

class Playlists {
    constructor(){
        this.playlists = []
        if(typeof(window.localStorage.getItem("savedPlaylists")) != "undefined"){
            this.playlists = JSON.parse(window.localStorage.getItem("savedPlaylists"))["playlists"]
            if(this.playlists == null){
                this.playlists = []
            }
        }
    }

    add(playlist, sync){
        this.playlists.push(playlist)
        window.localStorage.setItem("savedPlaylists", JSON.stringify({"playlists": this.playlists}))
    }

    remove(playlistId, sync){
        var plist = {}
        for(var x = 0; x < this.playlists.length; x++){
            if(this.playlists[x]["id"] == playlistId){
                plist = this.playlists[x]
            }
        }
        this.playlists.splice(this.playlists.indexOf(plist), 1)
        window.localStorage.setItem("savedPlaylists", JSON.stringify({"playlists": this.playlists}))
    }

    set(playlists, sync){
        this.playlists = playlists
        window.localStorage.setItem("savedPlaylists", JSON.stringify({"playlists": this.playlists}))
    }

    get(){
        return this.playlists
    }

    getPlaylist(id){
        for(var x = 0; x < this.playlists.length; x++){
            if(this.playlists[x]["id"] == id){
                return this.playlists[x]
            }
        }
    }

    getPlaylistByName(name){
        for(var x = 0; x < this.playlists.length; x++){
            if(this.playlists[x]["displayName"] == name){
                return this.playlists[x]
            }
        }
    }

    search(name){
        var ret = []
        for(var x = 0; x < this.playlists.length; x++){
            if(this.playlists[x]["displayName"].toLowerCase().includes(name.toLowerCase())){
                ret.push(this.playlists[x])
            }
        }
        return ret
    }
}

setInterval(function() {
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
    } else {
        window.progress.set(window.howlerInstance.seek())
    }
}, 1000);

document.addEventListener('DOMContentLoaded', function(){
    window.setProgress = setProgress
    document.getElementById("playercontrols-bottom").onwheel = handleScroll
    window.prefs = new UserPreferences();
    window.authSettings = new AuthSettings(window.prefs.getBackendUrl(), window.prefs.getFrontendUrl()+"/login.html")
    window.fetchedData = new FetchedData();
    window.fetchedData.onceInitalized(function(){
        getHome()
        window.localQueue = new PlayerQueue();
    })
    window.visibleContent = new VisibleContent();
    window.unsyncedPlaylists = new Playlists();
    
    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
            // you're at the bottom of the page
            console.log("Bottom of page");
        }
    };  
})

async function saveQueueClick(){
    if(typeof(window.localQueue) == "undefined"){
        console.log("No queue instance");
        window.localQueue = new PlayerQueue();
    }
    window.localQueue.save()
    console.log("Saving queue")
}

function handleLoopClick(th){
    window.localQueue.loop(th.getAttribute("enabled") == "true")
    console.log("Looping: "+window.localQueue.shuffled)
    /*
    if(window.localQueue.looped){
        showSnackbar("Looping")
    }else{
        showSnackbar("Not looping")
    }*/
}

function handleSongClick(id) {
    if(typeof(window.localQueue) == "undefined"){
        console.log("No queue instance");
        window.localQueue = new PlayerQueue();
    }
    var f = false
    if(!window.prefs.getAddToQueue()){
        window.localQueue.clear()
        f = true
    }
    console.log("Added " + id + " to queue")
    window.localQueue.add(id)
    window.localQueue.update(f)
}

function playList(list){
    if(typeof(window.localQueue) == "undefined"){
        console.log("No queue instance");
        window.localQueue = new PlayerQueue();
    }
    window.localQueue.clear()
    window.localQueue.set(list)
    window.localQueue.update(true)
}

function playSong(id) {
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
    }else{
        window.howlerInstance.stop();
        window.howlerInstance.off("play")
        window.howlerInstance.off("pause")
        window.howlerInstance.off("end")
        window.howlerInstance.off("load")
    }
    if(typeof(window.howlerId) == "undefined"){
        console.log("No howler playing");
    }
    var song = new Howl({
        src: [window.prefs.getBackendUrl() + '/info/songs/' + id + '/audio'],
        html5: true
    })
    var i = song.play();
    song.on('play', function() {
        window.localPlaying.set(true);
    })
    song.on('pause', function() {
        window.localPlaying.set(false);
    })
    song.on('end', function() {
        window.localPlaying.set(false)
        if(window.localQueue.setPos(1)) window.localQueue.update()
        setProgress(0)
    })
    song.once('load', function() {
        window.duration = song.duration();
    })

    window.localId = i
    window.howlerInstance = song;
    window.progress = new Position(0);
    window.progress.set(song.seek())
    window.localPlaying = new Playing(true);
}
// Update progress bar on seek/position change
function setProgress(val){
    var p = val / window.duration;
    document.getElementById("playercontrols-bottom").setAttribute("value", p);
}

function parseProgress(val){
    //Parse seconds to minutes
    var minutes = Math.floor(val / 60);
    var seconds = val % 60;
    var secondsFormatted = seconds < 10 ? '0' + seconds : seconds; // Ensures two digit format
    return minutes + ":" + secondsFormatted;
}
