import { useLingui } from "@lingui/react/macro";
import { useVideoActions, useVideoState } from "../../hooks";

interface SettingsSpeedTabProps {
  readonly onBack: () => void;
}

export function SettingsSpeedTab(props: SettingsSpeedTabProps) {
  const { t } = useLingui();
  const { setPlaybackRate } = useVideoActions();
  const { playbackRate } = useVideoState();

  const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4];

  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="flex items-center gap-2 px-2 py-1 text-white/70">
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10"
          onClick={props.onBack}
          aria-label={t`Back`}
        >
          ← {t`Settings`}
        </button>
        <div className="ml-auto text-xs">{t`Speed`}</div>
      </div>
      {rates.map((r) => (
        <div key={r}>
          <button
            type="button"
            aria-checked={playbackRate === r}
            onMouseDown={(e) => {
              // Keep popover open while selecting a rate
              e.preventDefault();
            }}
            onClick={() => {
              setPlaybackRate(r);
              // Return to root view after selection
              props.onBack();
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/10 focus:outline-none ${
              playbackRate === r ? "bg-white/10" : ""
            }`}
          >
            <span>{r.toFixed(2)}×</span>
            {playbackRate === r ? (
              <span className="text-xs text-white/70">{t`Selected`}</span>
            ) : null}
          </button>
        </div>
      ))}
    </div>
  );
}
