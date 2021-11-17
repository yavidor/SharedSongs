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
function noder(x){
    console.log(`NODER AMARTI LECHA ${x}`)
}
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
spotifyApi.setAccessToken('BQAJeso3FW6vfiSOhi2LefuTN-5vMsEGMqpuM0t1LlPq-jSQdl1TgiQe5eeSWMfW6OAdC6Im9O6xM0IvcBShCCCuEnfzutUY_nchrJLYZS4kaLU0D0WTSeA0DNlSx1iYubQvTMWCLRsy1QWpb5pF_-r1WMoa7eygEy_4FCTL7llI8-Ur_DKnIO1BhKAeoSgwy1aGfZZOvLGTLFV74jzFRcBg3PGu7jhwnPGLBuAV3dYImoFInkbKGuD4dyAqK5UoqHHpm4l4YHRFujz7qzIbpRJrwn5IPo29bzMQwOpwzptJ');
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
async function getTracks(ids) {
    songs = [];

    // if there is more tracks than the limit (100 by default)


    // Divide the total number of track by the limit to get the number of API calls
    for (let i = 0; i < Math.ceil(ids.length / 50); i++) {

        const trackToAdd = (await spotifyApi.getTracks(ids.slice(50 * i, 50 * (i + 1))));

        // Push the retreived tracks into the array
        trackToAdd.tracks.forEach((item) => songs.push(item));
    }


    return songs
}
async function getFeatures(ids, tracks) {
    songs = [];

    // if there is more tracks than the limit (100 by default)

    // Divide the total number of track by the limit to get the number of API calls
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

function getList() {
    const param = 'energy'
    const id = '3wA3D6ZvPxN6LNZdj1Y8pW'
    getPlaylistWithTracks(id).then(async function (result) {
        console.log('***', result);
        const ret = result.items;
        while (result.next) {
            result = await getPlaylistWithTracks(id, result.offset + 50);
            ret.push(...result.items)
        }
        return await getFeatures(ret.map(t => t.track.id), ret.map(t => t.track));
    }
    ).then(async function (result) {
        console.log(result);
        console.log(param);
        result.sort((a, b) => a.features[param] - b.features[param]);
        // result = result.map(function(x){return {"track":x.track,"param":`${param} ${x.features[param]}`}});
        console.log('xxx', result);
        console.log(toUniqueArray(result.map(x => x.name)).join`, `)
        console.log(result);
        for (let i = 0; i < result.length; i++)
            document.write(`<img src="${result[i].track.album.images[0].url}" title="${result[i].track.name} - ${result[i].track.artists[0].name} \n ${param} - ${result[i].features[param] * 100} \n Position - ${i+1}">`)

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
