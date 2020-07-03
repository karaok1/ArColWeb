const express = require('express')
const router = express.Router()
const LicenseUser = require('../models/LicenseUser');
var CryptoJS = require("crypto-js");

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

function DecryptData(encText) {
    var encryptData = encText
    console.log(`Raw date: ${encText}`)

    try {
        //Creating the Vector Key
        var iv = CryptoJS.enc.Hex.parse('e84ad660c4721ae0e84ad660c4721ae0');
        //Encoding the Password in from UTF8 to byte array
        var Pass = CryptoJS.enc.Utf8.parse('insightresult');
        //Encoding the Salt in from UTF8 to byte array
        var Salt = CryptoJS.enc.Utf8.parse("insight123resultxyz");
        //Creating the key in PBKDF2 format to be used during the decryption
        var key128Bits1000Iterations = CryptoJS.PBKDF2(Pass.toString(CryptoJS.enc.Utf8), Salt, { keySize: 128 / 32, iterations: 1000 });
        //Enclosing the test to be decrypted in a CipherParams object as supported by the CryptoJS libarary
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(encryptData)
        });

        //Decrypting the string contained in cipherParams using the PBKDF2 key
        var decrypted = CryptoJS.AES.decrypt(cipherParams, "lol", key128Bits1000Iterations, { mode: CryptoJS.mode.CBC, iv: iv, padding: CryptoJS.pad.Pkcs7 });
        console.log(`Decrypted date: ${decrypted.toString(CryptoJS.enc.Utf8)}`)
    }
    //Malformed UTF Data due to incorrect password
    catch (err) {
        console.log("Malformed UTF Data due to incorrect password")
    }
}

const today = new Date()
const endDate = new Date(today)
endDate.setDate(endDate.getDate() + 2)

router.post('/checkLicense', (req, res) => {

    const response = {
        status: null
    };

    // DecryptData(req.body.expirationDate)

    LicenseUser.findOneAndUpdate(
        { hWID: req.body.hWID }, 
        { 
            $setOnInsert: { 
                expirationDate: endDate, 
                timeStamp: req.body.timeStamp
            }
        },
        { upsert: true, new: true, runValidators: true }, 
        (err) => {
            console.log(err)
        })
        .then((doc) => {
            response.status = doc.expirationDate > new Date() ? true : false
            response.expirationDate = doc.expirationDate
            res.send(response)
            console.log(doc)
            console.log(response)
    })
})

module.exports = router