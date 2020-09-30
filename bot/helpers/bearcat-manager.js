const collectors = require(`./collectors`);
const database = require(`./database-manager`);

const regexEmail = RegExp(`^.+@((uc)?mail.)?uc.edu$`);

const userTimeout = {};

// Exports
module.exports = {verifyUser};

// Exported Functions
async function verifyUser(msg) {
  if (userTimeout[msg.author.id] === `active`) {
    msg.reply(`you're already attempting verification right now.`);
  }

  if (userTimeout[msg.author.id] && (userTimeout[msg.author.id] + 300000) > Date.now()) {
    msg.reply(`you've already tried verification recently, try again later.`);
  }

  let DMChannel;
  let startedFromDM = false;

  if (msg.channel.type === `dm`) {
    DMChannel = msg;
    startedFromDM = true;
    DMChannel.send(`This process verifies that you are a student at UC.\nIn order to do so, we email you a verification code to your UC email.\nWith that being said, what is your UC Email?`);
  } else {
    DMChannel = await msg.author.createDM();
    DMChannel.send(`This process verifies that you are a student at UC.\nIn order to do so, we email you a verification code to your UC email.\nWith that being said, what is your UC Email?`);
    msg.reply(`you have been sent a DM for the verification process.`);
  }

  const email = await collectors.oneMessageFromUser(DMChannel, msg.author.id);

  if (email && regexEmail.test(email)) {
    DMChannel.send(`Attempting to email you...`);

    if (startedFromDM) {
      DMChannel.send(`Your Email has been saved.\nIn order to get a verified role, run this command again from the server you want the role in.  You will not be asked to verify your email again.\nIf you'd like to complete your user profile for meeting sign-in, run the "profile-setup" command.`);
    } else {
      const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});
      if (guildSettings.verifiedRoleID) {
        const role = msg.guild.roles.cache.get(guildSettings.verifiedRoleID);
        if (role) {
          DMChannel.send(`Your Email has been saved and you now have the ${role.name} role in ${msg.guild.name}.\nIf you'd like to complete your user profile for meeting sign-in, run the "profile-setup" command.`);
        } else {
          DMChannel.send(`Your Email has been saved.  The server you verified in doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.  You will not be asked to verify your email again.\nIf you'd like to complete your user profile for meeting sign-in, run the "profile-setup" command.`);
        }
      } else {
        DMChannel.send(`Your Email has been saved.  The server you verified in doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.  You will not be asked to verify your email again.\nIf you'd like to complete your user profile for meeting sign-in, run the "profile-setup" command.`);
      }
    }
    // eslint-disable-next-line require-atomic-updates
    userTimeout[msg.author.id] = 0;
  } else {
    DMChannel.send(`That is not a valid UC Email.  Please try again in 5 minutes.`);
    // eslint-disable-next-line require-atomic-updates
    userTimeout[msg.author.id] = Date.now();
  }
}
