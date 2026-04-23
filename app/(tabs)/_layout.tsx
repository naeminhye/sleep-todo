import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/theme';
import { useBreakpoint } from '../../src/lib/useBreakpoint';
import { ResponsiveLayout } from '../../src/components/ResponsiveLayout';

// Tab icon — simple glyph, will be replaced with SVG icons later
import { Text } from 'react-native';
function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 18, color, lineHeight: 22 }}>{glyph}</Text>;
}

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();

  // On desktop web, hide the native tab bar entirely — Sidebar handles navigation
  const hideTabBar = Platform.OS === 'web' && isDesktop;

  return (
    <ResponsiveLayout>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSubtle,
          // Hide tab bar on desktop — set height 0 and opacity 0 rather than
          // display:none which can cause layout issues in RN Web
          tabBarStyle: hideTabBar
            ? { height: 0, opacity: 0, overflow: 'hidden' }
            : {
                backgroundColor: theme.colors.tabBar,
                borderTopColor: theme.colors.tabBarBorder,
                borderTopWidth: 1,
                paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
                paddingTop: 8,
                height: Platform.OS === 'ios' ? 56 + insets.bottom : 64,
              },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <TabIcon glyph="✦" color={color} />,
          }}
        />
        <Tabs.Screen
          name="jar"
          options={{
            title: 'Jar',
            tabBarIcon: ({ color }) => <TabIcon glyph="◎" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <TabIcon glyph="◷" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon glyph="✿" color={color} />,
          }}
        />
      </Tabs>
    </ResponsiveLayout>
  );
}
