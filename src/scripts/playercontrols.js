function handlePrev(){
    showSnackbar('Not Implemented')
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
    showSnackbar('Not Implemented')
}
function handleScroll(event){
    event.preventDefault();
    d = (event.deltaY < 0 ? 1 : -1)
    var seekScale = 10
    var np = window.progress.get() + (d * seekScale)
    window.progress.set(np)
    window.howlerInstance.seek(np)
}