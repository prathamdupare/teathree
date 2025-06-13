import * as React from 'react';
import { Pressable } from 'react-native';
import { Sun } from '~/lib/icons/Sun';
import { MoonStar } from '~/lib/icons/MoonStar';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={toggleColorScheme}
      className={cn(
        'h-10 w-10 items-center justify-center rounded-lg bg-background border border-border hover:bg-accent active:bg-accent',
        className
      )}
    >
      {isDarkColorScheme ? (
        <Sun className="h-5 w-5 text-foreground" />
      ) : (
        <MoonStar className="h-5 w-5 text-foreground" />
      )}
    </Pressable>
  );
} 