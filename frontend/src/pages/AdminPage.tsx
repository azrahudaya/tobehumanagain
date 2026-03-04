import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextArea, TextInput } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import type { AnalyticsData, Chapter, Choice, Mission, Scene } from "../types/api";

type AdminTab = "chapters" | "scenes" | "choices" | "missions" | "analytics";

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: "chapters", label: "Chapters" },
  { key: "scenes", label: "Scenes" },
  { key: "choices", label: "Choices" },
  { key: "missions", label: "Missions" },
  { key: "analytics", label: "Analytics" },
];

export const AdminPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>("chapters");
  const [loading, setLoading] = useState(true);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [chapterForm, setChapterForm] = useState({
    slug: "",
    title: "",
    description: "",
    orderIndex: 1,
  });

  const [sceneForm, setSceneForm] = useState({
    chapterId: "",
    sceneKey: "",
    title: "",
    body: "",
    speaker: "",
    orderIndex: 1,
    isStart: false,
    isEnd: false,
  });

  const [choiceForm, setChoiceForm] = useState({
    sceneId: "",
    text: "",
    empathyDelta: 0,
    relationshipDelta: 0,
    feedbackText: "",
    nextSceneId: "",
  });

  const [missionForm, setMissionForm] = useState({
    slug: "",
    title: "",
    description: "",
    objective: "",
    rewardScore: 5,
    rewardBadge: "",
    chapterId: "",
    requiredMissionId: "",
    orderIndex: 1,
  });

  const scenes = useMemo(() => chapters.flatMap((chapter) => chapter.scenes), [chapters]);
  const choices = useMemo(() => scenes.flatMap((scene) => scene.choices), [scenes]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [chaptersRes, missionsRes, analyticsRes] = await Promise.all([
        api.get<Chapter[]>("/admin/chapters"),
        api.get<Mission[]>("/admin/missions"),
        api.get<AnalyticsData>("/admin/analytics"),
      ]);
      setChapters(chaptersRes.data);
      setMissions(missionsRes.data);
      setAnalytics(analyticsRes.data);

      if (!sceneForm.chapterId && chaptersRes.data[0]) {
        setSceneForm((prev) => ({ ...prev, chapterId: chaptersRes.data[0].id }));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  const createChapter = async () => {
    try {
      await api.post("/admin/chapters", {
        ...chapterForm,
        description: chapterForm.description || null,
        isPublished: false,
      });
      setChapterForm({ slug: "", title: "", description: "", orderIndex: 1 });
      await loadAdminData();
      toast.success("Chapter created.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const updateChapter = async (chapter: Chapter) => {
    const title = window.prompt("Chapter title", chapter.title) ?? chapter.title;
    const description = window.prompt("Description", chapter.description ?? "") ?? chapter.description;

    try {
      await api.put(`/admin/chapters/${chapter.id}`, {
        title,
        description,
      });
      await loadAdminData();
      toast.success("Chapter updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleChapterPublish = async (chapter: Chapter) => {
    try {
      await api.put(`/admin/chapters/${chapter.id}`, { isPublished: !chapter.isPublished });
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!window.confirm("Delete this chapter and all scenes/choices?")) return;
    try {
      await api.delete(`/admin/chapters/${chapterId}`);
      await loadAdminData();
      toast.success("Chapter deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const createScene = async () => {
    try {
      await api.post("/admin/scenes", {
        ...sceneForm,
        speaker: sceneForm.speaker || null,
        background: `bg-${sceneForm.sceneKey}`,
        isPublished: true,
      });
      setSceneForm((prev) => ({
        ...prev,
        sceneKey: "",
        title: "",
        body: "",
        speaker: "",
      }));
      await loadAdminData();
      toast.success("Scene created.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const editScene = async (scene: Scene) => {
    const title = window.prompt("Scene title", scene.title) ?? scene.title;
    const body = window.prompt("Scene body", scene.body) ?? scene.body;
    const isStart = window.confirm("Set this as start scene? Click Cancel to keep current.") ? true : scene.isStart;

    try {
      await api.put(`/admin/scenes/${scene.id}`, {
        title,
        body,
        chapterId: scene.chapterId,
        isStart,
      });
      await loadAdminData();
      toast.success("Scene updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleScenePublish = async (scene: Scene) => {
    try {
      await api.put(`/admin/scenes/${scene.id}`, {
        isPublished: !scene.isPublished,
        chapterId: scene.chapterId,
      });
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteScene = async (sceneId: string) => {
    if (!window.confirm("Delete scene?")) return;
    try {
      await api.delete(`/admin/scenes/${sceneId}`);
      await loadAdminData();
      toast.success("Scene deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const createChoice = async () => {
    try {
      await api.post("/admin/choices", {
        ...choiceForm,
        nextSceneId: choiceForm.nextSceneId || null,
        isPublished: true,
      });
      setChoiceForm((prev) => ({
        ...prev,
        text: "",
        empathyDelta: 0,
        relationshipDelta: 0,
        feedbackText: "",
      }));
      await loadAdminData();
      toast.success("Choice created.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const editChoice = async (choice: Choice) => {
    const text = window.prompt("Choice text", choice.text) ?? choice.text;
    const feedbackText = window.prompt("Feedback", choice.feedbackText) ?? choice.feedbackText;

    try {
      await api.put(`/admin/choices/${choice.id}`, {
        text,
        feedbackText,
        sceneId: choice.sceneId,
      });
      await loadAdminData();
      toast.success("Choice updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleChoicePublish = async (choice: Choice) => {
    try {
      await api.put(`/admin/choices/${choice.id}`, {
        sceneId: choice.sceneId,
        isPublished: !choice.isPublished,
      });
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteChoice = async (choiceId: string) => {
    if (!window.confirm("Delete choice?")) return;
    try {
      await api.delete(`/admin/choices/${choiceId}`);
      await loadAdminData();
      toast.success("Choice deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const createMission = async () => {
    try {
      await api.post("/admin/missions", {
        ...missionForm,
        chapterId: missionForm.chapterId || null,
        requiredMissionId: missionForm.requiredMissionId || null,
        isPublished: false,
      });
      setMissionForm({
        slug: "",
        title: "",
        description: "",
        objective: "",
        rewardScore: 5,
        rewardBadge: "",
        chapterId: "",
        requiredMissionId: "",
        orderIndex: 1,
      });
      await loadAdminData();
      toast.success("Mission created.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const editMission = async (mission: Mission) => {
    const title = window.prompt("Mission title", mission.title) ?? mission.title;
    const objective = window.prompt("Objective", mission.objective) ?? mission.objective;

    try {
      await api.put(`/admin/missions/${mission.id}`, {
        title,
        objective,
      });
      await loadAdminData();
      toast.success("Mission updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleMissionPublish = async (mission: Mission) => {
    try {
      await api.put(`/admin/missions/${mission.id}`, { isPublished: !mission.isPublished });
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteMission = async (missionId: string) => {
    if (!window.confirm("Delete mission?")) return;
    try {
      await api.delete(`/admin/missions/${missionId}`);
      await loadAdminData();
      toast.success("Mission deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-caveat text-5xl text-ink">Admin Panel</h1>
        <Button variant="secondary" onClick={() => void loadAdminData()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            className={`rounded-full px-4 py-2 text-xs font-bold ${tab === item.key ? "bg-softBlue text-white" : "bg-white/70 text-[#5e4d52]"}`}
            onClick={() => setTab(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "chapters" && (
        <>
          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-ink">Create Chapter</h2>
            <TextInput placeholder="Slug" value={chapterForm.slug} onChange={(event) => setChapterForm((prev) => ({ ...prev, slug: event.target.value }))} />
            <TextInput placeholder="Title" value={chapterForm.title} onChange={(event) => setChapterForm((prev) => ({ ...prev, title: event.target.value }))} />
            <TextArea placeholder="Description" value={chapterForm.description} onChange={(event) => setChapterForm((prev) => ({ ...prev, description: event.target.value }))} />
            <TextInput
              type="number"
              min={1}
              value={chapterForm.orderIndex}
              onChange={(event) => setChapterForm((prev) => ({ ...prev, orderIndex: Number(event.target.value) }))}
            />
            <Button onClick={createChapter}>Create Chapter</Button>
          </Card>

          {chapters.map((chapter) => (
            <Card key={chapter.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-ink">{chapter.title}</h3>
                  <p className="text-xs text-[#69585e]">{chapter.slug} | Order {chapter.orderIndex}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => void updateChapter(chapter)}>Edit</Button>
                  <Button variant="ghost" onClick={() => void toggleChapterPublish(chapter)}>
                    {chapter.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="danger" onClick={() => void deleteChapter(chapter.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === "scenes" && (
        <>
          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-ink">Create Scene</h2>
            <select
              className="h-11 w-full rounded-2xl border border-[#cbc5bf] bg-white px-3"
              value={sceneForm.chapterId}
              onChange={(event) => setSceneForm((prev) => ({ ...prev, chapterId: event.target.value }))}
            >
              <option value="">Select chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
            <TextInput placeholder="Scene key" value={sceneForm.sceneKey} onChange={(event) => setSceneForm((prev) => ({ ...prev, sceneKey: event.target.value }))} />
            <TextInput placeholder="Title" value={sceneForm.title} onChange={(event) => setSceneForm((prev) => ({ ...prev, title: event.target.value }))} />
            <TextArea placeholder="Body" value={sceneForm.body} onChange={(event) => setSceneForm((prev) => ({ ...prev, body: event.target.value }))} />
            <TextInput placeholder="Speaker" value={sceneForm.speaker} onChange={(event) => setSceneForm((prev) => ({ ...prev, speaker: event.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-[#57484d]">
                <input type="checkbox" checked={sceneForm.isStart} onChange={(event) => setSceneForm((prev) => ({ ...prev, isStart: event.target.checked }))} />
                Start Scene
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#57484d]">
                <input type="checkbox" checked={sceneForm.isEnd} onChange={(event) => setSceneForm((prev) => ({ ...prev, isEnd: event.target.checked }))} />
                End Scene
              </label>
            </div>
            <Button onClick={createScene}>Create Scene</Button>
          </Card>

          {scenes.map((scene) => (
            <Card key={scene.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-ink">{scene.title}</h3>
                  <p className="text-xs text-[#68575d]">{scene.sceneKey} | Choices {scene.choices.length}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => void editScene(scene)}>Edit</Button>
                  <Button variant="ghost" onClick={() => void toggleScenePublish(scene)}>
                    {scene.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="danger" onClick={() => void deleteScene(scene.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === "choices" && (
        <>
          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-ink">Create Choice</h2>
            <select
              className="h-11 w-full rounded-2xl border border-[#cbc5bf] bg-white px-3"
              value={choiceForm.sceneId}
              onChange={(event) => setChoiceForm((prev) => ({ ...prev, sceneId: event.target.value }))}
            >
              <option value="">Select scene</option>
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
            <TextArea placeholder="Choice text" value={choiceForm.text} onChange={(event) => setChoiceForm((prev) => ({ ...prev, text: event.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                type="number"
                value={choiceForm.empathyDelta}
                onChange={(event) => setChoiceForm((prev) => ({ ...prev, empathyDelta: Number(event.target.value) }))}
                placeholder="Empathy delta"
              />
              <TextInput
                type="number"
                value={choiceForm.relationshipDelta}
                onChange={(event) => setChoiceForm((prev) => ({ ...prev, relationshipDelta: Number(event.target.value) }))}
                placeholder="Relationship delta"
              />
            </div>
            <TextArea
              placeholder="Feedback edukatif"
              value={choiceForm.feedbackText}
              onChange={(event) => setChoiceForm((prev) => ({ ...prev, feedbackText: event.target.value }))}
            />
            <select
              className="h-11 w-full rounded-2xl border border-[#cbc5bf] bg-white px-3"
              value={choiceForm.nextSceneId}
              onChange={(event) => setChoiceForm((prev) => ({ ...prev, nextSceneId: event.target.value }))}
            >
              <option value="">No next scene (end)</option>
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
            <Button onClick={createChoice}>Create Choice</Button>
          </Card>

          {choices.map((choice) => (
            <Card key={choice.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#4f3f44]">{choice.text}</p>
                  <p className="mt-1 text-xs text-[#6d5d63]">Score {choice.empathyDelta} | Next {choice.nextSceneId ? "Scene" : "End"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => void editChoice(choice)}>Edit</Button>
                  <Button variant="ghost" onClick={() => void toggleChoicePublish(choice)}>
                    {choice.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="danger" onClick={() => void deleteChoice(choice.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === "missions" && (
        <>
          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-ink">Create Mission</h2>
            <TextInput placeholder="Slug" value={missionForm.slug} onChange={(event) => setMissionForm((prev) => ({ ...prev, slug: event.target.value }))} />
            <TextInput placeholder="Title" value={missionForm.title} onChange={(event) => setMissionForm((prev) => ({ ...prev, title: event.target.value }))} />
            <TextArea placeholder="Description" value={missionForm.description} onChange={(event) => setMissionForm((prev) => ({ ...prev, description: event.target.value }))} />
            <TextArea placeholder="Objective" value={missionForm.objective} onChange={(event) => setMissionForm((prev) => ({ ...prev, objective: event.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                type="number"
                value={missionForm.rewardScore}
                onChange={(event) => setMissionForm((prev) => ({ ...prev, rewardScore: Number(event.target.value) }))}
                placeholder="Reward score"
              />
              <TextInput
                placeholder="Badge"
                value={missionForm.rewardBadge}
                onChange={(event) => setMissionForm((prev) => ({ ...prev, rewardBadge: event.target.value }))}
              />
            </div>
            <select
              className="h-11 w-full rounded-2xl border border-[#cbc5bf] bg-white px-3"
              value={missionForm.chapterId}
              onChange={(event) => setMissionForm((prev) => ({ ...prev, chapterId: event.target.value }))}
            >
              <option value="">No chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
            <select
              className="h-11 w-full rounded-2xl border border-[#cbc5bf] bg-white px-3"
              value={missionForm.requiredMissionId}
              onChange={(event) => setMissionForm((prev) => ({ ...prev, requiredMissionId: event.target.value }))}
            >
              <option value="">No prerequisite</option>
              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.title}
                </option>
              ))}
            </select>
            <Button onClick={createMission}>Create Mission</Button>
          </Card>

          {missions.map((mission) => (
            <Card key={mission.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-ink">{mission.title}</p>
                  <p className="text-xs text-[#6d5d62]">{mission.slug} | Reward +{mission.rewardScore}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => void editMission(mission)}>Edit</Button>
                  <Button variant="ghost" onClick={() => void toggleMissionPublish(mission)}>
                    {mission.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="danger" onClick={() => void deleteMission(mission.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === "analytics" && analytics && (
        <>
          <Card>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7e6d73]">Total Players</p>
            <p className="mt-2 text-4xl font-extrabold text-softBlue">{analytics.playerCount}</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-ink">Scene Paling Sering Dipilih</h2>
            <div className="mt-3 space-y-2">
              {analytics.mostChosenScenes.map((scene) => (
                <div key={scene.sceneId} className="rounded-xl border border-[#d0cbc5] bg-white/70 p-3 text-sm text-[#55454b]">
                  {scene.sceneTitle} - {scene.picks} picks
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-ink">Distribusi Empathy Score</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl bg-[#f8dfdf] p-3 text-center text-[#8f3f3f]">Low: {analytics.empathyDistribution.low}</div>
              <div className="rounded-xl bg-[#f9f0d9] p-3 text-center text-[#8a6f2b]">Medium: {analytics.empathyDistribution.medium}</div>
              <div className="rounded-xl bg-[#dff3e5] p-3 text-center text-[#2e7a52]">High: {analytics.empathyDistribution.high}</div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-ink">Skor Pemain</h2>
            <div className="mt-3 space-y-2">
              {analytics.playerScores.length === 0 && (
                <p className="text-sm text-[#66565c]">Belum ada data skor pemain.</p>
              )}

              {analytics.playerScores.map((player) => (
                <div key={player.userId} className="rounded-xl border border-[#d0cbc5] bg-white/70 p-3 text-sm text-[#55454b]">
                  <p className="font-bold">{player.displayName}</p>
                  <p className="text-xs text-[#6f5f66]">@{player.username} | {player.email}</p>
                  <p className="mt-1 font-semibold text-[#2f4db6]">Total Score: {player.totalEmpathyScore}</p>
                  <p className="text-xs text-[#7b6b71]">Updated: {new Date(player.lastUpdatedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
