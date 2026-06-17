const authService = require("../services/auth.service");

const login = (req, res) => {
  const { login: userLogin, password } = req.body ?? {};

  if (!userLogin || !password) {
    return res.status(400).json({
      ok: false,
      message: "Логин и пароль обязательны",
    });
  }

  const authorizedUser = authService.login({
    login: userLogin,
    password,
  });

  if (!authorizedUser) {
    return res.status(401).json({
      ok: false,
      message: "Неверный логин или пароль",
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Авторизация успешна",
    user: {
      id: authorizedUser.id,
      login: authorizedUser.login,
      clubsIDs: authorizedUser.clubsIDs,
      managerClubIDs: authorizedUser.managerClubIDs,
    },
  });
};

module.exports = {
  login,
};
