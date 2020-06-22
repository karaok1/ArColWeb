require('dotenv').config()
require('./strategies/discordstrategy')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001;
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const db = require('./database/database')
const path = require('path')
const mongoose = require('mongoose')
const fs = require('fs')
const log = require('./utils/log')
const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios')
const fetch = require("node-fetch");
global.client = client

db.then(() => console.log('Connected to MongoDB.')).catch(err => console.log(err));
// Routes
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');
const apiRoute = require('./routes/api')
const pricingRoute = require('./routes/pricing')
const faqRoute = require('./routes/faq')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'some random secret',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false,
    name: 'discord.oauth2',
    store: new MongoStore({ mongooseConnection:  mongoose.connection })
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware Routes
app.use('/auth', authRoute);
app.use('/dashboard', dashboardRoute);
app.use('/api', apiRoute)
app.use('/pricing', pricingRoute)
app.use('/faq', faqRoute)

const prefix = process.env.PREFIX
const token = process.env.TOKEN

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();

fs.readdir("./cmd/", (err, files) => {
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    let props = require(`./cmd/${f}`);
    log(`Loading Command: ${props.help.name}`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`with ships`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildMemberAdd", function (member) {
  member.addRole(member.guild.roles.find(role => role.id === process.env.MEMBER_ROLE_ID)).then(() => {
    let embedsay = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(`Welcome ${member.user} to **${member.guild.name}**! For more information take a look at the #information channel.`);
    member.guild.channels.find(channel => channel.id === process.env.WELCOME_CHANNEL_ID).send(embedsay);
  }).catch((error) => log(error));
  // const channel = member.guild.channels.find(channel => channel.name === "welcome");
  // if (!channel) return;
  // channel.send(`Welcome to our server, ${member}`);
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if (message.content.indexOf(prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let perms = client.elevation(message);
  let cmd;
  
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
    log(`Called command: ${cmd.help.name}`);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
    log(`Called command: ${cmd.help.name}`);
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return message.channel.send("oops looks like you dont have the right permission level :(");
    cmd.run(client, message, args, perms, prefix);
  }
});
client.login(token);

client.elevation = function (msg) {
  /* This function should resolve to an ELEVATION level which
  is then sent to the command handler for verification*/
  let permlvl = 0;
  
  let mod_role = msg.guild.roles.find(role => role.name, "Member");
  if (mod_role && msg.member.roles.has(mod_role.id)) permlvl = 2;
  
  let admin_role = msg.guild.roles.find(role => role.name, "Higher-up Members");
  if (admin_role && msg.member.roles.has(admin_role.id)) permlvl = 3;
  
  if (msg.author.id === process.env.DEV_ID) permlvl = 4;
  return permlvl;
};

app.get('/', isAuthorized, (req, res) => {
  
  fetch('https://api.github.com/repos/Pengii/ArmadaCollector-bin/releases/latest')
    .then(res => res.json())
     .then(release => {
      var asset = release.assets[0];
      var downloadCount = 0;
      for (var i = 0; i < release.assets.length; i++) {
        downloadCount += release.assets[i].download_count;
      }
      var oneHour = 60 * 60 * 1000;
      var oneDay = 24 * oneHour;
      var dateDiff = new Date() - new Date(asset.updated_at);
      var timeAgo;
      if (dateDiff < oneDay) {
        timeAgo = (dateDiff / oneHour).toFixed(1) + " hours ago";
      } else {
        timeAgo = (dateDiff / oneDay).toFixed(1) + " days ago";
      }
      
      res.render('home', {
        releaseName: release.name,
        timeAgo: timeAgo,
        downloadCount: downloadCount
      });
  })
  .catch(err => {
    console.log(err)
    res.render('home');
  })
  
});

function isAuthorized(req, res, next) {
    if(req.user) {
        console.log("User is logged in.");
        res.redirect('/dashboard');
    }
    else {
        console.log("User is not logged in.");
        next();
    }
}

app.listen(PORT, () => console.log(`Now listening to requests on port ${PORT}`));