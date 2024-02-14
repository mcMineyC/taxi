axios.get('http://localhost:3000/info/albums')
    .then(function (response) {
        var data = JSON.parse(JSON.stringify(response.data));
        console.log(data);
        var artists = data["albums"];
        for (var x = 0; x < artists.length; x++) {
            console.log(artists[x]["displayName"]);
            document.getElementById("content").innerHTML += '<m3-mediacard image="http://localhost:3000/info/albums/' + artists[x]["id"] + '/image" text="' + artists[x]["displayName"] + '" onclick="showSnackbar(\'' + artists[x]["id"] + '\')"></m3-mediacard>';
        }                
    })
    .catch(function (error){
        console.log(error);
    })