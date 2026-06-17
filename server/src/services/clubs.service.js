const clubsRepository = require("../repositories/clubs.repository");
const usersService = require("./users.service");

const getClubs = () => {
  return clubsRepository.findAll();
};

const getClubsByIds = (ids) => {
  return clubsRepository.findByIds(ids);
};

const getClubUsers = ({ clubId, excludeUserId }) => {
  const club = clubsRepository.findById(clubId);

  if (!club) {
    return null;
  }

  const userIds = club.userIds.filter((id) => id !== excludeUserId);
  return usersService.getUsersByIds(userIds);
};

module.exports = {
  getClubs,
  getClubsByIds,
  getClubUsers,
};
