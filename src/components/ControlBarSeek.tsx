import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";

import { currentTimeAtom, durationAtom, seekToAtom } from "../store/video";
import { formatTime } from "../utils/format";
import { FluoSlider } from "./branded/FluoSlider";

export function ControlBarSeek() {
  const { t } = useLingui();

  const currentTime = useAtomValue(currentTimeAtom);
  const duration = useAtomValue(durationAtom);
  const seekTo = useSetAtom(seekToAtom);

  return (
    <div className="flex items-center space-x-3">
      <span className="min-w-10 font-mono text-sm">
        {formatTime(currentTime)}
      </span>
      <FluoSlider
        aria-label={t`Seek`}
        value={currentTime}
        onChange={seekTo}
        min={0}
        max={duration || 0.0001}
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
      <span className="min-w-10 font-mono text-sm">{formatTime(duration)}</span>
    </div>
  );
}
