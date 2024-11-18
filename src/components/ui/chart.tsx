import React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  children,
  config,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("w-full h-full", className)}
      style={
        {
          "--color-revenue": config.revenue?.color,
          "--color-users": config.users?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return (
    <div
      className={cn(
        "bg-white p-2 rounded-md shadow border border-gray-200",
        className
      )}
      {...props}
    />
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipContentProps) {
  if (active && payload?.length) {
    return (
      <div className="p-2">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
} 