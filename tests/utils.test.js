// UNIT TESTS FOR MusicPlayerUtils FUNCTIONS

const MusicPlayerUtils = require('../utils.js');

describe('MusicPlayerUtils', () => {
  
  describe('findAlbumArtFromSearch', () => {
    const mockAlbumList = [
      {
        artist: 'The Beatles',
        name: 'Abbey Road',
        image: [
          { size: 'small', '#text': 'http://small.jpg' },
          { size: 'medium', '#text': 'http://medium.jpg' },
          { size: 'extralarge', '#text': 'http://extralarge.jpg' }
        ]
      },
      {
        artist: 'Pink Floyd',
        name: 'Dark Side of the Moon',
        image: [
          { size: 'extralarge', '#text': 'http://pinkfloyd-extralarge.jpg' }
        ]
      },
      {
        artist: 'Radiohead',
        name: 'OK Computer',
        image: []
      }
    ];

    test('should find album art when artist name matches exactly', () => {
      const result = MusicPlayerUtils.findAlbumArtFromSearch(
        mockAlbumList,
        'Come Together',
        'The Beatles'
      );
      expect(result).toBe('http://extralarge.jpg');
    });

    test('should find album art when artist name matches case-insensitively', () => {
      const result = MusicPlayerUtils.findAlbumArtFromSearch(
        mockAlbumList,
        'Time',
        'pink floyd'
      );
      expect(result).toBe('http://pinkfloyd-extralarge.jpg');
    });

    test('should return null when artist name does not match', () => {
      const result = MusicPlayerUtils.findAlbumArtFromSearch(
        mockAlbumList,
        'Song',
        'Unknown Artist'
      );
      expect(result).toBeNull();
    });

    test('should return null when album has no image array', () => {
      const albumListNoImages = [
        {
          artist: 'Some Artist',
          name: 'Some Album'
        }
      ];
      const result = MusicPlayerUtils.findAlbumArtFromSearch(
        albumListNoImages,
        'Song',
        'Some Artist'
      );
      expect(result).toBeNull();
    });

    test('should return null when album has no extralarge image', () => {
      const albumListNoExtralarge = [
        {
          artist: 'Some Artist',
          name: 'Some Album',
          image: [
            { size: 'small', '#text': 'http://small.jpg' },
            { size: 'medium', '#text': 'http://medium.jpg' }
          ]
        }
      ];
      const result = MusicPlayerUtils.findAlbumArtFromSearch(
        albumListNoExtralarge,
        'Song',
        'Some Artist'
      );
      expect(result).toBeNull();
    });

    test('should return null for empty album list', () => {
      const result = MusicPlayerUtils.findAlbumArtFromSearch(
        [],
        'Song',
        'Artist'
      );
      expect(result).toBeNull();
    });
  });

  describe('saveQueueToStorage', () => {
    test('should save queue and current index to localStorage', () => {
      const queue = [
        { name: 'Song 1', artist: 'Artist 1' },
        { name: 'Song 2', artist: 'Artist 2' }
      ];
      const currentIndex = 1;

      MusicPlayerUtils.saveQueueToStorage(queue, currentIndex);

      // Verify data was actually saved by reading it again
      const savedQueue = JSON.parse(localStorage.getItem('musicQueue'));
      const savedIndex = localStorage.getItem('currentTrackIndex');

      expect(savedQueue).toEqual(queue);
      expect(savedIndex).toBe('1');
    });

    test('should handle empty queue', () => {
      const queue = [];
      const currentIndex = -1;

      MusicPlayerUtils.saveQueueToStorage(queue, currentIndex);

      // Verify data was actually saved by reading it again
      const savedQueue = JSON.parse(localStorage.getItem('musicQueue'));
      const savedIndex = localStorage.getItem('currentTrackIndex');

      expect(savedQueue).toEqual([]);
      expect(savedIndex).toBe('-1');
    });

    test('should handle string conversion of index', () => {
      const queue = [{ name: 'Song', artist: 'Artist' }];
      const currentIndex = 0;

      MusicPlayerUtils.saveQueueToStorage(queue, currentIndex);

      // Verify data was actually saved by reading it again
      const savedQueue = JSON.parse(localStorage.getItem('musicQueue'));
      const savedIndex = localStorage.getItem('currentTrackIndex');

      expect(savedQueue).toEqual(queue);
      expect(savedIndex).toBe('0');
    });
  });

  describe('loadQueueFromStorage', () => {
    beforeEach(() => {
      // Explicitly clear localStorage before each test
      localStorage.clear();
      // manually delete the keys
      localStorage.removeItem('musicQueue');
      localStorage.removeItem('currentTrackIndex');
    });

    test('should load queue and current index from localStorage', () => {
      const queue = [
        { name: 'Song 1', artist: 'Artist 1' },
        { name: 'Song 2', artist: 'Artist 2' }
      ];
      
      // Set up test data
      localStorage.setItem('musicQueue', JSON.stringify(queue));
      localStorage.setItem('currentTrackIndex', '1');

      const result = MusicPlayerUtils.loadQueueFromStorage();

      expect(result.queue).toEqual(queue);
      expect(result.currentIndex).toBe(1);
    });

    test('should return empty queue and -1 index when no data in localStorage', () => {
      // localStorage is cleared by beforeEach
      const result = MusicPlayerUtils.loadQueueFromStorage();

      expect(result.queue).toEqual([]);
      expect(result.currentIndex).toBe(-1);
    });

    test('should return empty queue when only index exists', () => {
      localStorage.setItem('currentTrackIndex', '0');

      const result = MusicPlayerUtils.loadQueueFromStorage();

      expect(result.queue).toEqual([]);
      expect(result.currentIndex).toBe(0);
    });

    test('should return -1 index when only queue exists', () => {
      const queue = [{ name: 'Song', artist: 'Artist' }];
      
      localStorage.setItem('musicQueue', JSON.stringify(queue));

      const result = MusicPlayerUtils.loadQueueFromStorage();

      expect(result.queue).toEqual(queue);
      expect(result.currentIndex).toBe(-1);
    });

    test('should handle invalid JSON gracefully', () => {
      localStorage.setItem('musicQueue', 'invalid json');
      localStorage.setItem('currentTrackIndex', '0');

      const result = MusicPlayerUtils.loadQueueFromStorage();
      
      expect(result).toHaveProperty('queue');
      expect(result).toHaveProperty('currentIndex');
      expect(result.queue).toEqual([]);
      expect(result.currentIndex).toBe(-1);
    });
  });

  describe('handleSongClick', () => {
    test('should add new track to queue when not already present', () => {
      const currentQueue = [
        { name: 'Song 1', artist: 'Artist 1' }
      ];
      const currentIndex = 0;
      const newTrack = { name: 'Song 2', artist: 'Artist 2' };

      const result = MusicPlayerUtils.handleSongClick(currentQueue, currentIndex, newTrack);

      expect(result.queue).toHaveLength(2);
      expect(result.queue[1]).toEqual(newTrack);
      expect(result.currentIndex).toBe(1);
    });

    test('should not mutate original queue array', () => {
      const currentQueue = [
        { name: 'Song 1', artist: 'Artist 1' }
      ];
      const originalQueueCopy = [...currentQueue];
      const newTrack = { name: 'Song 2', artist: 'Artist 2' };

      MusicPlayerUtils.handleSongClick(currentQueue, 0, newTrack);

      expect(currentQueue).toEqual(originalQueueCopy);
    });

    test('should set current index to existing track when track is already in queue', () => {
      const existingTrack = { name: 'Song 1', artist: 'Artist 1' };
      const currentQueue = [
        existingTrack,
        { name: 'Song 2', artist: 'Artist 2' }
      ];
      const currentIndex = 1;

      const result = MusicPlayerUtils.handleSongClick(currentQueue, currentIndex, existingTrack);

      expect(result.queue).toHaveLength(2);
      expect(result.currentIndex).toBe(0);
    });

    test('should match tracks by both name and artist', () => {
      const track1 = { name: 'Song', artist: 'Artist 1' };
      const track2 = { name: 'Song', artist: 'Artist 2' };
      const currentQueue = [track1];
      const currentIndex = 0;

      // Different artist, same name - should be added
      const result1 = MusicPlayerUtils.handleSongClick(currentQueue, currentIndex, track2);
      expect(result1.queue).toHaveLength(2);
      expect(result1.currentIndex).toBe(1);

      // Same artist and name - should find existing
      const result2 = MusicPlayerUtils.handleSongClick(result1.queue, result1.currentIndex, track1);
      expect(result2.queue).toHaveLength(2);
      expect(result2.currentIndex).toBe(0);
    });

    test('should handle empty queue', () => {
      const currentQueue = [];
      const currentIndex = -1;
      const newTrack = { name: 'Song 1', artist: 'Artist 1' };

      const result = MusicPlayerUtils.handleSongClick(currentQueue, currentIndex, newTrack);

      expect(result.queue).toHaveLength(1);
      expect(result.queue[0]).toEqual(newTrack);
      expect(result.currentIndex).toBe(0);
    });
  });

  describe('formatTime', () => {
    test('should format seconds to MM:SS correctly', () => {
      expect(MusicPlayerUtils.formatTime(0)).toBe('0:00');
      expect(MusicPlayerUtils.formatTime(30)).toBe('0:30');
      expect(MusicPlayerUtils.formatTime(65)).toBe('1:05');
      expect(MusicPlayerUtils.formatTime(125)).toBe('2:05');
      expect(MusicPlayerUtils.formatTime(3661)).toBe('61:01');
    });

    test('should handle decimal seconds by flooring', () => {
      expect(MusicPlayerUtils.formatTime(65.7)).toBe('1:05');
      expect(MusicPlayerUtils.formatTime(125.9)).toBe('2:05');
    });

    test('should handle invalid input', () => {
      expect(MusicPlayerUtils.formatTime(null)).toBe('0:00');
      expect(MusicPlayerUtils.formatTime(undefined)).toBe('0:00');
      expect(MusicPlayerUtils.formatTime(NaN)).toBe('0:00');
      expect(MusicPlayerUtils.formatTime('invalid')).toBe('0:00');
    });

    test('should handle large time values', () => {
      expect(MusicPlayerUtils.formatTime(3599)).toBe('59:59');
      expect(MusicPlayerUtils.formatTime(7200)).toBe('120:00');
    });
  });
});

