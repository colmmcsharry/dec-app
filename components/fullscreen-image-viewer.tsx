import { AppFonts } from "@/constants/theme";
import { Asset } from "expo-asset";
import { Image, type ImageSource } from "expo-image";
import { Download, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FullscreenImageViewerProps = {
  visible: boolean;
  onClose: () => void;
  source: ImageSource;
  shareAssetModule: number;
  shareTitle: string;
  accessibilityLabel: string;
};

async function resolveShareableImageUri(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error("Unable to resolve image");
  }
  return uri;
}

/**
 * Full-screen overlay at the screen root (never RN Modal).
 * Overlay actions use Pressable — RectButton here can leave gesture-handler
 * stuck after unmount and break taps on the page underneath.
 */
export function FullscreenImageViewer({
  visible,
  onClose,
  source,
  shareAssetModule,
  shareTitle,
  accessibilityLabel,
}: FullscreenImageViewerProps) {
  const [sharing, setSharing] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const close = useCallback(() => {
    requestAnimationFrame(() => {
      onClose();
    });
  }, [onClose]);

  if (!visible) return null;

  const handleShare = async () => {
    if (sharing) return;
    try {
      setSharing(true);
      const uri = await resolveShareableImageUri(shareAssetModule);
      if (Platform.OS === "web") {
        window.open(uri, "_blank");
        return;
      }
      await Share.share({
        title: shareTitle,
        message: shareTitle,
        url: uri,
      });
    } catch {
      Alert.alert("Unable to share", "Please try again in a moment.");
    } finally {
      setSharing(false);
    }
  };

  const imageHeight = screenHeight - insets.top - insets.bottom - 120;

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingHorizontal: 16 },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => void handleShare()}
          disabled={sharing}
          hitSlop={{ top: 20, bottom: 20, left: 16, right: 16 }}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: pressed || sharing ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Download or save image"
        >
          <View pointerEvents="none" style={styles.actionBtnInner}>
            <Download size={22} color="#FFFFFF" strokeWidth={2.25} />
          </View>
        </Pressable>

        <Pressable
          onPress={close}
          hitSlop={{ top: 20, bottom: 20, left: 16, right: 16 }}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close full screen image"
        >
          <View pointerEvents="none" style={styles.actionBtnInner}>
            <X size={26} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </Pressable>
      </View>

      <View style={styles.body} pointerEvents="none">
        <Image
          source={source}
          style={{ width: screenWidth, height: imageHeight }}
          contentFit="contain"
          accessibilityLabel={accessibilityLabel}
        />
      </View>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
        pointerEvents="none"
      >
        <Text style={styles.footerHint}>
          {Platform.OS === "web"
            ? "Use the download button to open the image"
            : "Tap download to save to Photos or send to another app"}
        </Text>
      </View>
    </View>
  );
}

type FullscreenImageThumbnailProps = {
  source: ImageSource;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  hint?: string;
  isDark?: boolean;
  onPress: () => void;
};

export function FullscreenImageThumbnail({
  source,
  accessibilityLabel,
  style,
  hint = "Tap to view full screen",
  isDark = false,
  onPress,
}: FullscreenImageThumbnailProps) {
  return (
    <>
      <RectButton
        onPress={onPress}
        style={[styles.thumbnailBtn, style]}
        underlayColor="rgba(0,0,0,0.05)"
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}. Tap to view full screen.`}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Image
            source={source}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
            accessibilityLabel={accessibilityLabel}
          />
        </View>
      </RectButton>
      <Text style={[styles.hint, isDark && styles.hintDark]} pointerEvents="none">
        {hint}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
    backgroundColor: "rgba(0,0,0,0.94)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    zIndex: 2001,
    elevation: 2001,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  footerHint: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  thumbnailBtn: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  hint: {
    marginTop: 8,
    fontFamily: AppFonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  hintDark: {
    color: "#AEB3C4",
  },
});
