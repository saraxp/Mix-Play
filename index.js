/* SOME ELEMENTS */
const searchBarMain = document.getElementById("searchBarMain");
const searchBarPanel = document.getElementById("searchBarPanel");
const searchInputPanel = document.getElementById("searchInputPanel");
const searchInputMain = document.getElementById("searchInputMain");
const searchPanel = document.getElementById("searchPanel");
const fullView = document.getElementById("fullView");
const form1 = document.getElementById("searchBarMain");
const form2 = document.getElementById("searchBarPanel");

/* OTHER STUFF */
let ytPlayer;
let globalAlbumList = [];
let isPlaying = false;
let progressInterval;
let playbackQueue = [];   // array of track objects
let currentTrackIndex = -1;
window.onload = () => {
  document.getElementById("albumArtContainer").classList.add("hidden");
};


/* FUNCTIONALITY TO CLOSE SIDE PANEL */
//To close side panel when music player section is clicked
const musicPlayer = document.getElementById("musicPlayer");
musicPlayer.addEventListener("click", function () {
  resetToMainSearch();
});

const PanelClose = document.getElementById("backToMPButton");
if (PanelClose) {
    PanelClose.addEventListener('click', () => {
        resetToMainSearch(); 
    });
}



/* TAKING SEARCH INPUT */

//Form 1 submission (music player search bar)
form1.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const query = searchInputMain.value.trim();

    if (query !== "") {
        await performSearch(query);
        showSearchPanelOnly(); 
        searchInputPanel.focus();
    }
    form1.reset();
});


// Form 2 submission (panel search bar)
form2.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const query = searchInputPanel.value.trim();
    
    if (query !== "") {
        await performSearch(query);
        showSearchPanelOnly();  
        searchInputPanel.focus(); 
    }
    form2.reset();
});


// Search function
async function performSearch(query) {
    const trackUrl = `/api/lastfm?method=track.search&track=${encodeURIComponent(query)}`;
    const artistUrl = `/api/lastfm?method=artist.search&artist=${encodeURIComponent(query)}`;
    const albumUrl = `/api/lastfm?method=album.search&album=${encodeURIComponent(query)}`;

    try {
        const [trackResult, artistResult, albumResult] = await Promise.all([
            fetch(trackUrl),
            fetch(artistUrl),
            fetch(albumUrl)
        ]);

        const [trackData, artistData, albumData] = await Promise.all([
            trackResult.json(),
            artistResult.json(),
            albumResult.json()
        ]);
        
        const trackList = trackData.results?.trackmatches?.track || [];
        const artistList = artistData.results?.artistmatches?.artist || [];
        const albumList = albumData.results?.albummatches?.album || [];

        globalAlbumList = albumList;

        renderTracks(trackList);
        renderArtists(artistList);
        renderAlbums(albumList);

        if (trackList.length === 0 && artistList.length === 0 && albumList.length === 0) {
            console.log("😞 No results found for:", query);
        }

    } catch (err) {
        console.error("API error:", err);
    }
}


/* HELPER FUNCTIONS */
function showSearchPanelOnly() {
  searchPanel.classList.remove("hidden");
  fullView.classList.add("hidden");
  form1.classList.add("hidden");
  searchBarMain.classList.add("hidden");
}

function showFullViewOnly() {
  searchPanel.classList.add("hidden");
  fullView.classList.remove("hidden");
}

function resetToMainSearch() {
  searchPanel.classList.add("hidden");
  fullView.classList.add("hidden");
  searchBarMain.classList.remove("hidden");
  form1.classList.remove("hidden");
}

function findAlbumArtFromSearch(trackName, artistName) {
    return MusicPlayerUtils.findAlbumArtFromSearch(globalAlbumList, trackName, artistName);
}

