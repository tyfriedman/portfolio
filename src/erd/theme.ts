export interface CanvasTheme {
  /** Canvas background fill */
  canvasBg: string;
  /** Dot grid color */
  gridDot: string;
  /** Shape fill */
  shapeFill: string;
  /** Shape stroke */
  shapeStroke: string;
  /** Shape label text */
  shapeText: string;
  /** Accent color for selection */
  accent: string;
  /** Softer accent for hover */
  accentSoft: string;
  /** Connection line color */
  connection: string;
  /** Cardinality label color */
  cardinalityText: string;
  /** Ghost/preview shape stroke */
  ghost: string;
}

export const darkTheme: CanvasTheme = {
  canvasBg: '#0f1117',
  gridDot: '#2a2f3d',
  shapeFill: '#1a1f2b',
  shapeStroke: '#8b93a7',
  shapeText: '#e5e9f0',
  accent: '#6366f1',
  accentSoft: '#818cf8',
  connection: '#525b70',
  cardinalityText: '#a5adc2',
  ghost: '#6366f1',
};

export const lightTheme: CanvasTheme = {
  canvasBg: '#f8fafc',
  gridDot: '#d4dae3',
  shapeFill: '#ffffff',
  shapeStroke: '#475569',
  shapeText: '#1e293b',
  accent: '#4f46e5',
  accentSoft: '#6366f1',
  connection: '#94a3b8',
  cardinalityText: '#64748b',
  ghost: '#4f46e5',
};

export type ThemeMode = 'dark' | 'light';

export const getCanvasTheme = (mode: ThemeMode): CanvasTheme =>
  mode === 'dark' ? darkTheme : lightTheme;

export const THEME_STORAGE_KEY = 'erd-theme';

/**
 * CSS custom properties consumed by the floating chrome via Tailwind
 * arbitrary values, e.g. bg-[var(--surface)].
 */
export const getChromeVars = (mode: ThemeMode): Record<string, string> =>
  mode === 'dark'
    ? {
        '--surface': 'rgba(23, 26, 33, 0.92)',
        '--surface-solid': '#171a21',
        '--border': '#2c3140',
        '--text': '#e5e9f0',
        '--text-muted': '#8b93a7',
        '--hover': '#232836',
        '--accent': '#6366f1',
        '--accent-hover': '#818cf8',
      }
    : {
        '--surface': 'rgba(255, 255, 255, 0.92)',
        '--surface-solid': '#ffffff',
        '--border': '#e2e8f0',
        '--text': '#1e293b',
        '--text-muted': '#64748b',
        '--hover': '#f1f5f9',
        '--accent': '#4f46e5',
        '--accent-hover': '#6366f1',
      };
