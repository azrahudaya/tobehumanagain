import { MissionStatus, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.use(requireAuth);

const sceneInclude = {
  chapter: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  choices: {
    where: { isPublished: true },
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      text: true,
      empathyDelta: true,
      nextSceneId: true,
    },
  },
} satisfies Prisma.SceneInclude;

const serializeScene = (scene: Prisma.SceneGetPayload<{ include: typeof sceneInclude }>) => {
  return {
    id: scene.id,
    sceneKey: scene.sceneKey,
    title: scene.title,
    body: scene.body,
    speaker: scene.speaker,
    background: scene.background,
    isEnd: scene.isEnd,
    chapter: scene.chapter,
    choices: scene.choices,
  };
};

const getSceneWithChoices = async (sceneId: string) => {
  return prisma.scene.findUnique({
    where: { id: sceneId },
    include: sceneInclude,
  });
};

const recommendationForScore = (score: number) => {
  if (score >= 15) {
    return "Kamu sudah konsisten empatik. Tantangan berikutnya: tetap tegas saat tekanan sosial meningkat.";
  }
  if (score >= 6) {
    return "Empatimu mulai stabil. Coba lebih sering validasi emosi korban sebelum memilih tindakan publik.";
  }
  return "Mulai dari langkah kecil: dengarkan dulu, hindari mempermalukan, lalu pilih tindakan yang aman untuk semua pihak.";
};

type MissionEvaluationContext = {
  latestOverallProgress: {
    id: string;
    chapterId: string;
    checkpointIndex: number;
    chapterEmpathyScore: number;
    totalEmpathyScore: number;
    completedAt: Date | null;
  } | null;
  latestProgressByChapter: Map<
    string,
    {
      id: string;
      chapterId: string;
      checkpointIndex: number;
      chapterEmpathyScore: number;
      totalEmpathyScore: number;
      completedAt: Date | null;
    }
  >;
  hasDeEscalativeChoiceByChapter: Map<string, boolean>;
};

const missionAutoCompleted = (
  mission: {
    slug: string;
    chapterId: string | null;
  },
  context: MissionEvaluationContext,
) => {
  const chapterProgress = mission.chapterId ? context.latestProgressByChapter.get(mission.chapterId) ?? null : null;

  if (mission.slug === "m01-signal-care") {
    return Boolean(chapterProgress && chapterProgress.checkpointIndex >= 3 && chapterProgress.chapterEmpathyScore >= 2);
  }

  if (mission.slug === "m02-bridge-builder") {
    return Boolean(
      chapterProgress?.completedAt &&
        mission.chapterId &&
        context.hasDeEscalativeChoiceByChapter.get(mission.chapterId),
    );
  }

  if (mission.chapterId) {
    return Boolean(chapterProgress?.completedAt);
  }

  return Boolean(context.latestOverallProgress?.completedAt);
};

const rewardMissionCompletion = async (
  tx: Prisma.TransactionClient,
  userId: string,
  mission: {
    id: string;
    slug: string;
    title: string;
    rewardScore: number;
    chapterId: string | null;
  },
  context: MissionEvaluationContext,
) => {
  const targetProgress = mission.chapterId
    ? context.latestProgressByChapter.get(mission.chapterId) ?? null
    : context.latestOverallProgress;

  if (!targetProgress) {
    return;
  }

  const updatedProgress = await tx.progress.update({
    where: { id: targetProgress.id },
    data: {
      totalEmpathyScore: { increment: mission.rewardScore },
      chapterEmpathyScore: mission.chapterId === targetProgress.chapterId ? { increment: mission.rewardScore } : undefined,
    },
    select: {
      id: true,
      chapterId: true,
      checkpointIndex: true,
      chapterEmpathyScore: true,
      totalEmpathyScore: true,
      completedAt: true,
    },
  });

  context.latestOverallProgress = updatedProgress;
  context.latestProgressByChapter.set(updatedProgress.chapterId, updatedProgress);

  await tx.scoreLog.create({
    data: {
      userId,
      chapterId: updatedProgress.chapterId,
      progressId: updatedProgress.id,
      source: `MISSION:${mission.slug}`,
      delta: mission.rewardScore,
      note: mission.title,
    },
  });
};

