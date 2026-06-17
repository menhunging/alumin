const usersRepository = require("../repositories/users.repository");

const login = ({ login, password }) => {
  return usersRepository.findByCredentials({ login, password });
};

module.exports = {
  login,
};
