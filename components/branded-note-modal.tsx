import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { Bell, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type BrandedNote = {
  title: string;
  body: string;
  buttonLabel?: string;
  /** bell = habit nudge; check = confirmation */
  variant?: "bell" | "check";
};

type BrandedNoteModalProps = {
  note: BrandedNote | null;
  onClose: () => void;
};

type Listener = (note: BrandedNote | null) => void;

let noteListener: Listener | null = null;

/** Show a branded in-app note from anywhere (root host must be mounted). */
export function showBrandedNote(note: BrandedNote): void {
  noteListener?.(note);
}

/**
 * Root-level absolute overlay (not RN Modal).
 * Avoids nesting with HabitRemindersModal / home time picker Modals, which can crash.
 * Dim works here because the host sits at the app root, not inside a tab screen.
 */
export function BrandedNoteModal({ note, onClose }: BrandedNoteModalProps) {
  const { isDark } = useTheme();
  if (!note) return null;

  const variant = note.variant ?? "bell";
  const buttonLabel = note.buttonLabel ?? "OK";

  const dismiss = () => {
    requestAnimationFrame(() => onClose());
  };

  return (
    <View style={styles.overlay} accessibilityViewIsModal pointerEvents="box-none">
      <Pressable
        style={styles.backdrop}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={[styles.iconWrap, isDark && styles.iconWrapDark]}>
          <View pointerEvents="none">
            {variant === "check" ? (
              <Check size={28} color={MAIN_PURPLE} strokeWidth={2.6} />
            ) : (
              <Bell size={26} color={MAIN_PURPLE} strokeWidth={2.2} />
            )}
          </View>
        </View>
        <Text style={[styles.title, isDark && styles.titleDark]}>{note.title}</Text>
        <Text style={[styles.body, isDark && styles.bodyDark]}>{note.body}</Text>
        <Pressable
          onPress={dismiss}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.88 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Mount once near the app root so `showBrandedNote` can open UI from services/handlers. */
export function BrandedNoteHost() {
  const [note, setNote] = useState<BrandedNote | null>(null);

  useEffect(() => {
    noteListener = setNote;
    return () => {
      noteListener = null;
    };
  }, []);

  return <BrandedNoteModal note={note} onClose={() => setNote(null)} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2000,
    elevation: 2000,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: "100%",
    maxWidth: 320,
    zIndex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#EADBF7",
  },
  cardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A2E5C",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F4EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrapDark: {
    backgroundColor: "#2A2440",
  },
  title: {
    fontSize: 20,
    fontFamily: AppFonts.headingBold,
    color: "#1F2A3A",
    textAlign: "center",
    marginBottom: 8,
  },
  titleDark: {
    color: "#ECEDEE",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: AppFonts.bodyMedium,
    color: "#5C6370",
    textAlign: "center",
    marginBottom: 22,
  },
  bodyDark: {
    color: "#C4C8D4",
  },
  button: {
    alignSelf: "stretch",
    width: "100%",
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },
});
