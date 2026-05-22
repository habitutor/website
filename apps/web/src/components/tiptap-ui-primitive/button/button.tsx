import { Fragment, useMemo } from "react";

// --- Tiptap UI Primitive ---
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tiptap-ui-primitive/tooltip/tooltip";

// --- Lib ---
import { cn, parseShortcutKeys } from "@/lib/tiptap-utils";

import "@/components/tiptap-ui-primitive/button/button-colors.scss";
import "@/components/tiptap-ui-primitive/button/button-group.scss";
import "@/components/tiptap-ui-primitive/button/button.scss";

export interface ButtonProps extends React.ComponentProps<"button"> {
  className?: string;
  showTooltip?: boolean;
  tooltip?: React.ReactNode;
  shortcutKeys?: string;
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({ shortcuts }) => {
  if (shortcuts.length === 0) return null;

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={`${key}-${index.toString()}`}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  );
};

export const Button = ({
  ref,
  className,
  children,
  tooltip,
  showTooltip = true,
  shortcutKeys,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) => {
  const shortcuts = useMemo<string[]>(() => parseShortcutKeys({ shortcutKeys }), [shortcutKeys]);

  if (!tooltip || !showTooltip) {
    return (
      <button className={cn("tiptap-button", className)} ref={ref} aria-label={ariaLabel} {...props}>
        {children}
      </button>
    );
  }

  return (
    <Tooltip delay={200}>
      <TooltipTrigger className={cn("tiptap-button", className)} ref={ref} aria-label={ariaLabel} {...props}>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {tooltip}
        <ShortcutDisplay shortcuts={shortcuts} />
      </TooltipContent>
    </Tooltip>
  );
};

Button.displayName = "Button";

export const ButtonGroup = ({
  ref,
  className,
  children,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"fieldset"> & {
  orientation?: "horizontal" | "vertical";
}) => {
  return (
    <fieldset ref={ref} className={cn("tiptap-button-group", className)} data-orientation={orientation} {...props}>
      {children}
    </fieldset>
  );
};
ButtonGroup.displayName = "ButtonGroup";

export default Button;
