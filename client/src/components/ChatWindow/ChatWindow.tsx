import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Socket } from "socket.io-client";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import type { ChatUser } from "@/components/ChatUsersList/ChatUsersList";
import type { ChannelItem } from "@/components/ChannelList/ChannelList";

import "./ChatWindow.scss";

type ChatMessage = {
  id: string;
  senderId: number;
  text: string;
  createdAt: string;
};

type ChatWindowProps = {
  socket: Socket | null;
  currentUserId?: number;
  selectedClubId: number | null;
  selectedUser: ChatUser | null;
  selectedChannel: ChannelItem | null;
  canWriteToChannel: boolean;
};

const createRoomId = (clubId: number, firstUserId: number, secondUserId: number) => {
  const users = [firstUserId, secondUserId].sort((a, b) => a - b);
  return `club:${clubId}:dm:${users.join("-")}`;
};

const formatMessageDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dayMonth = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);

  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dayMonth} в ${time}`;
};

const ChatWindow = ({
  socket,
  currentUserId,
  selectedClubId,
  selectedUser,
  selectedChannel,
  canWriteToChannel,
}: ChatWindowProps) => {
  const roomIdRef = useRef<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const roomId = useMemo(() => {
    if (selectedChannel?.id) {
      return selectedChannel.id;
    }

    if (!selectedClubId || !selectedUser?.id || !currentUserId) {
      return null;
    }

    return createRoomId(selectedClubId, currentUserId, selectedUser.id);
  }, [selectedClubId, selectedUser, currentUserId]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleHistory = (payload: { roomId: string; messages: ChatMessage[] }) => {
      if (payload.roomId === roomIdRef.current) {
        setMessages(payload.messages);
      }
    };

    const handleMessage = (payload: { roomId: string; message: ChatMessage }) => {
      if (payload.roomId !== roomIdRef.current) {
        return;
      }

      setMessages((prev) => [...prev, payload.message]);
    };

    socket.on("chat:history", handleHistory);
    socket.on("chat:message", handleMessage);

    return () => {
      socket.off("chat:history", handleHistory);
      socket.off("chat:message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, roomId]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (!roomId) {
      roomIdRef.current = null;
      setMessages([]);
      return;
    }

    roomIdRef.current = roomId;
    setMessages([]);
    socket.emit("chat:join", { roomId });

    return () => {
      socket.emit("chat:leave", { roomId });
    };
  }, [roomId]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedText = text.trim();

    if (!socket || !roomId || !currentUserId || !selectedClubId || !normalizedText) {
      return;
    }

    const isChannelMode = Boolean(selectedChannel);

    if (isChannelMode && !canWriteToChannel) {
      return;
    }

    if (!isChannelMode && !selectedUser?.id) {
      return;
    }

    socket.emit("chat:message", {
      roomId,
      clubId: selectedClubId,
      senderId: currentUserId,
      recipientId: selectedUser?.id ?? null,
      chatType: isChannelMode ? "channel" : "dm",
      text: normalizedText,
    });

    setText("");
  };

  if (!selectedClubId || (!selectedUser && !selectedChannel)) {
    return <p className="chat-window__empty">Выбери канал или собеседника</p>;
  }

  return (
    <div className={`chat-window ${selectedChannel ? "is-channel" : ""}`}>
      <p className="chat-window__title">
        {selectedChannel ? `Канал: ${selectedChannel.name}` : `Чат с: ${selectedUser?.login}`}
      </p>

      <div ref={messagesContainerRef} className="chat-window__messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-window__message ${
              !selectedChannel && message.senderId === currentUserId ? "is-own" : ""
            }`}
          >
            <p className="chat-window__message-text">{message.text}</p>
            <span className="chat-window__message-time">
              {formatMessageDate(message.createdAt)}
            </span>
          </div>
        ))}
      </div>

      {selectedChannel && !canWriteToChannel ? (
        <p className="chat-window__readonly-note">
          Только менеджеры могут писать в этот канал
        </p>
      ) : (
        <form className="chat-window__form" onSubmit={sendMessage}>
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Введите сообщение"
          />
          <Button type="submit">Отправить</Button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow;
