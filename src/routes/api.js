const express = require('express')
const router = express.Router()
const DiscordUser = require('../models/DiscordUser');

router.get('/', async (req, res) => {
    try {
        const posts = await DiscordUser.find();
        res.json(posts);
    }
    catch(err) {
        res.json({ message: err })
    }
})

router.post('/', async (req, res) => {
    const post = new DiscordUser({
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
        const post = await DiscordUser.findById(req.params._id)
        res.json(post)
    }
    catch (err) {
        res.json({message: err})
    }
})

// Delete POST
router.delete('/:postId', async (req, res) => {
    try {
        const removedPost = await DiscordUser.remove({_id: req.params.postId})
        res.json(removedPost)
    }
    catch(err) {
        res.json({message: err})
    }
})

// Update a POST

router.patch('/:postId', async (req, res) => {
    try {
        const updatedPost = await DiscordUser.updateOne(
            { _id: req.params.postId }, 
            { $set: {title: req.body.title }})
        res.json(updatedPost)
    } 
    catch (err) {
        res.json({ message: err })
    }
})



router.post('/checkRole', (req, res) => {

    const response = {
        discordId: req.body.discordId,
        playerId: req.body.playerId,
        hasRole: null,
        trialExpired: null,
        error: null
    };

    const guild = client.guilds.find(guild => guild.id === process.env.GUILD_ID)
    let member = guild.members.get(req.body.discordId); // member ID

    if (guild == null) {
        response.error = 'Invalid guild!'
        console.log(response.error)
        res.send(response)
        return;
    }

    if (!member || !member.roles) 
    {
        response.error = 'There is no such member with an ID of: \'', req.body.id, '\''
        console.log(response.error)
        res.send(response)
        return;
    }
        
    DiscordUser.findOne(
        { discordId: req.body.discordId }, 
        { useFindOneAndModify: false },
        (err, doc) => {
            if (err != null) {
                res.send(err)
                return;
            }

            response.hasRole = member.roles.has(process.env.TRIAL_ID)
            if (response.hasRole) {
                console.log('Has role')
                response.trialExpired = doc.expirationDate < Date.now() ? true : false;
                if (response.trialExpired) {
                    console.log('Trial expired, removing role...')
                    member.removeRole(process.env.TRIAL_ID)
                        .then(() => console.log('Role removed'))
                        .catch((err) => log(err))
                }
            }
        })
        .then((doc) => {
            res.send(response)
        })
})

module.exports = router