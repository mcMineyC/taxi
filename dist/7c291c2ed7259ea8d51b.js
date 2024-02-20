function loginClick(){
    var username = document.getElementById("login-username").value;
    var password = document.getElementById("login-password").value;
    console.log("Logging in with username and password")
    window.authSettings.setOnFail(() => {
        alert("Failed to login. Check your credentials and try again")
    })
    window.authSettings.login(username, password);
}
window.prefs = new UserPreferences();
window.authSettings = new AuthSettings(window.prefs.getBackendUrl(), window.prefs.getFrontendUrl()+"/login.html")
window.authSettings.setOnLogin(() => {
    window.location = window.prefs.getFrontendUrl()+"/"
})
window.authSettings.setOnFail(() => {
    document.getElementById("login-root-2").style.display = "none"
    document.getElementById("login-root").style.display = "flex"
})
document.getElementById("login-root-2").style.display = "flex"
window.authSettings.loginToken()