import pkg from 'pg';
import { AnimalSchema } from './animal.js';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});


async function initialize() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS animals (
      animal_id       VARCHAR(36) PRIMARY KEY,
      name            VARCHAR(100) NOT NULL,
      species         VARCHAR(100) NOT NULL,
      status          VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'medical', 'reserved')),
      size            VARCHAR(10) DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
      notes           TEXT,
      arrival_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      traits          JSONB
    );
  `);
}
initialize();

export default {
  async createAnimal(animal) {
    const sql = `
      INSERT INTO animals (animal_id, name, species, status, size, notes, arrival_date, last_updated, traits)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;
    await pool.query(sql, [
      animal.animal_id,
      animal.name,
      animal.species,
      animal.status,
      animal.size,
      animal.notes,
      animal.arrival_date,
      animal.last_updated,
      JSON.stringify(animal.traits),
    ]);
    return animal;
  },

  async getAnimal(id) {
    const result = await pool.query('SELECT * FROM animals WHERE animal_id=$1', [id]);
    return result.rows[0] || null;
  },

  async getAllAnimals() {
    const result = await pool.query('SELECT * FROM animals ORDER BY arrival_date DESC');
    return result.rows;
  },

  async updateAnimal(id, updates) {
    const current = await this.getAnimal(id);
    if (!current) return null;

    const updated = { ...current, ...updates, last_updated: new Date().toISOString() };
    const validated = AnimalSchema.partial().parse(updated);

    await pool.query(
      `UPDATE animals SET name=$1, species=$2, status=$3, size=$4, notes=$5, traits=$6, last_updated=$7 WHERE animal_id=$8`,
      [
        validated.name,
        validated.species,
        validated.status,
        validated.size,
        validated.notes,
        JSON.stringify(validated.traits),
        validated.last_updated,
        id,
      ]
    );
    return validated;
  },

  async deleteAnimal(id) {
    const result = await pool.query('DELETE FROM animals WHERE animal_id=$1', [id]);
    return result.rowCount > 0;
  },
};
