class AuthSettings{
    constructor(url, authPageUrl){
        this.username = "BANANAS ARE GR8!!!"
        this.authUrl = url
        this.authPageUrl = authPageUrl
        this.onLogin = () => {}
        this.onFail = () => {}
        this.onDown = () => {}
        this.onRefreshToken = () => {}
        console.log("Checking for auth token in cookies")
        if(window.getCookie("authToken") != ""){
            this.authToken = window.getCookie("authToken")
            console.log("Found auth token in cookies: "+this.authToken)
        }else{
            this.authToken = ""
            console.log("No auth token in cookies")
        }
        if(this.authToken == "" && window.location.href != this.authPageUrl) {
            window.location = this.authPageUrl
        }
        if(window.localStorage.getItem("savedUsername") != null){
            this.username = window.localStorage.getItem("savedUsername")
        }
        console.log("Initialized auth settings with url "+this.authUrl)
    }

    setAuthToken(token){
        this.authToken = token
        window.setCookie("authToken", token, 999999999999999999999999999999999)
    }

    getAuthToken(){
        return this.authToken
    }

    getAuthPageUrl(){
        return this.authPageUrl
    }
    
    refreshAuthToken(){
        axios.post(this.authUrl+"/authtoken", {
            authtoken: this.authToken
        })
        .then((response) => {
            console.log(response.data);
            if(response.data["authorized"] == true){
                this.setAuthToken(response.data["authtoken"])
                this.setUsername(response.data["username"])
                this.onRefreshToken()
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }

    setOnLogin(callback){
        this.onLogin = callback
    }

    setOnFail(callback){
        this.onFail = callback
    }

    setOnDown(callback){
        this.onDown = callback
    }

    setOnRefreshToken(callback){
        this.onRefreshToken = callback
    }

    login(username, password){
        if(typeof(username) != "undefined" && typeof(password) != "undefined") {
            var usp = {
                "username": username,
                "password": password
            }
            console.log("Logging in with username and password")
            axios.post(this.authUrl+"/auth",usp)
            .then((response) => {
                console.log(response.data);
                if(response.data["authorized"] == true){
                    this.setAuthToken(response.data["authtoken"])
                    this.setUsername(response.data["username"])
                    this.onLogin()
                    return true
                }else{
                    this.onFail()
                }
                return false
            })
            .catch((error) => {
                if (error.code == "ERR_NETWORK"){
                    this.onDown()
                }else{
                    console.error(error);
                }
            });
        }
    }

    loginToken(){
        var usp = {
            "authtoken": this.authToken
        }
        console.log("Logging in with token")
        axios.post(this.authUrl+"/authtoken",usp)
        .then((response) => {
            console.log(response.data);
            if(response.data["authorized"] == true){
                this.setAuthToken(response.data["authtoken"])
                this.setUsername(response.data["username"])
                this.onLogin()
                return true
            }else{
                this.onFail()
            }
            return false
        })
        .catch((error) => {
            if (error.code == "ERR_NETWORK"){
                this.onDown()
            }else{
                console.error(error);
            }
        });
    }

    getUsername(){
        if(this.username == "BANANAS ARE GR8!!!"){
            let usp = {
                "authtoken": this.authToken
            }
            console.log("Posting /username")
            var tt = this
            axios.post(this.authUrl+"/username", usp).then((response) => {
                if(response.data["authorized"] == true){
                    tt.setUsername(response.data["username"])
                }
            }).catch((error) => {
                if (error.code == "ERR_NETWORK"){
                    this.onDown()
                }else{
                    console.error(error);
                }
            });
        }
        return this.username
    }

    setUsername(username){
        this.username = username
        localStorage.setItem("savedUsername", username)
    }

    logout(){
        this.username = "BANANAS ARE GR8!!!"
        window.setCookie("authToken", "", 999999999999999999999999999999999)
        window.location = this.authPageUrl
    }
}

class UserPreferences{
    constructor(){
        if(window.localStorage.getItem("configuredDarkMode") == null){
            window.localStorage.setItem("configuredDarkMode", false)
        }
        if(window.localStorage.getItem("configuredSaveQueueOnExit") == null){
            window.localStorage.setItem("configuredSaveQueueOnExit", false)
        }
        if(window.localStorage.getItem("configuredSaveQueueOnChange") == null){
            window.localStorage.setItem("configuredSaveQueueOnChange", false)
        }
        if(window.localStorage.getItem("configuredHomeScreen") == null){
            window.localStorage.setItem("configuredHomeScreen", "artists")
        }
        if(window.localStorage.getItem("configuredThemeColor") == null){
            window.localStorage.setItem("configuredThemeColor", "#17496C")
        }
        if(window.localStorage.getItem("configuredBackendUrl") == null){
            window.localStorage.setItem("configuredBackendUrl", "https://eatthecow.mooo.com:3030")
        }
        if(window.localStorage.getItem("configuredFrontendUrl") == null){
            window.localStorage.setItem("configuredFrontendUrl", window.location.origin)
        }
        if(window.localStorage.getItem("savedPlaylists") == null){
            window.localStorage.setItem("savedPlaylists", JSON.stringify({
                "playlists": []
            }))
        }
        this.addToQueue = false
        this.darkMode = window.localStorage.getItem("configuredDarkMode") == "true"
        this.saveQueueOnExit = window.localStorage.getItem("configuredSaveQueueOnExit") == "true"
        this.saveQueueOnChange = window.localStorage.getItem("configuredSaveQueueOnChange") == "true"
        this.homeScreen = window.localStorage.getItem("configuredHomeScreen")
        this.themeColor = window.localStorage.getItem("configuredThemeColor")
        this.backendUrl = window.localStorage.getItem("configuredBackendUrl")
        this.frontendUrl = window.localStorage.getItem("configuredFrontendUrl")
        this.savedPlaylists = JSON.parse(window.localStorage.getItem("savedPlaylists"))
        this.allPlaylists = []
    }

    setAddToQueue(addToQueue){
        return
    }


    setDarkMode(darkMode){
        this.darkMode = darkMode
        window.localStorage.setItem("configuredDarkMode", darkMode)
        window.apc()
    }

    setSaveQueueOnExit(addToQueue){
        this.saveQueueOnExit = addToQueue
        window.localStorage.setItem("configuredSaveQueueOnExit", addToQueue)
    }

    setSaveQueueOnChange(saveQueueOnChange){
        this.saveQueueOnChange = saveQueueOnChange
        window.localStorage.setItem("configuredSaveQueueOnChange", saveQueueOnChange)
    }

    setHomeScreen(homeScreen){
        this.homeScreen = homeScreen
        window.localStorage.setItem("configuredHomeScreen", homeScreen)
    }

    setThemeColor(themeColor){
        this.themeColor = themeColor
        window.localStorage.setItem("configuredThemeColor", themeColor)
        window.apc()
    }
    
    setBackendUrl(backendUrl){
        this.backendUrl = backendUrl
        window.localStorage.setItem("configuredBackendUrl", backendUrl)
    }
    
    setFrontendUrl(frontendUrl){
        this.frontendUrl = frontendUrl
        window.localStorage.setItem("configuredFrontendUrl", frontendUrl)
    }

    getDarkMode(){
        return this.darkMode
    }

    getAddToQueue(){
        return this.addToQueue
    }

    getSaveQueueOnExit(){
        return this.saveQueueOnExit
    }

    getSaveQueueOnChange(){
        return this.saveQueueOnChange
    }

    getHomeScreen(){
        return this.homeScreen
    }

    getThemeColor(){
        return this.themeColor
    }

    getBackendUrl(){
        return this.backendUrl
    }

    getFrontendUrl(){
        return this.frontendUrl
    }

    async getPlaylists(){
        var ap = []
        var app = {}
        var d = await window.fetchedData.getPlaylists()
        var du = await window.fetchedData.getUserPlaylists()
        console.log({"playlists": d.data})
        if(d.error){
            console.log(d.error)
            return []
        }
        if(du.error){
            console.log(d.error)
            return []
        }
        if(d.data["playlists"] == null){
            return []
        }
        if(du.data == null){
            return []
        }
        for(var x = 0; x < d.data["playlists"].length; x++){
            app[d.data["playlists"][x]["id"]] = d.data["playlists"][x]
        }
        for(var x = 0; x < du.data.length; x++){
            app[du.data[x]["id"]] = du.data[x]
        }
        Object.keys(app).forEach((key,value) => {
            ap.push(app[key])
        })
        this.allPlaylists = ap
        return ap
    }

    getPlaylist(playlist_id){
        for(var i = 0; i < this.allPlaylists.length; i++){
            if(this.allPlaylists[i]["id"] == playlist_id){
                return this.allPlaylists[i]
            }
        }
    }

    /*setPlaylists(savedPlaylists){
        this.savedPlaylists = savedPlaylists
        window.localStorage.setItem("savedPlaylists", JSON.stringify(this.savedPlaylists))
    }*/

    async addPlaylist(playlist){
        await window.fetchedData.modUserPlaylist(playlist)
    }

    removePlaylist(playlist){
        window.fetchedData.removeUserPlaylist(playlist)
    }

    addToPlaylist(playlist_id, song){
        for(var i = 0; i < this.allPlaylists.length; i++){
            if(this.allPlaylists[i]["id"] == playlist_id){
                console.log(this.allPlaylists[i])
                this.allPlaylists[i]["songs"].push(song)
                console.log(this.allPlaylists[i])
                window.fetchedData.modUserPlaylist(this.allPlaylists[i])
                return
            }
        }
    }

    addListToPlaylist(playlist_id, songs){
        for(var i = 0; i < this.allPlaylists.length; i++){
            if(this.allPlaylists[i]["id"] == playlist_id){
                console.log("Found playlist")
                console.log({"playlist": this.allPlaylists[i], "type": typeof(this.allPlaylists[i]["songs"])})
                this.allPlaylists[i]["songs"] = this.allPlaylists[i]["songs"].concat(songs)
                console.log({"playlist": this.allPlaylists[i], "type": typeof(this.allPlaylists[i]["songs"])})
                window.fetchedData.modUserPlaylist(this.allPlaylists[i])
                return
            }
        }
    }

    removeFromPlaylist(playlist_id, song_id){
        for(var i = 0; i < this.allPlaylists.length; i++){
            if(this.allPlaylists[i]["id"] == playlist_id){
                for(var j = 0; j < this.allPlaylists[i]["songs"].length; j++){
                    if(this.allPlaylists[i]["songs"][j] == song_id){
                        this.allPlaylists[i]["songs"].splice(j, 1)
                        window.fetchedData.modUserPlaylist(this.allPlaylists[i])
                        return
                    }
                }
                return
            }
        }
    }

    removeFromPlaylistIndex(playlist_id, index){
        for(var i = 0; i < this.allPlaylists.length; i++){
            if(this.allPlaylists[i]["id"] == playlist_id){
                console.log("using "+this.allPlaylists[i]["songs"].length)
                for(var j = 0; j < this.allPlaylists[i]["songs"].length; j++){
                    console.log(j+" "+index)
                    if(j == index){
                        console.log(j+" "+index)
                        this.allPlaylists[i]["songs"].splice(j, 1)
                        window.fetchedData.modUserPlaylist(this.allPlaylists[i])
                        return
                    }
                }
                return
            }
        }
    }

    savePlaylists(){
        //window.localStorage.setItem("savedPlaylists", JSON.stringify({"playlists": this.savedPlaylists}))
    }

    toggleDarkMode(){
        this.setDarkMode(!this.getDarkMode())
    }

    toggleAddToQueue(){
        return
    }

    toggleSaveQueueOnExit(){
        this.setSaveQueueOnExit(!this.getSaveQueueOnExit())
    }

    toggleSaveQueueOnChange(){
        this.setSaveQueueOnChange(!this.getSaveQueueOnChange())
    }

}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function addSettingsActions(){
    const tabs = document.getElementsByTagName("md-tabs")[0];
    var ch = localStorage.getItem("configuredHomeScreen")
    if(ch == null){
        localStorage.setItem("configuredHomeScreen", "albums")
        ch = "albums"
    }
    // ch = "albums";
    switch (ch) {
        case "artists":
            tabs.getElementsByClassName("settings-homepage-artists")[0].setAttribute("active", "");
            // tabs.getElementsByClassName("settings-homepage-albums")[0].setAttribute("active", "");
            // tabs.getElementsByClassName("settings-homepage-songs")[0].setAttribute("active", "");
            break;
        case "albums":
            tabs.getElementsByClassName("settings-homepage-albums")[0].setAttribute("active", "");
            // tabs.getElementsByClassName("settings-homepage-albums")[0].setAttribute("active", "");
            // tabs.getElementsByClassName("settings-homepage-songs")[0].setAttribute("active", "");
            break;
        case "songs":
            tabs.getElementsByClassName("settings-homepage-songs")[0].setAttribute("active", "");
            // tabs.getElementsByClassName("settings-homepage-albums")[0].setAttribute("active", "");
            // tabs.getElementsByClassName("settings-homepage-songs")[0].setAttribute("active", "");
            break;
        default:
            break;
    }
    tabs.addEventListener('change', (event) => {
        switch(event.target.activeTabIndex){
            case 0:
                window.prefs.setHomeScreen("artists")
                break;
            case 1:
                window.prefs.setHomeScreen("albums")
                break;
            case 2:
                window.prefs.setHomeScreen("songs")
                break;
        }
    });

    document.getElementById("settings-toggle-dark-mode").addEventListener("change", function(){
        window.prefs.toggleDarkMode()
    })
    document.getElementById("settings-toggle-save-queue-exit").addEventListener("change", function(){
        window.prefs.toggleSaveQueueOnExit()
    })
    document.getElementById("settings-toggle-save-queue-change").addEventListener("change", function(){
        window.prefs.toggleSaveQueueOnChange()
    })
    document.getElementById("settings-theme-hex-code-save").addEventListener("click", function(){
        window.prefs.setThemeColor(document.getElementById("settings-theme-hex-code").value)
    })
    document.getElementById("settings-backend-url-save").addEventListener("click", function(){
        window.prefs.setBackendUrl(document.getElementById("settings-backend-url").value)
        if(confirm("Backend URL changed.\nReload?")) window.location.reload()
    })
    document.getElementById("settings-frontend-url-save").addEventListener("click", function(){
        window.prefs.setFrontendUrl(document.getElementById("settings-frontend-url").value)
        if(confirm("Frontend URL changed.\nReload?")) window.location.reload()
    })

    document.getElementById("logout-button").addEventListener("click", function(){
        window.authSettings.logout()
    })
}

const merge = (a, b, predicate = (a, b) => a === b) => {
    const c = [...a]; // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c;
}

/*
Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i]["id"] === a[j]["id"])
                a.splice(j--, 1);
        }
    }

    return a;
};
*/