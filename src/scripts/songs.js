function getSongs(){
    var songs = window.fetchedData.getSongs();
    for (var x = 0; x < (songs.length > 50 ? 50 : songs.length); x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+songs[x]["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
    if(songs.length > 50){
        document.getElementById("content").innerHTML += '<h1 class="loading-text-placeholder">And more...</h1>';
    }
}
function getSongsByAlbum(id){
    var songs = window.fetchedData.getSongsByAlbum(id);
    for (var x = 0; x < (songs.length > 50 ? 50 : songs.length); x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+songs[x]["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
    if(songs.length > 50){
        document.getElementById("content").innerHTML += '<h1 class="loading-text-placeholder">And more...</h1>';
    }
}
function getSongsByArtist(id){
    var songs = window.fetchedData.getSongsByArtist(id);
    for (var x = 0; x < (songs.length > 50 ? 50 : songs.length); x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+songs[x]["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
    if(songs.length > 50){
        document.getElementById("content").innerHTML += '<h1 class="loading-text-placeholder">And more...</h1>';
    }
}
async function getSongsByPlaylist(id){
    var songs = window.prefs.getPlaylist(id)["songs"];
    if(songs != null && typeof(songs) != "undefined" && songs.length == 0){
        document.getElementById("content").innerHTML = `
                                                        <h1 class="loading-text-placeholder">Nothing here! :-)<br>How 'bout adding some?</h1>
        `;
        return
    }
    for (var x = 0; x < (songs.length > 50 ? 50 : songs.length); x++) {
        var song = window.fetchedData.getSong(songs[x])
        if(song == null || song == undefined){
            continue
        }
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+song["id"]+'" thingindex="'+x+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + song["id"] + '/image" text="' + song["displayName"] + '" onclick="handleSongClick(\'' + song["id"] + '\')"></m3-mediacard>';
    }
    if(songs.length > 50){
        document.getElementById("content").innerHTML += '<h1 class="loading-text-placeholder">And more...</h1>';
    }
}