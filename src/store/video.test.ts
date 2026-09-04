import { createStore } from "jotai";
import { expect, test, vi } from "vitest";

import {
  currentTimeAtom,
  durationAtom,
  isEndedAtom,
  isPlayingAtom,
  videoUrlAtom,
} from "./video";

test("only notifies ended subscribers when ended state changes", () => {
  const store = createStore();
  store.set(videoUrlAtom, "blob:video");
  store.set(durationAtom, 100);
  store.set(isPlayingAtom, true);

  const onEndedChange = vi.fn();
  const unsubscribe = store.sub(isEndedAtom, onEndedChange);

  store.set(currentTimeAtom, 1);
  store.set(currentTimeAtom, 50);
  store.set(currentTimeAtom, 99.9);

  expect(onEndedChange).not.toHaveBeenCalled();

  store.set(isPlayingAtom, false);

  expect(store.get(isEndedAtom)).toBe(true);
  expect(onEndedChange).toHaveBeenCalledOnce();

  store.set(currentTimeAtom, 100);

  expect(onEndedChange).toHaveBeenCalledOnce();
  unsubscribe();
});
