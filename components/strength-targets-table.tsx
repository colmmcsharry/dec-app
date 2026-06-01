import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import type { StrengthTargetRow } from "@/data/strength-fitness-targets";
import { StyleSheet, Text, View } from "react-native";

type StrengthTargetsTableProps = {
  rows: StrengthTargetRow[];
  isDark: boolean;
};

export function StrengthTargetsTable({ rows, isDark }: StrengthTargetsTableProps) {
  return (
    <View
      style={[
        styles.table,
        isDark ? styles.tableDark : styles.tableLight,
      ]}
    >
      <View
        style={[
          styles.headerRow,
          isDark ? styles.headerRowDark : styles.headerRowLight,
        ]}
      >
        <Text
          style={[styles.headerCell, styles.labelCol, isDark && styles.textDark]}
        />
        <Text
          style={[styles.headerCell, styles.dataCol, isDark && styles.textDark]}
        >
          Men
        </Text>
        <Text
          style={[styles.headerCell, styles.dataCol, isDark && styles.textDark]}
        >
          Women
        </Text>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[
            styles.bodyRow,
            index < rows.length - 1 && styles.bodyRowBorder,
            isDark ? styles.bodyRowBorderDark : styles.bodyRowBorderLight,
          ]}
        >
          <Text
            style={[styles.labelCell, isDark && styles.labelDark]}
          >
            {row.label}
          </Text>
          <Text style={[styles.dataCell, isDark && styles.dataDark]}>
            {row.men}
          </Text>
          <Text style={[styles.dataCell, isDark && styles.dataDark]}>
            {row.women}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableLight: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  tableDark: {
    borderColor: "#3A3D55",
    backgroundColor: "#1E1E32",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerRowLight: {
    backgroundColor: "#F3F0FA",
  },
  headerRowDark: {
    backgroundColor: "#252540",
  },
  headerCell: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 13,
    color: MAIN_PURPLE,
  },
  bodyRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  bodyRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bodyRowBorderLight: {
    borderBottomColor: "#E5E7EB",
  },
  bodyRowBorderDark: {
    borderBottomColor: "#3A3D55",
  },
  labelCol: {
    flex: 0.9,
  },
  dataCol: {
    flex: 1,
  },
  labelCell: {
    flex: 0.9,
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    color: "#374151",
  },
  labelDark: {
    color: "#D1D5DB",
  },
  dataCell: {
    flex: 1,
    fontFamily: AppFonts.bodyRegular,
    fontSize: 12,
    lineHeight: 17,
    color: "#4B5563",
  },
  dataDark: {
    color: "#AEB3C4",
  },
  textDark: {
    color: "#ECEDEE",
  },
});
