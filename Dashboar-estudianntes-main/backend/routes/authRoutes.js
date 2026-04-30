const express = require('express');
const router = express.Router();

const conexion  = require('../db/conection');
const {enviarcorreo} = require('../utils/mailer');
const { send } = require('process');


router.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.send('Faltan datos');
  }

  conexion.query(
    'SELECT * FROM Usuarios WHERE correo = ? AND contra = ?',
    [email, password],
    (err, result) => {
      if (err) return res.status(500).send('error');

      if (result.length === 0) {
        return res.send('Credenciales inválidas1');
      }

      const user = result[0];

      if (role && user.rol !== role) {
        return res.send('Credenciales inválidas2');
      }

      // 👉 estudiante
      if (user.rol === 'estudiante') {
        conexion.query(
          'SELECT * FROM Estudiantes WHERE id_usuario = ?',
          [user.id_usuario],
          (err, result) => {
            if (err) return res.status(500).send('error4');

            if (result.length === 0) {
              return res.send('No se encontró el estudiante');
            }

            const estudiante = result[0];

            // 🔥 si no tiene programa → enviar id en la URL
            if (!estudiante.programa) {
              return res.redirect(`/completar-estudiante.html?id=${user.id_usuario}`);
            }

            return res.redirect('/dashboard.html');
          }
        );
      }
    }
  );
});



router.post('/completar-estudiante', (req, res) => {
  const { programa, id_usuario } = req.body;

  if (!programa || !id_usuario) {
    return res.send('Faltan datos');
  }

  conexion.query(
    'UPDATE Estudiantes SET programa = ? WHERE id_usuario = ?',
    [programa, id_usuario],
    (err, result) => {
      if (err) return res.status(500).send('error5');

      if (result.affectedRows === 0) {
        return res.send('No se encontró el usuario');
      }

      return res.send('Programa guardado correctamente. Inicia sesión nuevamente.');
    }
  );
});



router.post('/register' , (req ,res)=>{

const {firstName, lastName , email , password , role} = req.body;


 const regex = /^[a-zA-Z0-9._%+-]+@pascualbravo\.edu\.co$/;

 if(!regex.test(email)){
    return res.status(400).send('solo se permiten correos institucionales: @pascualbravo.edu.co');

 }


 conexion.query('select * from usuarios where usuarios.correo = ?' , [email] , (err , result)=>{
    if(err) return res.json(err);
     if(result.length > 0){
     return res.status(400).send('el correo ya esta registrado');
     }

     
conexion.query('insert into usuarios(nombre , apellido , correo  , contra , rol) values(?,?,?,?,?)', [firstName ,lastName , email, password , role] , (err , result)=>{
    if(err) return res.send(err);

const id_usuario = result.insertId;

if(role ==='estudiante'){
   conexion.query('insert into Estudiantes(id_usuario) values(?)', [id_usuario] , (err , result)=>{
       if(err)  return res.status(500).send('error');
      return res.status(201).send('Datos satisfactoriamente Guardados');
   })
}else if(role ==='profesor'){
   conexion.query('insert into  Profesores(id_usuario) values(?)', [id_usuario] , (err , result)=>{
    if(err)  return res.status(500).send('error');
      return res.status(200).send('Datos satisfactoriamente Guardados');
   })
   
}else if(role === 'administrador') {
  conexion.query('insert into  Administradores(id_usuario) values(?)', [id_usuario] , (err , result)=>{
    if(err)  return res.status(500).send('error');
      return res.status(201).send('Datos satisfactoriamente Guardados');
   })
}else{
   
}
})

 })

});


router.post('/forgot-password' , (req , res)=>{
const crypto = require('crypto');
const {email} = req.body; 


const token = crypto.randomBytes(32).toString('hex');
const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

conexion.query('UPDATE Usuarios set token= ? , reset_expires= ?  where correo =?',[token, expires ,email], (err , result)=>{
   if(err) return  res.status(500).send('error');
   if(result.affectedRows === 0){
      return res.status(404).send('correo no encontrado');
   }

const link = `http://127.0.0.1:3000/reset-password?token=${token}`;

   enviarcorreo(email , 'Recuperacion' , `Haz click aqui: ${link}`);


res.send('enviado');

})

});

router.get('/reset-password', (req, res) => {

  const { token } = req.query;

  conexion.query(
    'SELECT * FROM Usuarios WHERE token = ? AND reset_expires > NOW()',
    [token],
    (err, result) => {
      if (err) return res.status(500).send('error');

      if (result.length === 0) {
        return res.send('Token inválido o expirado');
      }

      res.redirect(`/nueva-contrasena.html?token=${token}`);
    }
  );
});


router.post('/new-password' , (req,res)=>{
  const {token,password} = req.body;

  conexion.query('SELECT * FROM  Usuarios WHERE token=?  and reset_expires > NOW()', [token], (err,result)=>{
   if(err) return res.status(500).send('error');

   if(result.length === 0){
      return res.send('credenciales invalidos o expiro');
   }


   const user  = result[0];
   const id = user.id_usuario;


   conexion.query('UPDATE Usuarios  set token=null, reset_expires=null , contra=? where Usuarios.id_usuario=? ',[password , id], (err,result)=>{
      if(err) return res.status(500).send('error');
      if(result.affectedRows===0){
         return res.send('no hay ningun usuario identificado');
      }


      res.send('Datos correctamente actulizados');

   })





  })




})




module.exports = router; 