import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

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
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none py-1 data-disabled:opacity-50">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="h-full bg-foreground rounded-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="block size-4 shrink-0 rounded-full bg-foreground shadow-sm transition-transform select-none hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
