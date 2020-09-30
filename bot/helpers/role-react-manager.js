/*
1) query all roles
2) query all role categories
3) group each role into its category
4) build each embed per category
5) try to update each message. if message DNE, then create the message
6) listen for database changes, upon change, update the message embed.
*/

// steps 1-3 are complete, rest remains.

const database = require(`./database-manager`);
const {Op} = require(`sequelize`);

const categoryIDMap = new Map();
let roleData = {};

// load and return all categories
async function loadCategories() {
  const categories = await database.getAllEntries(`RoleCategories`);
  if (categories) {
    return categories;
  }
  return false;
}

async function loadCategoriesOfGuild(guildId) {
  const categories = await database.getAllEntries(`RoleCategories`, {guildID: guildId});
  if (categories) {
    return categories;
  }
  return false;
}

// load and return all roles
async function loadRoles() {
  const roles = await database.getAllEntries(`Roles`);
  if (roles) {
    return roles;
  }
  return false;
}

async function loadRolesOfCategories(categories) {
  const categoryIds = [];

  for (const cat of categories) {
    categoryIds.push(cat.roleCategory);
  }
  const roles = await database.getAllEntries(`Roles`, {[Op.or]: categoryIds});
  if (roles) {
    return roles;
  }
  return false;
}

async function initRoles() {
  // load data
  const categories = await loadCategories();
  const roles = await loadRoles();

  // if either database query did not work, return.
  if (!(categories && roles)) {
    return false;
  }

  // build map such that each category can be referred to by its ID.
  // this is so that each role can be assigned to its category in constant time.
  for (const cat of categories) {
    categoryIDMap.set(cat.ID, cat);
  }

  const data = {};

  // for each unique guild, for each unique category, an empty object to store roles.
  for (const cat of categories) {
    if (!(data[cat.guildID])) {
      data[cat.guildID] = {};
    }
    data[cat.guildID][cat.categoryName] = {categoryDescription: cat.categoryDescription, roles: []};
  }

  // for each role, place the role data in its proper guild and category
  for (const role of roles) {
    // use the map to quickly identify which guild and category a role belongs to.
    const cat = categoryIDMap.get(role.roleCategory);
    data[cat.guildID][cat.categoryName].roles.push(role);
  }
  roleData = data;
  return data;
}

async function updateGuildRoles(guildId) {
  const categories = await loadCategoriesOfGuild(guildId);
  const roles = await loadRolesOfCategories(guildId);

  // if either database query did not work, return.
  if (!(categories && roles)) {
    return false;
  }

  roleData[guildId] = {};

  // for each unique guild, for each unique category, an empty object to store roles.
  for (const cat of categories) {
    roleData[guildId][cat.categoryName] = {categoryDescription: cat.categoryDescription, categoryMessage: cat.messageID, roles: []};
  }

  // for each role, place the role data in its proper guild and category
  for (const role of roles) {
    // use the map to quickly identify which guild and category a role belongs to.
    const cat = categoryIDMap.get(role.roleCategory);
    roleData[guildId][cat.categoryName].roles.push(role);
  }

  return roleData;
}

/*
data = {
  guild1: {
    guild1Category1: {
      roles: [
      role1,
      role2,
      role3
      ]
      categoryDescription: "..."
      categoryMessage: "..."
    },
    guild1Category2: {
      roles: [
      role1,
      role2,
      role3
      ]
      categoryDescription: "..."
      categoryMessage: "..."
    },
  },
  guild1: {
    guild1Category1: {
      roles: [
      role1,
      role2,
      role3
      ]
      categoryDescription: "..."
      categoryMessage: "..."
    },
    guild1Category2: {
      roles: [
      role1,
      role2,
      role3
      ]
      categoryDescription: "..."
      categoryMessage: "..."
    },
  }
}
*/

module.exports = {initRoles, updateGuildRoles, roleData};
