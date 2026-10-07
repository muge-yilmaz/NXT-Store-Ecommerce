import '@testing-library/jest-dom';

// Global fetch mock for Jest tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;


jest.mock('@/lib/stripe', () => ({
  stripe: {},
}));