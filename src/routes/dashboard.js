const { authorize } = require('passport');

const router = require('express').Router();

function isAuthorized(req, res, next) {
    if(req.user) {
        console.log("User is logged in.");
        console.log(req.user);
        next();
    }
    else {
        console.log("User is not logged in.");
        res.redirect('/');
    }
}

router.get('/', isAuthorized, (req, res) => {

    console.log(req.user)
    res.render('dashboard', {
        username: req.user.username,
        discordId: req.user.discordId,
        trialUsed: req.user.trialUsed,
        expirationDate: req.user.expirationDate
    });
});

router.get('/settings', isAuthorized, (req, res) => {
    res.send(200);
});

module.exports = router;