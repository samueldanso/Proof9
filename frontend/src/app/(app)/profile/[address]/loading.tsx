import { Loader2 } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center">
      <Loader2 className="size-12 animate-spin text-[#00A8FF]" />
    </div>
  );
}
