import '@testing-library/jest-dom';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export async function setupTestDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

// Limpiar colecciones entre tests
export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// Cierre completo de DB
export async function teardownTestDB() {
  await mongoose.disconnect();
  await mongod.stop();
}

// Hooks globales para Vitest
beforeAll(async () => await setupTestDB());
afterEach(async () => await clearDB());
afterAll(async () => await teardownTestDB());
