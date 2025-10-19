import { User } from "lucide-react";

export default function ProfileHeader({
  name,
}: {
  name: string;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-nsanity-gray flex items-center justify-center">
          <User className="w-10 h-10 text-nsanity-black/40" />
        </div>
        <div>
          <h1 className="text-lg md:text-2xl font-semibold">
            Welcome back, {name.split(" ")[0]}
          </h1>
          <p className="text-nsanity-black/50 text-sm md:text-base">
            Manage your account and view your orders
          </p>
        </div>
      </div>
    </div>
  );
}
