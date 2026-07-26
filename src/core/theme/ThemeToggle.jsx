import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const nextTheme = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'is-dark' : 'is-light'} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun className="theme-toggle-sun" size={13}/>
        <Moon className="theme-toggle-moon" size={13}/>
        <i/>
      </span>
      <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
