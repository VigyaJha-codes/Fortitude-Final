import { Moon, Sun, Palette, Type, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeToggle = () => {
  const { themeMode, setThemeMode, contrastMode, setContrastMode, fontScale, setFontScale } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="glass">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setThemeMode('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light {themeMode === 'light' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeMode('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark {themeMode === 'dark' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeMode('glass')}>
          <Palette className="mr-2 h-4 w-4" />
          Glass {themeMode === 'glass' && '✓'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Contrast</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setContrastMode('normal')}>
          <Contrast className="mr-2 h-4 w-4" />
          Normal {contrastMode === 'normal' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setContrastMode('high')}>
          <Contrast className="mr-2 h-4 w-4" />
          High Contrast {contrastMode === 'high' && '✓'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Font Size</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setFontScale(100)}>
          <Type className="mr-2 h-4 w-4" />
          Normal (100%) {fontScale === 100 && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFontScale(125)}>
          <Type className="mr-2 h-4 w-4" />
          Large (125%) {fontScale === 125 && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFontScale(150)}>
          <Type className="mr-2 h-4 w-4" />
          Extra Large (150%) {fontScale === 150 && '✓'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
