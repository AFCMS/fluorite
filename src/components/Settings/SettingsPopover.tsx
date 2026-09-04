import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { HiCog6Tooth } from "react-icons/hi2";

import { loopAtom, toggleLoopAtom } from "../../store/video";
import { FluoButtonIcon } from "../branded/FluoButtonIcon";
import { SettingsPopoverStateProvider } from "./SettingsPopoverStateProvider";
import { SettingsRootTab } from "./SettingsRootTab";
import { SettingsSpeedTab } from "./SettingsSpeedTab";

export function SettingsPopover() {
  const { t } = useLingui();
  const [settingsTab, setSettingsTab] = useState<"root" | "speed">("root");

  const loop = useAtomValue(loopAtom);
  const toggleLoop = useSetAtom(toggleLoopAtom);

  return (
    <Popover>
      {({ open }) => {
        return (
          <>
            <SettingsPopoverStateProvider open={open} />
            <FluoButtonIcon
              render={<PopoverButton />}
              onClick={() => {
                setSettingsTab("root");
              }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 data-hover:bg-gray-900/95 data-open:bg-gray-900/95"
              title={t`Settings`}
            >
              <HiCog6Tooth
                className={`h-5 w-5 transition-[rotate] duration-300 motion-reduce:rotate-0 motion-reduce:transition-none ${
                  open ? "rotate-90" : "rotate-0"
                }`}
              />
            </FluoButtonIcon>

            <PopoverPanel
              transition
              anchor="bottom end"
              // Prevent clicks within the panel from propagating to the underlying
              // video container, which could interpret them as play/pause toggles.
              onClick={(event) => {
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              className="w-64 origin-top-right rounded-xl border border-white/5 bg-gray-900/95 p-1 text-sm/6 text-white transition-[opacity,scale] duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 motion-reduce:scale-100 motion-reduce:transition-opacity motion-reduce:duration-75"
            >
              {settingsTab === "root" ? (
                <SettingsRootTab
                  toggleLoop={toggleLoop}
                  loop={loop}
                  onSpeedTab={() => {
                    setSettingsTab("speed");
                  }}
                />
              ) : null}

              {settingsTab === "speed" ? (
                <SettingsSpeedTab
                  onBack={() => {
                    setSettingsTab("root");
                  }}
                />
              ) : null}
            </PopoverPanel>
          </>
        );
      }}
    </Popover>
  );
}
