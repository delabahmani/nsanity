import { MapPin, User } from "lucide-react";
import Button from "../ui/Button";

interface ProfileInfoProps {
  userInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
}

export default function ProfileInfo({
  userInfo,
  isEditing,
  onChange,
  onSave,
}: ProfileInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="bg-nsanity-white rounded-xl shadow p-6 h-full flex flex-col">
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <User className="w-5 h-5" /> Personal Information
          </h2>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Full Name</div>
              <input
                className={`w-full mt-1 px-3 py-2 rounded border ${
                  isEditing
                    ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                    : "bg-nsanity-gray border-gray-200"
                }`}
                value={userInfo.name}
                disabled={!isEditing}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </div>

            <div>
              <div className="text-sm font-medium">Email Address</div>
              <input
                className="w-full mt-1 px-3 py-2 bg-[#b3b3b3] rounded border border-gray-200 hover:cursor-not-allowed"
                value={userInfo.email}
                disabled={true} // Email should not be editable
              />
            </div>

            <div>
              <div className="text-sm font-medium">Phone Number</div>
              <input
                className={`w-full mt-1 px-3 py-2 rounded border ${
                  isEditing
                    ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                    : "bg-nsanity-gray border-gray-200"
                }`}
                value={userInfo.phone || ""}
                placeholder="Enter phone number"
                disabled={!isEditing}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-nsanity-white rounded-xl shadow p-6 h-full flex flex-col">
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" /> Shipping Address
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Street Address</div>
              <input
                className={`w-full mt-1 px-3 py-2 rounded border ${
                  isEditing
                    ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                    : "bg-nsanity-gray border-gray-200"
                }`}
                value={userInfo.address?.street || ""}
                placeholder="Enter street address"
                disabled={!isEditing}
                onChange={(e) => onChange("street", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">City</div>
                <input
                  className={`w-full mt-1 px-3 py-2 rounded border ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                      : "bg-nsanity-gray border-gray-200"
                  }`}
                  value={userInfo.address?.city || ""}
                  placeholder="Enter city"
                  disabled={!isEditing}
                  onChange={(e) => onChange("city", e.target.value)}
                />
              </div>
              <div>
                <div className="text-sm font-medium">State/Province</div>
                <input
                  className={`w-full mt-1 px-3 py-2 rounded border ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                      : "bg-nsanity-gray border-gray-200"
                  }`}
                  value={userInfo.address?.state || ""}
                  placeholder="Enter state or province"
                  disabled={!isEditing}
                  onChange={(e) => onChange("state", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">ZIP Code</div>
                <input
                  className={`w-full mt-1 px-3 py-2 rounded border ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                      : "bg-nsanity-gray border-gray-200"
                  }`}
                  value={userInfo.address?.zipCode || ""}
                  placeholder="Enter ZIP code"
                  disabled={!isEditing}
                  onChange={(e) => onChange("zipCode", e.target.value)}
                />
              </div>
              <div>
                <div className="text-sm font-medium">Country</div>
                <input
                  className={`w-full mt-1 px-3 py-2 rounded border ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-nsanity-black focus:ring-1 focus:ring-nsanity-black"
                      : "bg-nsanity-gray border-gray-200"
                  }`}
                  value={userInfo.address?.country || ""}
                  placeholder="Enter country"
                  disabled={!isEditing}
                  onChange={(e) => onChange("country", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditing && (
        <Button className="w-full mt-4" variant="primary" onClick={onSave}>
          Save Changes
        </Button>
      )}
    </div>
  );
}
