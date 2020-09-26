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

const categoryIDMap = new Map();

// load and return all categories
async function loadCategories() {
  const categories = await database.getAllEntries(`RoleCategories`);
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

  return data;
}

module.exports = {initRoles};
