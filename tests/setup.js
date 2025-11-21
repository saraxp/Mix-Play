// JEST SETUP FILE

// object to hold localStorage data
const localStorageStore = {};

// localStorage mock 
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: jest.fn()
};

// Helper function to restore default localStorage implementations
function restoreLocalStorageDefaults() {
  localStorageMock.getItem.mockImplementation((key) => {
    return localStorageStore[key] || null;
  });
  
  localStorageMock.setItem.mockImplementation((key, value) => {
    localStorageStore[key] = value.toString();
  });
  
  localStorageMock.removeItem.mockImplementation((key) => {
    delete localStorageStore[key];
  });
  
  localStorageMock.clear.mockImplementation(() => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  });
  
  localStorageMock.key.mockImplementation((index) => {
    const keys = Object.keys(localStorageStore);
    return keys[index] || null;
  });
}

// initial default implementations
restoreLocalStorageDefaults();

global.localStorage = localStorageMock;

global.fetch = jest.fn();

// Reset mocks and storage before each test
beforeEach(() => {
  for (const key in localStorageStore) {
    delete localStorageStore[key];
  }
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.key.mockClear();
  
  global.fetch.mockClear();
});

