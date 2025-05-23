import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md px-3 py-2 text-sm shadow-sm outline-none transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "border bg-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Input };
