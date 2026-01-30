import { useLingui } from "@lingui/react/macro";
import { HiArrowPath, HiChevronRight, HiPencil } from "react-icons/hi2";

interface SettingsRootTabProps {
  readonly onSpeedTab: () => void;
  readonly toggleLoop: () => void;
  readonly loop: boolean;
}

export function SettingsRootTab(props: SettingsRootTabProps) {
  const { t } = useLingui();

  return (
    <div className="p-1">
      <button
        type="button"
        onMouseDown={(e) => {
          // Keep popover open while toggling
          e.preventDefault();
        }}
        onClick={props.toggleLoop}
        className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 focus:outline-none"
      >
        <HiArrowPath className="size-4 fill-white/30" />
        {t`Loop`}
        <span className="ml-auto text-white/60">
          {props.loop ? t`On` : t`Off`}
        </span>
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          // Prevent immediate close when clicking to navigate within the panel
          e.preventDefault();
        }}
        onClick={props.onSpeedTab}
        className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 focus:outline-none"
      >
        <HiPencil className="size-4 fill-white/30" />
        {t`Playback speed`}
        <span className="ml-auto text-white/60">
          <HiChevronRight />
        </span>
      </button>
    </div>
  );
}
