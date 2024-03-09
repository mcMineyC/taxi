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
            window.localPlayer.set(false)
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