import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker"

import { cn } from "@/lib/utils"

import "react-day-picker/style.css"

export type CalendarProps = DayPickerProps

const defaultClassNames = getDefaultClassNames()

export default function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        ...defaultClassNames,
        months: cn(defaultClassNames.months, "flex flex-col gap-4 sm:flex-row"),
        month: cn(defaultClassNames.month, "gap-4"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "relative flex items-center justify-center px-1",
        ),
        caption_label: cn(defaultClassNames.caption_label, "text-sm font-medium"),
        dropdowns: cn(defaultClassNames.dropdowns, "flex items-center gap-2"),
        dropdown_root: cn(
          defaultClassNames.dropdown_root,
          "relative rounded-md border border-slate-200 bg-white",
        ),
        nav: cn(
          defaultClassNames.nav,
          "flex items-center gap-1",
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          "size-7 rounded-md border border-slate-200 bg-transparent p-0 opacity-80 hover:opacity-100",
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "size-7 rounded-md border border-slate-200 bg-transparent p-0 opacity-80 hover:opacity-100",
        ),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse"),
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          defaultClassNames.weekday,
          "w-9 text-[0.8rem] font-normal text-slate-500",
        ),
        week: cn(defaultClassNames.week),
        day: cn(
          defaultClassNames.day,
          "relative size-9 p-0 text-center text-sm",
        ),
        day_button: cn(
          defaultClassNames.day_button,
          "size-9 rounded-md p-0 font-normal hover:bg-slate-100 aria-selected:opacity-100",
        ),
        selected: cn(
          defaultClassNames.selected,
          "bg-[var(--yellow-mid)] text-[var(--brand-dark)] hover:bg-[var(--yellow-mid)] [&_.rdp-day_button]:border-[var(--brand-dark)]",
        ),
        today: cn(defaultClassNames.today, "border border-[var(--yellow-mid)]"),
        outside: cn(defaultClassNames.outside, "text-slate-400 opacity-50"),
        disabled: cn(defaultClassNames.disabled, "text-slate-300 opacity-50"),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        range_middle: cn(
          defaultClassNames.range_middle,
          "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        ),
        ...classNames,
      }}
      {...props}
    />
  )
}
