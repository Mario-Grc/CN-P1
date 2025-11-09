import db from './postgres_db.js';
import { httpResponse, httpError } from './lambda-helpers.js';

export const handler = async (event) => {
  try {
    const animals = await db.getAllAnimals();
    return httpResponse(200, animals);
    
  } catch (err) {
    return httpError(500, err.message || 'Internal server error');
  }
};