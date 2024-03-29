const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const LicenseUser = require('../models/LicenseUser');
require('dotenv').config({path:__dirname+'/./../.env'})

passport.serializeUser((user, done) => {
    console.log("Serialize");
    done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    console.log("Deserializing");
    const user = await LicenseUser.findById(id);
    if(user) 
        done(null, user);
});

passport.use(new DiscordStrategy({
    clientID: '689514388272578673',
    clientSecret: 'bdYZg4jjrQ9Hfwq9Km0ehsCSIHdK9ftE',
    callbackURL: 'https://akchan.me/auth/redirect',
    scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await LicenseUser.findOne({ discordId: profile.id });
        if(user)
        {
            console.log("User exists.");
            await user.updateOne({
                username: `${profile.username}#${profile.discriminator}`,
                guilds: profile.guilds
            });
            done(null, user);
        }
        else {
            console.log("User does not exist");
            const newUser = await LicenseUser.create({
                discordId: profile.id,
                username: profile.username,
                guilds: profile.guilds
            });
            const savedUser = await newUser.save();
            done(null, savedUser);
        }
    }
    catch(err) {
        console.log(err);
        done(err, null);
    }
}));