export default function LoadingSpinner({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-nsanity-cream border-t-nsanity-darkorange rounded-full animate-spin`}
      ></div>
    </div>
  );
}
