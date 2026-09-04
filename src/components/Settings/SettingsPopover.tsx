import { Menu } from "@base-ui/react/menu";
import { useLingui } from "@lingui/react/macro";
import { useSetAtom } from "jotai";
import { HiCog6Tooth } from "react-icons/hi2";

import { settingsPopoverOpenAtom } from "../../store/video";
import { FluoButtonIcon } from "../branded/FluoButtonIcon";
import { SettingsRootTab } from "./SettingsRootTab";

export function SettingsPopover() {
  const { t } = useLingui();
  const setSettingsPopoverOpen = useSetAtom(settingsPopoverOpenAtom);

  return (
    <Menu.Root onOpenChange={setSettingsPopoverOpen}>
      <Menu.Trigger
        render={<FluoButtonIcon />}
        className="group/settings inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 hover:bg-gray-900/95 data-popup-open:bg-gray-900/95"
        title={t`Settings`}
      >
        <HiCog6Tooth className="h-5 w-5 transition-[rotate] duration-300 group-data-popup-open/settings:rotate-90 motion-reduce:rotate-0 motion-reduce:transition-none" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="top"
          align="end"
          sideOffset={4}
          className="z-50 outline-none"
        >
          <Menu.Popup
            // Prevent clicks within the portal from propagating through the
            // React tree to the player controls.
            onClick={(event) => {
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            className="w-64 origin-(--transform-origin) rounded-xl border border-white/5 bg-gray-900/95 p-1 text-sm/6 text-white transition-[opacity,scale] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:scale-100 motion-reduce:transition-opacity motion-reduce:duration-75"
          >
            <SettingsRootTab />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
