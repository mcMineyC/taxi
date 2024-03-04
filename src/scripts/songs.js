function getSongs(){
    var songs = window.fetchedData.getSongs();
    for (var x = 0; x < 50; x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+songs[x]["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
}
function getSongsByAlbum(id){
    var songs = window.fetchedData.getSongsByAlbum(id);
    for (var x = 0; x < songs.length; x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+songs[x]["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
}
function getSongsByArtist(id){
    var songs = window.fetchedData.getSongsByArtist(id);
    for (var x = 0; x < songs.length; x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+songs[x]["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
}
function getSongsByPlaylist(id){
    var songs = window.prefs.getPlaylist(id)["songs"];
    for (var x = 0; x < songs.length; x++) {
        var song = window.fetchedData.getSong(songs[x])
        document.getElementById("content").innerHTML += '<m3-mediacard thingtype="song" thingid="'+song["id"]+'" image="'+window.prefs.getBackendUrl()+'/info/songs/' + song["id"] + '/image" text="' + song["displayName"] + '" onclick="handleSongClick(\'' + song["id"] + '\')"></m3-mediacard>';
    }
}