import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
};

export const AppFrame = ({ children }: AppFrameProps) => {
  return (
    <div className="min-h-screen bg-[rgb(248,250,242)]">
      {children}
    </div>
  );
};
