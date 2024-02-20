function loginClick(){
    var username = document.getElementById("login-username").value;
    var password = document.getElementById("login-password").value;
    window.authSettings.setOnLogin(() => {
        window.location = window.frontendUrl+"/"
    })
    window.authSettings.login(username, password);
}

window.authSettings = new AuthSettings("http://localhost:3000")
window.authSettings.setOnLogin(() => {
    window.location = window.frontendUrl+"/"
})
window.prefs = new UserPreferences();