export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface StoryChoice {
  id: string;
  text: string;
  empathyDelta: number;
  nextSceneId: string | null;
}

export interface StoryScene {
  id: string;
  sceneKey: string;
  title: string;
  body: string;
  speaker: string | null;
  background: string | null;
  isEnd: boolean;
  chapter: {
    id: string;
    title: string;
    slug: string;
  };
  choices: StoryChoice[];
}

export interface ProgressState {
  id: string;
  userId: string;
  chapterId: string;
  currentSceneId: string;
  checkpointIndex: number;
  chapterEmpathyScore: number;
  totalEmpathyScore: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ContinuePayload {
  progress: ProgressState;
  scene: StoryScene;
}

export interface ChoiceResult {
  feedback: {
    text: string;
    empathyDelta: number;
    relationshipDelta: number;
  };
  progress: {
    id: string;
    checkpointIndex: number;
    chapterEmpathyScore: number;
    totalEmpathyScore: number;
  };
  chapterCompleted: boolean;
  nextScene: StoryScene | null;
}

export interface MissionItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  objective: string;
  rewardScore: number;
  rewardBadge: string;
  orderIndex: number;
  status: "LOCKED" | "UNLOCKED" | "COMPLETED";
  completedAt: string | null;
  scoreEarned: number;
}

export interface DashboardData {
  totalEmpathyScore: number;
  recommendation: string;
  chapterSummaries: Array<{
    chapterId: string;
    chapterTitle: string;
    chapterEmpathyScore: number;
    completedAt: string | null;
  }>;
  importantChoices: Array<{
    sceneTitle: string;
    choiceText: string;
    empathyDelta: number;
    feedback: string;
    at: string;
  }>;
  badges: Array<{
    title: string;
    badge: string;
    rewardScore: number;
  }>;
}

export interface AnalyticsData {
  playerCount: number;
  mostChosenScenes: Array<{
    sceneId: string;
    sceneTitle: string;
    picks: number;
  }>;
  empathyDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  playerScores: Array<{
    userId: string;
    displayName: string;
    username: string;
    email: string;
    totalEmpathyScore: number;
    lastUpdatedAt: string;
  }>;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPublished: boolean;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  chapterId: string;
  sceneKey: string;
  title: string;
  body: string;
  speaker: string | null;
  orderIndex: number;
  isStart: boolean;
  isEnd: boolean;
  isPublished: boolean;
  background: string | null;
  choices: Choice[];
}

export interface Choice {
  id: string;
  sceneId: string;
  text: string;
  empathyDelta: number;
  relationshipDelta: number;
  feedbackText: string;
  nextSceneId: string | null;
  isPublished: boolean;
}

export interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  objective: string;
  rewardScore: number;
  rewardBadge: string;
  requiredMissionId: string | null;
  chapterId: string | null;
  orderIndex: number;
  isPublished: boolean;
}
