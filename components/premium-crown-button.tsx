import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  addCustomerInfoListener,
  configurePurchases,
  hasProEntitlement,
} from "@/services/purchases";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Check, Crown } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";

export function PremiumCrownButton() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  /** Blocks backdrop dismiss for the same click that opened the modal (web). */
  const modalOpenGuardRef = useRef(false);

  const refreshPremium = useCallback(() => {
    void hasProEntitlement().then(setIsPremium);
  }, []);

  useEffect(() => {
    configurePurchases();
    return addCustomerInfoListener(() => {
      refreshPremium();
    });
  }, [refreshPremium]);

  useFocusEffect(
    useCallback(() => {
      refreshPremium();
    }, [refreshPremium]),
  );

  const openPremiumModal = useCallback(() => {
    modalOpenGuardRef.current = true;
    requestAnimationFrame(() => {
      setShowPremiumModal(true);
    });
    setTimeout(() => {
      modalOpenGuardRef.current = false;
    }, 350);
  }, []);

  const closePremiumModal = useCallback(() => {
    if (modalOpenGuardRef.current) return;
    setShowPremiumModal(false);
  }, []);

  const onPress = useCallback(() => {
    if (isPremium) {
      openPremiumModal();
      return;
    }
    router.push("/paywall-placeholder");
  }, [isPremium, openPremiumModal, router]);

  const crownColor = isDark ? "#C4B5E8" : MAIN_PURPLE;

  return (
    <>
      <RectButton
        onPress={onPress}
        style={[styles.button, isDark && styles.buttonDark]}
        underlayColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(113,135,206,0.12)"}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        accessibilityRole="button"
        accessibilityLabel={
          isPremium
            ? "Premium — all content unlocked"
            : "Upgrade to Premium"
        }
      >
        <View pointerEvents="none" style={styles.iconWrap}>
          <Crown size={22} color={crownColor} strokeWidth={2.4} />
          {isPremium ? (
            <View style={[styles.tickBadge, isDark && styles.tickBadgeDark]}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          ) : null}
        </View>
      </RectButton>

      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={closePremiumModal}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={closePremiumModal}
        >
          <Pressable
            style={[styles.modalCard, isDark && styles.modalCardDark]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalIconWrap, isDark && styles.modalIconWrapDark]}>
              <Crown size={28} color={MAIN_PURPLE} strokeWidth={2.2} />
              <View
                style={[
                  styles.modalTickBadge,
                  isDark && styles.modalTickBadgeDark,
                ]}
              >
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
              You are on Premium
            </Text>
            <Text style={[styles.modalBody, isDark && styles.modalBodyDark]}>
              All content is unlocked — every module, video, and workbook.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && { opacity: 0.88 },
              ]}
              onPress={closePremiumModal}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0ECF7",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDark: {
    backgroundColor: "#2A2A3E",
  },
  iconWrap: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tickBadge: {
    position: "absolute",
    right: -4,
    bottom: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: MAIN_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F0ECF7",
  },
  tickBadgeDark: {
    borderColor: "#2A2A3E",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#EADBF7",
  },
  modalCardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A2E5C",
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F4EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconWrapDark: {
    backgroundColor: "#2A2440",
  },
  modalTickBadge: {
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
  modalTickBadgeDark: {
    borderColor: "#2A2440",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: AppFonts.headingBold,
    color: "#1F2A3A",
    textAlign: "center",
    marginBottom: 8,
  },
  modalTitleDark: {
    color: "#ECEDEE",
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: AppFonts.bodyMedium,
    color: "#5C6370",
    textAlign: "center",
    marginBottom: 22,
  },
  modalBodyDark: {
    color: "#C4C8D4",
  },
  modalButton: {
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 140,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },
});
