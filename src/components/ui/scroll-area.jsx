import { forwardRef } from "react";
import { cn } from "./utils";

const ScrollArea = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <div className="h-full w-full rounded-[inherit] overflow-auto">
      {children}
    </div>
  </div>
));

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };