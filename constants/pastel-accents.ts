/**
 * Pastel surfaces: faint backgrounds close to white, with soft accent bars
 * and borders (TestFlight-style — lighter than full worksheet card fills).
 */
export type PastelAccentVariant =
  | "lavender"
  | "purple"
  | "yellow"
  | "green"
  | "mint"
  | "blue"
  | "sky"
  | "red"
  | "peach"
  | "pink";

export type PastelAccentColors = {
  /** Near-white card fill */
  background: string;
  /** Visible card / box outline */
  border: string;
  /** Callout and badge label text */
  text: string;
  /** Accent bars, top borders, icons — soft pastel, not saturated */
  accent: string;
  /** Soft tint for icon wells on cards */
  iconBackground: string;
};

export type PastelAccentTheme = {
  light: PastelAccentColors;
  dark: PastelAccentColors;
};

export const PASTEL_ACCENTS: Record<PastelAccentVariant, PastelAccentTheme> = {
  lavender: {
    light: {
      background: "#FAF8FD",
      border: "#D4C4E8",
      text: "#6B5B8C",
      accent: "#A8B4E8",
      iconBackground: "#F0EBF8",
    },
    dark: {
      background: "#222033",
      border: "#3A2E5C",
      text: "#C4B5E8",
      accent: "#9090C8",
      iconBackground: "#2A2440",
    },
  },
  purple: {
    light: {
      background: "#FAF7FD",
      border: "#D4C4E8",
      text: "#7B5299",
      accent: "#B8A8E0",
      iconBackground: "#F3EBFA",
    },
    dark: {
      background: "#222033",
      border: "#3A2E5C",
      text: "#C4B5E8",
      accent: "#9090C8",
      iconBackground: "#2A2440",
    },
  },
  yellow: {
    light: {
      background: "#FFFCF7",
      border: "#EDE0B8",
      text: "#8A7340",
      accent: "#D4B86A",
      iconBackground: "#FBF5E8",
    },
    dark: {
      background: "#24221A",
      border: "#4A4528",
      text: "#D4C4A0",
      accent: "#B8A060",
      iconBackground: "#2A2818",
    },
  },
  green: {
    light: {
      background: "#F7FCF9",
      border: "#B8E8D4",
      text: "#3D7A5C",
      accent: "#81b38c",
      iconBackground: "#EDF7F1",
    },
    dark: {
      background: "#1C2420",
      border: "#2E4A38",
      text: "#A8DCC4",
      accent: "#6BA87A",
      iconBackground: "#1A2820",
    },
  },
  mint: {
    light: {
      background: "#F6FBF9",
      border: "#B8E0D4",
      text: "#4A7D6F",
      accent: "#7EC4AA",
      iconBackground: "#ECF6F2",
    },
    dark: {
      background: "#1C2422",
      border: "#2E4A44",
      text: "#A8DCC8",
      accent: "#6BA896",
      iconBackground: "#1A2824",
    },
  },
  blue: {
    light: {
      background: "#F8FAFD",
      border: "#C8DAF2",
      text: "#5278A8",
      accent: "#89AAD4",
      iconBackground: "#EDF3FB",
    },
    dark: {
      background: "#1A2230",
      border: "#2E4568",
      text: "#89AAD4",
      accent: "#7A9CC8",
      iconBackground: "#1A2438",
    },
  },
  sky: {
    light: {
      background: "#F8FAFE",
      border: "#C0D8F0",
      text: "#5278A8",
      accent: "#A8C8E8",
      iconBackground: "#EDF4FB",
    },
    dark: {
      background: "#1A2230",
      border: "#2E4568",
      text: "#89AAD4",
      accent: "#7A9CC8",
      iconBackground: "#1A2438",
    },
  },
  red: {
    light: {
      background: "#FEF8F7",
      border: "#F0C4BE",
      text: "#9E4A4A",
      accent: "#E0A8A4",
      iconBackground: "#FDEFED",
    },
    dark: {
      background: "#281E1E",
      border: "#5C3838",
      text: "#E8B4B0",
      accent: "#C88888",
      iconBackground: "#3A2424",
    },
  },
  peach: {
    light: {
      background: "#FDFAF7",
      border: "#E8D4C4",
      text: "#8A6840",
      accent: "#D4BC98",
      iconBackground: "#F9F2EA",
    },
    dark: {
      background: "#24201C",
      border: "#4A4038",
      text: "#D4C4A8",
      accent: "#A89070",
      iconBackground: "#2A2420",
    },
  },
  pink: {
    light: {
      background: "#FDF8FB",
      border: "#E8C4DC",
      text: "#8A4068",
      accent: "#D4A8C8",
      iconBackground: "#F9EDF4",
    },
    dark: {
      background: "#241E22",
      border: "#4A3848",
      text: "#E8B4D0",
      accent: "#B080A0",
      iconBackground: "#2A2028",
    },
  },
};

export function getPastelAccent(
  variant: PastelAccentVariant,
  isDark: boolean
): PastelAccentColors {
  return PASTEL_ACCENTS[variant][isDark ? "dark" : "light"];
}

/** Linear blend between two hex colors — `amount` is the weight of `toward`. */
export function mixHex(from: string, toward: string, amount: number): string {
  const channels = (hex: string) => {
    const normalized = hex.replace("#", "");
    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16),
    ] as const;
  };
  const [r1, g1, b1] = channels(from);
  const [r2, g2, b2] = channels(toward);
  const blend = (a: number, b: number) => Math.round(a + (b - a) * amount);
  const hex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${hex(blend(r1, r2))}${hex(blend(g1, g2))}${hex(blend(b1, b2))}`;
}

export function pastelCardShellStyle(
  variant: PastelAccentVariant,
  isDark: boolean
): {
  backgroundColor: string;
  borderColor: string;
  borderTopColor: string;
} {
  const colors = getPastelAccent(variant, isDark);
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderTopColor: colors.accent,
  };
}

export function pastelBoxStyle(
  variant: PastelAccentVariant,
  isDark: boolean
): {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
} {
  const colors = getPastelAccent(variant, isDark);
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
  };
}
