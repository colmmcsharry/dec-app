import { StyleSheet } from "react-native";
import Pdf from "react-native-pdf";

import type { NativePdfViewProps } from "./native-pdf-view";

/** Native PDF renderer for Android release builds (not available in Expo Go). */
export function NativePdfView({
  uri,
  isDark,
  onError,
  onLoadComplete,
}: NativePdfViewProps) {
  return (
    <Pdf
      source={{ uri, cache: true }}
      style={[
        styles.pdf,
        { backgroundColor: isDark ? "#1A1D2E" : "#F9FAFB" },
      ]}
      trustAllCerts
      onError={(error) => {
        const message =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Failed to display PDF";
        onError(message);
      }}
      onLoadComplete={onLoadComplete}
    />
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
  },
});
