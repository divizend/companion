// This file is run before each test file
// Add any global setup here, such as mocking native modules or setting up globals

// Mock Expo modules that might cause issues in tests
jest.mock('expo-font');
jest.mock('expo-asset');

// Mock the react-native-reanimated module
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Add any global mocks here
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
);
