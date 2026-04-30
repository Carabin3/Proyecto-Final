
const nodemailer = require('nodemailer');



const transporte = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: 'soporteuniversidad8@gmail.com',
        pass: 'mijg xqtq tdqb hqsu'
    }
})


function enviarcorreo(email , asunto , mensaje){
    const mailoptions ={
    from: 'soporteuniversidad8@gmail.com',
    to: email,
    subject: asunto,
    text: mensaje

    };


    transporte.sendMail(mailoptions , (err , info)=>{
        if(err){
            console.log('Error enviando correo', err);
        }else{
            console.log('correo enviado' , info.response);
        }
    });
}


module.exports = {enviarcorreo};
