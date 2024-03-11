function handlePrev(){
    window.localPlayer.previous()
}
function handlePause(){
    console.log("Handle pausing")
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
        return
    }
    if(window.localPlayer != undefined && window.localPlayer.canPlay == true){
        window.localPlayer.update(true)
        return
    }
    if (window.localPlayer.getPlaying() == true) {
        console.log("Pausing")
        window.howlerInstance.pause()
    } else {
        console.log("Playing")
        window.howlerInstance.play()
    }
}
function handleNext(){
    window.localPlayer.next()
}
function handleScroll(event){
    event.preventDefault();
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
        return
    }
    d = (event.deltaY < 0 ? 1 : -1)
    var seekScale = 8
    var np = window.howlerInstance.seek() + (d * seekScale)
    if(np < 0){
        window.howlerInstance.seek(0)
        window.progress.set(0)
    }else{
        window.howlerInstance.seek(np)
        window.progress.set(np)
    }
}
function handleMuteClick(t){
    t.getElementsByTagName("md-icon")[0].innerText = window.Howler.muted ? "volume_up" : "volume_off"
    window.Howler.muted = !window.Howler.muted
    window.Howler.mute(!window.Howler._muted) 
}

function handleShuffleClick(){
    window.localPlayer.shuffle()
}

function handleVolumeScroll(vs,e){
    e.preventDefault();
    e.stopPropagation();
    var d = (e.deltaY < 0 ? 1 : -1)
    var np = vs.value + (d)
    if(np < 0){
        np = 0
    }
    if(np > 15){
        np = 15
    }
    window.localPlayer.setVolume(np/15)
  }

const volumeScrollThrottled = _.throttle(handleVolumeScroll, 128, {trailing: false})
const scrollThrottled = _.throttle(handleScroll, 128, {trailing: true})