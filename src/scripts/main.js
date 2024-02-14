setInterval(function() {
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
    } else {
        window.progress.set(window.howlerInstance.seek())
    }
}, 1000);

window.setProgress = setProgress
document.getElementById("playercontrols-bottom").onwheel = handleScroll

function handleSongClick(id) {
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
    }else{
        window.howlerInstance.stop();
        window.howlerInstance.off("play")
        window.howlerInstance.off("pause")
    }
    if(typeof(window.howlerId) == "undefined"){
        console.log("No howler playing");
    }
    var song = new Howl({
        src: ['http://localhost:3000/info/songs/' + id + '/audio'],
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