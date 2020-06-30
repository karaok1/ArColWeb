const express = require('express')
const router = express.Router()
const LicenseUser = require('../models/LicenseUser');

router.get('/', async (req, res) => {
    try {
        const posts = await LicenseUser.find();
        res.json(posts);
    }
    catch(err) {
        res.json({ message: err })
    }
})

router.post('/', async (req, res) => {
    const post = new LicenseUser({
        discordId: req.body.discordId,
        playerId: req.body.playerId,
        expirationDate: Date.now()
    })

    try {
        const savedPost = await post.save()
        res.json(savedPost)
    }
    catch(err) {
        res.json({message: err})
    }
})

// Specific POST
router.get('/:_id', async (req, res) => {
    try {
        const post = await LicenseUser.findById(req.params._id)
        res.json(post)
    }
    catch (err) {
        res.json({message: err})
    }
})

// Delete POST
router.delete('/:postId', async (req, res) => {
    try {
        const removedPost = await LicenseUser.remove({_id: req.params.postId})
        res.json(removedPost)
    }
    catch(err) {
        res.json({message: err})
    }
})

// Update a POST

router.patch('/:postId', async (req, res) => {
    try {
        const updatedPost = await LicenseUser.updateOne(
            { _id: req.params.postId }, 
            { $set: {title: req.body.title }})
        res.json(updatedPost)
    } 
    catch (err) {
        res.json({ message: err })
    }
})

const today = new Date()
const endDate = new Date(today)
endDate.setDate(endDate.getDate() + 2)

router.post('/checkLicense', (req, res) => {

    const response = {
        status: null
    };

    LicenseUser.findOneAndUpdate(
        { hWID: req.body.hWID }, 
        { 
            $set: { 
                expirationDate: endDate, 
                timeStamp: req.body.timeStamp
            }
        },
        { upsert: true, new: true }, 
        (err) => {
            console.log(err)
        })
        .then((doc) => {
            response.status = doc.expirationDate > Date.now() ? true : false
            response.expirationDate = doc.expirationDate
            res.send(response)
            console.log(doc)
            console.log(response)
    })
})

module.exports = router