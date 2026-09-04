import { Menu } from "@base-ui/react/menu";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { HiArrowPath, HiChevronRight, HiPencil } from "react-icons/hi2";

import { loopAtom, setLoopAtom } from "../../store/video";
import { SettingsSpeedTab } from "./SettingsSpeedTab";

export function SettingsRootTab() {
  const { t } = useLingui();
  const loop = useAtomValue(loopAtom);
  const setLoop = useSetAtom(setLoopAtom);

  return (
    <Menu.Group className="p-1">
      <Menu.GroupLabel className="sr-only">{t`Settings`}</Menu.GroupLabel>
      <Menu.CheckboxItem
        checked={loop}
        onCheckedChange={(checked) => {
          setLoop(checked);
        }}
        className="fluo-button-icon group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 data-highlighted:bg-white/10 data-highlighted:text-white"
      >
        <HiArrowPath className="size-4 fill-white/30" />
        {t`Loop`}
        <span className="ml-auto text-white/60">{loop ? t`On` : t`Off`}</span>
      </Menu.CheckboxItem>
      <Menu.SubmenuRoot>
        <Menu.SubmenuTrigger className="fluo-button-icon group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 data-highlighted:bg-white/10 data-highlighted:text-white data-popup-open:bg-white/10">
          <HiPencil className="size-4 fill-white/30" />
          {t`Playback speed`}
          <span className="ml-auto text-white/60">
            <HiChevronRight />
          </span>
        </Menu.SubmenuTrigger>

        <Menu.Portal>
          <Menu.Positioner sideOffset={12} className="z-50 outline-none">
            <Menu.Popup className="max-h-(--available-height) w-44 origin-(--transform-origin) overflow-y-auto rounded-xl border border-white/5 bg-gray-900/95 p-1 text-sm/6 text-white transition-[opacity,scale] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:scale-100 motion-reduce:transition-opacity motion-reduce:duration-75">
              <SettingsSpeedTab />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.SubmenuRoot>
    </Menu.Group>
  );
}
