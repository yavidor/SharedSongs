function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++){
            if (arr[j + 1].hue < arr[j].hue){
                 temp = arr[j]; 
                arr[j] = arr[j+1]; 
                arr[j+1] = temp; 
            }
        }
    }
    return arr;}
let dada;
let imgnum =0;
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
console.log("hello")
spotifyApi.setAccessToken('BQDoE546VKWgDyatnOUa0JBNkpiaeOkxYCTwTAadfW0THHSEFus71GT7EuZk_MOsjqEhHK2niFfFapk7dluqKybCl54oT_f4rQ5IGSFmcHqQMW1xp5IQHKJ4mqIjs9awjzoNhFU1tfz_qNKxgXI1PQFveZYI7ckLJEyHVg5vr1McbzShrj8fSc-EQXQnJj8QAu_wX3dzqHIwvwENkcV6WmWgYhDOd9Mlv3gAkw8-yxGkvAr2cnYGdiONM2FlNYlia9Yd0WrObmAl-0XZQQq-aJyPP8q-x0oBmLuc8_IXmETa');
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', function (err, data) {
    if (err) console.error(err);
    else { console.log('Artist albums', data);dada=data };
});
function getPlaylists() {
    spotifyApi.getMySavedTracks( {limit:50},function (err, data) {
    if (err) console.error(err);
    else {
        
        for (let i = 0; i < data.items.length; i++) {
            //let img = document.querySelector('img');
            // Make sure image is finished loading
            const img = new Image();
            
            img.crossOrigin = 'Anonymous';
            img.src = data.items[i].track.album.images[0].url
            if (img.complete) {
                data.items[i].hue=(rgbToHue(colorThief.getColor(img)))
                imgnum++;
                if(imgnum==data.items.length)
                datastuff(data);
                
            } else {
                img.addEventListener('load', function () {
                    data.items[i].hue=(rgbToHue(colorThief.getColor(img)))
                    imgnum++;
                    if(imgnum==data.items.length)
                    datastuff(data);
                    
                });
            }
        }

    }
});}
function datastuff(data){
    let imgData = new Array(data.items.length);
    for(let i =0;i<imgData.length;i++){
        imgData[i]="";
    }
    imgData=imgData.map(function(x,i){return {"hue":data.items[i].hue,"lnk":data.items[i].track.album.images[0].url}})
    imgData=bubbleSort(imgData)
    console.log(imgData)
    for(let i = 0; i < imgData.length;i++)
    document.write('<img src="' + imgData[i].lnk + '"crossorigin="anonymus" width="250" height="250"/>');
    console.log(data);
}
function getAlbums() {
    spotifyApi.getMySavedAlbums({ limit: 50 }, function (err, data) {
        if (err) console.error(err);
        else {
            console.log(data);
            for (let i = 0; i < data.items.length; i++) {
                document.write('<img src="' + data.items[i].album.images[0].url + '"width="500" height="500"/>')
            }

        }
    })
}
getPlaylists();