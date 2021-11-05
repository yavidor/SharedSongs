var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('BQBtUAH9HwlolbkKUxuNt9B2gJOx_u4SfXFpYQPbMMc1PMhIeXav-4raGIWIBSLkuAIoa6X1BbgIeJa27X10ugA_oX2oyiAkGJOSHuFWWotPztVdXV5Nm2C7KMBcZ6Oim2BMdD1PvN1Qre91i0OGK-IGiOFxxXKTIhx3DaLBGqgY7mVH');
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', function (err, data) {
    if (err) console.error(err);
    else console.log('Artist albums', data);
});