async function fetchYTArtistImage(artistName) {
  const url = `/api/youtube?part=snippet&type=channel&q=${encodeURIComponent(artistName)}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const channel = data.items?.[0];
    const imageUrl = channel?.snippet?.thumbnails?.high?.url || "assests/fallback.png";
    return imageUrl;
  } catch (err) {
    console.error("YouTube channel fetch failed:", err);
    return "assests/fallback.png";
  }
}


/* YT PLAYER FUNCTION */
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("youtubePlayer", {
    height: "0px", 
    width: "0px",
    videoId: "",
    events: {
      onReady: () => console.log("YouTube player ready"),
      onStateChange: onPlayerStateChange
    }
  });
}


/* MAIN FUNCTIONS */

//fetch songs related to the search query
function renderTracks(tracks) {
  const section = document.getElementById("songsSection");
  const fullView = document.getElementById("fullView");
  const fullList = document.getElementById("fullList");
  const backBtn = document.getElementById("backToSummaryBtn");
  fullView.classList.add("hidden");

  section.innerHTML = "";

  if (tracks.length > 0) {
    section.innerHTML = "<h3 class='songsList'>Songs</h3>";
    tracks.slice(0, 5).forEach(track => {
      const div = document.createElement("div");
      div.classList.add("track-card");
      div.textContent = `${track.name} - ${track.artist}`;

      div.addEventListener("click", () => handleSongClick(track, tracks));

      section.appendChild(div);
    });

    const showMoreBtn = document.createElement("button");
    showMoreBtn.textContent = "Show more";
    showMoreBtn.classList.add("show-more-btn");
    section.appendChild(showMoreBtn);

    showMoreBtn.addEventListener("click", () => {
      document.getElementById("searchPanel").classList.add("hidden");
      fullView.classList.remove("hidden");

      fullList.innerHTML = "<h3 class='songsList'>Songs</h3>";
      tracks.forEach(track => {
        const div = document.createElement("div");
        div.classList.add("track-card");
        div.textContent = `${track.name} - ${track.artist}`;

        div.addEventListener("click", () => handleSongClick(track, tracks));

        fullList.appendChild(div);
      });

      if (!fullView.classList.contains("hidden") && searchPanel.classList.contains("hidden")) {
        backBtn.addEventListener("click", () => {
          showSearchPanelOnly();
        });
      }
    });
  }
}

//fetch artists related to the search query
async function renderArtists(artists) {
    const section = document.getElementById("artistsSection");
    const fullView = document.getElementById("fullView");
    const fullList = document.getElementById("fullList");
    const backBtn = document.getElementById("backToSummaryBtn");
    fullView.classList.add("hidden");

    section.innerHTML = "";

    if (artists.length === 0) {
        section.innerHTML = "<p>No artists found</p>";
        return;
    }

    section.innerHTML = "<h3 class='artistsList'>Artists</h3>";

    // Top artist match
    const topArtist = artists[0];
    const imageUrl = await fetchYTArtistImage(topArtist.name);

    if (imageUrl != "") {
        section.innerHTML += `
            <div class="top-artist-card">
                <div class="top-artist-name">
                    <p class="top-artist">${topArtist.name}</p>
                </div>
                <div 
                    class="artist-image-with-fade" 
                    style="background-image: linear-gradient(to right, rgb(12, 20, 19) 0%, rgba(0,0,0,0) 100%), url('${imageUrl}');"
                    role="img" 
                    aria-label="${topArtist.name}"
                ></div>
            </div>
            `;
    } else {
        section.innerHTML += `
            <div class="top-artist-card">
                <div class="top-artist-name">
                    <p class="top-artist">${topArtist.name}</p>
                </div>
            </div>
            `;
    }

    const showMoreBtn = document.createElement("button");
    showMoreBtn.textContent = "Show more";
    showMoreBtn.classList.add("show-more-btn");
    section.appendChild(showMoreBtn);

    showMoreBtn.addEventListener("click", () => {
        document.getElementById("searchPanel").classList.add("hidden");
        fullView.classList.remove("hidden");

        fullList.innerHTML = "<h3 class='artistsList'>Artists</h3>";
        artists.forEach(artist => {
            fullList.innerHTML += `<div class="artist-card">${artist.name}</div>`;
        });

        if (!fullView.classList.contains("hidden") && searchPanel.classList.contains("hidden")) {
            backBtn.addEventListener("click", () => {
                showSearchPanelOnly();
            });
        }
    });
}

//fetch albums related to the search query
function renderAlbums(albums) {
    const section = document.getElementById("albumsSection");
    const fullView = document.getElementById("fullView");
    const fullList = document.getElementById("fullList");
    const backBtn = document.getElementById("backToSummaryBtn");
    fullView.classList.add("hidden");

    section.innerHTML = "";

    if (albums.length === 0) {
        section.innerHTML = "<p>No albums found</p>";
        return;
    }

    section.innerHTML = "<h3 class='albumsList'>Albums</h3>";
    albums.slice(0, 3).forEach(album => {
        const albumCard = document.createElement('div');
        albumCard.classList.add('album-card');
        albumCard.innerHTML = `<h4>${album.name}</h4><p style="font-size:15px; margin-top:2px;">${album.artist}</p>`;
        section.appendChild(albumCard);
    });

    const showMoreBtn = document.createElement("button");
    showMoreBtn.textContent = "Show more";
    showMoreBtn.classList.add("show-more-btn");
    section.appendChild(showMoreBtn);

    showMoreBtn.addEventListener("click", () => {
        document.getElementById("searchPanel").classList.add("hidden");
        fullView.classList.remove("hidden");
        renderAlbumsInFullView();

        if (!fullView.classList.contains("hidden") && searchPanel.classList.contains("hidden")) {
            backBtn.addEventListener("click", () => {
                showSearchPanelOnly();
            });
        }
    });
}

/* ALBUM FUNCTIONS */
function renderAlbumsInFullView() {
    const fullList = document.getElementById("fullList");
    
    fullList.innerHTML = "<h3 class='albumsList'>Albums</h3>";
    globalAlbumList.forEach(album => {
        const albumDiv = document.createElement('div');
        albumDiv.classList.add('album-card', 'clickable-album');
        albumDiv.innerHTML = `<h4>${album.name}</h4><p style="font-size:15px; margin-top:2px;">${album.artist}</p>`;
        
      
        albumDiv.addEventListener('click', () => {
            showAlbumTracks(album.name, album.artist);
        });
        
        fullList.appendChild(albumDiv);
    });
}

// Function to get album tracks using album.getInfo
async function getAlbumTracks(artistName, albumName) {
    const albumInfoUrl = `/api/lastfm?method=album.getInfo&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}`;
    
    try {
        const response = await fetch(albumInfoUrl);
        const albumData = await response.json();
        
        if (albumData.album && albumData.album.tracks && albumData.album.tracks.track) {
            const tracks = Array.isArray(albumData.album.tracks.track) 
                ? albumData.album.tracks.track 
                : [albumData.album.tracks.track];
                
            return tracks.map(track => ({
                name: track.name,
                artist: artistName, 
                duration: track.duration || '0'
            }));
        }
    } catch (error) {
        console.error('Error fetching album tracks:', error);
    }
    return [];
}

// Function to show album tracks view
async function showAlbumTracks(albumName, artistName) {
    const fullView = document.getElementById("fullView");
    const fullList = document.getElementById("fullList");
    const backBtn = document.getElementById("backToSummaryBtn");
    
    
    fullList.innerHTML = `
        <div class="album-header">
            <h3>${albumName}</h3>
            <p>${artistName}</p>
            <p>Loading tracks...</p>
        </div>
    `;
    
    try {
        const tracks = await getAlbumTracks(artistName, albumName);
        const mainBackButton = document.getElementById('backToSummaryBtn');
        mainBackButton.classList.add('hidden');
        fullList.innerHTML = `
            <div class="album-header">
                <button id="backToAlbumsBtn" class="back-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(12, 20, 19)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to Albums</button>
                <h3>${albumName}</h3>
                <p>${artistName}</p>
                <p>${tracks.length} tracks</p>
            </div>
            <div class="tracks-container">
                ${tracks.length > 0 
                    ? tracks.map((track, index) => `
                        <div class="track-item" data-track='${JSON.stringify(track)}'>
                            <span class="track-number">${index + 1}</span>
                            <div class="track-info">
                                <div class="track-name">${track.name}</div>
                                <div class="track-artist">${track.artist}</div>
                            </div>
                            <div class="play-btn">
                              <svg class="play-symbol" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="rgb(232, 240, 239)" viewBox="0 0 256 256">
                              <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>
                              </svg>
                            </div>
                        </div>
                    `).join('')
                    : '<p>No tracks found for this album</p>'
                }
            </div>
        `;
        
        
        if (tracks.length > 0) {
            const trackItems = fullList.querySelectorAll('.track-item');
            trackItems.forEach(item => {
                item.addEventListener('click', () => {
                    const trackData = JSON.parse(item.dataset.track);
                    playTrack(trackData);
                });
            });
        }
        

        const backToAlbumsBtn = document.getElementById("backToAlbumsBtn");
        backToAlbumsBtn.addEventListener('click', () => {
            renderAlbumsInFullView();
            mainBackButton.classList.remove('hidden');
        });
        
    } catch (error) {
        console.error('Error loading album tracks:', error);
        fullList.innerHTML = `
            <div class="album-header">
                <button id="backToAlbumsBtn" class="back-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(12, 20, 19)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to Albums</button>
                <h3>${albumName}</h3>
                <p>${artistName}</p>
                <p>Error loading tracks</p>
            </div>
        `;
    }
}

/* PLAYBACK & SONG CONTROL */

async function playTrack(track) {
    const songQuery = `${track.name} ${track.artist}`;
    const songName = document.getElementById("songName");
    const artistName = document.getElementById("artistName");
    const albumArt = document.getElementById("albumArt");
    const progressBar = document.getElementById("progressBar");
    const playButton = document.getElementById("playButton");

    stopProgressUpdater(); 
    progressBar.style.width = "0%";

    try {
        const ytRes = await fetch(`/api/youtube?part=snippet&q=${encodeURIComponent(songQuery)}&maxResults=1&type=video`);
        const ytData = await ytRes.json();
        const videoId = ytData.items?.[0]?.id?.videoId;

        console.log("YouTube video ID:", videoId);

        // Fetch album art with a single, optimized API call
        try {
            const artResponse = await fetch(`/api/getAlbumArt?artist=${encodeURIComponent(track.artist)}&track=${encodeURIComponent(track.name)}`);
            const artData = await artResponse.json();

            if (artData.imageUrl) {
                albumArt.src = artData.imageUrl;
                document.getElementById("albumArtContainer").classList.remove("hidden");
                albumArt.classList.remove("hidden");
            } else {
                 throw new Error("No image URL returned");
            }
        } catch (artErr) {
            console.warn("Album art fallback used:", artErr);
            document.getElementById("albumArtContainer").classList.remove("hidden");
            albumArt.src = "assests/fallback.png"; 
        }

        songName.textContent = track.name;
        artistName.textContent = track.artist;

        if (videoId && ytPlayer?.loadVideoById) {
            ytPlayer.loadVideoById(videoId);
            ytPlayer.playVideo();             
            isPlaying = true;                 
            startProgressUpdater();          

            playButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="rgb(232, 240, 239)" viewBox="0 0 256 256">
                <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/>
                </svg>`;
        } else {
            console.warn("No video ID found or player not ready.");
        }

    } catch (err) {
        console.error("Error playing track:", err);
        songName.textContent = "Error playing track";
    }
}

