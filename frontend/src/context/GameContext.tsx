import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { ChoiceResult, ContinuePayload, ProgressState, StoryScene } from "../types/api";

type GameContextValue = {
  progress: ProgressState | null;
  currentScene: StoryScene | null;
  pendingFeedback: ChoiceResult["feedback"] | null;
  chapterCompleted: boolean;
  startNewGame: () => Promise<void>;
  continueGame: () => Promise<boolean>;
  choose: (choiceId: string) => Promise<void>;
  clearFeedback: () => void;
  clearRun: () => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<ChoiceResult["feedback"] | null>(null);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  const startNewGame = useCallback(async () => {
    const { data } = await api.post<ContinuePayload>("/game/new");
    setProgress(data.progress);
    setCurrentScene(data.scene);
    setPendingFeedback(null);
    setChapterCompleted(Boolean(data.progress.completedAt));
  }, []);

  const continueGame = useCallback(async () => {
    try {
      const { data } = await api.get<ContinuePayload>("/game/continue");
      setProgress(data.progress);
      setCurrentScene(data.scene);
      setPendingFeedback(null);
      setChapterCompleted(Boolean(data.progress.completedAt));
      return true;
    } catch {
      setProgress(null);
      setCurrentScene(null);
      setPendingFeedback(null);
      setChapterCompleted(false);
      return false;
    }
  }, []);

  const choose = useCallback(
    async (choiceId: string) => {
      if (!progress) {
        throw new Error("No active progress");
      }

      const { data } = await api.post<ChoiceResult>("/game/choose", {
        progressId: progress.id,
        choiceId,
      });

      setPendingFeedback(data.feedback);
      setChapterCompleted(data.chapterCompleted);
      setCurrentScene(data.nextScene);

      setProgress((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          checkpointIndex: data.progress.checkpointIndex,
          chapterEmpathyScore: data.progress.chapterEmpathyScore,
          totalEmpathyScore: data.progress.totalEmpathyScore,
          currentSceneId: data.nextScene?.id ?? prev.currentSceneId,
          completedAt: data.chapterCompleted ? new Date().toISOString() : prev.completedAt,
        };
      });
    },
    [progress],
  );

  const clearFeedback = useCallback(() => {
    setPendingFeedback(null);
  }, []);

  const clearRun = useCallback(() => {
    setProgress(null);
    setCurrentScene(null);
    setPendingFeedback(null);
    setChapterCompleted(false);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      currentScene,
      pendingFeedback,
      chapterCompleted,
      startNewGame,
      continueGame,
      choose,
      clearFeedback,
      clearRun,
    }),
    [progress, currentScene, pendingFeedback, chapterCompleted, startNewGame, continueGame, choose, clearFeedback, clearRun],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return context;
};
