function toUniqueArray(a) {
    var newArr = [];
    for (var i = 0; i < a.length; i++) {
        if (newArr.indexOf(a[i]) === -1) {
            newArr.push(a[i]);
        }
        // else
            // console.log(a[i])
    }
    return newArr;
}
function pic(url) {
    // Create a new `Image` instance
    var image = new Image();
  
    image.onload = function() {
      // Inside here we already have the dimensions of the loaded image
      var style = [
        // Hacky way of forcing image's viewport using `font-size` and `line-height`
        'font-size: 1px;',
        'line-height: ' + this.height + 'px;',
  
        // Hacky way of forcing a middle/center anchor point for the image
        'padding: ' + this.height * .5 + 'px ' + this.width * .5 + 'px;',
  
        // Set image dimensions
        'background-size: ' + this.width + 'px ' + this.height + 'px;',
  
        // Set image URL
        'background: no-repeat url('+ url +');'
       ].join(' ');
  
       // notice the space after %c
       console.log('%c ', style);
    };
  
    // Actually loads the image
    image.src = url;
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
spotifyApi.setAccessToken('BQCPdC13s3PdBq7fwlHym2rW9ZGYP9vr_1PmQiS2bK_ix5IOLoSvumD__ZE_njL_ZJbUPBAdqKji5GtwvEQpthdvpMyzkprpU_RMbltZh8ucI-uUdnwQRhIam7PFI0XmYxNivfqUmvyP-qkAbmrGF72Fa2mS3UQw5soupyeObHlBOLX4xZgDaf8KghngtZ4zHd_auBKhXfw159ZwsoPStnewkIFvRqp-ggIJkYkZnGN90Fw6qc072q1ry_bsDYLdexr0oLGg_6O9U6D5W8qA6dZpDVGim03qVCmZTwK_6tag');
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
        urn = await getFeatures(ret.map(t => t.track.id), ret.map(t => t.track));
        return {"search":search.tracks.items,"track":urn}
    }
    ).then(async function (result) {
        search = result.search;
        result = result.track;
        console.log(param);
        // result.sort((a, b) => a.track.name.length - b.track.name.length);
        // result = result.map(function(x){return {"track":x.track,"param":`${param} ${x.features[param]}`}});
        search = await getFeatures(search.map(t=>t.id),search)
        pic(search[0].track.album.images[1].url)
        console.log(search);
        result = result.map(function (x) { return { "track": x.track, "features": x.features, "delta": getDelta(x, search[0]) } })
        result.sort((a, b) => a.delta - b.delta);
        // console.log(toUniqueArray(result.map(x => x.track.name)).join`, `)
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