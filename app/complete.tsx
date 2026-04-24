import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withSpring, withSequence, withTiming, withDelay,
} from 'react-native-reanimated';

import { useTaskStore } from '../src/stores/taskStore';
import { useJarStore } from '../src/stores/jarStore';
// import { useTheme } from '../src/theme';
import { useTheme, spacing, typography, radius, fonts } from '@/theme';

export default function CompleteScreen() {
    const { theme } = useTheme();
    const { taskId, title, count, total } = useLocalSearchParams<{
        taskId: string;
        title: string;
        count: string;
        total: string;
    }>();

    const starScale = useSharedValue(0);
    const starRotate = useSharedValue(-15);
    const textOpacity = useSharedValue(0);
    const textY = useSharedValue(20);
    const btnOpacity = useSharedValue(0);

    useEffect(() => {
        // Star pops in
        starScale.value = withSpring(1, { damping: 10, stiffness: 200 });
        starRotate.value = withSpring(0, { damping: 12 });
        // Text fades up
        textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
        textY.value = withDelay(300, withSpring(0, { damping: 16 }));
        // Buttons appear
        btnOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
    }, []);

    const starStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: starScale.value },
            { rotate: `${starRotate.value}deg` },
        ],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textY.value }],
    }));

    const btnStyle = useAnimatedStyle(() => ({
        opacity: btnOpacity.value,
    }));

    const n = parseInt(count ?? '1');
    const t = parseInt(total ?? '0');
    const remaining = t - n;

    return (
        <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
            <View style={s.inner}>
                {/* Animated star */}
                <Animated.Text style={[s.star, starStyle, { color: theme.colors.accent }]}>
                    ★
                </Animated.Text>

                {/* Copy */}
                <Animated.View style={[s.copy, textStyle]}>
                    <Text style={[s.headline, { color: theme.colors.text, fontFamily: fonts.display }]}>
                        you did it!
                    </Text>
                    <Text style={[s.taskTitle, { color: theme.colors.textMuted, fontFamily: fonts.regular }]}>
                        {title}
                    </Text>
                    <Text style={[s.jarLine, { color: theme.colors.primary, fontFamily: fonts.medium }]}>
                        + one star for your jar ✦
                    </Text>
                    {t > 0 && (
                        <Text style={[s.progress, { color: theme.colors.textSubtle, fontFamily: fonts.regular }]}>
                            {n} of {t} · {remaining === 0
                                ? 'almost bedtime-ready'
                                : `${remaining} more to go`}
                        </Text>
                    )}
                </Animated.View>

                {/* Buttons */}
                <Animated.View style={[s.buttons, btnStyle]}>
                    <Pressable
                        style={[s.peekBtn, { borderColor: theme.colors.taskCardBorder }]}
                        onPress={() => { router.replace('/(tabs)/jar'); }}
                    >
                        <Text style={[s.peekLabel, { color: theme.colors.textMuted, fontFamily: fonts.regular }]}>
                            peek at jar
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[s.keepBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={[s.keepLabel, { fontFamily: fonts.medium }]}>
                            keep going →
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
    star: { fontSize: 96 },
    copy: { alignItems: 'center', gap: spacing.sm },
    headline: { fontSize: typography.size.xxxl, textAlign: 'center', lineHeight: 40 },
    taskTitle: { fontSize: typography.size.md, textAlign: 'center' },
    jarLine: { fontSize: typography.size.md, textAlign: 'center' },
    progress: { fontSize: typography.size.sm, textAlign: 'center' },
    buttons: {
        flexDirection: 'row', gap: spacing.md,
        marginTop: spacing.xl,
    },
    peekBtn: {
        flex: 1, borderRadius: radius.full, borderWidth: 1,
        paddingVertical: spacing.md, alignItems: 'center',
    },
    peekLabel: { fontSize: typography.size.sm },
    keepBtn: {
        flex: 1, borderRadius: radius.full,
        paddingVertical: spacing.md, alignItems: 'center',
    },
    keepLabel: { fontSize: typography.size.sm, color: '#ffffff' },
});