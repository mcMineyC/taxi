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
/*
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
*/

setInterval(function() {
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
    } else {
        window.progress.set(window.howlerInstance.seek())
    }
}, 1000);

class Player{
    constructor(){
        this.volume = 1
        this.muted = false
        this.doing = false
        this.thinking = false
        this.canPlay = false
        this.pos = 0
        this.queue = []
        this.shuffleLock = false

        if(localStorage.getItem("stateLastShuffled") == null){
            console.log("Setting stateLastShuffled to true")
            window.localStorage.setItem("stateLastShuffled", true)
        }
        if(localStorage.getItem("stateLastLooped") == null){
            window.localStorage.setItem("stateLastLooped", true)
        }
        if(localStorage.getItem("stateLastVolume") == null){
            window.localStorage.setItem("stateLastVolume", 1)
        }

        this.setVolume(parseFloat(localStorage.getItem("stateLastVolume")))

        this.looped = (localStorage.getItem("stateLastLooped") == "true")

        let loadedQueue = false
        if(localStorage.getItem("stateLastQueue") != null){
            try{
                this.queue = JSON.parse(localStorage.getItem("stateLastQueue"))
                this.pos = parseInt(localStorage.getItem("stateLastPos"))
                if(localStorage.getItem("stateLastSeek") != null){
                    this.dur = parseInt(localStorage.getItem("stateLastSeek"))
                }else{
                    this.dur = 0
                }
                console.log("Loaded queue from local storage")
                loadedQueue = true
            }catch(e){
                console.log("Failed to load queue from local storage")
            }
        }
        if(loadedQueue){
            console.log("Force updating queue")
            this.canPlay = true
            this.update(true)
        }
        console.log("Player created")
    }
    setVolume(vol){
        console.log("Setting volume to "+vol)
        this.volume = vol
        Howler.volume(vol)
        document.getElementById("playercontrols-bottom").setAttribute("volume", vol*15);
    }
    getVolume(){
        return this.volume
    }

