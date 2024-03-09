// Add an event listener for the contextmenu event on the document
document.addEventListener('contextmenu', function(event) {
    contextMenu(event)
});

function contextMenu(event){
    // Prevent the default context menu from appearing
    event.preventDefault();
    console.log(event.target)
  
    // Create and display a custom context menu at the mouse position
    const customContextMenu = document.getElementById('custom-context-menu');
    var thingtype = event.target.getAttribute("thingtype")
    var thingid = event.target.getAttribute("thingid")
    var inhtml = `<ul class="context-menu">`
    var contextMenuWidth = 202;
    var contextMenuHeight = 122;
    switch(event.target.getAttribute("thingtype")){
        case "album":
            console.log("album")
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlayer) != "undefined" && window.localPlayer.getPlaying() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
                contextMenuHeight = 158;
            }
            inhtml += `<li value="addplaylist"><md-icon>playlist_add</md-icon>Add to playlist</li>`
            inhtml += `<li value="share"><md-icon>share</md-icon>Share</li>`
            break;
        case "artist":
            console.log("artist")
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlayer) != "undefined" && window.localPlayer.getPlaying() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
                contextMenuHeight = 158;
            }
            inhtml +=  `<li value="addplaylist" id="addplaylist-popout"><md-icon>playlist_add</md-icon>Add to playlist<md-icon slot="ended">chevron_right</md-icon></li>
                        <ul id="addplaylist-popout-menu" class="popout-menu context-menu-color">
                        </ul>`
            inhtml +=  `<li value="share"><md-icon>share</md-icon>Share</li>`
            break;
        case "playlist":
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlayer) != "undefined" && window.localPlayer.getPlaying() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
                contextMenuHeight = 158;
            }
            inhtml += `<li value="delete"><md-icon>delete</md-icon>Delete</li>`
            inhtml += `<li value="share"><md-icon>share</md-icon>Share</li>`
            console.log("thingid: "+thingid)
            break;
        case "song":
            console.log("song")
            inhtml += `<li value="play"><md-icon>play_circle</md-icon>Play</li>`
            if(typeof(window.localPlayer) != "undefined" && window.localPlayer.getPlaying() == true){
                inhtml += `<li value="queue"><md-icon>add_to_queue</md-icon>Add to queue</li>`
                contextMenuHeight = 158;
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
    var leftPos = ''
    var topPos  = ''

    if (event.clientX < window.innerWidth - contextMenuWidth) {
      leftPos = `${event.clientX}px`;
    } else {
      leftPos = `${event.clientX - contextMenuWidth}px`;
    }

    if (event.clientY < window.innerHeight - contextMenuHeight) {
        topPos = `${event.clientY}px`;
      } else {
        topPos = `${event.clientY - contextMenuHeight}px`;
      }
    // if (event.pageX < window.innerWidth - contextMenuWidth - contextSubMenuWidth) {
    //   menu.classList.remove("sub-left");
    // } else {
    //   menu.classList.add("sub-left");
    // }
    inhtml += `</ul>`
    customContextMenu.innerHTML = inhtml
    customContextMenu.style.left = leftPos
    customContextMenu.style.top = topPos
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
                        window.localPlayer.playList(window.fetchedData.getSongsByAlbum(thingid).map(entry => entry.id))
                        break;
                    case "artist":
                        console.log("artist")
                        window.localPlayer.playList(window.fetchedData.getSongsByArtist(thingid).map(entry => entry.id))
                        break;
                    case "playlist":
                        console.log("playlist")
                        showSnackbar("Not implemented")
                        break;
                    case "song":
                        console.log("song")
                        window.localPlayer.playList([thingid])
                        break;
                }
                break;
            case "queue":
                switch(thingtype){
                    case "album":
                        console.log("album")
                        window.localPlayer.addListToQueue(window.fetchedData.getSongsByAlbum(thingid).map(entry => entry.id))
                        break;
                    case "artist":
                        console.log("artist")
                        window.localPlayer.addListToQueue(window.fetchedData.getSongsByArtist(thingid).map(entry => entry.id))
                        break;
                    case "playlist":
                        console.log("playlist")
                        showSnackbar("Not implemented")
                        break;
                    case "song":
                        console.log("song")
                        window.localPlayer.addToQueue(thingid)
                        break;
                    default:
                        console.log("default")
                        break;
                }
                break;
            case "addplaylist":
                console.log(thingid)
                window.prefs.addToPlaylist("someotherthing", thingid)
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


    // Add event listeners for the custom context menu popouts, currently only playlists
    customContextMenu.querySelector("#addplaylist-popout").addEventListener("mouseover", function(){
        customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "flex"
    })
    customContextMenu.querySelector("#addplaylist-popout").addEventListener("mouseout", function(){
        setTimeout(() => {
            if(!customContextMenu.querySelector("#addplaylist-popout-menu").matches(":hover")){
                customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "none"
            }
        }, 100);
       
    })
}