
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme} 
          aria-label="Toggle theme"
          className={`transition-all duration-200 ${
            theme === "dark" 
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white shadow-lg" 
              : "bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-md hover:shadow-lg"
          }`}
        >
          {theme === "light" ? (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 hover:rotate-12" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 hover:rotate-12 text-yellow-400" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm font-medium">
          {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
