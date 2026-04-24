import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withDelay, withTiming, withSpring,
} from 'react-native-reanimated';

import { useTaskStore } from '../src/stores/taskStore';
import { useTheme } from '../src/theme';
import { spacing, typography, radius, fonts } from '../src/theme/tokens';

export default function EndOfDayScreen() {
    const { theme } = useTheme();
    const completedCount = useTaskStore((s) => s.completedTodayCount());
    const todayActive = useTaskStore((s) => s.todayActive());
    const postponeTask = useTaskStore((s) => s.postponeTask);

    const faceOpacity = useSharedValue(0);
    const faceScale = useSharedValue(0.7);
    const textOpacity = useSharedValue(0);
    const btnOpacity = useSharedValue(0);

    useEffect(() => {
        faceOpacity.value = withTiming(1, { duration: 500 });
        faceScale.value = withSpring(1, { damping: 14 });
        textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
        btnOpacity.value = withDelay(700, withTiming(1, { duration: 300 }));
    }, []);

    const faceStyle = useAnimatedStyle(() => ({
        opacity: faceOpacity.value,
        transform: [{ scale: faceScale.value }],
    }));
    const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
    const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

    const handleGoodnight = () => {
        // Postpone all remaining active tasks to tomorrow
        todayActive.forEach((t) => postponeTask(t.id));
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
            <View style={s.inner}>
                {/* Smiley face */}
                <Animated.View style={[s.faceWrap, faceStyle]}>
                    <View style={[s.face, { backgroundColor: theme.colors.accent }]}>
                        <Text style={s.faceEmoji}>◡ ‿ ◡</Text>
                    </View>
                </Animated.View>

                {/* Copy */}
                <Animated.View style={[s.copy, textStyle]}>
                    <Text style={[s.headline, { color: theme.colors.text, fontFamily: fonts.display }]}>
                        that's enough{'\n'}for today
                    </Text>
                    <Text style={[s.sub, { color: theme.colors.textMuted, fontFamily: fonts.regular }]}>
                        {completedCount === 0
                            ? "rest is productive too."
                            : `you did ${completedCount} little ${completedCount === 1 ? 'thing' : 'things'}. tomorrow can\nhave its own worries.`}
                    </Text>
                    {completedCount > 0 && (
                        <Text style={[s.jarLine, { color: theme.colors.primary, fontFamily: fonts.medium }]}>
                            +{completedCount} for the jar
                        </Text>
                    )}
                    {todayActive.length > 0 && (
                        <Text style={[s.tucked, { color: theme.colors.textSubtle, fontFamily: fonts.regular }]}>
                            {todayActive.length} little {todayActive.length === 1 ? 'thing is' : 'things are'} tucked in for tomorrow.{'\n'}
                            it'll be waiting when you're ready ♡
                        </Text>
                    )}
                </Animated.View>

                {/* Buttons */}
                <Animated.View style={[s.buttons, btnStyle]}>
                    <Pressable
                        style={[s.goodnightBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={handleGoodnight}
                    >
                        <Text style={[s.goodnightLabel, { fontFamily: fonts.medium }]}>goodnight ✦</Text>
                    </Pressable>
                    <Pressable
                        style={s.oneMoreBtn}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={[s.oneMoreLabel, { color: theme.colors.textMuted, fontFamily: fonts.regular }]}>
                            one more, actually
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    inner: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: spacing.xl, gap: spacing.xl,
    },
    faceWrap: { alignItems: 'center' },
    face: {
        width: 80, height: 80, borderRadius: radius.full,
        alignItems: 'center', justifyContent: 'center',
    },
    faceEmoji: { fontSize: 20, color: '#ffffff' },
    copy: { alignItems: 'center', gap: spacing.md },
    headline: {
        fontSize: typography.size.xxl + 4, textAlign: 'center',
        lineHeight: 36,
    },
    sub: {
        fontSize: typography.size.md, textAlign: 'center',
        lineHeight: 24,
    },
    jarLine: { fontSize: typography.size.md },
    tucked: {
        fontSize: typography.size.sm, textAlign: 'center',
        lineHeight: 20, marginTop: spacing.sm,
    },
    buttons: { gap: spacing.md, width: '100%', marginTop: spacing.md },
    goodnightBtn: {
        borderRadius: radius.full, paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    goodnightLabel: { fontSize: typography.size.md, color: '#ffffff' },
    oneMoreBtn: { alignItems: 'center', paddingVertical: spacing.sm },
    oneMoreLabel: { fontSize: typography.size.sm },
});