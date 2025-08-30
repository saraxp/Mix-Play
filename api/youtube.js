export default async function handler(request, response) {
  const apiKey = process.env.YT_API_KEY;

  const searchParams = request.query;

  // Build the final URL yt API search
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams(searchParams).toString();
  url.searchParams.append("key", apiKey);

  try {
    const youtubeResponse = await fetch(url.toString());
    const data = await youtubeResponse.json();

    // Send the data from yt back to frontend
    response.status(200).json(data);
  } catch (error) {
    console.error("YouTube API Error:", error);
    response.status(500).json({ error: 'Failed to fetch data from YouTube API' });
  }
}