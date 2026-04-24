import React, { useState, useCallback } from 'react';
import {
    View, Text, Pressable, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withSpring, withTiming, withDelay,
    runOnJS,
} from 'react-native-reanimated';

import { useTaskStore } from '../src/stores/taskStore';
import { useJarStore } from '../src/stores/jarStore';
import { useTheme } from '../src/theme';
import { useThemedStyles } from '../src/theme/useThemedStyles';
import { spacing, typography, radius, fonts } from '../src/theme/tokens';
import type { Task } from '../src/types';

export default function FocusScreen() {
    const { theme } = useTheme();
    const styles = useThemedStyles(makeStyles);

    const todayActive = useTaskStore((s) => s.todayActive());
    const completeTask = useTaskStore((s) => s.completeTask);
    const postponeTask = useTaskStore((s) => s.postponeTask);
    const addJarEntry = useJarStore((s) => s.addEntry);

    const [index, setIndex] = useState(0);
    const task: Task | undefined = todayActive[index];

    const cardScale = useSharedValue(1);
    const cardOpacity = useSharedValue(1);
    const cardY = useSharedValue(0);

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }, { translateY: cardY.value }],
        opacity: cardOpacity.value,
    }));

    const animateOut = useCallback((direction: 'up' | 'down', cb: () => void) => {
        cardOpacity.value = withTiming(0, { duration: 200 });
        cardY.value = withTiming(direction === 'up' ? -40 : 40, { duration: 200 }, () => {
            runOnJS(cb)();
            cardY.value = direction === 'up' ? 40 : -40;
            cardOpacity.value = withTiming(1, { duration: 200 });
            cardY.value = withSpring(0, { damping: 16 });
        });
    }, []);

    const handleComplete = useCallback(() => {
        if (!task) return;
        animateOut('up', () => {
            const completed = completeTask(task.id);
            if (completed) addJarEntry(completed.id, completed.title);
            // Stay on same index — next task slides in, or empty state shows
        });
    }, [task, completeTask, addJarEntry, animateOut]);

    const handlePostpone = useCallback(() => {
        if (!task) return;
        animateOut('down', () => {
            postponeTask(task.id);
        });
    }, [task, postponeTask, animateOut]);

    const handleNext = useCallback(() => {
        if (index < todayActive.length - 1) {
            animateOut('up', () => setIndex((i) => i + 1));
        }
    }, [index, todayActive.length, animateOut]);

    const handlePrev = useCallback(() => {
        if (index > 0) {
            animateOut('down', () => setIndex((i) => i - 1));
        }
    }, [index, animateOut]);

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
            {/* Close */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
                    <Text style={styles.closeLabel}>✕</Text>
                </Pressable>
                {todayActive.length > 0 && (
                    <Text style={styles.counter}>
                        {index + 1} / {todayActive.length}
                    </Text>
                )}
                <View style={styles.closeBtn} />
            </View>

            {/* Main content */}
            <View style={styles.content}>
                {!task ? (
                    // Empty state
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyMoon}>🌙</Text>
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                            all done
                        </Text>
                        <Text style={[styles.emptySub, { color: theme.colors.textMuted }]}>
                            nothing left to focus on
                        </Text>
                        <Pressable
                            style={[styles.doneBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Text style={styles.doneBtnLabel}>back to today</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {/* Subtle task indicator dots */}
                        {todayActive.length > 1 && (
                            <View style={styles.dots}>
                                {todayActive.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.dot,
                                            {
                                                backgroundColor: i === index
                                                    ? theme.colors.primary
                                                    : theme.colors.primaryMuted + '40',
                                                width: i === index ? 16 : 6,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Task card */}
                        <Animated.View style={[styles.card, cardStyle, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.taskCardBorder,
                        }]}>
                            {/* Weight label */}
                            <Text style={[styles.weightLabel, { color: theme.colors.primaryMuted }]}>
                                {'·'.repeat(task.weight === 'tiny' ? 1 : task.weight === 'medium' ? 2 : 3)}
                                {' '}{task.weight}
                            </Text>

                            {/* Task title */}
                            <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                                {task.title}
                            </Text>

                            {/* Note */}
                            {task.note && (
                                <Text style={[styles.taskNote, { color: theme.colors.textMuted }]}>
                                    {task.note}
                                </Text>
                            )}

                            {/* just this one label */}
                            <Text style={[styles.justThis, { color: theme.colors.textSubtle }]}>
                                ✦ just this one
                            </Text>
                        </Animated.View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Pressable
                                style={[styles.actionBtn, styles.postponeBtn, { borderColor: theme.colors.taskCardBorder }]}
                                onPress={handlePostpone}
                            >
                                <Text style={[styles.postponeLabel, { color: theme.colors.textMuted }]}>
                                    later
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[styles.actionBtn, styles.completeBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={handleComplete}
                            >
                                <Text style={styles.completeLabel}>done ✦</Text>
                            </Pressable>
                        </View>

                        {/* Nav arrows */}
                        {todayActive.length > 1 && (
                            <View style={styles.nav}>
                                <Pressable
                                    onPress={handlePrev}
                                    disabled={index === 0}
                                    style={[styles.navBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                                >
                                    <Text style={[styles.navArrow, { color: theme.colors.textMuted }]}>←</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleNext}
                                    disabled={index === todayActive.length - 1}
                                    style={[styles.navBtn, { opacity: index === todayActive.length - 1 ? 0.3 : 1 }]}
                                >
                                    <Text style={[styles.navArrow, { color: theme.colors.textMuted }]}>→</Text>
                                </Pressable>
                            </View>
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

function makeStyles(theme: import('../src/types').Theme) {
    return StyleSheet.create({
        root: { flex: 1 },
        topBar: {
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg, paddingTop: spacing.md,
        },
        closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
        closeLabel: {
            fontSize: typography.size.md, color: theme.colors.textMuted,
            fontFamily: fonts.regular,
        },
        counter: {
            fontSize: typography.size.sm, color: theme.colors.textSubtle,
            fontFamily: fonts.regular,
        },
        content: {
            flex: 1, alignItems: 'center', justifyContent: 'center',
            paddingHorizontal: spacing.xl, gap: spacing.xl,
        },
        dots: {
            flexDirection: 'row', gap: spacing.xs, alignItems: 'center',
        },
        dot: {
            height: 6, borderRadius: radius.full,
        },
        card: {
            width: '100%', borderRadius: radius.xl,
            borderWidth: 1, padding: spacing.xl,
            gap: spacing.md, alignItems: 'center',
        },
        weightLabel: {
            fontSize: typography.size.xs, fontFamily: fonts.regular,
            letterSpacing: 1,
        },
        taskTitle: {
            fontSize: typography.size.xl + 4,
            fontFamily: fonts.display,
            textAlign: 'center',
            lineHeight: 36,
        },
        taskNote: {
            fontSize: typography.size.sm, fontFamily: fonts.regular,
            textAlign: 'center', lineHeight: 20,
        },
        justThis: {
            fontSize: typography.size.xs, fontFamily: fonts.regular,
            marginTop: spacing.sm,
        },
        actions: {
            flexDirection: 'row', gap: spacing.md, width: '100%',
        },
        actionBtn: {
            flex: 1, borderRadius: radius.full,
            paddingVertical: spacing.md, alignItems: 'center',
        },
        postponeBtn: { borderWidth: 1 },
        postponeLabel: { fontSize: typography.size.md, fontFamily: fonts.regular },
        completeBtn: {},
        completeLabel: {
            fontSize: typography.size.md, color: '#ffffff',
            fontFamily: fonts.medium,
        },
        nav: {
            flexDirection: 'row', gap: spacing.xl,
        },
        navBtn: { padding: spacing.md },
        navArrow: { fontSize: typography.size.xl, fontFamily: fonts.regular },
        emptyWrap: { alignItems: 'center', gap: spacing.lg },
        emptyMoon: { fontSize: 64 },
        emptyTitle: {
            fontSize: typography.size.xxl, fontFamily: fonts.display,
        },
        emptySub: {
            fontSize: typography.size.md, fontFamily: fonts.regular,
        },
        doneBtn: {
            borderRadius: radius.full, paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl, marginTop: spacing.md,
        },
        doneBtnLabel: {
            fontSize: typography.size.md, color: '#ffffff',
            fontFamily: fonts.medium,
        },
    });
}