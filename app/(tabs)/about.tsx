import { MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ACCENT = "#5D9B8B";

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
    <View style={[styles.testimonialCard, isDark && styles.cardDark]}>
      <View style={styles.testimonialHeader}>
        <Image
          source={image}
          style={[
            styles.testimonialImage,
            imageRound && styles.testimonialImageRound,
          ]}
          resizeMode="cover"
        />
        <View style={styles.testimonialNameWrap}>
          <Text style={[styles.testimonialName, isDark && styles.textDark]}>
            {name}
          </Text>
          <Text style={[styles.testimonialRole, isDark && styles.subtextDark]}>
            {role}
          </Text>
        </View>
      </View>
      <Text style={[styles.testimonialQuote, isDark && styles.subtextDark]}>
        &ldquo;{quote}&rdquo;
      </Text>
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
      <View style={styles.heroSection}>
        <Image
          source={require("@/assets/images/about/declan.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={[styles.heroName, isDark && styles.textDark]}>
          Declan Treanor
        </Text>
        <Text style={[styles.heroTagline, isDark && styles.subtextDark]}>
          Train the Mind, Body and Soul
        </Text>
      </View>

      {/* Mission */}
      <View
        style={[styles.section, styles.missionCard, isDark && styles.cardDark]}
      >
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          My Mission
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          I want to help people get the best out of themselves.
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          This app is the culmination of my 10 years of experience in the field
          of psychology and performance, working with high performers and
          average Joes.
        </Text>
      </View>

      {/* Who Am I */}
      <View style={[styles.section, styles.bioCard, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          So who am I?
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          I am an enthusiast for the area of psychology and performance and
          recently completed a Sports Psychology diploma with distinction.
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          Residing in Brussels and am a REPs accredited (Register of Exercise
          Professionals), fully qualified Personal Trainer. This qualification
          includes a national certificate in Nutrition for Physical Activity.
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          Before these qualifications I obtained an MSc in Strategic Management
          and Planning and a BComm in Commerce International with French.
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          As a Gaelic Footballer I was part of the Dublin Senior Team{"'"}s O
          {"'"}Byrne Cup squad in 2012.
        </Text>
        <Image
          source={require("@/assets/images/about/dubs-team.jpg")}
          style={styles.teamPhoto}
          resizeMode="cover"
        />
        <Text style={[styles.photoCaption, isDark && styles.subtextDark]}>
          Back row 2nd from left — Photo kindly provided by Sportsfile
        </Text>
        <Text
          style={[
            styles.bodyText,
            { marginTop: 16 },
            isDark && styles.subtextDark,
          ]}
        >
          My Dad got me interested in the area of performance by passing me on a
          book called the Monk who sold his Ferrari. Now it{"'"}s my turn to
          pass something on to you!
        </Text>
        <Text style={[styles.bodyText, isDark && styles.subtextDark]}>
          Having suffered the debilitating effects of performance anxiety
          particularly in the field of sport I feel it important to share
          information that can help others through such issues.
        </Text>
        <Text style={[styles.closingText, { color: ACCENT }]}>
          Train your mind, body and soul!
        </Text>
      </View>

      {/* Testimonials */}
      <Text
        style={[styles.testimonialsSectionTitle, isDark && styles.textDark]}
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

      {/* Links */}
      <View style={[styles.linksCard, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Find Me Online
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.linkButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() =>
            Linking.openURL("https://performancetreanor.wordpress.com")
          }
        >
          <Text style={styles.linkButtonText}>Blog — Performance Treanor</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8ECF6",
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
  subtextDark: {
    color: "#9BA1A6",
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: ACCENT,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  heroTagline: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#8E8EA0",
  },

  section: {
    marginBottom: 20,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  bioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  cardDark: {
    backgroundColor: "#1E1E32",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#4A5568",
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 4,
    gap: 6,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A5568",
    paddingLeft: 4,
  },
  teamPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#E5E7EB",
  },
  photoCaption: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#8E8EA0",
    textAlign: "center",
    marginTop: 8,
  },
  closingText: {
    fontSize: 18,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
  },

  testimonialsSectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 16,
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
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
  },
  testimonialImageRound: {
    borderRadius: 28,
  },
  testimonialNameWrap: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
  },
  testimonialRole: {
    fontSize: 13,
    color: "#8E8EA0",
    marginTop: 2,
  },
  testimonialQuote: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    color: "#4A5568",
  },

  linksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  linkButton: {
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
