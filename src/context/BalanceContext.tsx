"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BalanceContextType = {
  initialBalance: number | null;
  setInitialBalance: (balance: number) => void;
  resetInitialBalance: () => void;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [initialBalance, setInitialBalance] = useState<number | null>(null);

  const resetInitialBalance = () => {
    setInitialBalance(null);
  };

  return (
    <BalanceContext.Provider value={{ initialBalance, setInitialBalance, resetInitialBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
} 