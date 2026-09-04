import { Menu } from "@base-ui/react/menu";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";

import { playbackRateAtom, setPlaybackRateAtom } from "../../store/video";

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4] as const;

export function SettingsSpeedTab() {
  const { t } = useLingui();
  const setPlaybackRate = useSetAtom(setPlaybackRateAtom);
  const playbackRate = useAtomValue(playbackRateAtom);

  return (
    <Menu.Group className="flex flex-col gap-1 p-1">
      <Menu.GroupLabel className="sr-only">{t`Speed`}</Menu.GroupLabel>

      <Menu.RadioGroup
        value={playbackRate}
        onValueChange={(rate) => {
          setPlaybackRate(Number(rate));
        }}
      >
        {PLAYBACK_RATES.map((rate) => (
          <Menu.RadioItem
            key={rate}
            value={rate}
            className="fluo-button-icon flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/10 data-checked:bg-white/10 data-highlighted:bg-white/10 data-highlighted:text-white"
          >
            <span>{rate.toFixed(2)}×</span>
            <Menu.RadioItemIndicator className="text-xs text-white/70">
              {t`Selected`}
            </Menu.RadioItemIndicator>
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
    </Menu.Group>
  );
}
