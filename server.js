const express = require('express');
const BodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'livescore.com',
    database: 'smart-brain'
  }
});


const app = express();


app.use(BodyParser.json());
app.use(cors());

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {

      bcrypt.compare(req.body.password, data[0].hash, function (err, result) {
        if (err) throw new Error(err);
        if (result) {
          return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
          res.status(400).json('wrong credentials')
        }
      });
    })


})


app.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  bcrypt.hash(password, 10, function (err, hash) {
    if (err) throw new Error(err);

    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          return trx('users')
            .returning('*')
            .insert({
              'email': loginEmail[0],
              'name': name,
              'joined': new Date()
            })
            .then(user => {
              res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
      .catch(err => res.status(400).json('unable to reigster'))
  })
})


app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id: id })
    .then(user => {
      if (user.length)
        res.json(user)
      else {
        res.status(400).json('error, user not found!')
      }
    })
})

app.put('/image', (req, res) => {
  const { id } = req.body;

  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    })
    .catch(err => {
      res.status(400).json('unable to get entries')
    })
})

app.listen(3000, () => {
  console.log('The app is running on port 3000');
})