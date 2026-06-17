const usersRepository = require("../repositories/users.repository");

const getUsersByIds = (ids) => {
  return usersRepository.findByIds(ids);
};

module.exports = {
  getUsersByIds,
};
