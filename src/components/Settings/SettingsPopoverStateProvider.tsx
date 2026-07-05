import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { settingsPopoverOpenAtom } from "../../store/video";

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
