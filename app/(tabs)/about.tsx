import { BeforeAfterCarousel } from "@/components/before-after-carousel";
import { DevResetButton } from "@/components/dev-reset-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  addCustomerInfoListener,
  customerInfoHasPro,
  hasProEntitlement,
} from "@/services/purchases";
import { useIsFocused } from "@react-navigation/native";
import { Crown, Lock, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
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

interface TestimonialProps {
  name: string;
  role: string;
  image: any;
  quote: string;
  isDark: boolean;
  imageRound?: boolean;
}

function Testimonial({
  name,
  role,
  image,
  quote,
  isDark,
  imageRound,
}: TestimonialProps) {
  return (
    <View
      style={[
        styles.testimonialCard,
        isDark ? styles.testimonialCardDark : styles.testimonialCardLight,
        styles.cardShell,
        isDark && styles.cardShellDark,
      ]}
    >
      <View
        style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]}
      />
      <View style={styles.cardInner}>
        <View style={styles.testimonialHeader}>
          <Image
            source={image}
            style={[
              styles.testimonialImage,
              imageRound && styles.testimonialImageRound,
              isDark && styles.testimonialImageDark,
            ]}
            resizeMode="cover"
          />
          <View style={styles.testimonialNameWrap}>
            <Text
              style={[
                styles.testimonialName,
                isDark && styles.testimonialNameDark,
              ]}
            >
              {name}
            </Text>
            <Text
              style={[
                styles.testimonialRole,
                isDark && styles.testimonialRoleDark,
              ]}
            >
              {role}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.testimonialQuote,
            isDark && styles.testimonialQuoteDark,
          ]}
        >
          &ldquo;{quote}&rdquo;
        </Text>
      </View>
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
    >
      <PremiumStatusBanner isDark={isDark} isPremium={isPremium} />

      {/* Hero */}
      <View
        style={[
          styles.heroCard,
          isDark && styles.cardDark,
          styles.cardShell,
          isDark && styles.cardShellDark,
        ]}
      >
        <View
          style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]}
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
        </View>
      </View>

      {/* Mission */}
      <View
        style={[
          styles.section,
          styles.missionCard,
          isDark && styles.cardDark,
          styles.cardShell,
          isDark && styles.cardShellDark,
        ]}
      >
        <View
          style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]}
        />
        <View style={styles.cardInner}>
          <Text
            style={[styles.sectionEyebrow, isDark && styles.sectionEyebrowDark]}
          >
            Mission
          </Text>
          <Text
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            My Mission
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            I want to help people get the best out of themselves.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            This app is the culmination of my 10 years of experience in the
            field of psychology and performance, working with high performers
            and average Joes and Janes.
          </Text>
        </View>
      </View>

      {/* Who Am I */}
      <View
        style={[
          styles.section,
          styles.bioCard,
          isDark && styles.cardDark,
          styles.cardShell,
          isDark && styles.cardShellDark,
        ]}
      >
        <View
          style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]}
        />
        <View style={styles.cardInner}>
          <Text
            style={[styles.sectionEyebrow, isDark && styles.sectionEyebrowDark]}
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
            I am an enthusiast for the area of psychology and performance and
            have completed a Sports Psychology diploma with distinction.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            Residing in Dublin, Ireland, I am happily married, a father and and
            a REPs accredited (Register of Exercise Professionals), fully
            qualified Personal Trainer. This qualification includes a national
            certificate in Nutrition for Physical Activity.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            Before these qualifications I obtained an MSc in Strategic
            Management and Planning and a BComm in Commerce International with
            French.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
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
            <Text style={styles.bookTitle}>the Monk Who Sold His Ferrari</Text>.
            Now it{"'"}s my turn to pass something on to you!
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            Having suffered the debilitating effects of performance anxiety
            particularly in the field of sport I feel it important to share
            information that can help others through such issues.
          </Text>
          <Text style={[styles.closingText, isDark && styles.closingTextDark]}>
            Train your mind, body and soul!
          </Text>
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
        ]}
      >
        <View
          style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]}
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

      <TestimonialImageCarousel isDark={isDark} />

      <Testimonial
        name="Declan Egan"
        role="Founder, 100minds"
        image={require("@/assets/images/about/dec-egan.jpg")}
        quote="Declan was without doubt one of the most exemplary mentors we had on the project this year and stood out significantly as one of the most natural mentors amongst 160 of his peers ranging from companies like Google, Deloitte and many more. The feedback from his team of students was extremely positive and his commitment to going the extra mile both for his own team and for the bigger cause was amazing."
        isDark={isDark}
      />

      <Testimonial
        name="Igor Belozerov"
        role="Export Specialist, Watts Industries"
        image={require("@/assets/images/about/igor.jpg")}
        quote="Declan was the mastermind and the heart of our Drama/Theatre Group at the European Commission. He organized and ran weekly sessions for the Group. Being extremely creative, he always came up with interesting techniques and exercises for the warm up and to understand different on stage roles. He got two theatre experts in who helped us a lot with their knowledge and experience. Declan's natural leadership and especially his empathy guided the group to our final show which was a great success!"
        isDark={isDark}
        imageRound
      />

      <Testimonial
        name="Caoimhe Ní Shúilleabháin"
        role="Belgium GAA Chairman & Ladies' Footballer"
        image={require("@/assets/images/about/caoimhe.jpg")}
        quote="Declan trained Belgium ladies Gaelic football team in the run up to their encounter with the UK champions in the Junior Club All-Ireland championship in 2016. The transition was a smooth one thanks to Declan being well prepared from the beginning but also because he showed he was open to learning from us also. He pushed the players to give their 100%, but never in a negative way — feedback was always very constructive. Having Declan with us for our preparations for that big match was a great bonus to us."
        isDark={isDark}
      />

      <View
        style={[styles.disclaimerWrap, isDark && styles.disclaimerWrapDark]}
      >
        <View
          style={[
            styles.section,
            styles.missionCard,
            isDark && styles.cardDark,
            styles.cardShell,
            isDark && styles.cardShellDark,
          ]}
        >
          <View
            style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]}
          />
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
    backgroundColor: "#F3F2F7",
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
  testimonialQuoteDark: {
    color: "#CFD2E0",
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
  cardAccentBarDark: {
    backgroundColor: MAIN_PURPLE,
  },
  cardInner: {
    padding: 20,
  },
  cardDark: {
    backgroundColor: "#1E1E32",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
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
    marginBottom: 4,
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

  section: {
    marginBottom: 20,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
  },
  bioCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  beforeAfterCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
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
  testimonialCard: {
    marginBottom: 16,
  },
  testimonialCardLight: {
    backgroundColor: "#FFFFFF",
  },
  testimonialCardDark: {
    backgroundColor: "#34344a",
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  testimonialImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    borderWidth: 2,
    borderColor: "#EADBF7",
  },
  testimonialImageDark: {
    borderColor: "#3A2E5C",
  },
  testimonialImageRound: {
    borderRadius: 28,
  },
  testimonialNameWrap: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontFamily: AppFonts.headingSemiBold,
    color: WORKBOOK_TEXT,
  },
  testimonialNameDark: {
    color: "#F4F5F6",
  },
  testimonialRole: {
    fontSize: 13,
    color: "#5C6370",
    marginTop: 2,
    fontFamily: AppFonts.bodyRegular,
  },
  testimonialRoleDark: {
    color: "#BABECD",
  },
  testimonialQuote: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyRegular,
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
  disclaimerBodyText: {
    marginBottom: 0,
  },
});
