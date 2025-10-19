import { Pencil, User } from "lucide-react";
import Button from "../ui/Button";

export default function ProfileHeader({
  name,
  isEditing,
  onEditToggle,
  showEditBtn = true,
}: {
  name: string;
  isEditing: boolean;
  onEditToggle: () => void;
  showEditBtn?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-nsanity-gray flex items-center justify-center">
          <User className="w-10 h-10 text-nsanity-black/40" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {name.split(" ")[0]}
          </h1>
          <p className="text-nsanity-black/50">
            Manage your account and view your orders
          </p>
        </div>
      </div>

      {showEditBtn && (
        <Button
          variant="ghost"
          className="mt-4 md:mt-0 flex items-center gap-2"
          onClick={onEditToggle}
        >
          <Pencil className="w-4 h-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      )}
    </div>
  );
}
