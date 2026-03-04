import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useGame } from "../context/GameContext";

const buttonMotion = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const titleIllusFrames = [
  "/brand/title-illus-gif1.png",
  "/brand/title-illus-gif2.png",
  "/brand/title-illus-gif3.png",
  "/brand/title-illus-gif4.png",
];

const noticeVersions = {
  missions: "v1",
  settings: "v1",
  credits: "v1",
} as const;

type NoticeKey = keyof typeof noticeVersions;
type NoticeState = Record<NoticeKey, boolean>;

const getNoticeStorageKey = (key: NoticeKey) => `tbh_notice_${key}_${noticeVersions[key]}_seen`;

export const TitleScreenPage = () => {
  const navigate = useNavigate();
  const { clearRun } = useGame();
  const [frameIndex, setFrameIndex] = useState(0);
  const [notices, setNotices] = useState<NoticeState>({
    missions: false,
    settings: false,
    credits: false,
  });

  useEffect(() => {
    clearRun();
  }, [clearRun]);

  useEffect(() => {
    setNotices({
      missions: localStorage.getItem(getNoticeStorageKey("missions")) !== "1",
      settings: localStorage.getItem(getNoticeStorageKey("settings")) !== "1",
      credits: localStorage.getItem(getNoticeStorageKey("credits")) !== "1",
    });
  }, []);

  useEffect(() => {
    titleIllusFrames.forEach((src) => {
      const image = new Image();
      image.src = src;
    });

    const timer = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % titleIllusFrames.length);
    }, 220);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const handleStartGame = () => {
    navigate("/levels");
  };

  const handleOpenMenu = (key: NoticeKey, path: string) => {
    if (notices[key]) {
      localStorage.setItem(getNoticeStorageKey(key), "1");
      setNotices((prev) => ({ ...prev, [key]: false }));
    }
    navigate(path);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden p-4 md:p-6 lg:min-h-[72vh] lg:h-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(126,143,190,0.2),transparent_55%),radial-gradient(circle_at_30%_90%,rgba(251,137,104,0.2),transparent_58%)]" />

      <section className="relative z-10 mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full md:max-w-[430px]"
        >
          <div className="relative mx-auto w-full max-w-[390px]">
            <img
              src="/brand/logo1.png"
              alt="To Be Human Again logo"
              className="pointer-events-none absolute left-1/2 top-5 z-20 w-[165px] -translate-x-1/2 md:top-7 md:w-[205px]"
            />
            <img
              src={titleIllusFrames[frameIndex]}
              alt="To Be Human Again animated title illustration"
              className="mx-auto w-full max-w-[360px] translate-y-20 md:max-w-[390px] md:translate-y-14"
            />
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.18,
                },
              },
            }}
          >
            <Card className="mx-auto -mt-2 w-full max-w-[390px] space-y-3 border-[#c9c2ba] bg-white/74 p-4 md:-mt-1">
              <motion.div variants={buttonMotion}>
                <Button fullWidth onClick={handleStartGame}>
                  Start Game
                </Button>
              </motion.div>
              <motion.div variants={buttonMotion}>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => handleOpenMenu("missions", "/missions")}
                >
                  <span className="relative inline-flex items-center">
                    Missions
                    {notices.missions && (
                      <span className="absolute -right-3 -top-1.5 h-2.5 w-2.5 rounded-full bg-[#d24242] ring-2 ring-[#fff9f6]" />
                    )}
                  </span>
                </Button>
              </motion.div>
              <motion.div variants={buttonMotion}>
                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => handleOpenMenu("settings", "/settings")}
                >
                  <span className="relative inline-flex items-center">
                    Settings
                    {notices.settings && (
                      <span className="absolute -right-3 -top-1.5 h-2.5 w-2.5 rounded-full bg-[#d24242] ring-2 ring-[#fff9f6]" />
                    )}
                  </span>
                </Button>
              </motion.div>
              <motion.div variants={buttonMotion}>
                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => handleOpenMenu("credits", "/credits")}
                >
                  <span className="relative inline-flex items-center">
                    Credits
                    {notices.credits && (
                      <span className="absolute -right-3 -top-1.5 h-2.5 w-2.5 rounded-full bg-[#d24242] ring-2 ring-[#fff9f6]" />
                    )}
                  </span>
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};
