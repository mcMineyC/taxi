// Add an event listener for the contextmenu event on the document
document.addEventListener('contextmenu', function(event) {
    // Prevent the default context menu from appearing
    event.preventDefault();
    console.log(event.target)
  
    // Create and display a custom context menu at the mouse position
    const customContextMenu = document.getElementById('custom-context-menu');
    var thingtype = event.target.getAttribute("thingtype")
    var thingid = event.target.getAttribute("thingid")
    var inhtml = `<ul class="context-menu">`
    switch(event.target.getAttribute("thingtype")){
        case "album":
            console.log("album")
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlaying) != "undefined" && window.localPlaying.get() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
            }
            inhtml += `<li value="addplaylist"><md-icon>playlist_add</md-icon>Add to playlist</li>`
            inhtml += `<li value="share"><md-icon>share</md-icon>Share</li>`
            break;
        case "artist":
            console.log("artist")
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlaying) != "undefined" && window.localPlaying.get() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
            }
            inhtml += `<li value="addplaylist"><md-icon>playlist_add</md-icon>Add to playlist</li>`
            inhtml += `<li value="share"><md-icon>share</md-icon>Share</li>`
            break;
        case "playlist":
            console.log("playlist")
            break;
        case "song":
            console.log("song")
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlaying) != "undefined" && window.localPlaying.get() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
            }
            inhtml += `<li value="addplaylist"><md-icon>playlist_add</md-icon>Add to playlist</li>`
            inhtml += `<li value="share"><md-icon>share</md-icon>Share</li>`
            break;
        default:
            console.log("default")
            customContextMenu.style.display = 'none';
            return
            break;
    }
    inhtml += `</ul>`
    customContextMenu.innerHTML = inhtml
    customContextMenu.style.left = event.clientX + 'px';
    customContextMenu.style.top = event.clientY + 'px';
    customContextMenu.style.display = 'block';
    document.body.appendChild(customContextMenu);
    
    // Add event listeners for the custom context menu options
    customContextMenu.querySelectorAll('li').forEach(option => {
      option.addEventListener('click', function() {
        // Perform action based on the selected option
        var a = option.getAttribute('value')
        console.log('Selected option:', a);

        switch(a){
            case "play":
                switch(thingtype){
                    case "album":
                        console.log("album")
                        break;
                    case "artist":
                        console.log("artist")
                        playList(window.fetchedData.getSongsByArtist(thingid).map(entry => entry.id))
                        break;
                    case "playlist":
                        console.log("playlist")
                        break;
                    case "song":
                        console.log("song")
                        break;
                }
                break;
            case "queue":
                switch(thingtype){
                    case "album":
                        console.log("album")
                        window.localQueue.addList(window.fetchedData.getSongsByAlbum(thingid).map(entry => entry.id))
                        break;
                    case "artist":
                        console.log("artist")
                        window.localQueue.addList(window.fetchedData.getSongsByArtist(thingid).map(entry => entry.id))
                        break;
                    case "playlist":
                        console.log("playlist")
                        break;
                    case "song":
                        console.log("song")
                        window.localQueue.addList([thingid])
                        break;
                }
                break;
            case "addplaylist":
                console.log("addplaylist")
                break;
            case "share":
                console.log("share")
                break;
        }

        // Hide the custom context menu
        customContextMenu.style.display = 'none';
      });
    });
  
    // Add an event listener to close the custom context menu when clicking outside of it
    document.addEventListener('click', function(event) {
      if (!customContextMenu.contains(event.target)) {
        customContextMenu.style.display = 'none';
      }
    });
  });