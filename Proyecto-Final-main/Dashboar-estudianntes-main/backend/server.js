const express = require('express');
const app = express();
const path = require('node:path'); 

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/admin', express.static(path.join(__dirname, '../frontend-admin/Admin-main/Admin-main')));
app.use(express.urlencoded({ extended: true }));


app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));


app.use(require('./routes/authRoutes'));

app.listen(3000, () => {
 
});


