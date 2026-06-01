import { BeforeAfterCarousel } from "@/components/before-after-carousel";
import { VideoTestimonialCarousel } from "@/components/video-testimonial-carousel";
import { DevResetButton } from "@/components/dev-reset-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { getPastelAccent, mixHex } from "@/constants/pastel-accents";
import { useTheme } from "@/context/theme-context";
import { getReviewStoreLabel, requestAppReview } from "@/services/app-review";
import {
  addCustomerInfoListener,
  customerInfoHasPro,
  hasProEntitlement,
} from "@/services/purchases";
import { useIsFocused } from "@react-navigation/native";
import { ChevronDown, ChevronUp, Crown, Lock, Star, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Matches digital workbook body copy (`app/module-workbook/[slug].tsx`). */
const WORKBOOK_TEXT = "#1E2430";
const WORKBOOK_TEXT_BODY = "#2E343F";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_GAP = 16;
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40;
const CAROUSEL_IMAGE_WIDTH = CAROUSEL_ITEM_WIDTH - CAROUSEL_GAP;
const CAROUSEL_STRIDE = CAROUSEL_ITEM_WIDTH;
const CAROUSEL_IMAGE_HEIGHT = 250;

const COLLAGE_SOURCE = require("@/assets/images/deco-collage-compressed.png");
const COLLAGE_HEIGHT_RATIO = 537 / 539;

function BioCollage() {
  const [width, setWidth] = useState(0);

  return (
    <View
      style={styles.bioCollageWrap}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Image
          source={COLLAGE_SOURCE}
          style={{ width, height: width * COLLAGE_HEIGHT_RATIO }}
          accessibilityLabel="Photos of Declan running, with family, and on the coast"
        />
      ) : null}
    </View>
  );
}

const BIO_TOGGLE_PRESS_RETENTION = {
  top: 28,
  bottom: 28,
  left: 28,
  right: 28,
};

