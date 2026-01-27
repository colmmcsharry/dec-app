import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Heart, Sunrise, Zap, Apple, Dumbbell, Brain } from 'lucide-react-native';
import { router } from 'expo-router';

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
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.mainTitle}>Mind • Body • Soul</Text>
        <Text style={styles.subtitle}>Your holistic journey to peak performance</Text>
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
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8EA0',
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8EA0',
    lineHeight: 20,
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
