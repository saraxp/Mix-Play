async function fetchFromLastfm(params) {
    const apiKey = process.env.LAST_FM_API_KEY;
    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.search = new URLSearchParams(params).toString();
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("format", "json");
    const response = await fetch(url);
    return response.json();
}

export default async function handler(request, response) {
    const { artist, track, album } = request.query;
    let imageUrl = null;

    // 1. try to get the art for specific track
    const trackData = await fetchFromLastfm({ method: 'track.getInfo', artist, track });
    imageUrl = trackData.track?.album?.image.find(img => img.size === 'extralarge')?.['#text'];

    // 2. if that fails, try getting the artist's top album
    if (!imageUrl) {
        const topAlbumData = await fetchFromLastfm({ method: 'artist.getTopAlbums', artist, limit: 1 });
        imageUrl = topAlbumData.topalbums?.album?.[0]?.image.find(img => img.size === 'extralarge')?.['#text'];
    }
    
    // 3. If still nothing, send a fallback
    if (!imageUrl) {
        imageUrl = "assests/fallback.jpg";
    }

    response.status(200).json({ imageUrl });
}