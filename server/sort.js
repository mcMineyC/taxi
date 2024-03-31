const fs = require('fs-extra');
const path = require('path');
const mm = require('music-metadata');
const crypto = require('crypto');
const util = require('util');

const directoryPath = 'unsorted';

// Helper to normalize and encode strings similar to the Python's `strip` function
function strip(str) {
  return encodeURIComponent(str.normalize('NFKD')
    .toLowerCase()
    .replace(/\s/g, '_')
    .replace(/[()\/"'+=*[\]{}<>|,:;!?`*&\^%$#@!]/g, '-')
  );
}

// Helper function to create a SHA256 digest
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

const getNewStuff = async () => {
    const tagInfo = {};
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
        if (file.endsWith('.mp3')) {
            try {
                const filePath = path.join(directoryPath, file);
                const metadata = await mm.parseFile(filePath);
                const { common } = metadata;

                if (common.artist && common.album && common.title) {
                    const artist = common.artist.split('/')[0];
                    const album = common.album;
                    const title = common.title;

                    const artId = sha256(artist);
                    const albId = sha256(album);
                    const sId = sha256(title);

                    const sortedDirectory = path.join('music', 'sorted', artId, albId);

                    if (!tagInfo[artId]) {
                        tagInfo[artId] = {
                          id: artId,
                          displayName: artist,
                          albums: {}
                        };
                    }

                    const albumKey = `${artId}_${albId}`;
                    if (!tagInfo[artId].albums[albumKey]) {
                        tagInfo[artId].albums[albumKey] = {
                          displayName: album,
                          songs: []
                        };
                    }

                    tagInfo[artId].albums[albumKey].songs.push({
                        id: `${artId}_${albId}_${sId}`,
                        title: title,
                        file: path.join(sortedDirectory, file)
                    });
                }
            } catch (error) {
                console.error(`Skipping ${file} due to error: ${error.message}`);
            }
        }
    }
    return tagInfo;
}

const sortFiles = async () => {
  const tagInfo = await getNewStuff();

  // Create the JSON output
  const count = Object.values(tagInfo).length;
  const allJsonPath = path.join('config', 'all.json');

  if (await fs.pathExists(allJsonPath)) {
    if (count < 1) {
      console.log('Nothing new, skipping');
      return;
    }

    console.log('all.json exists');
    const data = await fs.readJson(allJsonPath);
    const merged = [...data.entries, ...Object.values(tagInfo)];

    await fs.writeJson(allJsonPath, { entries: merged }, { spaces: 4 });
  } else {
    if (count < 1) {
      console.log('Nothing new, skipping');
      return;
    }

    console.log('all.json does not exist');
    await fs.writeJson(allJsonPath, { entries: Object.values(tagInfo) }, { spaces: 4 });
  }

  console.log('Saved info to all.json');
}

exports.sortFiles = sortFiles;
exports.getNewStuff = getNewStuff