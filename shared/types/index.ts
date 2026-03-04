export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
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
  choices: StoryChoice[];
}

export interface ProgressState {
  id: string;
  checkpointIndex: number;
  chapterEmpathyScore: number;
  totalEmpathyScore: number;
  completedAt: string | null;
}
