
const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.urlencoded({extended: true}));


app.use('/assets' , express.static(path.join(__dirname , '../frontend/assets')));

// rutas (después)
app.use(require('./routes/authRoutes') );

app.listen(3000, () => {
    console.log('Servidor en puerto 3000');
});