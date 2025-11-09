import db from './postgres_db.js';
import { httpResponse, httpError } from './lambda-helpers.js';

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    
    const animal = await db.getAnimalById(id);
    
    if (!animal) {
      return httpError(404, 'Animal not found');
    }
    
    return httpResponse(200, animal);
    
  } catch (err) {
    return httpError(500, err.message || 'Internal server error');
  }
};