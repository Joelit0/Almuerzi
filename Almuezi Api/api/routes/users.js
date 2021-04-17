const express = require('express')
const Users = require('../models/Users')
const router = express.Router()

router.get('/:id', (req, res) => {
  Users.findById(req.params.id)
    .exec()
    .then(x => res.status(200).send(x))
})

module.exports = router