    //TODO Fix AI borks
    setMuted(muted){
        this.muted = muted
        if(muted){
            window.howlerInstance.mute()
        } else {
            window.howlerInstance.unmute()
        }
    }
    getMuted(){
        return this.muted
    }
    setPlaying(state){
        this.doing = state
        document.getElementById("playercontrols-bottom").setAttribute("playing", state);
    }
    getPlaying(){
        return (this.doing || this.thinking)
    }
    setThinking(state){
        this.thinking = state
    }
    getThinking(){
        return this.thinking
    }
    playList(list){
        this.clearQueue()
        this.setQueue(list)
        this.update(true)
    }
    setQueue(queuer){
        this.queue = queuer
        this.pos = 0
        this.dur = undefined
    }
    getQueue(){
        return this.queue
    }
    addToQueue(song){
        this.queue.push(song)
        showSnackbar("Added " + window.fetchedData.getSong(song)["displayName"] + " to queue")
    }
    addListToQueue(list){
        this.queue = this.queue.concat(list)
        showSnackbar("Added " + list.length + " songs to queue. new length: " + this.queue.length)
    }
    removeFromQueue(song){
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
    clearQueue(click){
        this.queue = []
        this.pos = 0
        this.dur = undefined

        if(click == true){
            window.localStorage.removeItem("stateLastQueue")
            window.localStorage.removeItem("stateLastPos")
            window.localStorage.removeItem("stateLastShuffled")
            window.localStorage.removeItem("stateLastLooped")
        
            this.changeInfo(true)
            this.update(true)
            Howler.stop()
            this.setPlaying(false)
            this.setThinking(false)
        }
    }
    setQueuePos(pos){
        if(this.pos+pos > this.queue.length-1){
            console.log("At the end of the queue")
            showSnackbar("At the end of the queue")
            if(this.looped){
                console.log("Looped")
                this.pos = 0
                if(window.prefs.getShuffleOnLoop()){
                    this.queue = this.shuffist(this.queue)
                }
                return true
            }else{
                console.log("Not looping")
                return false
            }
        }else if(this.pos+pos < 0){
            console.log("At the beginning of the queue")
            showSnackbar("At the beginning of the queue")
            if(this.looped){
                console.log("Looped")
                this.pos = this.queue.length-1
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
    getQueuePos(){
        return this.pos
    }
    async update(force){
        if (this.getPlaying() == false) {
            console.log("Not playing");
        }else if(this.getPlaying() && (typeof(force) == "undefined" || force == false)){
            return
        }
        if(this.queue.length == 0){
            return
        }
        var song = this.queue[this.pos]
        this.playSong(song)
        this.currentSong = song
        this.changeInfo()
    }
    async shuffle(){
        if(this.shuffleLock == true){
            return
        }
        this.shuffleLock = true
        
        this.queue = this.shuffist(this.queue)
        this.pos = 0
        this.update(true)

        if(window.navigationInfo.get()["location"] == "queue"){
            reset()
            getQueue(0, this.queue.length)
        }

        this.shuffleLock = false
    }
    loop(val){
        localStorage.setItem("stateLastLooped", val)
        this.looped = val
    }
    next(){
        if(this.setQueuePos(1)){
            this.update(true)
        }
    }
    previous(){
        if(this.setQueuePos(-1)){
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
            if(window.navigationInfo.get()["location"] == "queue"){
                reset()
                getQueue()
            }
            return
        }else{
            document.getElementById("playercontrols-box-info").style.visibility = "visible"
            document.getElementById("playercontrols-box-info").style.pointerEvents = "all"
        }
        var cSong = window.fetchedData.getSong(this.currentSong)
        if(cSong == undefined){
            document.getElementById("playercontrols-box-info").style.visibility = "hidden"
            document.getElementById("playercontrols-box-info").style.pointerEvents = "none"
            return
        }
        title.setAttribute("thingid", cSong["id"])
        album.setAttribute("thingid", cSong["albumId"])
        artist.setAttribute("thingid", cSong["artistId"])

        title.innerHTML = cSong["displayName"]
        album.innerHTML = window.fetchedData.getAlbum(cSong["albumId"])["displayName"]
        artist.innerHTML = window.fetchedData.getArtist(cSong["artistId"])["displayName"]

        tippy(title, {content: cSong["displayName"]})
        tippy(album, {content: window.fetchedData.getAlbum(cSong["albumId"])["displayName"]})
        tippy(artist, {content: window.fetchedData.getArtist(cSong["artistId"])["displayName"]})

        if(window.navigationInfo.get()["location"] == "queue"){
            console.log("Refetching queue")
            reset()
            getQueue(this.getQueuePos(),this.queue.length)
        }
        
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
    async saveQueue(){
        localStorage.setItem("stateLastQueue", JSON.stringify(this.queue))
        localStorage.setItem("stateLastPos", this.pos)
        localStorage.setItem("stateLastShuffled", this.shuffled)
        localStorage.setItem("stateLastLooped", this.looped)
        localStorage.setItem("stateLastSeek", window.howlerInstance.seek())
        localStorage.setItem("stateLastVolume", this.volume)
        showSnackbar("Saved queue")
    }
    playSong(id) {
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
        var tt = this
        song.on('play', function() {
            if(tt.canPlay == true && tt.dur != undefined){
                song.seek(Math.abs(tt.dur))
                Howler.volume(tt.volume)
                tt.dur = undefined
            }
            console.log("Playing song")
            tt.setPlaying(true);
            tt.canPlay = false
        })
        song.on('pause', function() {
            console.log("Paused song")
            tt.setPlaying(false);
        })
        song.on('end', function() {
            console.log("Ended song")
            tt.setPlaying(false);
            if(tt.setQueuePos(1)) tt.update(true)
            setProgress(0)
        })
        song.once('load', function() {
            console.log("Loaded song")
            window.duration = song.duration();
            tt.setThinking(false)
        })
    
        window.howlerId = i
        window.howlerInstance = song;
        window.progress = new Position(0);
        window.progress.set(song.seek())
        tt.setThinking(true)
    }

}

document.addEventListener('DOMContentLoaded', function(){
    window.setProgress = setProgress
    document.getElementById("playercontrols-bottom").onwheel = scrollThrottled
    window.prefs = new UserPreferences();
    window.authSettings = new AuthSettings(window.prefs.getBackendUrl(), window.prefs.getFrontendUrl()+"/login.html")
    window.fetchedData = new FetchedData();
    window.fetchedData.onceInitalized(function(){
        getHome()
        window.localPlayer = new Player();
    })
    window.visibleContent = new VisibleContent();
})

window.addEventListener('beforeunload', function(){
    if(window.prefs.getSaveQueueOnExit()){
        window.localPlayer.saveQueue()
    }
})

async function saveQueueClick(){
    if(typeof(this) == "undefined"){
        console.log("No queue instance");
        window.localPlayer = new Player();
    }
    window.localPlayer.saveQueue()
    console.log("Saving queue")
}

function handleLoopClick(th){
    window.localPlayer.loop(th.getAttribute("enabled") == "true")
    console.log("Looping: "+window.localPlayer.looped)
}

function handleSongClick(id) {
    if(typeof(this) == "undefined"){
        console.log("No queue instance");
        window.localPlayer = new Player();
    }
    var f = false
    if(!window.prefs.getAddToQueue()){
        window.localPlayer.clearQueue()
        f = true
    }
    console.log("Added " + id + " to queue")
    window.localPlayer.addToQueue(id)
    window.localPlayer.update(f)
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
