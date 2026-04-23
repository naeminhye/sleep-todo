import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import { useTheme } from '../theme';
import { useBreakpoint } from '../lib/useBreakpoint';
import { Sidebar } from './shared/Sidebar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { theme } = useTheme();
  const { isDesktop } = useBreakpoint();

  // On native (iOS/Android) always use mobile layout regardless of width
  if (Platform.OS !== 'web' || !isDesktop) {
    return <>{children}</>;
  }

  // Desktop web: sidebar + centered content column
  return (
    <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
      <Sidebar />
      <View style={styles.contentArea}>
        <View style={[styles.contentColumn, { backgroundColor: theme.colors.background }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    // Subtle page background contrast so the column stands out
    backgroundColor: 'transparent',
  },
  contentColumn: {
    width: '100%' as any,
    maxWidth: 640,
    flex: 1,
    // Soft left/right border to define the column edges on wide viewports
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
});
