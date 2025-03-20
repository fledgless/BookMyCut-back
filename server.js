const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api/users', usersRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log('Serveur demarré sur le port ' + port);
})

