import type { ReadableSignal } from "@amadeus-it-group/tansu";
import { derived } from "@amadeus-it-group/tansu";

export const resolveStorePromise = <T>(promiseStore$: ReadableSignal<Promise<T> | null | undefined>) =>
  derived(
    promiseStore$,
    (promise, set) => {
      set(null);
      if (!promise) {
        return;
      }
      let destroyed = false;
      promise.then((resolved) => {
        if (destroyed) return;
        set(resolved);
      });
      return () => {
        destroyed = true;
      };
    },
    null as null | T
  );

export const toBlobURL = (blob$: ReadableSignal<Blob | null>) =>
  derived(
    blob$,
    (value, set) => {
      if (!value) {
        set(null);
        return;
      }
      const url = URL.createObjectURL(value);
      set(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    },
    null as string | null
  );
