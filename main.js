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
spotifyApi.setAccessToken('BQCCw_F0_g6tO8IBtTXK4IHdN_ETzJqybCXHs1FwzpBL5ozewkGEhQrii1A8aifgY74EJVzRqr9cBvT1O9AN-mzRxGbLcfXtoUf_7WREiMsB9uLiThotVraNE2otNH7Mc6vLhSTekPxYFF-YzuxNvmXS_SsmOHW73sJYobxXd2QaZ7fVbTCtwgFHuOtkkH209UBzE0LqpyuRjuTyUy2EAx-19m0Gp1kQvOheLGYEF68HnMj3VLPAoKBqFaauPHydLtO2WGv1vYNQs_X_giU-qitOPTecqSsjDzZh5PidkOvC');
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
        result.sort((a, b) => a.track.name.length - b.track.name.length);
        // result = result.map(function(x){return {"track":x.track,"param":`${param} ${x.features[param]}`}});
        console.log('xxx', result);
        console.log(toUniqueArray(result.map(x => x.name)).join`, `)
        console.log(result);
        for (let i = 0; i < result.length; i++)
            document.write(`<img src="${result[i].track.album.images[0].url}" title="${result[i].track.name} - ${result[i].track.artists[0].name} \n ${param} - ${result[i].track.name.length} \n Position - ${i + 1}">`)

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