class PlayerQueue {
    constructor(){
        this.queue = []
        this.pos = 0
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
            return false
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
        var song = this.queue[this.pos]
        playSong(song)
    }
    next(){
        this.update(this.setPos(1))
    }
    previous(){
        this.update(this.setPos(-1))
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
window.fetchedData = new FetchedData();
window.fetchedData.onceInitalized(function(){
    getHome()
})

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
    window.localQueue.add(id)
    window.localQueue.update(f)
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
        src: [window.prefs.getUrl() + '/info/songs/' + id + '/audio'],
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
        window.localQueue.setPos(1)
        window.localQueue.update()
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
