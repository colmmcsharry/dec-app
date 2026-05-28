type NativePdfViewProps = {
  uri: string;
  isDark: boolean;
  onError: (message: string) => void;
  onLoadComplete: () => void;
};

/** Web/iOS stub — native PDF rendering is Android-only. */
export function NativePdfView(_props: NativePdfViewProps) {
  return null;
}

export type { NativePdfViewProps };
