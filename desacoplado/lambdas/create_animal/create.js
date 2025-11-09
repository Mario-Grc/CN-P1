import db from './postgres_db.js';
import { AnimalSchema } from './animal.js';
import { httpResponse, httpError } from './lambda-helpers.js';

export const handler = async (event) => {
  try {
    // El body viene como un string, hay que parsearlo
    const body = JSON.parse(event.body);
    
    // Validar los datos con el esquema
    const animal = AnimalSchema.parse(body);
    
    const newAnimal = await db.createAnimal(animal);
    return httpResponse(201, newAnimal);
    
  } catch (err) {
    // Manejo de errores de validación de Zod
    return httpError(400, err.message || 'Invalid request data');
  }
};