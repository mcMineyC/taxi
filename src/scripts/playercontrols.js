function handlePrev(){
    window.localQueue.previous()
}
function handlePause(){
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
        return
    }
    if (window.localPlaying.get()) {
        window.howlerInstance.pause()
    } else {
        window.howlerInstance.play()
    }
}
function handleNext(){
    window.localQueue.next()
}
function handleScroll(event){
    event.preventDefault();
    if(typeof(window.howlerInstance) == "undefined"){
        console.log("No howler instance");
        return
    }
    d = (event.deltaY < 0 ? 1 : -1)
    var seekScale = 10
    var np = window.progress.get() + (d * seekScale)
    window.progress.set(np)
    window.howlerInstance.seek(np)
}
function handleMuteClick(t){
    t.getElementsByTagName("md-icon")[0].innerText = window.Howler.muted ? "volume_up" : "volume_off"
    window.Howler.muted = !window.Howler.muted
    window.Howler.mute(!window.Howler._muted) 
}