import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

const chapterSchema = z.object({
  slug: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
  orderIndex: z.coerce.number().int().min(1),
  isPublished: z.boolean().default(false),
});

const sceneSchema = z.object({
  chapterId: z.string().min(1),
  sceneKey: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  body: z.string().min(5),
  speaker: z.string().max(80).optional().nullable(),
  orderIndex: z.coerce.number().int().min(1),
  isStart: z.boolean().default(false),
  isEnd: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  background: z.string().max(80).optional().nullable(),
});

const choiceSchema = z.object({
  sceneId: z.string().min(1),
  text: z.string().min(2),
  empathyDelta: z.coerce.number().int().min(-5).max(5),
  relationshipDelta: z.coerce.number().int().min(-5).max(5).default(0),
  feedbackText: z.string().min(5),
  nextSceneId: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
});

const missionSchema = z.object({
  slug: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  description: z.string().min(5),
  objective: z.string().min(5),
  rewardScore: z.coerce.number().int().min(0).max(100),
  rewardBadge: z.string().min(2).max(80),
  requiredMissionId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  orderIndex: z.coerce.number().int().min(1),
  isPublished: z.boolean().default(false),
});

router.get("/chapters", async (_req, res, next) => {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      include: {
        scenes: {
          orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
          include: {
            choices: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    return res.json(chapters);
  } catch (error) {
    return next(error);
  }
});

router.post("/chapters", async (req, res, next) => {
  try {
    const payload = chapterSchema.parse(req.body);
    const chapter = await prisma.chapter.create({ data: payload });
    return res.status(201).json(chapter);
  } catch (error) {
    return next(error);
  }
});

router.put("/chapters/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const payload = chapterSchema.partial().parse(req.body);

    const chapter = await prisma.chapter.update({
      where: { id },
      data: payload,
    });

    return res.json(chapter);
  } catch (error) {
    return next(error);
  }
});

router.delete("/chapters/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    await prisma.chapter.delete({ where: { id } });

    return res.json({ message: "Chapter deleted." });
  } catch (error) {
    return next(error);
  }
});

router.get("/scenes", async (req, res, next) => {
  try {
    const chapterId = typeof req.query.chapterId === "string" ? req.query.chapterId : undefined;

    const scenes = await prisma.scene.findMany({
      where: chapterId ? { chapterId } : undefined,
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      include: {
        choices: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return res.json(scenes);
  } catch (error) {
    return next(error);
  }
});

router.post("/scenes", async (req, res, next) => {
  try {
    const payload = sceneSchema.parse(req.body);

    if (payload.isStart) {
      await prisma.scene.updateMany({
        where: { chapterId: payload.chapterId, isStart: true },
        data: { isStart: false },
      });
    }

    const scene = await prisma.scene.create({ data: payload });
    return res.status(201).json(scene);
  } catch (error) {
    return next(error);
  }
});

router.put("/scenes/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const payload = sceneSchema.partial().parse(req.body);

    if (payload.isStart && payload.chapterId) {
      await prisma.scene.updateMany({
        where: { chapterId: payload.chapterId, isStart: true },
        data: { isStart: false },
      });
    }

    const scene = await prisma.scene.update({
      where: { id },
      data: payload,
    });

    return res.json(scene);
  } catch (error) {
    return next(error);
  }
});

router.delete("/scenes/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    await prisma.choice.updateMany({
      where: { nextSceneId: id },
      data: { nextSceneId: null },
    });

    await prisma.scene.delete({ where: { id } });

    return res.json({ message: "Scene deleted." });
  } catch (error) {
    return next(error);
  }
});

router.get("/choices", async (req, res, next) => {
  try {
    const sceneId = typeof req.query.sceneId === "string" ? req.query.sceneId : undefined;

    const choices = await prisma.choice.findMany({
      where: sceneId ? { sceneId } : undefined,
      orderBy: { createdAt: "asc" },
    });

    return res.json(choices);
  } catch (error) {
    return next(error);
  }
});

router.post("/choices", async (req, res, next) => {
  try {
    const payload = choiceSchema.parse(req.body);
    const choice = await prisma.choice.create({ data: payload });
    return res.status(201).json(choice);
  } catch (error) {
    return next(error);
  }
});

