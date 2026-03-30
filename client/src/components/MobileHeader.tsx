import { ArrowLeft } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
}

export function MobileHeader({ title, onBack }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack || (() => window.history.back())}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold text-center flex-1">{title}</h1>
        <div className="w-12" />
      </div>
    </div>
  );
}