//to save songs in playback queue
function saveQueueToStorage() {
  MusicPlayerUtils.saveQueueToStorage(playbackQueue, currentTrackIndex);
}

//to load songs in playback queue
function LoadQueueFromStorage() {
  const { queue, currentIndex } = MusicPlayerUtils.loadQueueFromStorage();
  playbackQueue = queue;
  currentTrackIndex = currentIndex;
}

//to add songs in playback queue
function handleSongClick(track) {
  const { queue, currentIndex } = MusicPlayerUtils.handleSongClick(playbackQueue, currentTrackIndex, track);
  playbackQueue = queue;
  currentTrackIndex = currentIndex;

  playTrack(track);
  saveQueueToStorage();
}


// progress bar functions
function startProgressUpdater() {
  clearInterval(progressInterval); 
  progressInterval = setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration) {
      const currentTime = ytPlayer.getCurrentTime();
      const duration = ytPlayer.getDuration();

      if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        document.getElementById("progressBar").style.width = `${progressPercent}%`;
      }
    }
  }, 500); 
}

function stopProgressUpdater() {
  clearInterval(progressInterval);
}

//song control buttons
document.getElementById("nextButton").addEventListener("click", () => {
  if (playbackQueue.length > 0 && currentTrackIndex < playbackQueue.length - 1) {
    currentTrackIndex++;
    playTrack(playbackQueue[currentTrackIndex]);
    saveQueueToStorage();
  }
});

document.getElementById("prevButton").addEventListener("click", () => {
  if (playbackQueue.length > 0 && currentTrackIndex > 0) {
    currentTrackIndex--;
    playTrack(playbackQueue[currentTrackIndex]);
    saveQueueToStorage();
  }
});

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    document.getElementById("nextButton").click();
  }
}

document.getElementById("playButton").addEventListener("click", () => {
  if (!ytPlayer) return;

  if (!isPlaying) {
    ytPlayer.playVideo();
    document.getElementById("playButton").innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="rgb(232, 240, 239)" viewBox="0 0 256 256">
        <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/>
      </svg>
    `;
    startProgressUpdater();
    isPlaying = true;
  } else {
    ytPlayer.pauseVideo();
    document.getElementById("playButton").innerHTML = `
      <svg class="play-symbol" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="rgb(232, 240, 239)" viewBox="0 0 256 256">
        <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>
      </svg>
    `;
    stopProgressUpdater();
    isPlaying = false;
  }
});

// on screen load
document.addEventListener('DOMContentLoaded', () => {
  LoadQueueFromStorage();
});