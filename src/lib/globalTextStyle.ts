/**
 * Sets Cause-Regular as the default font for all Text and TextInput components.
 * Import this once at the top of _layout.tsx before any rendering.
 *
 * On native: uses defaultProps (the standard RN pattern for global font defaults).
 * On web:    also injects a CSS rule so the font cascades naturally.
 */

import { Text, TextInput, Platform } from "react-native";

export function applyGlobalTextStyle() {
  // ── Native & Web: set defaultProps on Text and TextInput ──────────────────
  // RN merges defaultProps style with component style, so explicit fontFamily
  // on any component still takes precedence (e.g. Cherry Bomb One on titles).
  // @ts-ignore
  Text.defaultProps = {
    ...(Text.defaultProps ?? {}),
    style: [{ fontFamily: "Cause-Regular" }, (Text.defaultProps as any)?.style],
  };
  // @ts-ignore
  TextInput.defaultProps = {
    ...(TextInput.defaultProps ?? {}),
    style: [
      { fontFamily: "Cause-Regular" },
      (TextInput.defaultProps as any)?.style,
    ],
  };

  // ── Web only: CSS fallback so the font applies to any text not going through RN ──
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const id = "sleepy-global-font";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        * { font-family: 'Cause-Regular', system-ui, sans-serif; }
        @font-face {
          font-family: 'CherryBombOne-Regular';
          src: url('/assets/fonts/CherryBombOne-Regular.ttf') format('truetype');
          font-weight: 400;
          font-display: swap;
        }
        @font-face {
          font-family: 'Cause-Regular';
          src: url('/assets/fonts/Cause-Regular.ttf') format('truetype');
          font-weight: 400;
          font-display: swap;
        }
        @font-face {
          font-family: 'Cause-Medium';
          src: url('/assets/fonts/Cause-Medium.ttf') format('truetype');
          font-weight: 500;
          font-display: swap;
        }
        * { -webkit-font-smoothing: antialiased; }
      `;
      document.head.appendChild(style);
    }
  }
}
