function getArtists(){
    artists = window.fetchedData.getArtists();
    for (var x = 0; x < artists.length; x++) {
        document.getElementById("content").innerHTML += '<m3-mediacard image="http://localhost:3000/info/artists/' + artists[x]["id"] + '/image" text="' + artists[x]["displayName"] + '" onclick="artistClick(\'' + artists[x]["id"] + '\')"></m3-mediacard>';
    }
}