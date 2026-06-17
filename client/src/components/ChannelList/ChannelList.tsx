import { useMemo } from "react";

import "./ChannelList.scss";

export type ChannelItem = {
  id: string;
  name: string;
  clubId: number;
};

type ChannelListProps = {
  clubId: number | null;
  selectedChannelId: string | null;
  onSelectChannel: (channel: ChannelItem) => void;
};

const ChannelList = ({
  clubId,
  selectedChannelId,
  onSelectChannel,
}: ChannelListProps) => {
  const channels = useMemo<ChannelItem[]>(() => {
    if (!clubId) {
      return [];
    }

    return [
      {
        id: `club:${clubId}:channel:general`,
        name: "Общий",
        clubId,
      },
    ];
  }, [clubId]);

  if (!clubId) {
    return <p className="channel-list__empty">Выбери клуб</p>;
  }

  return (
    <div className="channel-list">
      {channels.map((channel) => (
        <button
          key={channel.id}
          type="button"
          className={`channel-list__item ${selectedChannelId === channel.id ? "is-active" : ""}`}
          onClick={() => onSelectChannel(channel)}
        >
          {channel.name}
        </button>
      ))}
    </div>
  );
};

export default ChannelList;
