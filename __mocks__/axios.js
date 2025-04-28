// Mock for axios
module.exports = {
  defaults: { headers: { common: {} } },
  post: jest.fn(() => Promise.resolve({ 
    data: {
      success: true,
      user_id: 122,
      email: 'mark@gmail.com',
      uid: "yE8vKBNw",
      jwt_token: "eyJhbGciOiJIUzI1NiIsI",
      ip_address: "65.181.9.198"
    }
  })),
  get: jest.fn(() => Promise.resolve({
    data: {
      user: { name: 'Test User' }
    }
  })),
  create: jest.fn(function() { return this; }),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};
