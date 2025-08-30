export default async function handler(request, response) {
  
  const apiKey = process.env.LAST_FM_API_KEY;
  const baseUrl = "https://ws.audioscrobbler.com/2.0/";

  
  const searchParams = request.query;

  // Build the final URL for LF API
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(searchParams).toString();
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("format", "json");

  try {
    const lastFmResponse = await fetch(url.toString());
    const data = await lastFmResponse.json();

    // Send the data from LF back to  frontend
    response.status(200).json(data);
  } catch (error) {
    console.error("Last.fm API Error:", error);
    response.status(500).json({ error: 'Failed to fetch data from Last.fm API' });
  }
}