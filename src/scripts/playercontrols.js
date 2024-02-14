function handlePrev(){
    showSnackbar('Not Implemented')
}
function handlePause(){
    if (window.localPlaying.get()) {
        window.howlerInstance.pause()
    } else {
        window.howlerInstance.play()
    }
}
function handleNext(){
    showSnackbar('Not Implemented')
}