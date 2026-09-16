import * as React from "react";
import { cn } from "@/Common/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)} {...props} />
  )
);
Label.displayName = "Label";

export { Label };
