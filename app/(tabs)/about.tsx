import { DevResetButton } from "@/components/dev-reset-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Matches digital workbook body copy (`app/module-workbook/[slug].tsx`). */
const WORKBOOK_TEXT = "#1E2430";
const WORKBOOK_TEXT_BODY = "#363C48";

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
        isDark && styles.cardDark,
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
            <Text style={[styles.testimonialName, isDark && styles.textDark]}>
              {name}
            </Text>
            <Text
              style={[styles.testimonialRole, isDark && styles.metaTextDark]}
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

export default function AboutScreen() {
  const { isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
    >
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
              Train the Mind, Body and Soul
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
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            My Mission
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            I want to help people get the best out of themselves.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            This app is the culmination of my 10 years of experience in the field
            of psychology and performance, working with high performers and
            average Joes and Janes.
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
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            So who am I?
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            I am an enthusiast for the area of psychology and performance and
            have completed a Sports Psychology diploma with distinction.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            Residing in Dublin, Ireland, I am happily married, a father and and a REPs accredited (Register of Exercise
            Professionals), fully qualified Personal Trainer. This qualification
            includes a national certificate in Nutrition for Physical Activity.
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            Before these qualifications I obtained an MSc in Strategic Management
            and Planning and a BComm in Commerce International with French.
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
            My Dad got me interested in the area of performance by passing me on a
            book called the Monk who sold his Ferrari. Now it{"'"}s my turn to
            pass something on to you!
          </Text>
          <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>
            Having suffered the debilitating effects of performance anxiety
            particularly in the field of sport I feel it important to share
            information that can help others through such issues.
          </Text>
          <Text
            style={[
              styles.closingText,
              isDark && styles.closingTextDark,
            ]}
          >
            Train your mind, body and soul!
          </Text>
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
        style={[styles.testimonialsSectionTitle, isDark && styles.sectionTitleDark]}
      >
        What People Say
      </Text>

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
    paddingTop: 60,
    paddingBottom: 40,
  },
  textDark: {
    color: "#ECEDEE",
  },
  sectionTitleDark: {
    color: "#ECEDEE",
  },
  bodyTextDark: {
    color: "#D8DBE8",
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
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: WORKBOOK_TEXT_BODY,
    marginBottom: 12,
    fontFamily: AppFonts.bodyRegular,
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
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
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
  testimonialRole: {
    fontSize: 13,
    color: "#5C6370",
    marginTop: 2,
    fontFamily: AppFonts.bodyRegular,
  },
  testimonialQuote: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyRegular,
  },
});
