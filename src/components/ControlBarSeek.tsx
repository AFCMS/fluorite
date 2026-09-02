import { useLingui } from "@lingui/react/macro";

import { useVideoActions, useVideoState } from "../hooks";
import { formatTime } from "../utils/format";
import { FluoSlider } from "./branded/FluoSlider";

export function ControlBarSeek() {
  const { t } = useLingui();

  const videoActions = useVideoActions();
  const videoState = useVideoState();

  return (
    <div className="flex items-center space-x-3">
      <span className="min-w-10 font-mono text-sm">
        {formatTime(videoState.currentTime)}
      </span>
      <FluoSlider
        aria-label={t`Seek`}
        value={videoState.currentTime}
        onChange={videoActions.seekTo}
        min={0}
        max={videoState.duration || 0.0001}
        step={0.1}
        onKeyDown={(e) => {
          // Prevent arrow / home / end / page keys from moving the slider while focused
          if (
            [
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "Home",
              "End",
              "PageUp",
              "PageDown",
            ].includes(e.key)
          ) {
            e.preventDefault();
          }
        }}
      />
      <span className="min-w-10 font-mono text-sm">
        {formatTime(videoState.duration)}
      </span>
    </div>
  );
}
