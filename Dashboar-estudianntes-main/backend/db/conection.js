const mysql = require('mysql2');


const conexion = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'12345',
    database: 'Universidad'


});


conexion.connect(err =>{
    if(err){
        return console.log(err);
    }else{
      console.log('conectado a mysql');
    }
});


module.exports = conexion;

