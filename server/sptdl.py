import json, sys
from spotdl import Spotdl
from spotdl.download.downloader import Downloader
from spotdl.types.options import DownloaderOptions
from spotdl.download.progress_handler import ProgressHandler, SongTracker
import rich.console as rc

def printer(junk, message):
    completed = junk.parent.overall_completed_tasks
    total = junk.parent.song_count
    name = junk.song_name
    print(json.dumps({"message": message, "completed": completed, "total": total, "name": name}))

obj = Spotdl(client_id="0a65ebdec6ec4983870a7d2f51af2aa1", client_secret="22714014e04f46cebad7e03764beeac8", no_cache=True)
print(json.dumps({"message": "Starting download", "completed": 0, "total": 0, "name": ""}))
songs_obj = obj.search(sys.argv[1:])
print(json.dumps({"message": "Starting download", "completed": 0, "total": len(songs_obj), "name": ""}))
obj.downloader.progress_handler.close()
dl = Downloader(DownloaderOptions(simple_tui=True))
obj.downloader.progress_handler.close()
ph = ProgressHandler(True, printer, False)
dl.progress_handler = ph
obj.downloader = dl
obj.download_songs(songs_obj)