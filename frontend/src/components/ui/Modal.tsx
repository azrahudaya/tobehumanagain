import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "./Card";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export const Modal = ({ open, title, children, onClose }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2326]/55 p-4">
      <Card className="w-full max-w-md p-0">
        <div className="flex items-center justify-between border-b border-[#c5c2be] px-5 py-4">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <Button variant="ghost" className="h-9 w-9 rounded-full p-0" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 px-5 py-4">{children}</div>
      </Card>
    </div>
  );
};
