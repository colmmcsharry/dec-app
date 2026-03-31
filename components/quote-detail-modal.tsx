import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import type { DailyQuote } from '@/data/quotes';

const ACCENT_GREEN = '#5D9B8B';
const CARD_BG = '#D4F1E8';

type QuoteDetailModalProps = {
  visible: boolean;
  quote: DailyQuote | null;
  onClose: () => void;
  isDark: boolean;
};

export function QuoteDetailModal({
  visible,
  quote,
  onClose,
  isDark,
}: QuoteDetailModalProps) {
  if (!quote) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.centered}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? '#1E2E2A' : CARD_BG },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={24} color={isDark ? '#ccc' : '#666'} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.cardInner}>
              <Text style={[styles.label, { color: ACCENT_GREEN }]}>
                Daily Diesel
              </Text>

              <Text
                style={[
                  styles.quoteIcon,
                  { color: isDark ? '#5D9B8B' : '#4A7D6F' },
                ]}
              >
                "
              </Text>

              <Text
                style={[
                  styles.quoteText,
                  { color: isDark ? '#ECEDEE' : '#2C3E50' },
                ]}
              >
                {quote.text}
              </Text>

              <Text
                style={[
                  styles.quoteAuthor,
                  { color: isDark ? '#9BA1A6' : '#8E8EA0' },
                ]}
              >
                — {quote.author}
              </Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  cardInner: {
    padding: 28,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quoteIcon: {
    fontSize: 60,
    lineHeight: 60,
    fontWeight: '700',
    marginBottom: -8,
  },
  quoteText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 20,
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
});
