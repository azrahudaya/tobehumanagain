import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../api/client";
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

export const TitleScreenPage = () => {
  const navigate = useNavigate();
  const { startNewGame, continueGame, clearRun } = useGame();
  const [hasProgress, setHasProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    clearRun();

    const loadTitleState = async () => {
      try {
        const { data } = await api.get<{ hasProgress: boolean }>("/game/title-state");
        setHasProgress(data.hasProgress);
      } catch {
        setHasProgress(false);
      }
    };

    void loadTitleState();
  }, [clearRun]);

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

  const handleNewGame = async () => {
    setLoading(true);
    try {
      await startNewGame();
      navigate("/story");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const exists = await continueGame();
      if (!exists) {
        toast.error("Belum ada progress untuk dilanjutkan.");
        setHasProgress(false);
        return;
      }
      navigate("/story");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[88vh] overflow-hidden p-4 md:min-h-[72vh] md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(126,143,190,0.2),transparent_55%),radial-gradient(circle_at_30%_90%,rgba(251,137,104,0.2),transparent_58%)]" />
      <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full border border-[#6f5a60]/20" />
      <div className="absolute bottom-16 right-8 h-24 w-24 rounded-full border border-[#8d787e]/20" />

      <section className="relative z-10 mx-auto flex h-full max-w-xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full pt-3 md:max-w-[430px] md:pt-5"
        >
          <img
            src={titleIllusFrames[frameIndex]}
            alt="To Be Human Again animated title illustration"
            className="mx-auto w-full max-w-[360px] md:max-w-[390px]"
          />

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
            <Card className="mx-auto mt-1 w-full max-w-[390px] space-y-3 border-[#c9c2ba] bg-white/74 p-4 md:mt-2">
              <motion.div variants={buttonMotion}>
                <Button fullWidth onClick={handleNewGame} disabled={loading}>
                  New Game
                </Button>
              </motion.div>
              <motion.div variants={buttonMotion}>
                <Button fullWidth variant="secondary" onClick={handleContinue} disabled={!hasProgress || loading}>
                  Continue
                </Button>
              </motion.div>
              <motion.div variants={buttonMotion}>
                <Button fullWidth variant="ghost" onClick={() => navigate("/settings")}>Settings</Button>
              </motion.div>
              <motion.div variants={buttonMotion}>
                <Button fullWidth variant="ghost" onClick={() => navigate("/credits")}>Credits</Button>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};
