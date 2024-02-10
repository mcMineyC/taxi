const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path')

const app = express();
const port = 3000;
app.use(cors());

app.use('/music', express.static(path.join(__dirname, 'music')));

app.use('/',express.static(path.join(__dirname, 'static')));

app.get('/info/songs', function (req, res) {
    res.sendFile(path.join(__dirname, 'songs.json'));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})