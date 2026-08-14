import PhonemeKey from "./PhonemeKey";
import { CONSONANT_GROUPS, VOWEL_GROUPS } from "@/lib/phonemes";
import type { PhonemeStatus } from "@/lib/wordle";

const ROWS = [...Object.values(CONSONANT_GROUPS), ...Object.values(VOWEL_GROUPS)];

export default function PhonemeKeyboard({
  keyStatuses,
  onPress,
}: {
  keyStatuses: Record<string, PhonemeStatus>;
  onPress: (symbol: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex flex-wrap justify-center gap-1.5">
          {row.map((symbol) => (
            <PhonemeKey
              key={symbol}
              symbol={symbol}
              status={keyStatuses[symbol]}
              onPress={onPress}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
