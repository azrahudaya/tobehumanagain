import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
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
  const { currentScene, progress, pendingFeedback, chapterCompleted, continueGame, choose, clearFeedback } = useGame();
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
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-4xl flex-col justify-between p-4 md:p-6">
        {!currentScene && (
          <p className="rounded-2xl bg-white/78 p-4 text-sm text-[#5f4e54]">
            Belum ada scene aktif. Mulai New Game dari Title.
          </p>
        )}

        {currentScene && (
          <>
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d2ca] bg-[#fffdf2dc] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#5d4b50] shadow-[0_8px_18px_rgba(45,28,30,0.12)]">
                <span>{currentScene.chapter.title}</span>
                <span className="h-1 w-1 rounded-full bg-[#8c787e]" />
                <span>Checkpoint {progress?.checkpointIndex ?? 0}</span>
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
                  {isTyping ? "Tampilkan Penuh" : "Lanjut"}
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
                        className="w-full rounded-2xl border border-[#d4cec6] bg-[#fffdf4de] px-4 py-3 text-left text-sm font-semibold text-[#534146] shadow-[0_8px_20px_rgba(54,36,36,0.16)] transition hover:-translate-y-0.5 hover:border-[#b6ad8d] hover:bg-[#fffaf0] disabled:opacity-60"
                        onClick={() => handleChoice(choice.id)}
                        disabled={loading}
                      >
                        {choice.text}
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
                  <Button variant="secondary" onClick={() => navigate("/title")}>Back to Title</Button>
                  <Button onClick={() => navigate("/dashboard")}>Open Reflection</Button>
                </div>
              )}
            </div>
          </>
        )}

        <Modal
          open={Boolean(pendingFeedback)}
          title="Feedback Edukatif"
          onClose={clearFeedback}
        >
          <p className="text-sm text-[#58484d]">{pendingFeedback?.text}</p>
          <Button fullWidth onClick={clearFeedback}>Lanjut</Button>
        </Modal>
      </div>
    </div>
  );
};
