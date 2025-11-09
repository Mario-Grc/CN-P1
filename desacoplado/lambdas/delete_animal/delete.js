import db from './postgres_db.js';
import { httpResponse, httpError } from './lambda-helpers.js';

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    
    const deleted = await db.deleteAnimal(id);
    
    if (!deleted) {
      return httpError(404, 'Animal not found');
    }
    
    // Éxito sin contenido
    return httpResponse(204, null); 
    
  } catch (err) {
    return httpError(500, err.message || 'Internal server error');
  }
};