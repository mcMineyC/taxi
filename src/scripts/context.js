// Add an event listener for the contextmenu event on the document
document.addEventListener('contextmenu', function(event) {
    contextMenu(event)
}); 

async function contextMenu(event){
    // Prevent the default context menu from appearing
    event.preventDefault();
    event.stopPropagation();
    
    // Create and display a custom context menu at the mouse position
    const customContextMenu = document.getElementById('custom-context-menu');
    var thingtype = event.target.getAttribute("thingtype")
    var thingid = event.target.getAttribute("thingid")
    var thingindex = event.target.getAttribute("thingindex")
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
            inhtml +=  `<li value="addplaylist" id="addplaylist-popout"><md-icon>playlist_add</md-icon>Add to playlist<md-icon slot="ended">chevron_right</md-icon></li>
                        <ul id="addplaylist-popout-menu" class="popout-menu context-menu-color">
                        </ul>`
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
            inhtml +=  `<li value="addplaylist" id="addplaylist-popout" style="display: none"><md-icon>playlist_add</md-icon>Add to playlist<md-icon slot="ended">chevron_right</md-icon></li>
                        <ul id="addplaylist-popout-menu" class="popout-menu context-menu-color">
                        </ul>`
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
            if(typeof(window.navigationInfo) != "undefined" && window.navigationInfo.getHist()[window.navigationInfo.getHist().length-1].substring(0, 8) == "playlist"){
                inhtml += `<li value="delete"><md-icon>delete</md-icon>Delete</li>`
            }
            inhtml +=  `<li value="addplaylist" id="addplaylist-popout"><md-icon>playlist_add</md-icon>Add to playlist<md-icon slot="ended">chevron_right</md-icon></li>
                        <ul id="addplaylist-popout-menu" class="popout-menu context-menu-color">
                        </ul>`
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
      option.addEventListener('click', async function() {
        // Perform action based on the selected option
        var a = option.getAttribute('value')
        console.log('Selected option:', a);
        if(a == "addplaylist"){
            return // For mobile so you can click on it cuz no mouse duh
        }
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
                        window.localPlayer.playList(window.prefs.getPlaylist(thingid).songs)
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
                        window.localPlayer.addListToQueue(window.prefs.getPlaylist(thingid).songs)
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
            case "share":
                console.log("share")
                showSnackbar("Not implemented yet")
                break;
            case "delete":
                if(thingtype == "playlist"){
                    window.prefs.removePlaylist(thingid)
                }else if(thingtype == "song"){
                    window.prefs.removeFromPlaylistIndex(window.navigationInfo.get()["id"], thingindex)
                }
                break;
        }
        console.log("Resetting")
        if(a == "delete" && window.navigationInfo.get()["location"] == "songsID" && window.navigationInfo.getHist()[window.navigationInfo.getHist().length-1].substring(0, 8) == "playlist"){
            console.log("Updating playlist")
            await window.prefs.getPlaylists()
            reset()
            getSongsByPlaylist(window.navigationInfo.get()["id"])
        }else if(a == "delete" && window.navigationInfo.get()["location"].substring(0, 8) == "playlist"){
            console.log("Showing all playlists")
            await window.prefs.getPlaylists()
            getPlaylists()
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
    // Close if moused off of menu
    customContextMenu.addEventListener('mouseover', function() {
        document.addEventListener('mouseover', function(event) {
            if (!customContextMenu.contains(event.target)) {
              customContextMenu.style.display = 'none';
            }
        });
    })
    
    // Add event listeners for the custom context menu popouts, currently only addplaylistconsole.log("Playlist moused")
    var inHtml = `<li value="createPlaylist"><md-icon>playlist_add</md-icon>Create playlist</li>`;
    var cnt = await (async ()=>{
        try{
            var p = await window.prefs.getUserPlaylists();
            if(p.length == 0){
                inHtml = `<li value="createPlaylist"><md-icon>playlist_add</md-icon>Create playlist</li>`
                customContextMenu.querySelector("#addplaylist-popout-menu").innerHTML = inHtmlpm.querySelectorAll("li").forEach(element => {
                    element.addEventListener("click", function(e){
                        console.log("Playlist click")
                        var el = e.target
                        if(el.getAttribute("value") == "addplaylist" && el.getAttribute("vvalue") != undefined){
                            switch(thingtype){
                                case "album":
                                    console.log("album")
                                    window.prefs.addListToPlaylist(el.getAttribute("vvalue"), window.fetchedData.getSongsByAlbum(thingid).map(entry => entry.id))
                                    break;
                                case "artist":
                                    console.log("artist")
                                    window.prefs.addListToPlaylist(el.getAttribute("vvalue"), window.fetchedData.getSongsByArtist(thingid).map(entry => entry.id))
                                    break;
                                case "playlist":
                                    console.log("playlist")
                                    break;
                                case "song":
                                    console.log("song")
                                    window.prefs.addToPlaylist(el.getAttribute("vvalue"), thingid)
                                    break;
                            }
                            customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "none"
                        }else if (el.getAttribute("value") == "createPlaylist"){
                            console.log("create playlist")
                            createPlaylistDialog(thingtype, thingid)
                        }
                    })
                })
                return 1
            }
            var cntr = 0
            for (var x = 0; x < (p.length < 25 ? p.length : 25); x++) {
                cntr++
                inHtml += `<li value="addplaylist" vvalue="${p[x]["id"]}"><span class="oneline">${p[x]["displayName"]}</span></li>`
            }
            inHtml += `<li value="more"><md-icon>more_horiz</md-icon>More</li>`
            pm.querySelectorAll("li").forEach(element => {
                element.addEventListener("click", function(e){
                    console.log("Playlist click")
                    var el = e.target
                    if(el.getAttribute("value") == "addplaylist" && el.getAttribute("vvalue") != undefined){
                        switch(thingtype){
                            case "album":
                                console.log("album")
                                window.prefs.addListToPlaylist(el.getAttribute("vvalue"), window.fetchedData.getSongsByAlbum(thingid).map(entry => entry.id))
                                break;
                            case "artist":
                                console.log("artist")
                                window.prefs.addListToPlaylist(el.getAttribute("vvalue"), window.fetchedData.getSongsByArtist(thingid).map(entry => entry.id))
                                break;
                            case "playlist":
                                console.log("playlist")
                                break;
                            case "song":
                                console.log("song")
                                window.prefs.addToPlaylist(el.getAttribute("vvalue"), thingid)
                                break;
                        }
                        customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "none"
                    }else if (el.getAttribute("value") == "createPlaylist"){
                        console.log("create playlist")
                        createPlaylistDialog(thingtype, thingid)
                    }
                })
            })
            return 1+cntr
        }catch(e){
            console.log(e)
            inHtml = "No playlists"
        }
    })();
    customContextMenu.querySelector("#addplaylist-popout-menu").innerHTML = inHtml
    var popMenuHeight = (cnt*36);
    console.log({"my": popMenuHeight})
    var leftPos = ''
    // var rightPos = '-172px'
    var topPos  = ''

    console.log({"cx": event.clientX, "wx": window.innerWidth - contextMenuWidth - 158 - 14, "cy": event.clientY, "wy": window.innerHeight - contextMenuHeight})
    if (event.clientX < window.innerWidth - contextMenuWidth - 158 - 14) {
      leftPos = `${158+(14*3)}px`;
    } else {
      leftPos = `${-1*(158+14)}px`;
    }

    if (event.clientY < window.innerHeight - popMenuHeight - 44 - 12) {
        topPos = `${-44}px`;
      } else {
        topPos = `${(-1*popMenuHeight)-44}px`;
      }
    var pm = customContextMenu.querySelector("#addplaylist-popout-menu")
    pm.style.left = leftPos
    pm.style.marginTop = topPos
    // pm.style.right = rightPos
    
    
    customContextMenu.querySelector("#addplaylist-popout").addEventListener("mouseover", function(){
        customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "flex";
        customContextMenu.querySelector("#addplaylist-popout-menu").addEventListener("mouseout", function(){
            setTimeout(() => {
                let es = customContextMenu.querySelector("#addplaylist-popout-menu > li")
                let fh = false
                for (var x = 0; x < es.length; x++) {
                    if(es[x].matches(":hover")){
                        fh = true
                    }
                }
                if(!customContextMenu.querySelector("#addplaylist-popout").matches(":hover") && !fh && !customContextMenu.querySelector("#addplaylist-popout-menu").matches(":hover")){
                    customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "none"
                }
            }, 100);
        })
    })
    // Close menu on mouseoff
    customContextMenu.querySelector("#addplaylist-popout").addEventListener("mouseout", function(){
        setTimeout(() => {
            if(!customContextMenu.querySelector("#addplaylist-popout-menu").matches(":hover")){
                customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "none"
            }
        }, 200);
       
    })
    // Mobile open (click)
    customContextMenu.querySelector("#addplaylist-popout").addEventListener("click", function(){
        customContextMenu.querySelector("#addplaylist-popout-menu").style.display = "flex"
    })
}