import { ThemeProvider as NextThemeProvider, type ThemeProviderProps } from 'next-themes';

type Props = Omit<ThemeProviderProps, 'attribute'> & { children: React.ReactNode };

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemeProvider>
  );
}

