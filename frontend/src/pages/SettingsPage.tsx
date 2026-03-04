import { Card } from "../components/ui/Card";

export const SettingsPage = () => {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="font-caveat text-5xl text-ink">Settings</h1>
      <Card>
        <p className="text-sm text-[#58484d]">Versi ini menyiapkan panel setting dasar. Pengaturan audio, subtitle speed, dan accessibility dapat ditambah di iterasi berikutnya.</p>
      </Card>
    </div>
  );
};
