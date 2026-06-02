import dotenv from "dotenv";

dotenv.config();

// Mock Redis object that mimics the interface but does nothing
const mockRedis = {
  // Cache to simulate Redis functionality locally
  cache: {},
  
  // Mock get method
  async get(key) {
    console.log(`[Redis Mock] Getting key: ${key}`);
    return this.cache[key];
  },
  
  // Mock set method
  async set(key, value, options) {
    console.log(`[Redis Mock] Setting key: ${key}`);
    this.cache[key] = value;
    return "OK";
  },
  
  // Mock quit method
  quit() {
    console.log("[Redis Mock] Quitting connection");
    return Promise.resolve("OK");
  },
  
  // Mock disconnect method
  disconnect() {
    console.log("[Redis Mock] Disconnecting");
    return Promise.resolve();
  },
};

export const redis = mockRedis;
