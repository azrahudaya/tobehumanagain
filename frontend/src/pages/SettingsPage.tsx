import { ArrowLeft, Music2, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4 md:p-6">
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
          Pengaturan audio sedang disiapkan untuk update berikutnya.
        </p>
      </div>

      <Card className="space-y-4 border-[#d4cfc8] bg-white/82">
        <h2 className="inline-flex items-center gap-2 font-caveat text-4xl text-[#4d3a3f]">
          <Music2 className="h-6 w-6" />
          Audio (Coming Soon)
        </h2>

        <div className="space-y-3 opacity-75">
          <div className="rounded-2xl border border-[#d8d1c9] bg-[#fbfaf7] p-4">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5a4a50]">
              <Volume2 className="h-4 w-4" />
              Master Volume
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={70}
              disabled
              className="mt-3 h-2 w-full cursor-not-allowed accent-[#7f8fbe]"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="ghost" className="h-11 rounded-xl text-lg" disabled>
              Music: On
            </Button>
            <Button variant="ghost" className="h-11 rounded-xl text-lg" disabled>
              SFX: On
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
