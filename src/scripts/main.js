class PlayerQueue {
    constructor(){
        this.queue = []
        this.pos = 0
        this.playedPoses = []
        this.shuffled = true
        this.looped = true
        if(localStorage.getItem("stateLastShuffled") != null){
            this.shuffled = (localStorage.getItem("stateLastShuffled") == "true")
        }
        if(localStorage.getItem("stateLastLooped") != null){
            this.looped = (localStorage.getItem("stateLastLooped") == "true")
        }
    }
    set(queue){
        this.queue = queue
    }
    get(){
        return this.queue
    }
    add(song){
        this.queue.push(song)
        showSnackbar("Added " + song + " to queue")
    }
    addList(list){
        this.queue = this.queue.concat(list)
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
        this.playedPoses = []
    }
    setPos(pos){
        if(this.pos+pos > this.queue.length-1){
            console.log("At the end of the queue")
            showSnackbar("At the end of the queue")
            if(this.looped){
                console.log("Looped")
                this.pos = 0
                this.playedPoses = []
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
    update(force){
        if (typeof(window.localPlaying) == "undefined") {
            console.log("Not playing");
        }else if(window.localPlaying.get() && (typeof(force) == "undefined" || force == false)){
            return
        }
        if(this.queue.length == 0){
            return
        }
        var poses = 0
        console.log(this.playedPoses)
        if(this.shuffled){
            poses = Math.floor(Math.random() * this.queue.length)
            console.log("Choosing random song "+poses)
            while(this.playedPoses.includes(poses)){
                poses = Math.floor(Math.random() * this.queue.length)
                console.log("Choosing random song "+poses)
            }
        }else{
            poses = this.pos
        }
        var song = this.queue[poses]
        playSong(song)
        this.playedPoses.push(poses)
        console.log(this.playedPoses)
    }
    shuffle(val){
        localStorage.setItem("stateLastShuffled", val)
        this.shuffled = val
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
window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
      // you're at the bottom of the page
      console.log("Bottom of page");
    }
};

function handleShuffleClick(th){
    window.localQueue.shuffle(th.getAttribute("enabled") == "true")
    console.log("Shuffling: "+window.localQueue.shuffled)
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
