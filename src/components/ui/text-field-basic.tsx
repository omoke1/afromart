"use client";

import {
  Label as AriaLabel,
  LabelProps as AriaLabelProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: AriaLabelProps) {
  return (
    <AriaLabel
      className={cn(
        "text-sm font-medium leading-none text-ink",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
