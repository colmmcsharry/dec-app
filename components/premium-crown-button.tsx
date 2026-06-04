import { MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  addCustomerInfoListener,
  configurePurchases,
  hasProEntitlement,
} from "@/services/purchases";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Check, Crown } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type PremiumCrownButtonProps = {
  onShowPremiumStatus?: () => void;
};

export function PremiumCrownButton({ onShowPremiumStatus }: PremiumCrownButtonProps) {
  const { isDark } = useTheme();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

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

  const onPress = useCallback(() => {
    if (isPremium) {
      onShowPremiumStatus?.();
      return;
    }
    router.push("/paywall-placeholder");
  }, [isPremium, onShowPremiumStatus, router]);

  const crownColor = isDark ? "#C4B5E8" : MAIN_PURPLE;

  return (
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
});
