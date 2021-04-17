const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Users = require('../models/Users')
const { isAuthenticated } = require('../auth')
const router = express.Router()


const signToken = (_id) => {
  return jwt.sign({ _id }, 'my-secret', {
    expiresIn: 60 * 60 * 24 * 365
  })
}

router.post('/register', (req, res) => {
  const { email, password } = req.body
  crypto.randomBytes(16, (err, salt) => {
    const newSalt = salt.toString('base64')
    crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
      const encryptedPassword = key.toString('base64')

      Users.findOne({ email }).exec()
        .then(user => {
          if (user) {
            return res.send('User already exists')
          }

          Users.create({
            email,
            password: encryptedPassword,
            salt: newSalt
          }).then(() => {
            res.send('User has been created successfully')
          })
        })
    })
  })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  Users.findOne({ email }).exec()
    .then(user => {
      if (!user) {
        res.send('User and/or password is incorrect')
      }

      crypto.pbkdf2(password, user.salt, 10000, 64, 'sha1', (err, key) => {
        const encryptedPassword = key.toString('base64')

        if (user.password === encryptedPassword) {
          const token = signToken(user._id)
          return res.send({ token })
        }

        res.send('User and/or password is incorrect')
      })
    })
})

router.get('/me', isAuthenticated, (req, res) => {
  res.send(req.user)
})

module.exports = router