function BioToggleButton({
  label,
  icon: Icon,
  onPress,
  accessibilityLabel,
  isDark,
}: {
  label: string;
  icon: typeof ChevronDown;
  onPress: () => void;
  accessibilityLabel: string;
  isDark: boolean;
}) {
  const toggleColor = isDark ? "#ECEDEE" : WORKBOOK_TEXT;
  const toggleTextStyle = [
    styles.bioToggleText,
    isDark && styles.bioToggleTextDark,
  ];

  return (
    <Pressable
      onPress={onPress}
      pressRetentionOffset={BIO_TOGGLE_PRESS_RETENTION}
      style={({ pressed }) => [
        styles.bioToggleButton,
        pressed && styles.bioToggleButtonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.bioToggleRow}>
        <Text style={toggleTextStyle}>{label}</Text>
        <Icon size={20} color={toggleColor} strokeWidth={2.5} />
      </View>
    </Pressable>
  );
}

function WhoAmISection({
  isDark,
  defaultAccentBarColor,
}: {
  isDark: boolean;
  defaultAccentBarColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const bodyTextStyle = [styles.bodyText, isDark && styles.bodyTextDark];

  const expandBio = useCallback(() => {
    setExpanded(true);
  }, []);

  const collapseBio = useCallback(() => {
    setExpanded(false);
  }, []);

  return (
    <View
      style={[
        styles.section,
        styles.bioCard,
        isDark && styles.cardDark,
        styles.cardShell,
        isDark && styles.cardShellDark,
        { borderTopColor: defaultAccentBarColor },
      ]}
    >
      <View
        style={[
          styles.cardAccentBar,
          { backgroundColor: defaultAccentBarColor },
        ]}
      />
      <View style={styles.cardInner}>
        <Text style={[styles.heroEyebrow, isDark && styles.heroEyebrowDark]}>
          About
        </Text>
        <View style={styles.heroSection}>
          <Image
            source={require("@/assets/images/about/declan.png")}
            style={[styles.heroImage, isDark && styles.heroImageDark]}
            resizeMode="cover"
          />
          <Text style={[styles.heroName, isDark && styles.textDark]}>
            Declan Treanor
          </Text>
          <Text
            style={[styles.heroTagline, isDark && styles.heroTaglineDark]}
          >
            aka Performance Treanor
          </Text>
        </View>
        <Text
          style={[
            styles.bodyText,
            styles.heroMissionText,
            isDark && styles.bodyTextDark,
          ]}
        >
          I want to help people get the best out of themselves.
        </Text>

        {!expanded ? (
          <BioToggleButton
            label="Read More"
            icon={ChevronDown}
            onPress={expandBio}
            accessibilityLabel="Read more about Declan"
            isDark={isDark}
          />
        ) : (
          <BioToggleButton
            label="See Less"
            icon={ChevronUp}
            onPress={collapseBio}
            accessibilityLabel="See less about Declan"
            isDark={isDark}
          />
        )}

        {expanded ? (
          <>
            <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
              This app is the culmination of my 10 years of experience in the
              field of psychology and performance, working with high performers
              and average Joes and Janes.
            </Text>
            <Text
              style={[
                styles.sectionEyebrow,
                styles.bioExpandedEyebrow,
                isDark && styles.sectionEyebrowDark,
              ]}
            >
              Background
            </Text>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              So who am I?
            </Text>
            <BioCollage />
            <Text
              style={[
                styles.bodyText,
                styles.bodyTextAfterPhoto,
                isDark && styles.bodyTextDark,
              ]}
            >
              Residing in Dublin, Ireland, I am happily married, a father and
              a REPs accredited (Register of Exercise Professionals), fully
              qualified Personal Trainer. This qualification includes a national
              certificate in Nutrition for Physical Activity.
            </Text>
            <Text style={bodyTextStyle}>
              I am an enthusiast for the area of psychology and performance and
              have completed a Sports Psychology diploma with distinction.
            </Text>
            <Text style={bodyTextStyle}>
              Before these qualifications I obtained an MSc in Strategic
              Management and Planning and a BComm in Commerce International with
              French.
            </Text>
            <Text style={bodyTextStyle}>
              As a Gaelic Footballer I was part of the Dublin Senior Team{"'"}s O
              {"'"}Byrne Cup squad in 2012.
            </Text>
            <Image
              source={require("@/assets/images/about/dubs-team.jpg")}
              style={styles.teamPhoto}
              resizeMode="cover"
            />
            <Text style={[styles.photoCaption, isDark && styles.metaTextDark]}>
              Back row 2nd from left — Photo kindly provided by Sportsfile
            </Text>
            <Text
              style={[
                styles.bodyText,
                { marginTop: 16 },
                isDark && styles.bodyTextDark,
              ]}
            >
              My Dad got me interested in the area of performance by passing me on
              a book called{" "}
              <Text style={styles.bookTitle}>
                the Monk Who Sold His Ferrari
              </Text>
              . Now it{"'"}s my turn to pass something on to you!
            </Text>
            <Text style={bodyTextStyle}>
              Having suffered the debilitating effects of performance anxiety
              particularly in the field of sport I feel it important to share
              information that can help others through such issues.
            </Text>
            <Text
              style={[styles.closingText, isDark && styles.closingTextDark]}
            >
              Train your mind, body and soul!
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const TESTIMONIAL_IMAGES: ImageSourcePropType[] = [
  require("@/assets/images/about/testimonials/testimonial-2.jpg"),
  require("@/assets/images/about/testimonials/testimonial-1.jpg"),
  require("@/assets/images/about/testimonials/testimonial-3.jpg"),
  require("@/assets/images/about/testimonials/testimonial-4.jpg"),
  require("@/assets/images/about/testimonials/testimonial-5.jpg"),
  require("@/assets/images/about/testimonials/testimonial-6.jpg"),
  require("@/assets/images/about/testimonials/testimonial-7.jpg"),
  require("@/assets/images/about/testimonials/testimonial-8.jpg"),
];

function TestimonialImageCarousel({ isDark }: { isDark: boolean }) {
  const insets = useSafeAreaInsets();
  const modalListRef = useRef<FlatList<ImageSourcePropType>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /** null = closed; number = open (initial slide only — swipe uses modalSlideIndex). */
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);

  useEffect(() => {
    if (viewerIndex === null) return;
    setModalSlideIndex(viewerIndex);
    requestAnimationFrame(() => {
      modalListRef.current?.scrollToIndex({
        index: viewerIndex,
        animated: false,
      });
    });
  }, [viewerIndex]);

  const openViewer = (index: number) => {
    if (viewerIndex !== null) return;
    setViewerIndex(index);
  };

  const onCarouselScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / CAROUSEL_STRIDE));
  };

  const onModalScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setModalSlideIndex(Math.round(x / SCREEN_WIDTH));
  };

  const closeViewer = () => {
    setActiveIndex(modalSlideIndex);
    setViewerIndex(null);
  };

  const viewerOpen = viewerIndex !== null;

  return (
    <View style={styles.carouselWrap}>
      <FlatList
        data={TESTIMONIAL_IMAGES}
        style={styles.carouselList}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_STRIDE}
        snapToAlignment="start"
        disableIntervalMomentum
        keyExtractor={(_, index) => `testimonial-image-${index}`}
        onMomentumScrollEnd={onCarouselScrollEnd}
        getItemLayout={(_, index) => ({
          length: CAROUSEL_STRIDE,
          offset: CAROUSEL_STRIDE * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <Pressable
            style={[
              styles.carouselSlide,
              {
                width: CAROUSEL_IMAGE_WIDTH,
                marginRight: CAROUSEL_GAP,
              },
            ]}
            onPress={() => openViewer(index)}
            disabled={viewerOpen}
            accessibilityRole="button"
            accessibilityLabel={`Testimonial ${index + 1} of ${TESTIMONIAL_IMAGES.length}. Tap to open full screen.`}
          >
            <Image
              source={item}
              style={styles.carouselImage}
              resizeMode="contain"
            />
          </Pressable>
        )}
      />
      <View style={styles.carouselDots}>
        {TESTIMONIAL_IMAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.carouselDot,
              isDark && styles.carouselDotDark,
              index === activeIndex && styles.carouselDotActive,
              index === activeIndex && isDark && styles.carouselDotActiveDark,
            ]}
          />
        ))}
      </View>
      <Text style={[styles.carouselHint, isDark && styles.carouselHintDark]}>
        Tap to view full screen · Swipe for more
      </Text>

      <Modal
        visible={viewerOpen}
        animationType="fade"
        transparent
        onRequestClose={closeViewer}
        presentationStyle="fullScreen"
      >
        <View style={styles.viewerRoot}>
          <View
            style={[
              styles.viewerHeader,
              { paddingTop: insets.top + 8, paddingHorizontal: 16 },
            ]}
          >
            <Text style={styles.viewerCounter}>
              {modalSlideIndex + 1} / {TESTIMONIAL_IMAGES.length}
            </Text>
            <Pressable
              onPress={closeViewer}
              onPressIn={(e) => e.stopPropagation()}
              hitSlop={16}
              style={({ pressed }) => [
                styles.viewerCloseBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close testimonial viewer"
            >
              <X size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          <FlatList
            ref={modalListRef}
            style={styles.viewerList}
            data={TESTIMONIAL_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            keyExtractor={(_, index) => `testimonial-viewer-${index}`}
            onMomentumScrollEnd={onModalScrollEnd}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                modalListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                });
              }, 100);
            }}
            renderItem={({ item, index }) => (
              <View
                style={[styles.viewerSlide, { width: SCREEN_WIDTH }]}
                accessibilityRole="image"
                accessibilityLabel={`Testimonial ${index + 1} of ${TESTIMONIAL_IMAGES.length}`}
              >
                <Image
                  source={item}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          <View
            style={[styles.viewerFooter, { paddingBottom: insets.bottom + 16 }]}
          >
            <View style={styles.carouselDots}>
              {TESTIMONIAL_IMAGES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.carouselDot,
                    styles.viewerDot,
                    index === modalSlideIndex && styles.viewerDotActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.viewerHint}>Swipe to browse testimonials</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PremiumStatusBanner({
  isDark,
  isPremium,
}: {
  isDark: boolean;
  isPremium: boolean | null;
}) {
  const insets = useSafeAreaInsets();

  if (isPremium === null) return null;

  const active = isPremium;
  const title = active
    ? "You are on the Premium version"
    : "You are on the Basic version";

  return (
    <View style={{ paddingTop: insets.top + 8, marginBottom: 20 }}>
      <View
        style={[
          styles.premiumBanner,
          active ? styles.premiumBannerActive : styles.premiumBannerFree,
          isDark &&
            (active
              ? styles.premiumBannerActiveDark
              : styles.premiumBannerFreeDark),
        ]}
        accessibilityRole="text"
        accessibilityLabel={title}
      >
        <View style={styles.premiumBannerText}>
          <View style={styles.premiumBannerTitleRow}>
            <Text
              style={[
                styles.premiumBannerTitle,
                isDark && styles.premiumBannerTitleDark,
                active && styles.premiumBannerTitleActive,
                active && isDark && styles.premiumBannerTitleActiveDark,
              ]}
            >
              {title}
            </Text>
            {active ? (
              <Crown
                size={18}
                color={isDark ? "#C4B5E8" : MAIN_PURPLE}
                strokeWidth={2.2}
              />
            ) : (
              <Lock
                size={18}
                color={isDark ? "#AEB3C4" : "#5C6370"}
                strokeWidth={2.2}
              />
            )}
          </View>
          <Text
            style={[
              styles.premiumBannerSubtitle,
              isDark && styles.premiumBannerSubtitleDark,
            ]}
          >
            {active
              ? "Full access to all modules, videos, and workbooks."
              : "Upgrade to Premium to unlock all modules, videos, and workbooks."}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { isDark } = useTheme();
  const isFocused = useIsFocused();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const disclaimerAccent = getPastelAccent("red", isDark);
  const disclaimerBackground = mixHex(
    disclaimerAccent.background,
    disclaimerAccent.accent,
    0.15,
  );
  const defaultAccentBarColor = isDark ? MAIN_PURPLE : "#A8B4E8";

  useEffect(() => {
    if (!isFocused) return;
    void hasProEntitlement().then(setIsPremium);
  }, [isFocused]);

  useEffect(() => {
    return addCustomerInfoListener((info) => {
      setIsPremium(customerInfoHasPro(info));
    });
  }, []);

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
    >
      <PremiumStatusBanner isDark={isDark} isPremium={isPremium} />

      <WhoAmISection
        isDark={isDark}
        defaultAccentBarColor={defaultAccentBarColor}
      />

      {/* Leave a review */}
      <View
        style={[
          styles.section,
          styles.reviewCard,
          { backgroundColor: "#E6F5F0" },
        ]}
      >
        <View style={styles.cardInner}>
          <Text
            style={[styles.sectionEyebrow, isDark && styles.sectionEyebrowDark]}
          >
            Feedback
          </Text>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Enjoying Daily Diesel?
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            If the app is helping you, a quick review on the{" "}
            {getReviewStoreLabel()} makes a big difference.
          </Text>
          <Pressable
            onPress={() => void requestAppReview()}
            style={({ pressed }) => [
              styles.reviewButton,
              isDark && styles.reviewButtonDark,
              pressed && styles.reviewButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Leave a review on the ${getReviewStoreLabel()}`}
          >
            <Star
              size={18}
              color={isDark ? "#1E2430" : "#FFFFFF"}
              fill={isDark ? "#C4B5E8" : "#FFFFFF"}
            />
            <Text
              style={[
                styles.reviewButtonText,
                isDark && styles.reviewButtonTextDark,
              ]}
            >
              Leave a review
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Before / After */}
      <View
        style={[
          styles.section,
          styles.beforeAfterCard,
          isDark && styles.cardDark,
          styles.cardShell,
          isDark && styles.cardShellDark,
          { borderTopColor: defaultAccentBarColor },
        ]}
      >
        <View
          style={[
            styles.cardAccentBar,
            { backgroundColor: defaultAccentBarColor },
          ]}
        />
        <View style={styles.cardInner}>
          <Text
            style={[styles.sectionEyebrow, isDark && styles.sectionEyebrowDark]}
          >
            Before / After
          </Text>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Client Transformations
          </Text>
          <BeforeAfterCarousel isDark={isDark} />
        </View>
      </View>

      {/* Testimonials */}
      <Text
        style={[
          styles.sectionEyebrow,
          styles.testimonialsEyebrow,
          isDark && styles.sectionEyebrowDark,
        ]}
      >
        Testimonials
      </Text>
      <Text
        style={[
          styles.testimonialsSectionTitle,
          isDark && styles.sectionTitleDark,
        ]}
      >
        What People Say
      </Text>

      <View style={styles.carouselWrap}>
        <VideoTestimonialCarousel isDark={isDark} />
      </View>

      <TestimonialImageCarousel isDark={isDark} />

      <View
        style={[styles.disclaimerWrap, isDark && styles.disclaimerWrapDark]}
      >
        <View
          style={[
            styles.section,
            styles.disclaimerCard,
            { backgroundColor: disclaimerBackground },
          ]}
        >
          <View style={styles.cardInner}>
            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Medical Disclaimer
            </Text>
            <Text
              style={[
                styles.bodyText,
                styles.disclaimerBodyText,
                isDark && styles.bodyTextDark,
              ]}
            >
              The content in this app is for informational purposes only and is
              not a substitute for professional medical advice, diagnosis or
              treatment. Always consult a qualified healthcare provider
              regarding any medical conditions.
            </Text>
          </View>
        </View>
      </View>

      <DevResetButton variant="inline" />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  premiumBannerActive: {
    backgroundColor: "#F4F0FB",
    borderColor: "#C4B5E8",
  },
  premiumBannerActiveDark: {
    backgroundColor: "#2A2440",
    borderColor: "#5B4A8A",
  },
  premiumBannerFree: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  premiumBannerFreeDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3A52",
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  premiumBannerTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    color: WORKBOOK_TEXT,
  },
  premiumBannerTitleDark: {
    color: "#ECEDEE",
  },
  premiumBannerTitleActive: {
    color: MAIN_PURPLE,
  },
  premiumBannerTitleActiveDark: {
    color: "#C4B5E8",
  },
  premiumBannerSubtitle: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#5C6370",
  },
  premiumBannerSubtitleDark: {
    color: "#AEB3C4",
  },
  viewAllButton: {
    marginTop: 4,
    backgroundColor: MAIN_PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  viewAllButtonText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#FFFFFF",
  },
  textDark: {
    color: "#ECEDEE",
  },
  sectionTitleDark: {
    color: "#ECEDEE",
  },
  bodyTextDark: {
    color: "#E0E3EC",
  },
  metaTextDark: {
    color: "#AEB3C4",
  },

  /** Shared card chrome (workbook / welcome-style purple). */
  cardShell: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#EADBF7",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: MAIN_PURPLE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
  },
  cardShellDark: {
    borderColor: "#3A2E5C",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
      },
    }),
  },
  cardAccentBar: {
    height: 5,
    backgroundColor: "#A8B4E8",
  },
  cardInner: {
    padding: 20,
  },
  cardDark: {
    backgroundColor: "#1E1E32",
  },

  heroEyebrow: {
    fontSize: 11,
    fontFamily: AppFonts.headingBold,
    color: MAIN_PURPLE,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 14,
    textAlign: "center",
  },
  heroEyebrowDark: {
    color: "#B7A8E0",
  },
  heroSection: {
    alignItems: "center",
  },
  heroImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: MAIN_PURPLE,
  },
  heroImageDark: {
    borderColor: "#9B8FD4",
  },
  heroName: {
    fontSize: 28,
    fontFamily: AppFonts.headingBold,
    color: WORKBOOK_TEXT,
    marginBottom: 0,
  },
  heroTagline: {
    fontSize: 16,
    fontStyle: "italic",
    color: MAIN_PURPLE,
    fontFamily: AppFonts.bodyMedium,
    textAlign: "center",
  },
  heroTaglineDark: {
    color: "#B7A8E0",
  },
  heroMissionText: {
    marginTop: 24,
  },

  section: {
    marginBottom: 20,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
  },
  bioCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
    overflow: "visible",
  },
  beforeAfterCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  reviewCard: {
    marginBottom: 24,
    borderRadius: 20,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: MAIN_PURPLE,
  },
  reviewButtonDark: {
    backgroundColor: "#B7A8E0",
  },
  reviewButtonPressed: {
    opacity: 0.85,
  },
  reviewButtonText: {
    fontSize: 16,
    fontFamily: AppFonts.headingSemiBold,
    color: "#FFFFFF",
  },
  reviewButtonTextDark: {
    color: "#1E2430",
  },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: AppFonts.headingBold,
    color: MAIN_PURPLE,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionEyebrowDark: {
    color: "#B7A8E0",
  },
  bioExpandedEyebrow: {
    marginTop: 20,
  },
  testimonialsEyebrow: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: WORKBOOK_TEXT,
    marginBottom: 8,
  },
  bioCollageWrap: {
    width: "100%",
    marginTop: 8,
  },
  bodyTextAfterPhoto: {
    marginTop: 8,
  },
  bioToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bioToggleButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    marginTop: 10,
    marginLeft: -8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  bioToggleButtonPressed: {
    opacity: 0.65,
  },
  bioToggleText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 15,
    color: WORKBOOK_TEXT,
  },
  bioToggleTextDark: {
    color: "#ECEDEE",
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 25,
    color: WORKBOOK_TEXT_BODY,
    marginBottom: 12,
    fontFamily: AppFonts.bodyRegular,
  },
  bookTitle: {
    fontStyle: "italic",
  },
  teamPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#E8E8EF",
  },
  photoCaption: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#5C6370",
    textAlign: "center",
    marginTop: 8,
    fontFamily: AppFonts.bodyRegular,
  },
  closingText: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
    color: MAIN_PURPLE,
  },
  closingTextDark: {
    color: "#C4B5E8",
  },

  testimonialsSectionTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: WORKBOOK_TEXT,
    marginBottom: 16,
  },
  carouselWrap: {
    marginBottom: 28,
  },
  carouselList: {
    width: CAROUSEL_ITEM_WIDTH,
  },
  carouselSlide: {
    alignItems: "center",
    justifyContent: "center",
  },
  carouselImage: {
    width: "100%",
    height: CAROUSEL_IMAGE_HEIGHT,
    maxHeight: CAROUSEL_IMAGE_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#1A1D2E",
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  carouselDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  carouselDotDark: {
    backgroundColor: "#4B5563",
  },
  carouselDotActive: {
    width: 20,
    backgroundColor: MAIN_PURPLE,
  },
  carouselDotActiveDark: {
    backgroundColor: "#B7A8E0",
  },
  carouselHint: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: AppFonts.bodyRegular,
    color: "#5C6370",
    textAlign: "center",
  },
  carouselHintDark: {
    color: "#AEB3C4",
  },
  viewerRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  viewerCounter: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  viewerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  viewerList: {
    flex: 1,
  },
  viewerSlide: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  viewerImage: {
    width: SCREEN_WIDTH - 24,
    height: "100%",
  },
  viewerFooter: {
    paddingTop: 12,
    alignItems: "center",
    gap: 8,
  },
  viewerDot: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  viewerDotActive: {
    backgroundColor: "#FFFFFF",
  },
  viewerHint: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  disclaimerWrap: {
    marginTop: 12,
    paddingTop: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#D1D5DB",
  },
  disclaimerWrapDark: {
    borderTopColor: "#3A3A52",
  },
  disclaimerCard: {
    borderRadius: 20,
  },
  disclaimerBodyText: {
    marginBottom: 0,
  },
});
