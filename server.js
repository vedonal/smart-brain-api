const express = require('express');
const BodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const knex = require('knex');
const register = require('./controllers/Register');
const signin = require('./controllers/Signin');
const profile = require('./controllers/Profile');
const image = require('./controllers/Image');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    host: process.env.DATABASE_HOST,
    port: 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PW,
    database: process.env.DATABASE_DB

    },
});

const app = express();

app.use(BodyParser.json());

app.get('/', (req, res) => { res.send('It is working')});
app.post('/signin', (req,res) => { signin.handleSignIn(req, res, db, bcrypt )});
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt)});
app.get('/profile/:id', (req, res) => { profile.handleProfile(req, res, db)});
app.put('/image', (req, res) => { image.handleImage(req, res, db)})

app.listen(process.env.PORT || 3000, () => {
  console.log(`The app is running on port ${process.env.PORT}`);
})