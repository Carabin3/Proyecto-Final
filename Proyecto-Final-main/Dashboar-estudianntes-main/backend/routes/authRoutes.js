const express = require('express');
const router = express.Router();

const conexion = require('../db/conection');
const { enviarcorreo } = require('../utils/mailer');

router.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.send('Faltan datos');
  }

  conexion.query(
    'SELECT * FROM usuarios WHERE correo = $1 AND contrasena = $2',
    [email, password],
    (err, result) => {
      if (err) return res.status(500).send('error');

      if (result.rows.length === 0) {
        return res.send('Credenciales inválidas1');
      }

      const user = result.rows[0];

      if (role && user.rol !== role) {
        return res.send('Credenciales inválidas2');
      }

      if (user.rol === 'estudiante') {
        conexion.query(
          'SELECT * FROM estudiantes WHERE id_estudiante = $1',
          [user.id_usuario],
          (err2, result2) => {
            if (err2) return res.status(500).send('error4');

            if (result2.rows.length === 0) {
              return res.send('No se encontró el estudiante');
            }

            const estudiante = result2.rows[0];

            if (!estudiante.programa_academico) {
              return res.json({
                rol: user.rol,
                redirectUrl: `/completar-estudiante.html?id=${user.id_usuario}`,
              });
            }

            return res.json({
              rol: user.rol,
              redirectUrl: '/dashboard.html',
            });
          }
        );
        return;
      }

      if (user.rol === 'administrador') {
        return res.json({
          rol: user.rol,
          redirectUrl: '/admin/index.html',
        });
      }

      return res.status(403).json({
        message: 'Rol no permitido',
      });
    }
  );
});

router.post('/completar-estudiante', (req, res) => {
  const { programa_academico, id_estudiante } = req.body;

  if (!programa_academico || !id_estudiante) {
    return res.send('Faltan datos');
  }

  conexion.query(
    'UPDATE estudiantes SET programa_academico = $1 WHERE id_estudiante = $2',
    [programa_academico, id_estudiante],
    (err, result) => {
      if (err) return res.status(500).send('error5');

      if (result.rowCount === 0) {
        return res.send('No se encontró el usuario');
      }

      return res.json({
        success: true,
        redirectUrl: '/dashboard.html',
      });
    }
  );
});

router.post('/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const regex = /^[a-zA-Z0-9._%+-]+@pascualbravo\.edu\.co$/;

  if (!regex.test(email)) {
    return res.status(400).send('solo se permiten correos institucionales: @pascualbravo.edu.co');
  }

  if (!['estudiante', 'profesor', 'administrador'].includes(role)) {
    return res.status(400).send('Rol inválido');
  }

  conexion.query('SELECT * FROM usuarios WHERE correo = $1', [email], (err, result) => {
    if (err) return res.json(err);
    if (result.rows.length > 0) {
      return res.status(400).send('el correo ya esta registrado');
    }

    conexion.query(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario',
      [firstName, lastName, email, password, role],
      (err2, result2) => {
        if (err2) return res.send(err2);

        const id_usuario = result2.rows[0].id_usuario;

        const registroOk = () =>
          res.status(201).json({
            success: true,
            message: '¡Registro exitoso! Ahora puedes iniciar sesión',
          });

        if (role === 'estudiante') {
          conexion.query('INSERT INTO estudiantes (id_estudiante) VALUES ($1)', [id_usuario], (err3) => {
            if (err3) return res.status(500).send('error');
            return registroOk();
          });
        } else if (role === 'profesor') {
          conexion.query('INSERT INTO profesores (id_usuario) VALUES ($1)', [id_usuario], (err3) => {
            if (err3) return res.status(500).send('error');
            return registroOk();
          });
        } else if (role === 'administrador') {
          conexion.query('INSERT INTO administradores (id_usuario) VALUES ($1)', [id_usuario], (err3) => {
            if (err3) return res.status(500).send('error');
            return registroOk();
          });
        }
      }
    );
  });
});

router.post('/forgot-password', (req, res) => {
  const crypto = require('crypto');
  const { email } = req.body;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  conexion.query(
    'UPDATE usuarios SET token = $1, reset_expires = $2 WHERE correo = $3',
    [token, expires, email],
    (err, result) => {
      if (err) return res.status(500).send('error');
      if (result.rowCount === 0) {
        return res.status(404).send('correo no encontrado');
      }

      const link = `http://127.0.0.1:3000/reset-password?token=${token}`;

      enviarcorreo(email, 'Recuperacion', `Haz click aqui: ${link}`);

      return res.json({ message: 'Exito' });
    }
  );
});

router.get('/reset-password', (req, res) => {
  const { token } = req.query;

  conexion.query(
    'SELECT * FROM usuarios WHERE token = $1 AND reset_expires > NOW()',
    [token],
    (err, result) => {
      if (err) return res.status(500).send('error');

      if (result.rows.length === 0) {
        return res.send('Token inválido o expirado');
      }

      return res.json({
        message: 'Exito',
        redirectUrl: `/nueva-contrasena.html?token=${token}`,
      });
    }
  );
});

router.post('/new-password', (req, res) => {
  const { token, password } = req.body;

  conexion.query(
    'SELECT * FROM usuarios WHERE token = $1 AND reset_expires > NOW()',
    [token],
    (err, result) => {
      if (err) return res.status(500).send('error');

      if (result.rows.length === 0) {
        return res.send('credenciales invalidos o expiro');
      }

      const user = result.rows[0];
      const id = user.id_usuario;

      conexion.query(
        'UPDATE usuarios SET token = NULL, reset_expires = NULL, contrasena = $1 WHERE id_usuario = $2',
        [password, id],
        (err2, result2) => {
          if (err2) return res.status(500).send('error');
          if (result2.rowCount === 0) {
            return res.send('no hay ningun usuario identificado');
          }

          return res.json({ message: 'Exito' });
        }
      );
    }
  );
});

module.exports = router;
