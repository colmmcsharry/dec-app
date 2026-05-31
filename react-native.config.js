/** Android-only native PDF stack — exclude from iOS to avoid launch crashes in release builds. */
module.exports = {
  dependencies: {
    "react-native-pdf": {
      platforms: {
        ios: null,
        macos: null,
      },
    },
    "react-native-blob-util": {
      platforms: {
        ios: null,
        macos: null,
      },
    },
  },
};
