import { useState } from "react";
import { useLingui } from "@lingui/react/macro";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { HiCog6Tooth } from "react-icons/hi2";

import { SettingsPopoverStateProvider } from "./SettingsPopoverStateProvider";
import { SettingsSpeedTab } from "./SettingsSpeedTab";
import { SettingsRootTab } from "./SettingsRootTab";
import { useVideoActions, useVideoState } from "../../hooks";

export function SettingsPopover() {
  const { t } = useLingui();
  const [settingsTab, setSettingsTab] = useState<"root" | "speed">("root");

  const videoActions = useVideoActions();
  const videoState = useVideoState();

  return (
    <Popover>
      {({ open }) => {
        return (
          <>
            <SettingsPopoverStateProvider open={open} />
            <PopoverButton
              onClick={() => {
                setSettingsTab("root");
              }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-900/95 data-open:bg-gray-900/95"
              title={t`Settings`}
            >
              <HiCog6Tooth
                className={`h-5 w-5 transition-transform duration-300 ${
                  open ? "rotate-90" : "rotate-0"
                }`}
              />
            </PopoverButton>

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
              className="w-64 origin-top-right rounded-xl border border-white/5 bg-gray-900/95 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
            >
              {settingsTab === "root" ? (
                <SettingsRootTab
                  toggleLoop={videoActions.toggleLoop}
                  loop={videoState.loop}
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
