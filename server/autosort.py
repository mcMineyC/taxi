import os
import eyed3
import json
import shutil



def strip(a):
    return a.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("/", "").replace('"', "_").replace("\'", "_").replace("&", "-").replace(":", "-").replace(";", "-").replace(",", "-").replace(".", "-").replace("!", "-").replace("?", "-").replace("`", "-")



# Replace 'directory_path' with the path to the directory containing the mp3 files
directory_path = 'unsorted'

# Create a dictionary to store the ID3 tag information
tag_info = {}

# Iterate through the mp3 files in the directory
for file in os.listdir(directory_path):
    if file.endswith(".mp3"):
        audiofile = eyed3.load(os.path.join(directory_path, file))
        if audiofile.tag:
            if(audiofile is None):
                print("Skipping " + file)
                continue
            if(audiofile.tag is None):
                print("Skipping " + file)
                continue
            if(audiofile.tag.artist is None):
                audiofile.tag.artist = "None"
                print("Skipping " + file)
                continue
            if(audiofile.tag.album is None):
                audiofile.tag.album = "None"
                print("Skipping " + file)
                continue
            if(audiofile.tag.title is None):
                audiofile.tag.title = "None"
                print("Skipping " + file)
                continue
            
            artist = audiofile.tag.artist.split("/")[0]
            album = audiofile.tag.album
            title = audiofile.tag.title
            artistId = strip(artist)
            albId = strip(album)
            
            # Create the sorted directory structure
            sorted_directory = os.path.join('sorted', artistId, albId)
            os.makedirs(sorted_directory, exist_ok=True)
            
            # Move the files to the sorted directory
            shutil.move(os.path.join(directory_path, file), os.path.join(sorted_directory, file))
            # Update the tag_info dictionary
            if artist not in tag_info:
                tag_info[artist] = {
                    "id": artist.lower().replace(" ", "_"),
                    "displayName": artist,
                    "albums": {}
                }
            if albId not in tag_info[artist]["albums"]:
                tag_info[artist]["albums"][albId] = {
                    "displayName": album,
                    "songs": []
                }
            tag_info[artist]["albums"][albId]["songs"].append({
                "id": strip(title),
                "title": title,
                "file": os.path.join(sorted_directory, file)
            })

# Create the JSON output
output_json = {
    "entries": list(tag_info.values())
}

# Write the JSON to a file
with open('tag_info.json', 'w') as outfile:
    json.dump(output_json, outfile, indent=4)

print("Tag information saved to tag_info.json")
