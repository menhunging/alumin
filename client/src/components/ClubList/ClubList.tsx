import { useEffect, useState } from "react";
import { api } from "@/api/axios";

import "./ClubList.scss";

type Club = {
  id: number;
  name: string;
  shortName: string;
};

type ClubListProps = {
  clubIds: number[];
  selectedClubId: number | null;
  onSelectClub: (club: Club) => void;
};

const ClubList = ({ clubIds, selectedClubId, onSelectClub }: ClubListProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    if (!clubIds.length) {
      setClubs([]);
      return;
    }

    const fetchClubs = async () => {
      try {
        const response = await api.post("/clubs", { ids: clubIds });
        setClubs(response.data?.data ?? []);
      } catch (error) {
        console.error("Ошибка загрузки клубов:", error);
      }
    };

    void fetchClubs();
  }, [clubIds]);

  return (
    <div className="club-list">
      {clubs.map((club) => (
        <button
          key={club.id}
          type="button"
          className={`club-list__item ${selectedClubId === club.id ? "is-active" : ""}`}
          data-title={club.name}
          onClick={() => onSelectClub(club)}
        >
          {club.shortName}
        </button>
      ))}
    </div>
  );
};

export default ClubList;
