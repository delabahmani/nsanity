import { Heart, Package, Settings, User } from "lucide-react";

const tabs = [
  {
    key: "profile" as const,
    label: "Profile",
    icon: <User className="w-4 h-4 mr-2" />,
  },
  {
    key: "favorites" as const,
    label: "Favorites",
    icon: <Heart className="w-4 h-4 mr-2" />,
  },
  {
    key: "orders" as const,
    label: "Orders",
    icon: <Package className="w-4 h-4 mr-2" />,
  },
  {
    key: "settings" as const,
    label: "Settings",
    icon: <Settings className="w-4 h-4 mr-2" />,
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
    <div className="w-full flex bg-[#f6f3ee] rounded-md overflow-hidden mb-8">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer ${
            tab === t.key
              ? "border-b-2 border-nsanity-black bg-white"
              : "text-nsanity-black/60 hover:bg-nsanity-gray"
          }`}
          onClick={() => setTab(t.key)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
