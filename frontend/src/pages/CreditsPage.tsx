import { Card } from "../components/ui/Card";

export const CreditsPage = () => {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="font-caveat text-5xl text-ink">Credits</h1>
      <Card>
        <p className="text-sm text-[#57484d]">Game concept: To Be Human Again</p>
        <p className="mt-1 text-sm text-[#57484d]">Built with React + TypeScript + Tailwind + Express + Prisma.</p>
      </Card>
    </div>
  );
};
