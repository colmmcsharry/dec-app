import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type OpenQuoteFromNotificationContextValue = {
  openQuoteOnNextFocus: boolean;
  setOpenQuoteOnNextFocus: (value: boolean) => void;
  consumeOpenQuote: () => boolean;
};

const OpenQuoteFromNotificationContext =
  createContext<OpenQuoteFromNotificationContextValue | null>(null);

export function OpenQuoteFromNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openQuoteOnNextFocus, setOpenQuoteOnNextFocus] = useState(false);

  const consumeOpenQuote = useCallback(() => {
    if (!openQuoteOnNextFocus) return false;
    setOpenQuoteOnNextFocus(false);
    return true;
  }, [openQuoteOnNextFocus]);

  const value = useMemo(
    () => ({
      openQuoteOnNextFocus,
      setOpenQuoteOnNextFocus,
      consumeOpenQuote,
    }),
    [openQuoteOnNextFocus, consumeOpenQuote],
  );

  return (
    <OpenQuoteFromNotificationContext.Provider value={value}>
      {children}
    </OpenQuoteFromNotificationContext.Provider>
  );
}

export function useOpenQuoteFromNotification(): OpenQuoteFromNotificationContextValue {
  const ctx = useContext(OpenQuoteFromNotificationContext);
  if (!ctx) {
    return {
      openQuoteOnNextFocus: false,
      setOpenQuoteOnNextFocus: () => {},
      consumeOpenQuote: () => false,
    };
  }
  return ctx;
}
