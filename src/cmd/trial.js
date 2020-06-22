const Discord = require("discord.js");
const log = require('../utils/log')
const Post = require('../models/DiscordUser')

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

let date = new Date();
let trialFinish = date.addDays(7);
var d = trialFinish,
dformat = [d.getDate(),
       d.getMonth()+1,
       d.getFullYear()].join('/')+' '+
      [d.getHours(),
       d.getMinutes(),
       d.getSeconds()].join(':');

exports.run = (client, message, params) => {
    let trialembed = new Discord.RichEmbed()
        .setTitle("Premium activated")
        .setDescription("** Premium is activated for " + message.author.username + " ** ") /** ruser declares the user that was removed. **/
        .setColor("#3937a5")
        .attachFile('./assets/premium.png')
        .setThumbnail('attachment://premium.png', 300, 300)
        .addField("Time assigned:", message.createdAt, true)
        .addField("Lasts until: ", `${dformat}`, true)

    let trialuser = new Discord.RichEmbed()
        .setTitle("Already a premium member!")
        .setImage("https://i.pinimg.com/564x/e9/33/f8/e933f8b55c9de86fb8c832428e943e03.jpg")

    let alreadyused = new Discord.RichEmbed()
        .setTitle(" Trial expired or already used.")
        .setFooter( `${message.author.tag} `)
        .setImage("https://66.media.tumblr.com/tumblr_m5yig6JjC61roq0rxo1_500.gif")

    let member = message.member
    if (!member.roles.has(process.env.TRIAL_ID)) {
        Post.collection.dropIndexes(function (err, results) {
            console.log(results)
        });
        Post.findOne(
            { discordId: member.id },
            { useFindAndModify: false },
            (err, doc) => {
                if (err) {
                    console.log(err)
                } 
                else if (doc && doc.trialUsed) {
                    member.guild.channels
                        .find(channel => channel.id === process.env.BOT_COMMAND_CHANNEL_ID)
                        .send(message.author, alreadyused)
                }
                else {
                    Post.findOneAndUpdate(
                        { discordId: member.id }, 
                        { 
                            $set: { 
                                expirationDate: trialFinish, 
                                trialUsed: true 
                            }
                        },
                        { upsert: true, new: true }, 
                        (err) => {
                            console.log(err)
                        })
                        .then((doc) => {
                            member.addRole(process.env.TRIAL_ID)
                                .then(() => {
                                    member.guild.channels.find(channel => channel.id === process.env.BOT_COMMAND_CHANNEL_ID)
                                        .send(trialembed)
                                    }).catch((error) => log(error))
                            console.log(doc)
                    })
                }
            })
        }
        else {
            member.guild.channels.find(channel => channel.id === process.env.BOT_COMMAND_CHANNEL_ID)
                .send(trialuser)
            return;
        }

    }

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};
  
exports.help = {
    name: "trial",
    description: "Start the trial for 7 days",
    usage: "trial"
};