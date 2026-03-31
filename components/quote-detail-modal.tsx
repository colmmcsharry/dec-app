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
import { Quote, X } from 'lucide-react-native';
import { AppFonts } from '@/constants/theme';
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
              activeOpacity={0.6}
            >
              <X size={24} color={isDark ? '#ccc' : '#666'} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.cardInner}>
              <Text style={[styles.label, { color: ACCENT_GREEN }]}>
                Daily Diesel
              </Text>

              <View style={[styles.quoteIconRow, { alignSelf: 'flex-start' }]}>
                <View style={{ transform: [{ scaleX: -1 }] }}>
                  <Quote
                    size={24}
                    color={isDark ? '#5D9B8B' : '#4A7D6F'}
                    strokeWidth={2.5}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.quoteText,
                  { color: isDark ? '#ECEDEE' : '#2C3E50' },
                ]}
              >
                {quote.text}
              </Text>

              <View style={[styles.quoteIconRow, { alignSelf: 'flex-end' }]}>
                <Quote
                  size={24}
                  color={isDark ? '#5D9B8B' : '#4A7D6F'}
                  strokeWidth={2.5}
                />
              </View>

              <Text
                style={[
                  styles.quoteAuthor,
                  { color: isDark ? '#9BA1A6' : '#8E8EA0' },
                ]}
              >
                — {quote.author}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.bottomCloseButton,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={onClose}
              >
                <Text style={styles.bottomCloseButtonText}>Close</Text>
              </Pressable>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInner: {
    padding: 28,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: AppFonts.headingBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quoteIconRow: {
    marginVertical: 22,
    opacity: 0.8,
  },
  quoteText: {
    fontSize: 22,
    fontFamily: AppFonts.headingSemiBold,
    lineHeight: 32,
    marginBottom: 20,
  },
  quoteAuthor: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    textAlign: 'right',
  },
  bottomCloseButton: {
    marginTop: 24,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bottomCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
  },
});
