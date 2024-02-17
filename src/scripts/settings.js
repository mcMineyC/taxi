document.getElementById("header-title").innerHTML = "Settings";
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
            localStorage.setItem("configuredHomeScreen", "artists")
            break;
        case 1:
            localStorage.setItem("configuredHomeScreen", "albums")
            break;
        case 2:
            localStorage.setItem("configuredHomeScreen", "songs")
            break;
    }
});