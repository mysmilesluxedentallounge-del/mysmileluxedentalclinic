import { cn } from "@/lib/utils"

type FormLabelProps = React.HTMLAttributes<HTMLElement> & {
  required?: boolean
  as?: "span" | "label"
  htmlFor?: string
}

export function RequiredMark({ className }: { className?: string }) {
  return <span className={cn("text-red-500", className)} aria-hidden="true"> *</span>
}

export function FormLabel({
  children,
  required,
  className,
  as = "span",
  htmlFor,
  ...props
}: FormLabelProps) {
  const Component = as

  return (
    <Component htmlFor={as === "label" ? htmlFor : undefined} className={className} {...props}>
      {children}
      {required ? <RequiredMark /> : null}
    </Component>
  )
}
