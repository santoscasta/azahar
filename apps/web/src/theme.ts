export const theme = {
  brand: {
    primary: {
      100: '#FFF2D4',
      300: '#F9DC98',
      500: '#F6C45C',
      600: '#E6B44E',
      700: '#D99C35',
    },
    accent: {
      200: '#D6E3FD',
      300: '#BFD3FB',
      500: '#6FAEF5',
      600: '#4F6FD8',
    },
    blossom: '#F9FAFF',
    pistil: '#F6C45C',
  },
  neutrals: {
    50: '#F9FAFF',
    200: '#C9CEE4',
    500: '#6B6F84',
    700: '#4B4F63',
    900: '#2F2F3A',
  },
  semantic: {
    success: '#6FAEF5',
    warning: '#FF9F43',
    danger: '#D64545',
    info: '#8E8EDC',
  },
  surfaces: {
    background: '#F9FAFF',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  on: {
    onPrimary: '#2F2F3A',
    onSurface: '#2F2F3A',
    onAccent: '#2F2F3A',
  },
} as const

export type Theme = typeof theme

export default theme
