const roomMessages = new Map();
const socketRooms = new Map();
const socketUsers = new Map();
const clubs = require("../data/clubs.json");

const createMessage = ({ senderId, text }) => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    senderId,
    text,
    createdAt: new Date().toISOString(),
  };
};

const clearRoomIfEmpty = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);

  if (!room || room.size === 0) {
    roomMessages.delete(roomId);
  }
};

const canWriteToChannel = ({ clubId, senderId }) => {
  const club = clubs.find((item) => item.id === clubId);

  if (!club) {
    return false;
  }

  return Array.isArray(club.managerIds) && club.managerIds.includes(senderId);
};

const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("chat:register", ({ userId }) => {
      const normalizedUserId = Number(userId);

      if (!Number.isInteger(normalizedUserId)) {
        return;
      }

      socketUsers.set(socket.id, normalizedUserId);
      socket.join(`user:${normalizedUserId}`);
    });

    socket.on("chat:join", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      const previousRoomId = socketRooms.get(socket.id);

      if (previousRoomId && previousRoomId !== roomId) {
        socket.leave(previousRoomId);
        clearRoomIfEmpty(io, previousRoomId);
      }

      socket.join(roomId);
      socketRooms.set(socket.id, roomId);

      const messages = roomMessages.get(roomId) || [];
      socket.emit("chat:history", { roomId, messages });
    });

    socket.on("chat:leave", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);
      socketRooms.delete(socket.id);
      clearRoomIfEmpty(io, roomId);
    });

    socket.on("chat:message", ({ roomId, clubId, senderId, recipientId, chatType, text }) => {
      const normalizedText = String(text || "").trim();
      const normalizedSenderId = Number(senderId);
      const normalizedRecipientId = Number(recipientId);
      const normalizedClubId = Number(clubId);
      const normalizedChatType = String(chatType || "dm");

      if (!roomId || !normalizedSenderId || !normalizedText) {
        return;
      }

      if (normalizedChatType === "channel" && !canWriteToChannel({
        clubId: normalizedClubId,
        senderId: normalizedSenderId,
      })) {
        return;
      }

      const message = createMessage({
        senderId: normalizedSenderId,
        text: normalizedText,
      });

      const messages = roomMessages.get(roomId) || [];
      messages.push(message);
      roomMessages.set(roomId, messages);

      io.to(roomId).emit("chat:message", { roomId, message });

      if (Number.isInteger(normalizedRecipientId) && Number.isInteger(normalizedClubId)) {
        io.to(`user:${normalizedRecipientId}`).emit("chat:inbox", {
          clubId: normalizedClubId,
          senderId: normalizedSenderId,
          message,
        });
      }
    });

    socket.on("disconnect", () => {
      const roomId = socketRooms.get(socket.id);
      socketUsers.delete(socket.id);

      if (!roomId) {
        return;
      }

      socketRooms.delete(socket.id);
      clearRoomIfEmpty(io, roomId);
    });
  });
};

module.exports = {
  registerChatSocket,
};
