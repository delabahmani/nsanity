import { Heart, Package, Settings, User } from "lucide-react";

const tabs = [
  {
    key: "profile" as const,
    label: "Profile",
    icon: <User className="w-6 h-6 sm:w-4 sm:h-4" />,
  },
  {
    key: "favorites" as const,
    label: "Favorites",
    icon: <Heart className="w-6 h-6 sm:w-4 sm:h-4" />,
  },
  {
    key: "orders" as const,
    label: "Orders",
    icon: <Package className="w-6 h-6 sm:w-4 sm:h-4" />,
  },
  {
    key: "settings" as const,
    label: "Settings",
    icon: <Settings className="w-6 h-6 sm:w-4 sm:h-4" />,
  },
];

type TabType = "profile" | "favorites" | "orders" | "settings";

export default function ProfileTabs({
  tab,
  setTab,
}: {
  tab: TabType;
  setTab: (tab: TabType) => void;
}) {
  return (
    <div
      className="w-full flex bg-[#f6f3ee] rounded-md overflow-x-auto mb-8 justify-center md:justify-start px-2 md:px-0 gap-2 md:gap-0"
      role="tablist"
      aria-label="Profile tabs"
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={tab === t.key}
          aria-label={t.label}
          onClick={() => setTab(t.key)}
          className={`flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer whitespace-nowrap
            px-0 sm:px-3 py-0 sm:py-3
            min-w-14 h-12 sm:h-auto sm:min-w-0 sm:flex-1
            ${tab === t.key ? "border-b-2 border-nsanity-black bg-white" : "text-nsanity-black/60 hover:bg-nsanity-gray"}`}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
