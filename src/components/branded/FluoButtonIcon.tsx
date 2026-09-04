import { Button } from "@base-ui/react/button";

import "./FluoButtonIcon.css";

export type FluoButtonIconProps = Button.Props;

export function FluoButtonIcon({
  className,
  focusableWhenDisabled = true,
  ...props
}: FluoButtonIconProps) {
  const mergedClassName =
    typeof className === "function"
      ? (state: Button.State) =>
          ["fluo-button-icon", className(state)].filter(Boolean).join(" ")
      : ["fluo-button-icon", className].filter(Boolean).join(" ");

  return (
    <Button
      {...props}
      className={mergedClassName}
      focusableWhenDisabled={focusableWhenDisabled}
    />
  );
}
