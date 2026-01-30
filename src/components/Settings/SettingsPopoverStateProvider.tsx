import { useSetAtom } from "jotai";
import { settingsPopoverOpenAtom } from "../../store/video";
import { useEffect } from "react";

interface SettingsPopoverStateProviderProps {
  readonly open: boolean;
}

export function SettingsPopoverStateProvider(
  props: SettingsPopoverStateProviderProps,
) {
  const setSettingsPopoverOpen = useSetAtom(settingsPopoverOpenAtom);

  useEffect(() => {
    setSettingsPopoverOpen(props.open);
  }, [props.open, setSettingsPopoverOpen]);

  return null;
}
