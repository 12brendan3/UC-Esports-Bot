/*
1) query all roles
2) query all role categories
3) group each role into its category
4) build each embed per category
5) try to update each message. if message DNE, then create the message
6) listen for database changes, upon change, update the message embed.
*/

const database = require(`./database-manager`);


async function loadCategories() {
  const categories = await database.getAllEntries(`RoleCategories`);
  if (categories) {
    return categories;
  }
  return false;
}

async function loadRoles() {
  const roles = await database.getAllEntries(`Roles`);
  if (roles) {
    return roles;
  }
  return false;
}

async function sortRoles() {

  const categories = await loadCategories();
  const roles = await loadRoles();

  const categoryIDMap = new Map();

  for (const cat of categories) {
    categoryIDMap.set(cat.ID, cat);
  }

  if (!(categories && roles)) {
    return false;
  }
  const data = {};

  for (const cat of categories) {
    if (!(data[cat.guildID])) {
      data[cat.guildID] = {};
    }
    data[cat.guildID][cat.categoryName] = [];
  }

  for (const role of roles) {
    const cat = categoryIDMap.get(role.roleCategory);
    data[cat.guildID][cat.categoryName].push(role);
  }

  return data;
}

sortRoles();
