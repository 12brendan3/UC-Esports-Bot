const settings = require(`./settings-manager`);
const collectors = require(`./collectors`);
const database = require(`./database-manager`);

const Crypto = require(`crypto`);

const nodemailer = require(`nodemailer`);

const regexEmail = RegExp(`^.+@((uc)?mail.)?uc.edu$`);

const emailHTML1 = `<head><style>*{font-family:Arial,Helvetica Neue,Helvetica,sans-serif;padding:0;margin:0}body{background-color:#E00122}#top-text{padding-top:1vw;font-size:4vw;font-weight:bold}#code{padding-top:1vw;font-size:6vw;font-weight:bold}#bottom-text{padding-top:2vw;font-size:2vw}#text-area{margin-left:auto;margin-right:auto;text-align:center;background-color:white;height:20vw;width:60vw}</style></head><body> <img src="cid:verHeaderImg"/><div id="text-area"><p id="top-text">Your verification code is:</p><p id="code">`;
const emailHTML2 = `</p><p id="bottom-text">Please copy this code and send it to the Bearcat Bot.</p></div> <img src="cid:verFooterImg"/></body>`;

const userTimeouts = new Map();

let emailer;

// Exports
module.exports = {prepEmail, verifyUser, setupProfile};

// Exported Functions
function prepEmail() {
  if (settings.getAuth().gmailUN === `replace me` || settings.getAuth().gmailPW === `replace me`) {
    console.error(`No Gmail username and/or password found, please edit the "auth.json" file in the storage folder.\nYou can then type "restart" and then press enter.\nTo exit, type "exit" and then press enter.`);
    return;
  }

  emailer = nodemailer.createTransport({
    service: `gmail`,
    auth: {
      user: settings.getAuth().gmailUN,
      pass: settings.getAuth().gmailPW,
    },
  });

  console.info(`Email username and password set.`);
}

async function verifyUser(msg) {
  if (!emailer) {
    msg.reply(`The email verification system isn't set up on this bot, bug the bot developers to set it up.`);
    return;
  }

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
    if (msg.deletable) {
      msg.delete();
    }
    DMChannel = await msg.author.createDM();
  }

  const prevVerified = await database.getEntry(`Bearcats`, {userID: msg.author.id});

  if (prevVerified && prevVerified.email) {
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
          await msg.member.roles.add(guildSettings.verifiedRoleID, `User has previously passed verification.`);
          DMChannel.send(`You now have the ${role.name} role in ${msg.guild.name}.`);
        }
      } else {
        DMChannel.send(`This server doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.`);
      }
    }

    userTimeouts.delete(msg.author.id);
    return;
  }

  DMChannel.send(`This process verifies that you are a student at UC.\nIn order to do so, we email you a verification code to your UC email.\nWith that being said, what is your UC email?`);

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
      DMChannel.send(`An email has been sent with a verification code; please reply with the code.\nYou have 5 minutes to reply before this command times out.\nMake sure to check your junk mail!`);
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
        return;
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
      DMChannel.send(`Success!\nYour email has been saved.\nIn order to get a verified role, run this command again from a server you want a verified role in.  You won't be asked to verify your email again.`);
    } else {
      const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});
      let role = false;

      if (guildSettings.verifiedRoleID) {
        role = msg.guild.roles.cache.get(guildSettings.verifiedRoleID);
      }

      if (role) {
        if (msg.member.roles.cache.has(guildSettings.verifiedRoleID)) {
          // \nIf you'd like to complete your user profile, run the "profile-setup" command.
          DMChannel.send(`Success!\nYour email has been saved.`);
        } else {
          await msg.member.roles.add(guildSettings.verifiedRoleID, `User passed verification.`);
          // \nIf you'd like to complete your user profile, run the "profile-setup" command.
          DMChannel.send(`Success!\nYour email has been saved and you now have the ${role.name} role in ${msg.guild.name}.`);
        }
      } else {
        // \nIf you'd like to complete your user profile, run the "profile-setup" command.
        DMChannel.send(`Success!\nYour email has been saved.  The server you verified in doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.  You will not be asked to verify your email again.`);
      }
    }

    userTimeouts.delete(msg.author.id);
  } else {
    DMChannel.send(`That is not a valid UC email.  Please try again in 5 minutes.`);
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

      const token = buffer.toString(`hex`);

      const mailOptions = {
        from: settings.getAuth().gmailUN,
        to: email,
        subject: `UC Esports verification code`,
        text: `Your verification code is: ${token.toUpperCase()}\nPlease copy this code and send it to the Bearcat Bot.`,
        html: `${emailHTML1}${token.toUpperCase()}${emailHTML2}`,
        attachments: [{
          filename: `header.svg`,
          path: `./assets/email/header.svg`,
          cid: `verHeaderImg`,
        },
        {
          filename: `footer.svg`,
          path: `./assets/email/footer.svg`,
          cid: `verFooterImg`,
        }],
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