const syncUserMissions = async (userId: string) => {
  const missions = await prisma.mission.findMany({
    where: { isPublished: true },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });

  const existing = await prisma.userMission.findMany({
    where: { userId },
  });

  const progresses = await prisma.progress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      chapterId: true,
      checkpointIndex: true,
      chapterEmpathyScore: true,
      totalEmpathyScore: true,
      completedAt: true,
    },
  });

  const choiceLogs = await prisma.choiceLog.findMany({
    where: { userId },
    select: {
      chapterId: true,
      empathyDelta: true,
    },
  });

  const missionMap = new Map(existing.map((item) => [item.missionId, item]));
  const latestProgressByChapter = new Map<string, (typeof progresses)[number]>();

  for (const progress of progresses) {
    if (!latestProgressByChapter.has(progress.chapterId)) {
      latestProgressByChapter.set(progress.chapterId, progress);
    }
  }

  const hasDeEscalativeChoiceByChapter = new Map<string, boolean>();
  for (const log of choiceLogs) {
    if (log.empathyDelta >= 2) {
      hasDeEscalativeChoiceByChapter.set(log.chapterId, true);
    }
  }

  const missionContext: MissionEvaluationContext = {
    latestOverallProgress: progresses[0] ?? null,
    latestProgressByChapter,
    hasDeEscalativeChoiceByChapter,
  };

  for (const mission of missions) {
    const current = missionMap.get(mission.id);
    const prerequisite = mission.requiredMissionId ? missionMap.get(mission.requiredMissionId) : null;
    const unlocked = !mission.requiredMissionId || prerequisite?.status === MissionStatus.COMPLETED;

    if (!current) {
      const created = await prisma.userMission.create({
        data: {
          userId,
          missionId: mission.id,
          status: unlocked ? MissionStatus.UNLOCKED : MissionStatus.LOCKED,
        },
      });
      missionMap.set(mission.id, created);
      continue;
    }

    if (current.status === MissionStatus.LOCKED && unlocked) {
      const updated = await prisma.userMission.update({
        where: { id: current.id },
        data: { status: MissionStatus.UNLOCKED },
      });
      missionMap.set(mission.id, updated);
    }
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const mission of missions) {
      const current = missionMap.get(mission.id);

      if (!current) {
        continue;
      }

      const prerequisite = mission.requiredMissionId ? missionMap.get(mission.requiredMissionId) : null;
      const unlocked = !mission.requiredMissionId || prerequisite?.status === MissionStatus.COMPLETED;

      if (current.status === MissionStatus.LOCKED && unlocked) {
        const unlockedMission = await prisma.userMission.update({
          where: { id: current.id },
          data: { status: MissionStatus.UNLOCKED },
        });
        missionMap.set(mission.id, unlockedMission);
        changed = true;
        continue;
      }

      if (current.status !== MissionStatus.UNLOCKED) {
        continue;
      }

      if (!missionAutoCompleted(mission, missionContext)) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.userMission.update({
          where: { id: current.id },
          data: {
            status: MissionStatus.COMPLETED,
            scoreEarned: mission.rewardScore,
            completedAt: new Date(),
          },
        });

        await rewardMissionCompletion(tx, userId, mission, missionContext);
      });

      missionMap.set(mission.id, {
        ...current,
        status: MissionStatus.COMPLETED,
        scoreEarned: mission.rewardScore,
        completedAt: new Date(),
      });

      changed = true;
    }
  }

  return missions.map((mission) => {
    const userMission = missionMap.get(mission.id);
    return {
      ...mission,
      status: userMission?.status ?? MissionStatus.LOCKED,
      scoreEarned: userMission?.scoreEarned ?? 0,
      completedAt: userMission?.completedAt ?? null,
    };
  });
};

