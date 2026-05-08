const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'AppStudents',
  port: 5432,
  password: '1234',
});

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    let detalle = `Error de conexión a PostgreSQL: ${err.message}`;

    if (err.code === '28P01') {
      detalle = `Fallo de autenticación: revisa la contraseña del usuario "${pool.options.user}".`;
    } else if (err.code === '28000') {
      detalle = `Fallo de autenticación: revisa el usuario "${pool.options.user}" y su contraseña.`;
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      detalle = `No se pudo conectar al host "${pool.options.host}" en el puerto ${pool.options.port}.`;
    } else if (err.code === '3D000') {
      detalle = `La base de datos "${pool.options.database}" no existe o no es accesible.`;
    }

    console.error(detalle);
    return console.error(`Detalle técnico [${err.code || 'sin-código'}]: ${err.message}`);
  }

  console.log(`Conexión PostgreSQL exitosa. Hora del servidor: ${result.rows[0].now}`);
});

module.exports = pool;
