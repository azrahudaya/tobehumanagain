import { useEffect, useState } from "react";
import {
  RiCheckboxCircleFill,
  RiLoader4Line,
  RiMedal2Fill,
  RiQuestionMark,
  RiShieldStarLine,
  RiSparkling2Fill,
} from "@remixicon/react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../api/client";
import { Card } from "../components/ui/Card";
import type { DashboardData } from "../types/api";

const fallbackBadgeLabel = "Mystery Badge";

const getBadgeLabel = (badge: string) => {
  const normalized = badge.trim();
  return normalized.length > 0 ? normalized : fallbackBadgeLabel;
};

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get<DashboardData>("/game/dashboard");
        setData(response.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <div className="p-4 md:p-6">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-4 md:p-6">Dashboard unavailable.</div>;
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="font-caveat text-5xl text-ink">Reflection Journal</h1>

      <Card>
        <p className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-[#7d6b71]">
          <RiSparkling2Fill className="h-4 w-4" />
          Guided Reflection
        </p>
        <p className="mt-3 text-sm text-[#58484d]">{data.recommendation}</p>
      </Card>

      <Card>
        <h2 className="inline-flex items-center gap-1 text-lg font-bold text-ink">
          <RiShieldStarLine className="h-5 w-5" />
          Chapter Summary
        </h2>
        <div className="mt-3 space-y-2">
          {data.chapterSummaries.map((chapter) => (
            <div key={chapter.chapterId} className="rounded-2xl border border-[#d2ccc7] bg-white/75 p-3 text-sm text-[#57464c]">
              <p className="font-bold">{chapter.chapterTitle}</p>
              <p
                className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${
                  chapter.completedAt ? "text-[#216146]" : "text-[#2f4db6]"
                }`}
              >
                {chapter.completedAt ? <RiCheckboxCircleFill className="h-4 w-4" /> : <RiLoader4Line className="h-4 w-4" />}
                {chapter.completedAt ? "Completed" : "In Progress"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="inline-flex items-center gap-1 text-lg font-bold text-ink">
          <RiMedal2Fill className="h-5 w-5" />
          Badges
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.badges.length === 0 && (
            <p className="inline-flex items-center gap-1 text-sm text-[#64545a]">
              <RiQuestionMark className="h-4 w-4" />
              Belum ada badge.
            </p>
          )}
          {data.badges.map((badge) => (
            <span
              key={`${badge.badge}-${badge.title}`}
              className="inline-flex items-center gap-1 rounded-full border border-[#b8c7f8] bg-[#edf2ff] px-3 py-1 text-xs font-bold text-[#2b4bb5]"
            >
              <RiMedal2Fill className="h-4 w-4" />
              {getBadgeLabel(badge.badge)}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-ink">Riwayat Pilihan Penting</h2>
        <div className="mt-3 space-y-2">
          {data.importantChoices.map((item, index) => (
            <div key={`${item.sceneTitle}-${index}`} className="rounded-2xl border border-[#d7d2cb] bg-white/75 p-3">
              <p className="text-sm font-bold text-[#4f3e44]">{item.sceneTitle}</p>
              <p className="text-sm text-[#59494f]">{item.choiceText}</p>
              <p className="mt-1 text-xs text-[#6e5f65]">Feedback: {item.feedback}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
