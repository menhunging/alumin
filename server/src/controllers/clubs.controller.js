const clubsService = require("../services/clubs.service");

const getClubs = (_req, res) => {
  const clubs = clubsService.getClubs();

  return res.status(200).json({
    ok: true,
    data: clubs,
  });
};

const getClubsByIds = (req, res) => {
  const { ids } = req.body ?? {};

  if (!Array.isArray(ids)) {
    return res.status(400).json({
      ok: false,
      message: "Поле ids должно быть массивом",
    });
  }

  const normalizedIds = ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id));

  const clubs = clubsService.getClubsByIds(normalizedIds);

  return res.status(200).json({
    ok: true,
    data: clubs,
  });
};

const getClubUsers = (req, res) => {
  const clubId = Number(req.params.clubId);
  const excludeUserId = Number(req.query.excludeUserId) || null;

  if (!Number.isInteger(clubId)) {
    return res.status(400).json({
      ok: false,
      message: "Неверный clubId",
    });
  }

  const users = clubsService.getClubUsers({ clubId, excludeUserId });

  if (users === null) {
    return res.status(404).json({
      ok: false,
      message: "Клуб не найден",
    });
  }

  return res.status(200).json({
    ok: true,
    data: users.map((user) => ({
      id: user.id,
      login: user.login,
    })),
  });
};

module.exports = {
  getClubs,
  getClubsByIds,
  getClubUsers,
};