router.put("/choices/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const payload = choiceSchema.partial().parse(req.body);

    const choice = await prisma.choice.update({
      where: { id },
      data: payload,
    });

    return res.json(choice);
  } catch (error) {
    return next(error);
  }
});

router.delete("/choices/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    await prisma.choice.delete({ where: { id } });

    return res.json({ message: "Choice deleted." });
  } catch (error) {
    return next(error);
  }
});

router.get("/missions", async (_req, res, next) => {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        requiredMission: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.json(missions);
  } catch (error) {
    return next(error);
  }
});

router.post("/missions", async (req, res, next) => {
  try {
    const payload = missionSchema.parse(req.body);
    const mission = await prisma.mission.create({ data: payload });
    return res.status(201).json(mission);
  } catch (error) {
    return next(error);
  }
});

router.put("/missions/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);
    const payload = missionSchema.partial().parse(req.body);

    if (payload.requiredMissionId === id) {
      throw new HttpError(400, "Mission cannot depend on itself.");
    }

    const mission = await prisma.mission.update({
      where: { id },
      data: payload,
    });

    return res.json(mission);
  } catch (error) {
    return next(error);
  }
});

router.delete("/missions/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    await prisma.mission.updateMany({
      where: { requiredMissionId: id },
      data: { requiredMissionId: null },
    });

    await prisma.userMission.deleteMany({ where: { missionId: id } });
    await prisma.mission.delete({ where: { id } });

    return res.json({ message: "Mission deleted." });
  } catch (error) {
    return next(error);
  }
});

router.get("/analytics", async (_req, res, next) => {
  try {
    const playerCount = await prisma.user.count({
      where: { role: Role.USER },
    });

    const sceneCounts = await prisma.choiceLog.groupBy({
      by: ["sceneId"],
      _count: {
        sceneId: true,
      },
      orderBy: {
        _count: {
          sceneId: "desc",
        },
      },
      take: 5,
    });

    const sceneIds = sceneCounts.map((item) => item.sceneId);
    const sceneMeta = sceneIds.length
      ? await prisma.scene.findMany({
          where: { id: { in: sceneIds } },
          select: { id: true, title: true },
        })
      : [];

    const sceneMap = new Map(sceneMeta.map((item) => [item.id, item.title]));

    const progressByUser = await prisma.progress.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        userId: true,
        totalEmpathyScore: true,
        updatedAt: true,
        user: {
          select: {
            displayName: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const latestScoreMap = new Map<
      string,
      {
        userId: string;
        displayName: string;
        username: string;
        email: string;
        totalEmpathyScore: number;
        updatedAt: Date;
      }
    >();

    for (const item of progressByUser) {
      if (!latestScoreMap.has(item.userId)) {
        latestScoreMap.set(item.userId, {
          userId: item.userId,
          displayName: item.user.displayName,
          username: item.user.username,
          email: item.user.email,
          totalEmpathyScore: item.totalEmpathyScore,
          updatedAt: item.updatedAt,
        });
      }
    }

    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
    };

    for (const item of latestScoreMap.values()) {
      const score = item.totalEmpathyScore;
      if (score < 6) {
        distribution.low += 1;
      } else if (score < 15) {
        distribution.medium += 1;
      } else {
        distribution.high += 1;
      }
    }

    const playerScores = [...latestScoreMap.values()]
      .sort((a, b) => b.totalEmpathyScore - a.totalEmpathyScore)
      .map((item) => ({
        userId: item.userId,
        displayName: item.displayName,
        username: item.username,
        email: item.email,
        totalEmpathyScore: item.totalEmpathyScore,
        lastUpdatedAt: item.updatedAt,
      }));

    return res.json({
      playerCount,
      mostChosenScenes: sceneCounts.map((item) => ({
        sceneId: item.sceneId,
        sceneTitle: sceneMap.get(item.sceneId) ?? "Unknown Scene",
        picks: item._count.sceneId,
      })),
      empathyDistribution: distribution,
      playerScores,
    });
  } catch (error) {
    return next(error);
  }
});

export { router as adminRouter };
