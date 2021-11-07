function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j + 1].hue < arr[j].hue) {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}
function toUniqueArray(a) {
    var newArr = [];
    for (var i = 0; i < a.length; i++) {
        if (newArr.indexOf(a[i]) === -1) {
            newArr.push(a[i]);
        }
    }
    return newArr;
}
let dada;
let moshed;
let imgnum = 0;
function rgbToHue(rgb) {
    var h;
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);

    if (max - min === 0) {
        return 0;
    }

    if (max === r) {
        h = (g - b) / (max - min);
    }
    else if (max === g) {
        h = 2 + (b - r) / (max - min);
    }
    else if (max === b) {
        h = 4 + (r - g) / (max - min);
    }
    h = h * 60;
    h %= 360;
    if (h < 0) {
        h += 360;
    }

    return Math.round(h);
}
var spotifyApi = new SpotifyWebApi();
const colorThief = new ColorThief();
spotifyApi.setAccessToken('BQCcotnJlnlYoAN8RjQpAY5jijZ57No9Pl5CrjaCQNzWES5gtlw7EtIVl7p9ljftf7WDXKETCCTxbs63c1QhO4yhx6Zmd-qJZeghxgUBtcphum-GCdj2JwnLMI_71DXwhEOjCfOv0YQJQkCYIGuJ-iF0O7vOhswVf0pihnLjdAoCd2PfqREL0ggHEAu3DL9CEpMfMa4lCWJvRTEyY2od2iAcPFg831T36tzTeQTMZjnxZb9HI2uHQOwZfCgT6UwkC7Tv3uo1lXxJbp2tLpoDrSUAoAX8rBrIJYt-ncZHC4Rv');
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', function (err, data) {
    if (err) console.error(err);
    else { console.log('Artist albums', data); dada = data };
});
function getListened(depth) {
    let ret = [];
    ret = spotifyApi.getMySavedTracks({ limit: 20 }).then(function (data) {
        return data.items.map(function (t) { return t.track.id })

    })

    return ret;
}
async function getPlaylistWithTracks(id) {
    const playlist = (await spotifyApi.getPlaylist(id))

    // if there is more tracks than the limit (100 by default)
    if (playlist.tracks.total > playlist.tracks.limit) {

        // Divide the total number of track by the limit to get the number of API calls
        for (let i = 0; i < Math.ceil(playlist.tracks.total / playlist.tracks.limit); i++) {

            const trackToAdd = (await spotifyApi.getPlaylistTracks(id, {
                offset: playlist.tracks.limit * i // Offset each call by the limit * the call's index
            }));

            // Push the retreived tracks into the array
            trackToAdd.items.forEach((item) => playlist.tracks.items.push(item));
        }
    }

    return playlist
}
async function getTracks(ids) {
    songs = [];

    // if there is more tracks than the limit (100 by default)
    if (ids.length > 50) {
        console.log()
        // Divide the total number of track by the limit to get the number of API calls
        for (let i = 0; i < Math.ceil(ids.length / 50); i++) {

            const trackToAdd = (await spotifyApi.getTracks(ids.slice(50 * i, 50 * (i + 1))));

            // Push the retreived tracks into the array
            trackToAdd.tracks.forEach((item) => songs.push(item));
        }
    }

    return songs
}
async function getFeatures(ids) {
    songs = [];

    // if there is more tracks than the limit (100 by default)
    if (ids.length > 50) {
        console.log()
        // Divide the total number of track by the limit to get the number of API calls
        for (let i = 0; i < Math.ceil(ids.length / 50); i++) {

            const trackToAdd = (await spotifyApi.getAudioFeaturesForTracks(ids.slice(50 * i, 50 * (i + 1))));

            // Push the retreived tracks into the array
            trackToAdd.audio_features.forEach((item) => songs.push(item));
        }
    }

    return songs
}

async function getWhatever() {
    getPlaylistWithTracks('46yFRyWFyu30ONXKZ3vMG7').then(async function (result) {
        console.log(result)
        result = (await getFeatures(result.tracks.items.map(t => t.track.id)))
        return result;
    }
    ).then(async function (result) {
        console.log(result);
        result.sort((a, b) => a.duration_ms - b.duration_ms)
        result = result.map(x => x.id);
        console.log(result)
        await getTracks([...result]).then(function (data) {
            console.log(toUniqueArray(data.map(x => x.name)).join`,`)
            console.log(data);
            for (let i = 0; i < data.length; i++)
                document.write('<img src="' + data[i].album.images[0].url + '" data-album-id="' + data[i].id + '" title="' + data[i].name + '" >')
        })
    })
}
function getPlaylists() {
    spotifyApi.getMySavedTracks({ limit: 49 }, function (err, data) {
        if (err) console.error(err);
        else {

            for (let i = 0; i < data.items.length; i++) {
                //let img = document.querySelector('img');
                // Make sure image is finished loading
                const img = new Image();

                img.crossOrigin = 'Anonymous';
                img.src = data.items[i].track.album.images[0].url
                if (img.complete) {
                    data.items[i].hue = (rgbToHue(colorThief.getColor(img)))
                    imgnum++;
                    if (imgnum == data.items.length)
                        datastuff(data);

                } else {
                    img.addEventListener('load', function () {
                        data.items[i].hue = (rgbToHue(colorThief.getColor(img)))
                        imgnum++;
                        if (imgnum == data.items.length)
                            datastuff(data);
                        // console.log(data);

                    });
                }
            }

        }
    });
}
function datastuff(data) {
    let imgData = new Array(data.items.length);
    for (let i = 0; i < imgData.length; i++) {
        imgData[i] = "";
    }
    imgData = imgData.map(function (x, i) { return { "hue": data.items[i].hue, "lnk": data.items[i].track.album.images[0].url } })
    imgData = bubbleSort(imgData)
    for (let i = 0; i < imgData.length; i++) {
        document.write('<img src="' + imgData[i].lnk + '"crossorigin="anonymus" width="250" height="250"/>');
        if (i % 7 == 6)
            document.write('<br>')
        // console.log(data.items[i].track.name);
    }
    // console.log(imgData)
}
function getAlbums() {
    spotifyApi.getMySavedAlbums({ limit: 50 }, function (err, data) {
        if (err) console.error(err);
        else {
            // console.log(data);
            for (let i = 0; i < data.items.length; i++) {
                document.write('<img src="' + data.items[i].album.images[0].url + '"width="500" height="500"/>')
            }

        }
    })
}
// getPlaylists();
getWhatever();