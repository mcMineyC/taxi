const clientID = "0a65ebdec6ec4983870a7d2f51af2aa1";
const secretKey = "22714014e04f46cebad7e03764beeac8";

const { SpotifyApi } = require("@spotify/web-api-ts-sdk");

(async () => {
    console.log("Searching Spotify for The Beatles...");
    
    const api = SpotifyApi.withClientCredentials(
        clientID,
        secretKey
    );
    
    const items = await api.search("C418", ["artist"]);
    
    console.table(items.artists.items.map((item) => ({
        name: item.name,
        followers: item.followers.total,
        popularity: item.popularity,
        id: item.id
    })));
})();