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
spotifyApi.setAccessToken('BQCjZQbkA6Vr8HmW6noLlBHSmCjEOJPzu5qKJQDTJVloB4wukF9jzy_Q9Sni2RFGxRfz8JF7LirSmpkLzDXoNF4Zp5rO3693GdNZ_MJFeg3OGeOjQD7n9i0zCBbw7qkndS8Pzys8LnwVVA5HgzwflkHzRQi7pFGJs8y3fm77AuJhy4-rOT9JrbpTN6ZMUDCcGxcAtIonarel6YM8aNQz4nq-SpL3Z6O4E8SLUDL8Y7M8tTzLJHGR05yAO9kasAJzFB7B2lo4_F4pjD3ms4csZNYzF42hGM1F6SnFtqbtI44X');
function getListened(depth) {
    let ret = [];
    ret = spotifyApi.getMySavedTracks({ limit: 20 }).then(function (data) {
        return data.items.map(function (t) { return t.track.id })

    })

    return ret;
}
async function getPlaylistWithTracks(id, offset = 0) {
    const playlist = await spotifyApi.getPlaylist(id);
    // if there is more tracks than the limit (100 by default)


    // Divide the total number of track by the limit to get the number of API calls
    return await spotifyApi.getPlaylistTracks(id, {
        offset: offset // Offset each call by the limit * the call's index
    });

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
async function getFeatures(ids) {
    songs = [];

    // if there is more tracks than the limit (100 by default)

    // Divide the total number of track by the limit to get the number of API calls
    for (let i = 0; i < Math.ceil(ids.length / 50); i++) {

        const trackToAdd = (await spotifyApi.getAudioFeaturesForTracks(ids.slice(50 * i, 50 * (i + 1))));

        // Push the retreived tracks into the array
        trackToAdd.audio_features.forEach((item) => songs.push(item));
    }
    return songs
}

function getList() {
    const id = '361wdMbdgp9UnjvEufIU8J'
    getPlaylistWithTracks(id).then(async function (result) {
        console.log('***', result);
        const ret = result.items;
        while (result.next) {
            result = await getPlaylistWithTracks(id, result.offset + 100);
            ret.push(...result.items)
        }
        return await getFeatures(ret.map(t => t.track.id));
    }
    ).then(async function (result) {
        console.log(result);
        result.sort((a, b) => a.liveness - b.liveness);
        result = result.map(x => x.id);
        console.log('xxx', result);
        await getTracks(result).then(function (data) {
            console.log(toUniqueArray(data.map(x => x.name)).join`, `)
            console.log(data);
            for (let i = 0; i < data.length; i++)
                document.write(`<img src="${data[i].album.images[0].url}" title="${data[i].name}">`)
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
