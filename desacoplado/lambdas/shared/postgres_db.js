import pkg from 'pg';
const { Pool } = pkg;

// Configura la conexión a PostgreSQL usando variables de entorno
// Estas variables las defines en el CloudFormation (DB_HOST, DB_NAME, etc.)
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // necesario si RDS usa SSL
});

// Función para crear la tabla si no existe
const ensureTableExists = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS animals (
      animal_id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      species VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'available',
      size VARCHAR(20) DEFAULT 'medium',
      notes TEXT,
      arrival_date TIMESTAMP DEFAULT NOW(),
      last_updated TIMESTAMP DEFAULT NOW(),
      traits TEXT[]
    );
  `;
  await pool.query(query);
};

// Crear un nuevo animal
async function createAnimal(animal) {
  await ensureTableExists(); // Asegura que la tabla existe

  const query = `
    INSERT INTO animals (animal_id, name, species, status, size, notes, arrival_date, last_updated, traits)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;

  const values = [
    animal.animal_id,
    animal.name,
    animal.species,
    animal.status,
    animal.size,
    animal.notes || null,
    animal.arrival_date,
    animal.last_updated,
    animal.traits || [],
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Obtener todos los animales
async function getAllAnimals() {
  await ensureTableExists(); // Asegura que la tabla existe

  const { rows } = await pool.query('SELECT * FROM animals ORDER BY arrival_date DESC;');
  return rows;
}

// Obtener un animal por ID
async function getAnimalById(id) {
  await ensureTableExists(); // Asegura que la tabla existe

  const { rows } = await pool.query('SELECT * FROM animals WHERE animal_id = $1;', [id]);
  return rows[0];
}

// Actualizar un animal
async function updateAnimal(id, updates) {
  await ensureTableExists(); // Asegura que la tabla existe

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }

  values.push(id); // último parámetro: el id
  const query = `
    UPDATE animals
    SET ${fields.join(', ')}, last_updated = NOW()
    WHERE animal_id = $${idx}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Eliminar un animal
async function deleteAnimal(id) {
  await ensureTableExists(); // Asegura que la tabla existe

  const { rowCount } = await pool.query('DELETE FROM animals WHERE animal_id = $1;', [id]);
  return rowCount > 0;
}

// Exportar las funciones
export default {
  createAnimal,
  getAllAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
};
