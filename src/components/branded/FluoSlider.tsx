import type { BaseUIEvent } from "@base-ui/react";
import { Slider } from "@base-ui/react/slider";

export interface FluoSliderProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly onCommit?: (value: number) => void;
  readonly onKeyDown?: (
    event: BaseUIEvent<React.KeyboardEvent<HTMLDivElement>>,
  ) => void;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly disabled?: boolean;
  readonly isLoading?: boolean;
  readonly "aria-describedby"?: string;
  readonly className?: string;
  readonly "aria-label"?: string;
}

export function FluoSlider(props: FluoSliderProps) {
  const loading = props.isLoading ?? false;

  return (
    <Slider.Root
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      disabled={props.disabled}
      thumbAlignment="edge-client-only"
      onValueChange={(value) => props.onChange(value)}
      onValueCommitted={(value) => props.onCommit?.(value)}
      onKeyDown={(value) => props.onKeyDown?.(value)}
      className={props.className ?? "w-full"}
    >
      <Slider.Control
        className={
          "flex w-full cursor-pointer touch-none items-center py-3 select-none data-disabled:cursor-not-allowed"
        }
      >
        <Slider.Track
          className={
            "h-1 w-full rounded-lg select-none" +
            (loading ? " bg-zinc-700" : " bg-zinc-700") // TODO: implement a better loading style, maybe with an animated gradient or something
          }
        >
          <Slider.Indicator
            className={"h-1 rounded-lg bg-zinc-400 select-none"}
          />
          <Slider.Thumb
            aria-label={props["aria-label"] ?? "Slider thumb"}
            className={
              "size-4 rounded-full bg-white ring-1 ring-zinc-700 select-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            }
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
