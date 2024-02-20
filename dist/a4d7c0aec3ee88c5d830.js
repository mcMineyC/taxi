class AuthSettings{
    constructor(url, authPageUrl){
        this.authUrl = url
        this.authPageUrl = authPageUrl
        this.onLogin = () => {}
        this.onFail = () => {}
        this.onRefreshToken = () => {}
        console.log("Checking for auth token in cookies")
        if(window.getCookie("authToken") != ""){
            this.authToken = window.getCookie("authToken")
        }else{
            this.authToken = ""
        }
        if(this.authToken == "" && window.location.href != this.authPageUrl) {
            window.location = this.authPageUrl
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
    
    refreshAuthToken(){
        axios.post(this.authUrl+"/authtoken", {
            authtoken: this.authToken
        })
        .then((response) => {
            console.log(response.data);
            if(response.data["authorized"] == true){
                this.setAuthToken(response.data["authtoken"])
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

    setOnRefreshToken(callback){
        this.onRefreshToken = callback
    }

    login(username, password){
        var usp = new URLSearchParams()
        if(typeof(username) != "undefined" && typeof(password) != "undefined") {
            usp.append('username', username);
            usp.append('password', password);
            console.log("Logging in with username and password")
            axios.post(this.authUrl+"/auth",usp)
            .then((response) => {
                console.log(response.data);
                if(response.data["authorized"] == true){
                    this.setAuthToken(response.data["authtoken"])
                    this.onLogin()
                    return true
                }else{
                    this.onFail()
                }
                return false
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    loginToken(){
        var usp = new URLSearchParams()
        usp.append('authtoken', this.authToken);
        console.log("Logging in with token")
        axios.post(this.authUrl+"/authtoken",usp)
        .then((response) => {
            console.log(response.data);
            if(response.data["authorized"] == true){
                this.setAuthToken(response.data["authtoken"])
                this.onLogin()
                return true
            }else{
                this.onFail()
            }
            return false
        })
        .catch((error) => {
            console.error(error);
        });
    }

}
class UserPreferences{
    constructor(){
        if(window.localStorage.getItem("configuredDarkMode") == null){
            window.localStorage.setItem("configuredDarkMode", false)
        }
        if(window.localStorage.getItem("configuredAddToQueue") == null){
            window.localStorage.setItem("configuredAddToQueue", false)
        }
        if(window.localStorage.getItem("configuredHomeScreen") == null){
            window.localStorage.setItem("configuredHomeScreen", "artists")
        }
        if(window.localStorage.getItem("configuredThemeColor") == null){
            window.localStorage.setItem("configuredThemeColor", "")
        }
        if(window.localStorage.getItem("configuredBackendUrl") == null){
            window.localStorage.setItem("configuredBackendUrl", "https://eatthecow.mooo.com:3030")
        }
        if(window.localStorage.getItem("configuredFrontendUrl") == null){
            window.localStorage.setItem("configuredFrontendUrl", window.location.origin)
        }
        this.darkMode = window.localStorage.getItem("configuredDarkMode") == "true"
        this.addToQueue = window.localStorage.getItem("configuredAddToQueue") == "true"
        this.homeScreen = window.localStorage.getItem("configuredHomeScreen")
        this.themeColor = window.localStorage.getItem("configuredThemeColor")
        this.backendUrl = window.localStorage.getItem("configuredBackendUrl")
        this.frontendUrl = window.localStorage.getItem("configuredFrontendUrl")
    }

    setDarkMode(darkMode){
        this.darkMode = darkMode
        window.localStorage.setItem("configuredDarkMode", darkMode)
    }

    setAddToQueue(addToQueue){
        window.localStorage.setItem("configuredAddToQueue", addToQueue)
        this.addToQueue = addToQueue
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

    getDarkMode(){
        return this.darkMode
    }

    getAddToQueue(){
        return this.addToQueue
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

    toggleDarkMode(){
        this.setDarkMode(!this.getDarkMode())
    }

    toggleAddToQueue(){
        this.setAddToQueue(!this.getAddToQueue())
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
    document.getElementById("settings-toggle-add-to-queue").addEventListener("change", function(){
        window.prefs.toggleAddToQueue()
    })
    document.getElementById("settings-theme-hex-code-save").addEventListener("click", function(){
        window.prefs.setThemeColor(document.getElementById("settings-theme-hex-code").value)
    })

}