import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Heart, Sunrise, Zap, Apple, Dumbbell, Brain, Sun, Moon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/theme-context';

interface CategoryCardProps {
  title: string;
  videoCount: number;
  guideCount: number;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  slug: string;
}

const CategoryCard = ({ 
  title, 
  videoCount, 
  guideCount, 
  icon, 
  backgroundColor, 
  textColor,
  slug 
}: CategoryCardProps) => {
  const handlePress = () => {
    router.push({
      pathname: '/category/[slug]',
      params: { slug, title },
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor }]} 
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: textColor, opacity: 0.7 }]}>
        {videoCount} videos • {guideCount} guides
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();

  const categories = [
    {
      title: 'Sleep',
      slug: 'sleep',
      videoCount: 15,
      guideCount: 8,
      icon: <Heart size={28} color="#8B7AB8" strokeWidth={2.5} />,
      backgroundColor: '#E5D9F2',
      textColor: '#6B5B8C',
    },
    {
      title: 'Morning\nRoutines',
      slug: 'morning-routines',
      videoCount: 20,
      guideCount: 12,
      icon: <Sunrise size={28} color="#D4A574" strokeWidth={2.5} />,
      backgroundColor: '#FFF3DC',
      textColor: '#B8884D',
    },
    {
      title: 'Energy\nManagement',
      slug: 'energy-management',
      videoCount: 18,
      guideCount: 10,
      icon: <Zap size={28} color="#5D9B8B" strokeWidth={2.5} />,
      backgroundColor: '#D4F1E8',
      textColor: '#4A7D6F',
    },
    {
      title: 'Fuel 2 Perform',
      slug: 'fuel-2-perform',
      videoCount: 22,
      guideCount: 15,
      icon: <Apple size={28} color="#D97B7B" strokeWidth={2.5} />,
      backgroundColor: '#FFDDD9',
      textColor: '#B85D5D',
    },
    {
      title: 'Move 2\nPerform',
      slug: 'move-2-perform',
      videoCount: 25,
      guideCount: 14,
      icon: <Dumbbell size={28} color="#6B9BD1" strokeWidth={2.5} />,
      backgroundColor: '#D9E9F7',
      textColor: '#5278A8',
    },
    {
      title: 'Thinking 2\nPerform',
      slug: 'thinking-2-perform',
      videoCount: 16,
      guideCount: 11,
      icon: <Brain size={28} color="#C97BA8" strokeWidth={2.5} />,
      backgroundColor: '#F7DBF0',
      textColor: '#A35D85',
    },
    {
      title: 'Recovery',
      slug: 'recovery',
      videoCount: 12,
      guideCount: 9,
      icon: <Heart size={28} color="#7BA8C9" strokeWidth={2.5} />,
      backgroundColor: '#DBE9F7',
      textColor: '#5278A8',
    },
    {
      title: 'Mindfulness',
      slug: 'mindfulness',
      videoCount: 14,
      guideCount: 10,
      icon: <Brain size={28} color="#A87BC9" strokeWidth={2.5} />,
      backgroundColor: '#EADBF7',
      textColor: '#7B5299',
    },
    {
      title: 'Stress\nManagement',
      slug: 'stress-management',
      videoCount: 18,
      guideCount: 12,
      icon: <Zap size={28} color="#C9A87B" strokeWidth={2.5} />,
      backgroundColor: '#F7EADB',
      textColor: '#997D5C',
    },
    {
      title: 'Building\nHabits',
      slug: 'habits',
      videoCount: 20,
      guideCount: 13,
      icon: <Sunrise size={28} color="#7BC9A8" strokeWidth={2.5} />,
      backgroundColor: '#DBF7EA',
      textColor: '#52997D',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.welcomeText, isDark && styles.welcomeTextDark]}>Welcome Back</Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeToggle, isDark && styles.themeToggleDark]}
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun size={20} color="#FDB813" strokeWidth={2.5} />
            ) : (
              <Moon size={20} color="#6B5B8C" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.mainTitle, isDark && styles.mainTitleDark]}>Mind • Body • Soul</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Your holistic journey to peak performance</Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <CategoryCard key={index} {...category} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121222',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8EA0',
  },
  welcomeTextDark: {
    color: '#9090A8',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  mainTitleDark: {
    color: '#ECEDEE',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8EA0',
    lineHeight: 20,
  },
  subtitleDark: {
    color: '#9090A8',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0ECF7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggleDark: {
    backgroundColor: '#2A2A3E',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: '47%',
    aspectRatio: 0.85,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 16,
  },
});
