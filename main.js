function toUniqueArray(a) {
    var newArr = [];
    for (var i = 0; i < a.length; i++) {
        if (newArr.indexOf(a[i]) === -1) {
            newArr.push(a[i]);
        }
        else
            console.log(a[i])
    }
    return newArr;
}
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
spotifyApi.setAccessToken('BQAZPi9EkfnTb-j230bKKqWcTSiS8UR-m9OnPkI1JokUkGphvMQXRMFYNA28td37635tGjgJQwYM7XA8PbHUkQjW0p08hNor-QitvA1yESQMnemfEEbV9Ldp6KbiwMSI5D5y6gcUKhkNCrVMvefJM1EC1pPDYK35BQRLthwh8GwUo49ovWkleydDTd_6k-EaIGrHdaRW-1TGzljT-14HF6Wh2ApZwlqFFtvvOmwbgcGPj20WKoB8nSxMi8baF-k75mR8DDDumOID4_BgPnW_NzX676qvwDp4O-LQkqKlKw8h');
function getListened(depth) {
    let ret = [];
    ret = spotifyApi.getMySavedTracks({ limit: 20 }).then(function (data) {
        return data.items.map(function (t) { return t.track.id })

    })

    return ret;
}
async function getPlaylistWithTracks(id, offset = 0) {
    // return await spotifyApi.getPlaylistTracks(id, {
    //     offset: offset
    // });
    return await spotifyApi.getMySavedTracks({ limit: 50, offset: offset });
}
function sumFeatures(track) {
    return track.features.acousticness + track.features.energy
        + track.features.danceability + track.features.instrumentalness
        + track.features.liveness + track.features.loudness + track.features.speechiness + track.features.valence;// + track.features.tempo + track.features.valence;
}
function getDelta(first, second) {
    //Gets the difference between two tracks
    return Math.abs(sumFeatures(first) - sumFeatures(second));

}
async function getTracks(ids) {
    songs = [];
    for (let i = 0; i < Math.ceil(ids.length / 50); i++) {
        const trackToAdd = (await spotifyApi.getTracks(ids.slice(50 * i, 50 * (i + 1))));
        trackToAdd.tracks.forEach((item) => songs.push(item));
    }


    return songs
}
async function getFeatures(ids, tracks) {
    songs = [];
    for (let i = 0; i < Math.ceil(ids.length / 50); i++) {

        const trackToAdd = (await spotifyApi.getAudioFeaturesForTracks(ids.slice(50 * i, 50 * (i + 1))));

        // Push the retreived tracks into the array
        trackToAdd.audio_features.forEach((item) => songs.push(item));
    }
    for (let i = 0; i < songs.length; i++) {
        songs[i] = { "features": songs[i], "track": tracks[i] }
    }
    return songs
}

async function getList() {
    const param = 'energy'
    const id = '3wA3D6ZvPxN6LNZdj1Y8pW'
    let search = await spotifyApi.search(prompt("Songs"),["track"]);
    getPlaylistWithTracks(id).then(async function (result) {
        console.log('***', result);
        const ret = result.items;
        while (result.next) {
            result = await getPlaylistWithTracks(id, result.offset + 50);
            ret.push(...result.items)
        }
        urn = await getFeatures(ret.map(t => t.track.id), ret.map(t => t.track))
        return {"search":search.tracks.items,"track":urn}
    }
    ).then(async function (result) {
        search = result.search;
        result = result.track;
        console.log(param);
        // result.sort((a, b) => a.track.name.length - b.track.name.length);
        // result = result.map(function(x){return {"track":x.track,"param":`${param} ${x.features[param]}`}});
        search = await getFeatures(search.map(t=>t.id),search)
        console.log(search);
        result = result.map(function (x) { return { "track": x.track, "features": x.features, "delta": getDelta(x, search[0]) } })
        result.sort((a, b) => a.delta - b.delta);
        console.log(toUniqueArray(result.map(x => x.track.name)).join`, `)
        console.log('xxx', result);
        for (let i = 0; i < result.length; i++) {
            document.write(`<img src="${result[i].track.album.images[0].url}" title="${result[i].track.name}
             - ${result[i].track.artists[0].name} \n ${param} - ${result[i].delta} \n Position - ${i + 1}">`)
        }
        imgnum = result;
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
    imgData = bubbleSort(imgData);
    for (let i = 0; i < imgData.length; i++) {
        document.write('<img src="' + imgData[i].lnk + '"crossorigin="anonymus" width="250" height="250"/>');
        if (i % 7 == 6)
            document.write('<br>');
    }
}
function getAlbums() {
    spotifyApi.getMySavedAlbums({ limit: 50 }, function (err, data) {
        if (err) console.error(err);
        else {
            for (let i = 0; i < data.items.length; i++) {
                document.write('<img src="' + data.items[i].album.images[0].url + '"width="500" height="500"/>');
            }

        }
    })
}
getList();