const clubs = require("../data/clubs.json");

const findAll = () => {
  return clubs;
};

const findByIds = (ids) => {
  const idsSet = new Set(ids);
  return clubs.filter((club) => idsSet.has(club.id));
};

const findById = (id) => {
  return clubs.find((club) => club.id === id) || null;
};

module.exports = {
  findAll,
  findByIds,
  findById,
};
