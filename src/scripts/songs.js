function getSongs(){
    var songs = window.fetchedData.getSongs();
    for (var x = 0; x < songs.length; x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard image="http://localhost:3000/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
}
function getSongsByAlbum(id){
    var songs = window.fetchedData.getSongsByAlbum(id);
    for (var x = 0; x < songs.length; x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard image="http://localhost:3000/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
}
function getSongsByArtist(id){
    var songs = window.fetchedData.getSongsByArtist(id);
    for (var x = 0; x < songs.length; x++) {
        // console.log(songs[x]["displayName"]);
        document.getElementById("content").innerHTML += '<m3-mediacard image="http://localhost:3000/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
    }
}