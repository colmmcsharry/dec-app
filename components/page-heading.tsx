import type { ReactNode } from "react";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { StyleSheet, Text, View } from "react-native";

type PageHeadingProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function PageHeading({ title, subtitle, trailing }: PageHeadingProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  trailing: {
    flexShrink: 0,
    marginTop: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    letterSpacing: 0.3,
    lineHeight: 26,
  },
  titleDark: {
    color: "#ECEDEE",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: "#5C6370",
    fontFamily: AppFonts.bodyRegular,
    marginTop: 6,
  },
  subtitleDark: {
    color: "#C4C8D4",
  },
});
