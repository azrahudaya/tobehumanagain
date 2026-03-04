import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export const CreditsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <Button variant="secondary" className="h-10 rounded-xl px-4 text-lg" onClick={() => navigate("/home")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <h1 className="font-caveat text-5xl text-ink">Credits</h1>
      <Card>
        <p className="text-sm text-[#57484d]">Game concept: To Be Human Again</p>
        <p className="mt-1 text-sm text-[#57484d]">Built with React + TypeScript + Tailwind + Express + Prisma.</p>
      </Card>
    </div>
  );
};
