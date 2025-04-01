import React from "react";
import { cn } from "@/lib/utils/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "link" | "danger";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? React.Fragment : "button";

    return (
      <Comp
        className={cn(
          "flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-50",

          //Variants
          variant === "default" &&
            "bg-nsanity-cream text-nsanity-black hover:scale-105 transition-all duration-200 shadow-sm",
          variant === "primary" &&
            "bg-nsanity-darkorange text-nsanity-cream hover:scale-105 transition-all duration-200 shadow-md border-2 border-nsanity-orange",
          variant === "link" &&
            "text-nsanity-black hover:scale-105 bg-nsanity-cream backdrop-blur-lg transition-all duration-200 shadow-md",
          variant === "danger" &&
            "bg-nsanity-red text-nsanity-cream hover:scale-105 transition-all duration-200 shadow-md",
          variant === "ghost" &&
            "bg-transparent text-nsanity-black hover:scale-105 transition-all duration-200 ",

          //Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3 text-sm rounded-md",
          size === "lg" && "h-11 px-8 rounded-md",
          size === "xl" && "h-12 text-lg w-40 text-md px-8 rounded-md",
          size === "icon" && "h-10 w-10",

          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent " />
        ) : null}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
export default Button;
