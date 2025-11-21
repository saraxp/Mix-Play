// MUSIC PLAYER UTILITY FUNCTIONS

const MusicPlayerUtils = {
  /**
   * Finds album art from a list of albums by matching artist name 
   * @param {Array} albumList - Array of albums from LastFM API
   * @param {string} trackName - Name of the track
   * @param {string} artistName - Name of the artist to match
   * @returns {string|null} - URL of the extralarge album art image
   */
  findAlbumArtFromSearch(albumList, trackName, artistName) {
    const matchingAlbum = albumList.find(album => 
      album.artist.toLowerCase() === artistName.toLowerCase()
    );
    
    if (matchingAlbum && matchingAlbum.image) {
      const albumArtImage = matchingAlbum.image.find(img => img.size === 'extralarge');
      return albumArtImage ? albumArtImage['#text'] : null;
    }
    
    return null;
  },

  /**
   * Saves playback queue and current track index
   * @param {Array} queue - Array of track objects
   * @param {number} currentIndex - Current track index in the queue
   */
  saveQueueToStorage(queue, currentIndex) {
    try {
      localStorage.setItem('musicQueue', JSON.stringify(queue));
      localStorage.setItem('currentTrackIndex', currentIndex.toString());
    } catch (error) {
      console.error('Error saving queue to storage:', error);
    }
  },

  /**
   * Loads playback queue and current track index
   * @returns {Object} - Object with queue and currentIndex properties
   */
  loadQueueFromStorage() {
    try {
      const savedQueue = localStorage.getItem('musicQueue');
      const savedIndex = localStorage.getItem('currentTrackIndex');

      const queue = savedQueue ? JSON.parse(savedQueue) : [];
      const currentIndex = savedIndex ? parseInt(savedIndex, 10) : -1;

      return { queue, currentIndex };
    } catch (error) {
      console.error('Error loading queue from storage:', error);
      return { queue: [], currentIndex: -1 };
    }
  },

  /**
   * Handles the queue management logic
   * @param {Array} currentQueue - Current playback queue
   * @param {number} currentIndex - Current track index
   * @param {Object} track - Track object to add/switch to
   * @returns {Object} - Object with queue and currentIndex properties
   */
  handleSongClick(currentQueue, currentIndex, track) {
    const queue = [...currentQueue];
    
    const indexInQueue = queue.findIndex(
      t => t.name === track.name && t.artist === track.artist
    );

    if (indexInQueue === -1) {
      queue.push(track);
      return { queue, currentIndex: queue.length - 1 };
    } else {
      return { queue, currentIndex: indexInQueue };
    }
  },

  /**
   * Formats time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time string (MM:SS)
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Export for use in browser (globally available)
if (typeof window !== 'undefined') {
  window.MusicPlayerUtils = MusicPlayerUtils;
}

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicPlayerUtils;
}

