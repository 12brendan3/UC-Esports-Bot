const settings = require(`./settings-manager`);
const database = require(`./database-manager`);

const Crypto = require(`crypto`);

const nodemailer = require(`nodemailer`);

const regexEmail = new RegExp(`^.+@((uc)?mail.)?uc.edu$`);

const emailHTML1 = `<head><style>*{font-family:Arial,Helvetica Neue,Helvetica,sans-serif;padding:0;margin:0}body{background-color:#E00122}#top-text{padding-top:1vw;font-size:4vw;font-weight:bold}#code{padding-top:1vw;font-size:6vw;font-weight:bold}#bottom-text{padding-top:2vw;font-size:2vw}#text-area{margin-left:auto;margin-right:auto;text-align:center;background-color:white;height:20vw;width:60vw}</style></head><body> <img src="cid:verHeaderImg"/><div id="text-area"><p id="top-text">Your verification code is:</p><p id="code">`;
const emailHTML2 = `</p><p id="bottom-text">Please copy this code and send it to the Bearcat Bot.</p></div> <img src="cid:verFooterImg"/></body>`;

const userStatuses = new Map();

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

async function verifyUser(interaction) {
  if (!emailer) {
    interaction.reply({content: `The email verification system isn't set up on this bot, bug the bot developers to set it up.`, ephemeral: true});
    return;
  }

  let startedFromDM = false;

  if (!interaction.inGuild()) {
    startedFromDM = true;
  }

  let userStatus = userStatuses.get(interaction.user.id);

  if (userStatus) {
    if (userStatus.code && userStatus.status !== `timeout`) {
      if (interaction.options.get(`code`)) {
        const subCode = interaction.options.get(`code`).value;

        if (subCode.toLowerCase() !== userStatus.code.toLowerCase()) {
          userStatus.attempts--;
          if (userStatus.attempts > 0) {
            interaction.reply({content: `That code is incorrect, please try again.\nYou have ${userStatus.attempts} more attempt(s).`, ephemeral: true});
          } else {
            interaction.reply({content: `That code is incorrect, you have no more attempts.\nPlease try again later.`, ephemeral: true});
            userStatus.code = null;
            userStatus.status = `timeout`;
            userStatus.timer = Date.now();
            if (userStatus.timeout) {
              clearTimeout(userStatus.timeout);
            }
          }
          return;
        }

        await database.updateOrCreateEntry(`Bearcats`, {userID: interaction.user.id}, {email: userStatus.email});

        if (startedFromDM) {
          // \nIf you'd like to complete your user profile, run the "profile-setup" command.
          interaction.reply({content: `Success!\nYour email has been saved.\nIn order to get a verified role, run \`/verify\` in a server you want the verified role in.  You won't be asked to verify your email again.`, ephemeral: true});
        } else {
          const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});
          let role = false;

          if (guildSettings && guildSettings.verifiedRoleID) {
            role = interaction.guild.roles.cache.get(guildSettings.verifiedRoleID);
          }

          if (role) {
            if (interaction.member.roles.cache.has(guildSettings.verifiedRoleID)) {
              // \nIf you'd like to complete your user profile, run the "profile-setup" command.
              interaction.reply({content: `Success!\nYour email has been saved.`, ephemeral: true});
            } else {
              await interaction.member.roles.add(guildSettings.verifiedRoleID, `User passed verification.`);
              // \nIf you'd like to complete your user profile, run the "profile-setup" command.
              interaction.reply({content: `Success!\nYour email has been saved and you now have the ${role.name} role in ${interaction.guild.name}.`, ephemeral: true});
            }
          } else {
            // \nIf you'd like to complete your user profile, run the "profile-setup" command.
            interaction.reply({content: `Success!\nYour email has been saved.  The server you verified in doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.  You will not be asked to verify your email again.`, ephemeral: true});
          }
        }

        if (userStatus.timeout) {
          clearTimeout(userStatus.timeout);
        }

        userStatuses.delete(interaction.user.id);
      } else {
        interaction.reply({content: `Please provide a verification code.`, ephemeral: true});
        return;
      }
    } else {
      if (userStatus.status === `active`) {
        interaction.reply({content: `You're already attempting verification right now.`, ephemeral: true});
        return;
      }

      if (userStatus.status === `timeout` && (userStatus.timer + 300000) > Date.now()) {
        interaction.reply({content: `You've already tried verification recently, try again later.`, ephemeral: true});
        return;
      }
    }
  }

  userStatuses.set(interaction.user.id, {status: `active`, code: null, timeout: null, attempts: 3, email: null, timer: 0});
  userStatus = userStatuses.get(interaction.user.id);

  const prevVerified = await database.getEntry(`Bearcats`, {userID: interaction.user.id});

  if (prevVerified && prevVerified.email) {
    if (startedFromDM) {
      interaction.reply({content: `You've already verified, please run this command from a server to get the verified user role.`, ephemeral: true});
    } else {
      const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});
      let role = false;

      if (guildSettings && guildSettings.verifiedRoleID) {
        role = interaction.guild.roles.cache.get(guildSettings.verifiedRoleID);
      }

      if (role) {
        if (interaction.member.roles.cache.has(guildSettings.verifiedRoleID)) {
          interaction.reply({content: `You already have the verified user role in ${interaction.guild.name}.`, ephemeral: true});
        } else {
          await interaction.member.roles.add(guildSettings.verifiedRoleID, `User has previously passed verification.`);
          interaction.reply({content: `You now have the ${role.name} role in ${interaction.guild.name}.`, ephemeral: true});
        }
      } else {
        interaction.reply({content: `This server doesn't have a verified role.\nIf one is added, you can re-run this command to get the role.`, ephemeral: true});
      }
    }

    userStatuses.delete(interaction.user.id);
    return;
  }

  if (!interaction.options.get(`email`)) {
    interaction.reply({content: `Please run the command again with an email to verify you with.`, ephemeral: true});
    userStatuses.delete(interaction.user.id);
    return;
  }

  const email = interaction.options.get(`email`).value;
  if (regexEmail.test(email)) {
    const existing = await database.getEntry(`Bearcats`, {email});

    if (existing) {
      interaction.reply({content: `That email has already been used to verify another user.\nContact a bot developer if you believe this is an error.`, ephemeral: true});
      userStatus.status = `timeout`;
      userStatus.timer = Date.now();
      return;
    }

    interaction.reply({content: `Attempting to email you...`, ephemeral: true});

    const verificationCode = await sendEmail(email);

    if (verificationCode) {
      interaction.editReply({content: `An email has been sent with a verification code; please use \`/verify code:yourcode\`.\nYou have 5 minutes to verify your code.\nMake sure to check your junk mail!`, ephemeral: true});
      userStatus.email = email;
      userStatus.code = verificationCode;
      userStatus.timeout = setTimeout(() => {
        userStatus.code = null;
        userStatus.status = `timeout`;
        userStatus.timer = Date.now();
      }, 300000);
    } else {
      interaction.editReply({content: `Failed to send a verification code.\nTry again later and let the bot devs know if the issue persists.`, ephemeral: true});
      userStatuses.delete(interaction.user.id);
    }
    return;
  } else {
    interaction.reply({content: `That is not a valid UC email.  Please try again in 5 minutes.`, ephemeral: true});
    userStatus.status = `timeout`;
    userStatus.timer = Date.now();
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
