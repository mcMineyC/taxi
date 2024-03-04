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
        this.unshuffled = []
        this.shuffleLock = false
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
        this.unshuffled.push(song)
        showSnackbar("Added " + song + " to queue")
    }
    addList(list){
        this.unshuffled.push(list)
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
    clear(){
        this.queue = []
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
    async shuffle(val){
        if(this.shuffleLock == true){
            return
        }
        this.shuffleLock = true
        window.localStorage.setItem("stateLastShuffled", (val==true))
        this.shuffled = val
        console.log({"valCheck": window.localStorage.getItem("stateLastShuffled"), "shuffled": this.shuffled, "shuffledCheck": (this.shuffled == true), "shuffledCheck2": (this.shuffled == val)})
        if(val == true){
            this.unshuffled = []
            for(var i = 0; i < this.queue.length; i++){
                this.unshuffled.push(this.queue[i])
            }
            this.queue = this.shuffist(this.queue)
            console.log("Shuffling, "+(this.unshuffled==this.queue))
        }else{
            console.log("Unshuffling, "+(this.unshuffled==this.queue))
            this.queue = []
            for(var i = 0; i < this.unshuffled.length; i++){
                this.queue.push(this.unshuffled[i])
            }
        }

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
    changeInfo(){
        document.getElementById("playercontrols-box-info").style.visibility = "visible"
        document.getElementById("playercontrols-box-info").style.pointerEvents = "all"
        var title = document.getElementById("playercontrols-info-title")
        var album = document.getElementById("playercontrols-info-album")
        var artist = document.getElementById("playercontrols-info-artist")
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
    
}

setInterval(function() {
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
    } else {
        window.progress.set(window.howlerInstance.seek())
    }
}, 1000);

window.setProgress = setProgress
document.getElementById("playercontrols-bottom").onwheel = handleScroll
window.localQueue = new PlayerQueue();
window.prefs = new UserPreferences();
window.authSettings = new AuthSettings(window.prefs.getBackendUrl(), window.prefs.getFrontendUrl()+"/login.html")
window.fetchedData = new FetchedData();
window.fetchedData.onceInitalized(function(){
    getHome()
})
window.visibleContent = new VisibleContent();
window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
      // you're at the bottom of the page
      console.log("Bottom of page");
    }
};

function handleShuffleClick(th){
    window.localQueue.shuffle(th.getAttribute("enabled") == "true")
    // console.log("Shuffling: "+window.localQueue.shuffled)
    /*
    if(window.localQueue.shuffled){
        showSnackbar("Shuffling")
    }else{
        showSnackbar("Not shuffling")
    }*/
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
    window.localPlaying = new Playing(false);
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
