import { useEffect, useState } from "react";
import { api } from "@/api/axios";

import "./ChatUsersList.scss";

export type ChatUser = {
  id: number;
  login: string;
};

type ChatUsersListProps = {
  clubId: number | null;
  currentUserId?: number;
  selectedUserId: number | null;
  unreadCounts: Record<string, number>;
  onSelectUser: (user: ChatUser) => void;
};

const ChatUsersList = ({
  clubId,
  currentUserId,
  selectedUserId,
  unreadCounts,
  onSelectUser,
}: ChatUsersListProps) => {
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!clubId) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get(`/clubs/${clubId}/users`, {
          params: {
            excludeUserId: currentUserId,
          },
        });

        setUsers(response.data?.data ?? []);
      } catch (error) {
        console.error("Ошибка загрузки участников клуба:", error);
      }
    };

    void fetchUsers();
  }, [clubId, currentUserId]);

  if (!clubId) {
    return <p className="chat-users-list__empty">Выбери клуб</p>;
  }

  if (!users.length) {
    return <p className="chat-users-list__empty">В этом клубе нет собеседников</p>;
  }

  return (
    <div className="chat-users-list">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          className={`chat-users-list__item ${selectedUserId === user.id ? "is-active" : ""}`}
          onClick={() => onSelectUser(user)}
        >
          <span>{user.login}</span>
          {!!clubId && unreadCounts[`${clubId}:${user.id}`] > 0 && (
            <span className="chat-users-list__badge">{unreadCounts[`${clubId}:${user.id}`]}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ChatUsersList;
