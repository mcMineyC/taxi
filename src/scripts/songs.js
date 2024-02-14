axios.get('http://localhost:3000/info/songs')
    .then(function (response) {
        var data = JSON.parse(JSON.stringify(response.data));
        console.log(data);
        var songs = data["songs"];
        for (var x = 0; x < songs.length; x++) {
            console.log(songs[x]["displayName"]);
            document.getElementById("content").innerHTML += '<m3-mediacard image="http://localhost:3000/info/songs/' + songs[x]["id"] + '/image" text="' + songs[x]["displayName"] + '" onclick="handleSongClick(\'' + songs[x]["id"] + '\')"></m3-mediacard>';
        }                
    })
    .catch(function (error){
        console.log(error);
    })