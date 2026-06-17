import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import Button from "@/components/ui/Button/Button";
import ChatUsersList, {
  type ChatUser,
} from "@/components/ChatUsersList/ChatUsersList";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import ChannelList, { type ChannelItem } from "@/components/ChannelList/ChannelList";
import ClubList from "@/components/ClubList/ClubList";
import { API_BASE_URL } from "@/api/axios";
import { useAuthStore } from "@/store/auth.store";

import "./Home.scss";

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const selectedClubIdRef = useRef<number | null>(null);
  const selectedUserRef = useRef<ChatUser | null>(null);

  useEffect(() => {
    selectedClubIdRef.current = selectedClubId;
  }, [selectedClubId]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const chatSocket = io(API_BASE_URL || window.location.origin, {
      transports: ["websocket"],
    });

    chatSocket.emit("chat:register", { userId: user.id });

    const handleInbox = (payload: { clubId: number; senderId: number }) => {
      const isOpenChat =
        selectedClubIdRef.current === payload.clubId &&
        selectedUserRef.current?.id === payload.senderId;

      if (isOpenChat) {
        return;
      }

      const key = `${payload.clubId}:${payload.senderId}`;

      setUnreadCounts((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1,
      }));
    };

    chatSocket.on("chat:inbox", handleInbox);
    setSocket(chatSocket);

    return () => {
      chatSocket.off("chat:inbox", handleInbox);
      chatSocket.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  useEffect(() => {
    if (selectedClubId !== null) {
      return;
    }

    const firstClubId = user?.clubsIDs?.[0];

    if (!firstClubId) {
      return;
    }

    setSelectedClubId(firstClubId);
    setSelectedChannel({
      id: `club:${firstClubId}:channel:general`,
      name: "Общий",
      clubId: firstClubId,
    });
    setSelectedUser(null);
  }, [user?.clubsIDs, selectedClubId]);

  const handleClubSelect = (club: { id: number }) => {
    setSelectedClubId(club.id);
    setSelectedChannel({
      id: `club:${club.id}:channel:general`,
      name: "Общий",
      clubId: club.id,
    });
    setSelectedUser(null);
  };

  const handleUserSelect = (chatUser: ChatUser) => {
    if (selectedClubId) {
      const key = `${selectedClubId}:${chatUser.id}`;
      setUnreadCounts((prev) => ({
        ...prev,
        [key]: 0,
      }));
    }

    setSelectedUser(chatUser);
    setSelectedChannel(null);
  };

  const handleChannelSelect = (channel: ChannelItem) => {
    setSelectedChannel(channel);
    setSelectedUser(null);
  };

  const canWriteToChannel = Boolean(
    selectedClubId && user?.managerClubIDs?.includes(selectedClubId),
  );

  return (
    <div className="home">
      <div className="home__side leftSide box">
        <div className="listClubs">
          <ClubList
            clubIds={user?.clubsIDs ?? []}
            selectedClubId={selectedClubId}
            onSelectClub={handleClubSelect}
          />
        </div>
        <div className="home__controls">
          <p className="home__controls-title">{user?.login}</p>
          <Button
            style={{ width: "60px", height: "60px" }}
            onClick={logout}
            aria-label="Выйти"
            data-title="Выйти"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.75 7.5L20.25 12M20.25 12L15.75 16.5M20.25 12H9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 4.5H7.5C6.39543 4.5 5.5 5.39543 5.5 6.5V17.5C5.5 18.6046 6.39543 19.5 7.5 19.5H10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>
      <div className="home__side centerSide box">
        <div className="chanell">
          <p className="home__title">Каналы</p>
          <ChannelList
            clubId={selectedClubId}
            selectedChannelId={selectedChannel?.id ?? null}
            onSelectChannel={handleChannelSelect}
          />
        </div>
        <div className="chats">
          <p className="home__title">Чаты (люди)</p>

          <ChatUsersList
            clubId={selectedClubId}
            currentUserId={user?.id}
            selectedUserId={selectedUser?.id ?? null}
            unreadCounts={unreadCounts}
            onSelectUser={handleUserSelect}
          />
        </div>
      </div>
      <div className="home__side rightSide box">
        <ChatWindow
          socket={socket}
          currentUserId={user?.id}
          selectedClubId={selectedClubId}
          selectedUser={selectedUser}
          selectedChannel={selectedChannel}
          canWriteToChannel={canWriteToChannel}
        />
      </div>
    </div>
  );
};

export default Home;
