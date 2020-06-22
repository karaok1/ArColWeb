const Discord = require("discord.js");

exports.run = (client, message, params) => {
  let embedsay = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setAuthor(message.author.tag, message.author.avatarURL)
  .setDescription(`${params[0]}`)
  message.channel.send(embedsay);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['status'],
  permLevel: 4
};

exports.help = {
  name: "dev",
  description: "A quick test to see if the bot is working",
  usage: "dev"
};