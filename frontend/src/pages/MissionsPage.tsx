import { useEffect, useState } from "react";
import {
  RiCheckboxCircleFill,
  RiFlag2Line,
  RiFocus3Line,
  RiLoader4Line,
  RiLock2Line,
  RiMedal2Fill,
  RiSparkling2Fill,
} from "@remixicon/react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../api/client";
import { Card } from "../components/ui/Card";
import type { MissionItem } from "../types/api";

const fallbackBadgeLabel = "Mystery Badge";

const getStatusConfig = (status: MissionItem["status"]) => {
  if (status === "COMPLETED") {
    return {
      label: "Completed",
      Icon: RiCheckboxCircleFill,
      chipClassName: "bg-[#d8f1e3] text-[#216146]",
      note: "Selesai otomatis karena syarat mission sudah terpenuhi.",
      NoteIcon: RiSparkling2Fill,
    };
  }

  if (status === "UNLOCKED") {
    return {
      label: "Active",
      Icon: RiLoader4Line,
      chipClassName: "bg-[#e5ebff] text-[#2f4db6]",
      note: "Sedang dipantau sistem. Mainkan story untuk memenuhi objective.",
      NoteIcon: RiFocus3Line,
    };
  }

  return {
    label: "Locked",
    Icon: RiLock2Line,
    chipClassName: "bg-[#ece9e4] text-[#6f5f65]",
    note: "Mission akan terbuka otomatis setelah prasyarat mission sebelumnya selesai.",
    NoteIcon: RiLock2Line,
  };
};

const getBadgeLabel = (badge: string) => {
  const normalized = badge.trim();
  return normalized.length > 0 ? normalized : fallbackBadgeLabel;
};

export const MissionsPage = () => {
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<MissionItem[]>("/game/missions");
      setMissions(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMissions();
  }, []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="font-caveat text-5xl text-ink">Mission Board</h1>
        <p className="text-sm text-[#5d4c51]">Status mission otomatis diperbarui oleh sistem berdasarkan progres permainanmu.</p>
      </div>

      {loading && <Card>Loading missions...</Card>}

      {!loading &&
        missions.map((mission) => (
          <Card key={mission.id} className="border-[#d4cfc8] bg-white/80">
            {(() => {
              const statusConfig = getStatusConfig(mission.status);
              const StatusIcon = statusConfig.Icon;
              const NoteIcon = statusConfig.NoteIcon;
              const badgeLabel = getBadgeLabel(mission.rewardBadge);

              return (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-[#7b6a70]">
                        <RiFlag2Line className="h-4 w-4" />
                        {mission.orderIndex}
                      </p>
                      <h2 className="text-xl font-bold text-ink">{mission.title}</h2>
                      <p className="mt-2 text-sm text-[#5f4d53]">{mission.description}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6d5a60]">
                        <RiFocus3Line className="h-4 w-4" />
                        {mission.objective}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#e3d9c7] bg-[#fff9ec] px-2.5 py-1 text-xs font-bold text-[#7b5a2a]">
                        <RiMedal2Fill className="h-4 w-4" />
                        {badgeLabel}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${statusConfig.chipClassName}`}>
                      <StatusIcon className="h-4 w-4" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="mt-4 inline-flex w-full items-center gap-1 rounded-xl border border-[#d9d3cc] bg-[#fffaf2] px-3 py-2 text-xs text-[#6c5a61]">
                    <NoteIcon className="h-4 w-4 shrink-0" />
                    {statusConfig.note}
                  </p>
                </>
              );
            })()}
          </Card>
        ))}
    </div>
  );
};