router.get("/title-state", async (req, res, next) => {
  try {
    const latestProgress = await prisma.progress.findFirst({
      where: {
        userId: req.authUser!.id,
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({
      hasProgress: Boolean(latestProgress),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const chapter = await prisma.chapter.findFirst({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      include: {
        scenes: {
          where: {
            isPublished: true,
            isStart: true,
          },
          orderBy: { orderIndex: "asc" },
          take: 1,
        },
      },
    });

    if (!chapter || chapter.scenes.length === 0) {
      throw new HttpError(404, "No published chapter with a start scene.");
    }

    const startScene = chapter.scenes[0]!;
    const userId = req.authUser!.id;

    await prisma.$transaction([
      prisma.choiceLog.deleteMany({ where: { userId } }),
      prisma.scoreLog.deleteMany({ where: { userId } }),
      prisma.userMission.deleteMany({ where: { userId } }),
      prisma.progress.deleteMany({ where: { userId } }),
    ]);

    const progress = await prisma.progress.create({
      data: {
        userId,
        chapterId: chapter.id,
        currentSceneId: startScene.id,
        keyChoicesJson: "[]",
      },
    });

    await syncUserMissions(userId);

    const scene = await getSceneWithChoices(startScene.id);

    if (!scene) {
      throw new HttpError(404, "Start scene not found.");
    }

    return res.status(201).json({
      progress,
      scene: serializeScene(scene),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/continue", async (req, res, next) => {
  try {
    const progress = await prisma.progress.findFirst({
      where: {
        userId: req.authUser!.id,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!progress) {
      throw new HttpError(404, "No saved progress found.");
    }

    const scene = await getSceneWithChoices(progress.currentSceneId);

    if (!scene) {
      throw new HttpError(404, "Scene from saved progress not found.");
    }

    return res.json({
      progress,
      scene: serializeScene(scene),
    });
  } catch (error) {
    return next(error);
  }
});

const chooseSchema = z.object({
  progressId: z.string().min(1),
  choiceId: z.string().min(1),
});

router.post("/choose", async (req, res, next) => {
  try {
    const { progressId, choiceId } = chooseSchema.parse(req.body);

    const progress = await prisma.progress.findFirst({
      where: {
        id: progressId,
        userId: req.authUser!.id,
      },
      include: {
        currentScene: true,
      },
    });

    if (!progress) {
      throw new HttpError(404, "Progress not found.");
    }

    if (progress.completedAt) {
      throw new HttpError(400, "Chapter already completed.");
    }

    const choice = await prisma.choice.findFirst({
      where: {
        id: choiceId,
        sceneId: progress.currentSceneId,
        isPublished: true,
      },
    });

    if (!choice) {
      throw new HttpError(400, "Choice is not available for this scene.");
    }

    let previousHistory: Array<Record<string, unknown>> = [];
    if (progress.keyChoicesJson) {
      try {
        const parsed = JSON.parse(progress.keyChoicesJson);
        previousHistory = Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : [];
      } catch {
        previousHistory = [];
      }
    }

    const historyEntry = {
      sceneId: progress.currentSceneId,
      sceneTitle: progress.currentScene.title,
      choiceId: choice.id,
      choiceText: choice.text,
      empathyDelta: choice.empathyDelta,
      at: new Date().toISOString(),
    };

    const nextHistory = [...previousHistory, historyEntry].slice(-24);

    const updatedProgress = await prisma.$transaction(async (tx) => {
      const updated = await tx.progress.update({
        where: { id: progress.id },
        data: {
          currentSceneId: choice.nextSceneId ?? progress.currentSceneId,
          checkpointIndex: { increment: 1 },
          chapterEmpathyScore: { increment: choice.empathyDelta },
          totalEmpathyScore: { increment: choice.empathyDelta },
          keyChoicesJson: JSON.stringify(nextHistory),
          completedAt: choice.nextSceneId ? undefined : new Date(),
        },
      });

      await tx.choiceLog.create({
        data: {
          userId: req.authUser!.id,
          chapterId: progress.chapterId,
          sceneId: progress.currentSceneId,
          choiceId: choice.id,
          empathyDelta: choice.empathyDelta,
        },
      });

      await tx.scoreLog.create({
        data: {
          userId: req.authUser!.id,
          chapterId: progress.chapterId,
          progressId: progress.id,
          source: `CHOICE:${choice.id}`,
          delta: choice.empathyDelta,
          note: choice.text,
        },
      });

      return updated;
    });

    let nextScene = choice.nextSceneId ? await getSceneWithChoices(choice.nextSceneId) : null;
    let chapterCompleted = Boolean(updatedProgress.completedAt);

    if (nextScene && nextScene.isEnd && nextScene.choices.length === 0 && !updatedProgress.completedAt) {
      await prisma.progress.update({
        where: { id: progress.id },
        data: { completedAt: new Date() },
      });
      chapterCompleted = true;
    }

    if (!nextScene && choice.nextSceneId) {
      throw new HttpError(404, "Next scene not found.");
    }

    await syncUserMissions(req.authUser!.id);

    return res.json({
      feedback: {
        text: choice.feedbackText,
        empathyDelta: choice.empathyDelta,
        relationshipDelta: choice.relationshipDelta,
      },
      progress: {
        id: updatedProgress.id,
        chapterEmpathyScore: updatedProgress.chapterEmpathyScore,
        totalEmpathyScore: updatedProgress.totalEmpathyScore,
        checkpointIndex: updatedProgress.checkpointIndex,
      },
      chapterCompleted,
      nextScene: nextScene ? serializeScene(nextScene) : null,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/missions", async (req, res, next) => {
  try {
    const missions = await syncUserMissions(req.authUser!.id);
    return res.json(missions);
  } catch (error) {
    return next(error);
  }
});

router.post("/missions/:missionId/complete", async (req, res, next) => {
  try {
    const missionId = z.string().min(1).parse(req.params.missionId);
    const missions = await syncUserMissions(req.authUser!.id);
    const mission = missions.find((item) => item.id === missionId);

    if (!mission) {
      throw new HttpError(404, "Mission not found.");
    }

    return res.json({
      message: "Mission status ditentukan otomatis oleh sistem.",
      status: mission.status,
      missions,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const userId = req.authUser!.id;

    const progresses = await prisma.progress.findMany({
      where: { userId },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: "asc" },
    });

    const totalScore = progresses.length > 0 ? Math.max(...progresses.map((item) => item.totalEmpathyScore)) : 0;

    const choiceHistory = await prisma.choiceLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        scene: {
          select: {
            title: true,
          },
        },
        choice: {
          select: {
            text: true,
            feedbackText: true,
            empathyDelta: true,
          },
        },
      },
    });

    const badges = await prisma.userMission.findMany({
      where: {
        userId,
        status: MissionStatus.COMPLETED,
      },
      include: {
        mission: {
          select: {
            title: true,
            rewardBadge: true,
            rewardScore: true,
          },
        },
      },
    });

    return res.json({
      totalEmpathyScore: totalScore,
      recommendation: recommendationForScore(totalScore),
      chapterSummaries: progresses.map((progress) => ({
        chapterId: progress.chapterId,
        chapterTitle: progress.chapter.title,
        chapterEmpathyScore: progress.chapterEmpathyScore,
        completedAt: progress.completedAt,
      })),
      importantChoices: choiceHistory.map((item) => ({
        sceneTitle: item.scene.title,
        choiceText: item.choice.text,
        empathyDelta: item.choice.empathyDelta,
        feedback: item.choice.feedbackText,
        at: item.createdAt,
      })),
      badges: badges.map((item) => ({
        title: item.mission.title,
        badge: item.mission.rewardBadge,
        rewardScore: item.mission.rewardScore,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

export { router as gameRouter };
