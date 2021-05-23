const settings = require(`./settings-manager`);
const collectors = require(`./collectors`);
const database = require(`./database-manager`);

const Crypto = require('crypto');

const nodemailer = require('nodemailer');

const regexEmail = RegExp(`^.+@((uc)?mail.)?uc.edu$`);

const userTimeouts = new Map();

let emailer;

// Exports
module.exports = {prepEmail, verifyUser, setupProfile};

// Exported Functions
function prepEmail() {
  emailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.getAuth().gmailUN,
      pass: settings.getAuth().gmailPW,
    },
  });
}

async function verifyUser(msg) {
  const userStatus = userTimeouts.get(msg.author.id);
  if (userStatus) {
    if (userStatus.status === `active`) {
      msg.reply(`You're already attempting verification right now.`);
      return;
    }

    if (userStatus.status === `timeout` && (userStatus.timeout + 300000) > Date.now()) {
      msg.reply(`You've already tried verification recently, try again later.`);
      return;
    }
  }

  userTimeouts.set(msg.author.id, {status: `active`});

  let DMChannel;
  let startedFromDM = false;

  if (msg.channel.type === `dm`) {
    DMChannel = msg.channel;
    startedFromDM = true;
  } else {
    DMChannel = await msg.author.createDM();
    msg.reply(`you've been sent a DM.`);
  }

  const prevVerified = await database.getEntry(`Bearcats`, {userID: msg.author.id});

  if (prevVerified) {
    if (startedFromDM) {
      msg.reply(`You've already verified, please run this command from a server to get the verified user role.`);
    } else {
      const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});
      let role = false;

      if (guildSettings.verifiedRoleID) {
        role = msg.guild.roles.cache.get(guildSettings.verifiedRoleID);
      }

      if (role) {
        if (msg.member.roles.cache.has(guildSettings.verifiedRoleID)) {
          DMChannel.send(`You already have the verified user role in ${msg.guild.name}.`);
        } else {
          await msg.member.roles.add(guildSettings.verifiedRoleID, `User requested role addition.`);
          DMChannel.send(`You now have the ${role.name} role in ${msg.guild.name}.`);
        }
      } else {
        DMChannel.send(`This server doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.`);
      }
    }

    userTimeouts.delete(msg.author.id);
    return;
  }

  DMChannel.send(`This process verifies that you are a student at UC.\nIn order to do so, we email you a verification code to your UC email.\nWith that being said, what is your UC Email?`);

  let emailCollected;
  try {
    emailCollected = await collectors.oneMessageFromUser(DMChannel, msg.author.id);
  } catch {
    userTimeouts.delete(msg.author.id);
    DMChannel.send(`Verification command timed out, please try again.`);
  }

  const email = emailCollected.first().content;

  if (email && regexEmail.test(email)) {
    const existing = await database.getEntry(`Bearcats`, {email});

    if (existing) {
      DMChannel.send(`That email has already been used to verify another user.\nContact a bot developer if you believe this is an error.`);
      userTimeouts.set(msg.author.id, {status: `timeout`, timeout: Date.now()});
      return;
    }

    DMChannel.send(`Attempting to email you...`);

    const verificationCode = await sendEmail(email);

    if (verificationCode) {
      DMChannel.send(`An email has been sent with a verification code, please reply with the code.\nYou have 5 minutes to reply before this command times out.`);
    } else {
      DMChannel.send(`Failed to send a verification code.\nTry again later and let the bot devs know if the issue persists.`);
      userTimeouts.delete(msg.author.id);
      return;
    }

    let attempts = 3;
    let loop = true;

    while (loop) {
      let replyCode;
      try {
        replyCode = await collectors.oneMessageFromUser(DMChannel, msg.author.id, 300000);
      } catch {
        userTimeouts.delete(msg.author.id);
        DMChannel.send(`Verification command timed out, please try again.`);
      }

      if (verificationCode.toLowerCase() === replyCode.first().content.toLowerCase()) {
        loop = false;
      } else {
        if (attempts === 1) {
          DMChannel.send(`Out of attempts, please wait 5 minutes before attempting verification again.`);
          userTimeouts.set(msg.author.id, {status: `timeout`, timeout: Date.now()});
          return;
        }
        attempts--;
        DMChannel.send(`That doesn't seem to match, you have ${attempts} more attempts, try again.`);
      }
    }

    await database.updateOrCreateEntry(`Bearcats`, {userID: msg.author.id}, {email});

    if (startedFromDM) {
      // \nIf you'd like to complete your user profile, run the "profile-setup" command.
      DMChannel.send(`Success!\nYour Email has been saved.\nIn order to get a verified role, run this command again from a server you want a verified role in.  You won't be asked to verify your email again.`);
    } else {
      const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});
      let role = false;

      if (guildSettings.verifiedRoleID) {
        role = msg.guild.roles.cache.has(guildSettings.verifiedRoleID);
      }

      if (role) {
        if (msg.member.roles.cache.has(guildSettings.verifiedRoleID)) {
          // \nIf you'd like to complete your user profile, run the "profile-setup" command.
          DMChannel.send(`Success!\nYour Email has been saved.`);
        } else {
          await msg.member.roles.add(guildSettings.verifiedRoleID, `User requested role addition.`);
          // \nIf you'd like to complete your user profile, run the "profile-setup" command.
          DMChannel.send(`Success!\nYour Email has been saved and you now have the ${role.name} role in ${msg.guild.name}.`);
        }
      } else {
        // \nIf you'd like to complete your user profile, run the "profile-setup" command.
        DMChannel.send(`Success!\nYour Email has been saved.  The server you verified in doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.  You will not be asked to verify your email again.`);
      }
    }

    userTimeouts.delete(msg.author.id);
  } else {
    DMChannel.send(`That is not a valid UC Email.  Please try again in 5 minutes.`);
    userTimeouts.set(msg.author.id, {status: `timeout`, timeout: Date.now()});
  }
}

function setupProfile() {
  return true;
}

// Private Functions
function sendEmail(email) {
  return new Promise((resolve) => {
    Crypto.randomBytes(3, (err, buffer) => {
      if (err) {
        console.error(`There was an error generating a new token:`);
        console.error(err);
        resolve(false);
      }

      const token = buffer.toString('hex');

      const mailOptions = {
        from: `Bearcat Bot`,
        to: email,
        subject: `UC Esports verification code`,
        text: `Your verification code is: ${token.toUpperCase()}`,
      };

      emailer.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(`There was an error sending a verification email:`);
          console.error(error);
          resolve(false);
        } else {
          resolve(token);
        }
      });
    });
  });
}
