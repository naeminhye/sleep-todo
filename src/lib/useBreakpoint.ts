import { useWindowDimensions } from 'react-native';

const DESKTOP_BREAKPOINT = 768;

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  return { isDesktop, isMobile: !isDesktop, width };
}
