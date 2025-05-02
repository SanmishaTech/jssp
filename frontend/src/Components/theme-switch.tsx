import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <SwitchPrimitives.Root
      checked={theme === "dark"}
      onCheckedChange={toggleTheme}
      className={cn(
        "relative inline-flex h-[22px] w-[42px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none flex items-center justify-center h-[18px] w-[18px] rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
          theme === "dark" ? "translate-x-[20px]" : "translate-x-0"
        )}
      >
        {theme === "dark" ? (
          <Moon className="h-2.5 w-2.5 text-blue-400" />
        ) : (
          <Sun className="h-2.5 w-2.5 text-yellow-500" />
        )}
      </SwitchPrimitives.Thumb>
      
      {/* Background Icons - always visible in opposite positions */}
      <Sun className={cn(
        "absolute left-[3px] top-[3px] h-2.5 w-2.5 text-yellow-500 transition-opacity", 
        theme === "dark" ? "opacity-100" : "opacity-30"
      )} />
      <Moon className={cn(
        "absolute right-[3px] top-[3px] h-2.5 w-2.5 text-blue-400 transition-opacity", 
        theme === "dark" ? "opacity-30" : "opacity-100"
      )} />
    </SwitchPrimitives.Root>
  )
} 