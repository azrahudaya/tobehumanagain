import { Card } from "./Card";

type DialogBoxProps = {
  speaker?: string | null;
  title: string;
  text: string;
};

export const DialogBox = ({ speaker, title, text }: DialogBoxProps) => {
  return (
    <Card className="rounded-[2rem] border-[#b6b0aa] bg-[#fffefb]/90 px-5 py-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7f8fbe]">{speaker || "Narrator"}</p>
      <h2 className="mt-1 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#534246]">{text}</p>
    </Card>
  );
};
