import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { Check, Crown } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PremiumStatusModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Full-screen overlay (not RN Modal) so iOS touch handling stays intact
 * after dismiss — Modal + gesture-handler buttons caused double-tap bugs.
 */
export function PremiumStatusModal({ visible, onClose }: PremiumStatusModalProps) {
  const { isDark } = useTheme();
  const openGuardRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    openGuardRef.current = true;
    const timer = setTimeout(() => {
      openGuardRef.current = false;
    }, 350);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    if (openGuardRef.current) return;
    onClose();
  };

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Pressable
        style={styles.backdrop}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={[styles.iconWrap, isDark && styles.iconWrapDark]}>
          <Crown size={28} color={MAIN_PURPLE} strokeWidth={2.2} />
          <View style={[styles.tickBadge, isDark && styles.tickBadgeDark]}>
            <Check size={12} color="#FFFFFF" strokeWidth={3} />
          </View>
        </View>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          You are on Premium
        </Text>
        <Text style={[styles.body, isDark && styles.bodyDark]}>
          All content is unlocked — all modules, videos, resources and workbooks.
        </Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.88 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Got it"
        >
          <Text style={styles.buttonText}>Got it</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
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
  tickBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MAIN_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F4EEFF",
  },
  tickBadgeDark: {
    borderColor: "#2A2440",
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
