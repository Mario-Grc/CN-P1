import db from './postgres_db.js';
import { httpResponse, httpError } from './lambda-helpers.js';

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const updates = JSON.parse(event.body);
    
    // El updateAnimal de tu postgres_db.js ya valida con Zod partial
    const updatedAnimal = await db.updateAnimal(id, updates);
    
    if (!updatedAnimal) {
      return httpError(404, 'Animal not found');
    }
    
    return httpResponse(200, updatedAnimal);

  } catch (err) {
    // Manejo de errores de validación de Zod u otros
    return httpError(400, err.message || 'Invalid request data');
  }
};