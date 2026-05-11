import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      className={cn("relative w-full touch-none select-none", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center py-2">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Indicator className="absolute h-full rounded-full bg-foreground" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-4 rounded-full bg-foreground shadow-sm ring-2 ring-background focus-visible:outline-none" />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
