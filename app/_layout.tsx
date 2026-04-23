import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { ThemeProvider, useTheme } from '../src/theme';
import { useDailyReset } from '../src/lib/useDailyReset';
import { AnimationOverlayProvider } from '../src/components/AnimationOverlayProvider';
import { applyGlobalTextStyle } from '../src/lib/globalTextStyle';

SplashScreen.preventAutoHideAsync();

// Apply global font defaults as a side effect before any rendering
applyGlobalTextStyle();

function RootLayoutInner() {
  const { theme } = useTheme();

  useDailyReset();

  useEffect(() => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      document.body.style.backgroundColor = theme.colors.background;
      document.body.style.margin = '0';
    }
  }, [theme.colors.background]);

  return (
    <AnimationOverlayProvider>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="focus"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </AnimationOverlayProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'CherryBombOne-Regular': require('../assets/fonts/CherryBombOne-Regular.ttf'),
    'Cause-Regular': require('../assets/fonts/Cause-Regular.ttf'),
    'Cause-Medium': require('../assets/fonts/Cause-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
