import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { useGame } from "../context/GameContext";

const TYPE_SPEED_MS = 38;
const CHOICE_STAGGER_MS = 260;
const ANIM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DIALOG_TRANSITION_SECONDS = 0.42;
const CHOICE_TRANSITION_SECONDS = 0.38;

const checkpointBackgrounds: Record<string, string> = {
  "bg-feed": "/checkpoints/bg-feed.png",
  "bg-chat": "/checkpoints/bg-chat.png",
  "bg-thread": "/checkpoints/bg-thread.png",
  "bg-safe-room": "/checkpoints/bg-safe-room.png",
  "bg-cancel": "/checkpoints/bg-cancel.png",
  "bg-report": "/checkpoints/bg-report.png",
  "bg-reflect": "/checkpoints/bg-reflect.png",
  "bg-closing": "/checkpoints/bg-closing.png",
};

const splitNarrationLines = (body: string) => {
  const lines = body
    .split(/\r?\n+/)
    .flatMap((line) => line.split("||"))
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : ["..."];
};

export const StoryPage = () => {
  const navigate = useNavigate();
  const { currentScene, chapterCompleted, continueGame, choose } = useGame();
  const [loading, setLoading] = useState(false);
  const [narrationLines, setNarrationLines] = useState<string[]>([]);
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [visibleChoiceCount, setVisibleChoiceCount] = useState(0);
  const sceneBackground = currentScene?.background ? checkpointBackgrounds[currentScene.background] : null;

  useEffect(() => {
    if (!currentScene) {
      void continueGame();
    }
  }, [currentScene, continueGame]);

  useEffect(() => {
    if (!currentScene) {
      setNarrationLines([]);
      setNarrationIndex(0);
      setTypedCount(0);
      setVisibleChoiceCount(0);
      return;
    }

    setNarrationLines(splitNarrationLines(currentScene.body));
    setNarrationIndex(0);
    setTypedCount(0);
    setVisibleChoiceCount(0);
  }, [currentScene]);

  const hasNarration = narrationLines.length > 0;
  const safeNarrationIndex = hasNarration ? Math.min(narrationIndex, narrationLines.length - 1) : 0;
  const currentNarration = hasNarration ? narrationLines[safeNarrationIndex] : "...";
  const hasNextNarration = hasNarration && safeNarrationIndex < narrationLines.length - 1;
  const isTyping = hasNarration && typedCount < currentNarration.length;
  const typedNarration = hasNarration ? currentNarration.slice(0, typedCount) : "...";
  const choicesUnlocked = Boolean(currentScene) && (!hasNarration || (!hasNextNarration && !isTyping));

  useEffect(() => {
    setTypedCount(0);
  }, [currentScene?.id, safeNarrationIndex]);

  useEffect(() => {
    if (!hasNarration) {
      return;
    }

    if (typedCount >= currentNarration.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTypedCount((prev) => Math.min(currentNarration.length, prev + 1));
    }, TYPE_SPEED_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [typedCount, currentNarration, hasNarration]);

  useEffect(() => {
    if (!currentScene || !choicesUnlocked) {
      setVisibleChoiceCount(0);
      return;
    }

    const totalChoices = currentScene.choices.length;
    if (totalChoices === 0) {
      setVisibleChoiceCount(0);
      return;
    }

    setVisibleChoiceCount(1);
    if (totalChoices === 1) {
      return;
    }

    let revealed = 1;
    const timer = window.setInterval(() => {
      revealed += 1;
      setVisibleChoiceCount(Math.min(revealed, totalChoices));

      if (revealed >= totalChoices) {
        window.clearInterval(timer);
      }
    }, CHOICE_STAGGER_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [choicesUnlocked, currentScene?.id, currentScene?.choices.length]);

  const handleChoice = async (choiceId: string) => {
    setLoading(true);
    try {
      await choose(choiceId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const continueNarration = () => {
    if (isTyping) {
      setTypedCount(currentNarration.length);
      return;
    }

    if (hasNextNarration) {
      setNarrationIndex((prev) => prev + 1);
    }
  };

  const renderedChoices = currentScene?.choices.slice(0, visibleChoiceCount) ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden lg:min-h-[calc(100vh-72px)]">
      {sceneBackground ? (
        <div className="pointer-events-none absolute inset-0">
          <img
            src={sceneBackground}
            alt={currentScene?.title ?? "Checkpoint background"}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,242,0.05)_0%,rgba(248,250,242,0.16)_100%)]" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[rgb(248,250,242)]" />
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col p-4 md:p-6 lg:min-h-[calc(100vh-72px)]">
        {!currentScene && (
          <p className="rounded-2xl bg-white/78 p-4 text-sm text-[#5f4e54]">
            Belum ada scene aktif. Mulai dari Start Game di Home.
          </p>
        )}

        {currentScene && (
          <>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button variant="secondary" className="h-10 rounded-xl px-4 text-lg" onClick={() => navigate("/levels")}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d2ca] bg-[#fffdf2dc] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#5d4b50] shadow-[0_8px_18px_rgba(45,28,30,0.12)]">
                <span>{currentScene.chapter.title}</span>
              </div>
            </div>

            <div className="space-y-3 pb-1 md:pb-3">
              <div
                className={`rounded-[1.75rem] border border-[#d9d2ca] bg-[#fffdf4ec] px-5 py-4 shadow-[0_12px_24px_rgba(45,28,30,0.16)] ${
                  isTyping || hasNextNarration ? "cursor-pointer" : ""
                }`}
                onClick={continueNarration}
                role={isTyping || hasNextNarration ? "button" : undefined}
                tabIndex={isTyping || hasNextNarration ? 0 : undefined}
                onKeyDown={
                  isTyping || hasNextNarration
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          continueNarration();
                        }
                      }
                    : undefined
                }
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${currentScene.id}-${safeNarrationIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: DIALOG_TRANSITION_SECONDS, ease: ANIM_EASE }}
                    className="min-h-[76px] text-base leading-relaxed text-[#503f44] md:text-[1.05rem]"
                  >
                    {typedNarration}
                    {isTyping && <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-[#705a61]" />}
                  </motion.p>
                </AnimatePresence>
              </div>

              {(isTyping || hasNextNarration) && (
                <Button variant="secondary" fullWidth onClick={continueNarration}>
                  {isTyping ? "Skip" : "Lanjut"}
                </Button>
              )}

              {choicesUnlocked && (
                <div className="space-y-3">
                  {currentScene.choices.length > 0 ? (
                    renderedChoices.map((choice) => (
                      <motion.button
                        key={choice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: CHOICE_TRANSITION_SECONDS, ease: ANIM_EASE }}
                        className="group w-full cursor-pointer rounded-2xl border border-[#b9c6ee] bg-[linear-gradient(180deg,#f8faff_0%,#eef3ff_100%)] px-4 py-3 text-left font-body text-[0.95rem] font-semibold text-[#2d467a] shadow-[0_10px_22px_rgba(48,66,112,0.18)] transition duration-150 hover:-translate-y-0.5 hover:border-[#8fa5df] hover:bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_100%)] hover:shadow-[0_14px_26px_rgba(48,66,112,0.24)] active:translate-y-0 active:scale-[0.998] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9aaee5]/35 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleChoice(choice.id)}
                        disabled={loading}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span>{choice.text}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </span>
                      </motion.button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-[#d8d2ca] bg-[#fffdf2d6] p-4 text-sm text-[#5a4a50]">
                      Tidak ada pilihan lanjutan untuk scene ini.
                    </div>
                  )}
                </div>
              )}

              {chapterCompleted && choicesUnlocked && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button variant="secondary" onClick={() => navigate("/home")}>Back to Home</Button>
                  <Button onClick={() => navigate("/dashboard")}>Open Reflection</Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
