import express from 'express';
import { AnimalSchema } from './animal.js';
import db from './postgres_db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  next();
});

// POST /animals
app.post('/animals', async (req, res) => {
  try {
    const animal = AnimalSchema.parse(req.body);
    await db.createAnimal(animal);
    res.status(201).json(animal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /animals/:id
app.get('/animals/:id', async (req, res) => {
  const animal = await db.getAnimal(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });
  res.json(animal);
});

// GET /animals
app.get('/animals', async (_, res) => {
  const animals = await db.getAllAnimals();
  res.json(animals);
});

// PUT /animals/:id
app.put('/animals/:id', async (req, res) => {
  try {
    const updated = await db.updateAnimal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Animal not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /animals/:id
app.delete('/animals/:id', async (req, res) => {
  const deleted = await db.deleteAnimal(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Animal not found' });
  res.status(204).send();
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'healthy' }));

app.listen(8080, () => console.log('Server running on port 8080'));
