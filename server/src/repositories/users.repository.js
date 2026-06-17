const users = require("../data/users.json");

const findByCredentials = ({ login, password }) => {
  return users.find((user) => user.login === login && user.password === password) || null;
};

const findByIds = (ids) => {
  const idsSet = new Set(ids);
  return users.filter((user) => idsSet.has(user.id));
};

module.exports = {
  findByCredentials,
  findByIds,
};
