import { useEffect, useState } from "react";
import {
  applyAppearance,
  readAppearance,
  subscribeAppearance,
  writeAppearance,
  type Appearance,
  DEFAULT_APPEARANCE,
} from "@/lib/appearance";

export function useAppearance() {
  const [appearance, setState] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const initial = readAppearance();
    setState(initial);
    applyAppearance(initial);
    return subscribeAppearance(setState);
  }, []);

  const update = (patch: Partial<Appearance>) => {
    const next = { ...readAppearance(), ...patch };
    writeAppearance(next);
    setState(next);
  };

  const reset = () => {
    writeAppearance(DEFAULT_APPEARANCE);
    setState(DEFAULT_APPEARANCE);
  };

  return { appearance, update, reset };
}
