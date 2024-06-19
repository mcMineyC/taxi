const songSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {type: 'string', maxLength: 256},
    albumId: 'string',
    artistId: 'string',
    displayName: 'string',
    // albumDisplayName: 'string',
    // artistDisplayName: 'string',
    duration: 'double',
    file: 'string',
  }
}

const albumSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {type: 'string', maxLength: 256},
    artistId: 'string',
    displayName: 'string',
    // artistDisplayName: 'string',
    // songCount: 'int',
  }
}

const artistSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {type: 'string', maxLength: 256},
    displayName: 'string',
    // albumCount: 'int',
    // songCount: 'int',
  }
}

const playlistSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {type: 'string', maxLength: 256},
    owner: 'string',
    displayName: 'string',
    public: 'boolean',
    songs: {
      type: 'array',
      items: 'string',
    },
    // songCount: 'int',
  }
}

const authSchema = {
  version: 0,
  primaryKey: 'loginName',
  type: 'object',
  properties: {
    loginName: {type: 'string', maxLength: 16},
    displayName: 'string',
    password: 'string',
    authtoken: 'string',
  }
}

const playedSchema = {
  version: 0,
  primaryKey: 'owner',
  type: 'object',
  properties: {
    owner: {type: 'string', maxLength: 16},
    songs: {type: 'array', items: 'string'},
  }
}

const favoriteSchema = {
  version: 0,
  primaryKey: 'owner',
  type: 'object',
  properties: {
    owner: {type: 'string', maxLength: 16},
    songs: {type: 'array', items: {type: 'string'}},
    // count: 'int',
  }
}

export default {
  songSchema: songSchema,
  albumSchema: albumSchema,
  artistSchema: artistSchema,
  playlistSchema: playlistSchema,
  authSchema: authSchema,
  playedSchema: playedSchema,
  favoriteSchema: favoriteSchema,
  register: (db) => {
    if(!db){
      return Promise.reject('db is not defined');
    }
    return db.addCollections({
      songs: {
        migrationStrategies:{
          1: (doc) => {
            doc.albumDisplayName = doc.albumId;
            doc.artistDisplayName = doc.artistId;
            return doc;
          }
        },
        schema: songSchema
      },
      albums: {
        migrationStrategies:{
          1: (doc) => {
            doc.artistDisplayName = doc.artistId;
            doc.songCount = 0;
            return doc;
          }
        },
        schema: albumSchema
      },
      artists: {
        migrationStrategies:{
          1: (doc) => {
            doc.albumCount = 0;
            doc.songCount = 0;
            return doc;
          }
        },
        schema: artistSchema,
      },
      playlists: {
        migrationStrategies:{
          1: (doc) => {
            // doc.songCount = 0;
            doc.songCount = doc.songs.length;
            return doc;
          }
        },
        schema: playlistSchema,
      },
      auth: {
        schema: authSchema,
      },
      played: {
        schema: playedSchema,
      },
      favorites: {
        migrationStrategies: {
          1: (doc) => {
            // doc.count = 0;
            doc.count = doc.songs.length;
            return doc;
          },
        },
        schema: favoriteSchema
      }
    });
  }
}
