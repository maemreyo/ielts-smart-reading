import { useLocalStorage } from "@/hooks/use-local-storage";
import { useCallback } from "react";

type GuessStore = {
  [key: string]: string;
};

export function useGuessStore() {
  const [guesses, setGuesses] = useLocalStorage<GuessStore>("user-guesses", {});

  const getGuess = useCallback(
    (itemId: number | string) => {
      return guesses[itemId] || "";
    },
    [guesses]
  );

  const setGuess = useCallback(
    (itemId: number | string, guess: string) => {
      setGuesses({ ...guesses, [itemId]: guess });
    },
    [guesses, setGuesses]
  );

  return { getGuess, setGuess };
}
