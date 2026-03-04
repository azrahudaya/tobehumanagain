import { motion } from "framer-motion";
import { ArrowLeft, Lock, PlayCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useGame } from "../context/GameContext";

type LevelStatus = "AVAILABLE" | "LOCKED" | "COMING_SOON";

type DummyLevel = {
  id: string;
  title: string;
  status: LevelStatus;
  description: string;
  imageUrl: string;
};

const levelCards: DummyLevel[] = [
  {
    id: "lv-01",
    title: "Digital Heart",
    status: "AVAILABLE",
    description: "Chapter pertama yang sudah bisa dimainkan sekarang.",
    imageUrl: "/checkpoints/bg-feed.png",
  },
  {
    id: "lv-02",
    title: "Echo Chamber",
    status: "LOCKED",
    description: "Dummy level. Nanti diisi konflik lanjutan dan pilihan baru.",
    imageUrl: "/checkpoints/bg-chat.png",
  },
  {
    id: "lv-03",
    title: "Silent Trigger",
    status: "LOCKED",
    description: "Dummy level. Placeholder untuk branch drama berikutnya.",
    imageUrl: "/checkpoints/bg-thread.png",
  },
  {
    id: "lv-04",
    title: "Mirror Pulse",
    status: "COMING_SOON",
    description: "Dummy level. Konsep masih tahap desain.",
    imageUrl: "/checkpoints/bg-safe-room.png",
  },
  {
    id: "lv-05",
    title: "Recovery Arc",
    status: "COMING_SOON",
    description: "Dummy level. Akan fokus pada penyelesaian konflik.",
    imageUrl: "/checkpoints/bg-reflect.png",
  },
  {
    id: "lv-06",
    title: "Human Again",
    status: "COMING_SOON",
    description: "Dummy level final untuk ending chapter besar.",
    imageUrl: "/checkpoints/bg-closing.png",
  },
];

const statusLabel: Record<LevelStatus, string> = {
  AVAILABLE: "Playable",
  LOCKED: "Locked",
  COMING_SOON: "Coming Soon",
};

const statusChipClassName: Record<LevelStatus, string> = {
  AVAILABLE: "bg-[#dff4e7] text-[#1f6b48]",
  LOCKED: "bg-[#ebe6df] text-[#705f66]",
  COMING_SOON: "bg-[#e8ecff] text-[#3451b6]",
};

export const LevelSelectPage = () => {
  const navigate = useNavigate();
  const { startNewGame, continueGame } = useGame();
  const [startingLevelId, setStartingLevelId] = useState<string | null>(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    const loadTitleState = async () => {
      try {
        const { data } = await api.get<{ hasProgress: boolean }>("/game/title-state");
        setHasSavedProgress(data.hasProgress);
      } catch {
        setHasSavedProgress(false);
      }
    };

    void loadTitleState();
  }, []);

  const onSelectLevel = async (level: DummyLevel) => {
    if (level.status !== "AVAILABLE") {
      toast("Level ini masih dummy. Nanti kita isi kontennya.");
      return;
    }

    setStartingLevelId(level.id);
    try {
      const resumed = await continueGame();
      if (!resumed) {
        await startNewGame();
      }
      setHasSavedProgress(true);
      navigate("/story");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStartingLevelId(null);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <Button variant="secondary" className="h-10 rounded-xl px-4 text-lg" onClick={() => navigate("/home")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="font-caveat text-5xl text-ink">Choose Level</h1>
        <p className="inline-flex items-center gap-1 text-sm text-[#5c4a50]">
          <Sparkles className="h-4 w-4" />
          Sebagian pilihan masih dummy untuk preview menu level.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {levelCards.map((level, index) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.06 + 0.04 }}
            whileHover={level.status === "AVAILABLE" ? { y: -3 } : undefined}
            className="h-full"
          >
            <Card
              className={`group flex h-full flex-col gap-3 border-[#cec6bc] bg-white/82 transition duration-300 ${
                level.status === "AVAILABLE" ? "shadow-[0_12px_24px_rgba(63,46,48,0.16)]" : "opacity-95"
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#cfc4bb]">
                <div className="aspect-[3/1]">
                  <img
                    src={level.imageUrl}
                    alt={`${level.title} preview`}
                    className={`h-full w-full object-cover transition duration-500 ${
                      level.status === "LOCKED"
                        ? "grayscale"
                        : "grayscale-0 group-hover:scale-[1.02]"
                    }`}
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,19,21,0.06)_0%,rgba(26,19,21,0.22)_100%)]" />
                <span
                  className={`absolute right-2 top-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${statusChipClassName[level.status]}`}
                >
                  {statusLabel[level.status]}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-caveat text-4xl leading-none text-[#4f3c43]">{level.title}</h2>
                <p className="text-sm text-[#5b4b51]">{level.description}</p>
              </div>

              <Button
                fullWidth
                variant={level.status === "AVAILABLE" ? "primary" : "ghost"}
                className="mt-auto h-11 rounded-xl text-xl"
                onClick={() => void onSelectLevel(level)}
                disabled={startingLevelId !== null && startingLevelId !== level.id}
              >
                {level.status === "AVAILABLE" ? (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    {startingLevelId === level.id ? (hasSavedProgress ? "Resuming..." : "Starting...") : hasSavedProgress ? "Resume" : "Start"}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {level.status === "LOCKED" ? "Locked" : "Soon"}
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
