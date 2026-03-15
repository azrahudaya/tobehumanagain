import { ArrowLeft, AudioLines, Gamepad2, Music2, SkipForward, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type TextSpeed = "SLOW" | "NORMAL" | "FAST";

type LocalSettings = {
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  textSpeed: TextSpeed;
  autoSkip: boolean;
};

const localSettingsKey = "tbh_settings_v1";

const defaultSettings: LocalSettings = {
  musicVolume: 70,
  sfxVolume: 75,
  voiceVolume: 80,
  textSpeed: "NORMAL",
  autoSkip: false,
};

const textSpeedOptions: { label: string; value: TextSpeed }[] = [
  { label: "Slow", value: "SLOW" },
  { label: "Normal", value: "NORMAL" },
  { label: "Fast", value: "FAST" },
];

const clampVolume = (value: number) => Math.min(100, Math.max(0, value));

const readLocalSettings = (): LocalSettings => {
  try {
    const raw = localStorage.getItem(localSettingsKey);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw) as Partial<LocalSettings>;
    const textSpeed = parsed.textSpeed;

    return {
      musicVolume: clampVolume(Number(parsed.musicVolume ?? defaultSettings.musicVolume)),
      sfxVolume: clampVolume(Number(parsed.sfxVolume ?? defaultSettings.sfxVolume)),
      voiceVolume: clampVolume(Number(parsed.voiceVolume ?? defaultSettings.voiceVolume)),
      textSpeed: textSpeed === "SLOW" || textSpeed === "NORMAL" || textSpeed === "FAST" ? textSpeed : defaultSettings.textSpeed,
      autoSkip: Boolean(parsed.autoSkip ?? defaultSettings.autoSkip),
    };
  } catch {
    return defaultSettings;
  }
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<LocalSettings>(readLocalSettings);

  useEffect(() => {
    localStorage.setItem(localSettingsKey, JSON.stringify(settings));
  }, [settings]);

  const updateVolume = (key: "musicVolume" | "sfxVolume" | "voiceVolume", value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: clampVolume(value),
    }));
  };

  return (
    <div className="mx-auto w-full space-y-4 p-4 md:p-6 lg:w-2/3 lg:max-w-none">
      <div>
        <Button
          variant="secondary"
          className="h-10 rounded-xl px-4 text-lg"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="font-caveat text-5xl text-ink">Settings</h1>
        <p className="text-sm text-[#5d4c51]">
          Pengaturan ini tersimpan lokal di browser.
        </p>
      </div>

      <Card className="space-y-4 border-[#d4cfc8] bg-white/82">
        <h2 className="inline-flex items-center gap-2 font-caveat text-4xl text-[#4d3a3f]">
          <Music2 className="h-6 w-6" />
          Audio Configuration
        </h2>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#d8d1c9] bg-[#fbfaf7] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5a4a50]">
                <Volume2 className="h-4 w-4" />
                Music Volume
              </p>
              <span className="rounded-full border border-[#d4cdc6] bg-white px-2.5 py-1 text-xs font-black text-[#5d4b51]">
                {settings.musicVolume}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.musicVolume}
              onChange={(event) => updateVolume("musicVolume", Number(event.target.value))}
              className="mt-3 h-2 w-full accent-[#7f8fbe]"
              aria-label="Music volume"
            />
          </div>

          <div className="rounded-2xl border border-[#d8d1c9] bg-[#fbfaf7] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5a4a50]">
                <Volume2 className="h-4 w-4" />
                SFX Volume
              </p>
              <span className="rounded-full border border-[#d4cdc6] bg-white px-2.5 py-1 text-xs font-black text-[#5d4b51]">
                {settings.sfxVolume}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.sfxVolume}
              onChange={(event) => updateVolume("sfxVolume", Number(event.target.value))}
              className="mt-3 h-2 w-full accent-[#7f8fbe]"
              aria-label="SFX volume"
            />
          </div>

          <div className="rounded-2xl border border-[#d8d1c9] bg-[#fbfaf7] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5a4a50]">
                <AudioLines className="h-4 w-4" />
                Voice Volume
              </p>
              <span className="rounded-full border border-[#d4cdc6] bg-white px-2.5 py-1 text-xs font-black text-[#5d4b51]">
                {settings.voiceVolume}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.voiceVolume}
              onChange={(event) => updateVolume("voiceVolume", Number(event.target.value))}
              className="mt-3 h-2 w-full accent-[#7f8fbe]"
              aria-label="Voice volume"
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-[#d4cfc8] bg-white/82">
        <h2 className="inline-flex items-center gap-2 font-caveat text-4xl text-[#4d3a3f]">
          <Gamepad2 className="h-6 w-6" />
          Gameplay Configuration
        </h2>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#d8d1c9] bg-[#fbfaf7] p-4">
            <p className="text-sm font-bold text-[#5a4a50]">Text Speed</p>
            <p className="text-xs text-[#786970]">Atur kecepatan munculnya dialog.</p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {textSpeedOptions.map((option) => {
                const isActive = settings.textSpeed === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, textSpeed: option.value }))}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      isActive
                        ? "border-[#6f84be] bg-[#e9efff] text-[#2f4cae]"
                        : "border-[#cdc4bc] bg-white text-[#5f4f55] hover:border-[#93a4d5]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8d1c9] bg-[#fbfaf7] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5a4a50]">
                  <SkipForward className="h-4 w-4" />
                  Auto Skip
                </p>
                <p className="text-xs text-[#786970]">Lewati dialog yang sudah pernah kamu baca.</p>
              </div>

              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, autoSkip: !prev.autoSkip }))}
                className={`relative h-8 w-14 rounded-full border transition ${
                  settings.autoSkip
                    ? "border-[#6380c8] bg-[#cfdcff]"
                    : "border-[#cec6be] bg-[#ece7e1]"
                }`}
                aria-label="Toggle auto skip"
                aria-pressed={settings.autoSkip}
              >
                <span
                  className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoSkip ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
