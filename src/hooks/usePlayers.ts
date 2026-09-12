"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  getActivePlayer,
  setActivePlayer as persistActivePlayer,
  createPlayer as persistCreatePlayer,
  updatePlayerProgress,
  resetPlayerProgress,
  updateSettings,
} from "@/lib/storage";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type AgeGroup,
  type AppSettings,
  type Player,
  type PlayerProgress,
  type StorageData,
} from "@/lib/types";

const EMPTY: StorageData = {
  players: [],
  activePlayerId: null,
  settings: { ...DEFAULT_SETTINGS },
};

const listeners = new Set<() => void>();

/** Cached snapshot — must return same reference if data unchanged. */
let cachedKey: string | null = null;
let cachedSnapshot: StorageData = EMPTY;

function readSnapshot(): StorageData {
  if (typeof window === "undefined") return EMPTY;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const key = raw ?? "__empty__";

  if (key === cachedKey) {
    return cachedSnapshot;
  }

  cachedKey = key;

  if (!raw) {
    cachedSnapshot = EMPTY;
    return cachedSnapshot;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StorageData>;
    cachedSnapshot = {
      players: Array.isArray(parsed.players) ? parsed.players : [],
      activePlayerId: parsed.activePlayerId ?? null,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    cachedSnapshot = EMPTY;
  }

  return cachedSnapshot;
}

function invalidateSnapshotCache() {
  cachedKey = null;
}

function emitChange() {
  invalidateSnapshotCache();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      invalidateSnapshotCache();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): StorageData {
  return readSnapshot();
}

function getServerSnapshot(): StorageData {
  return EMPTY;
}

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function usePlayers() {
  const hydrated = useHydrated();
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const activePlayer = useMemo(
    () => data.players.find((p) => p.id === data.activePlayerId) ?? null,
    [data.players, data.activePlayerId],
  );

  const selectPlayer = useCallback((id: string) => {
    persistActivePlayer(id);
    emitChange();
  }, []);

  const addPlayer = useCallback((name: string, age: AgeGroup) => {
    const player = persistCreatePlayer(name, age);
    emitChange();
    return player;
  }, []);

  const saveProgress = useCallback((progress: PlayerProgress) => {
    const current = getActivePlayer();
    if (!current) return null;
    const updated = updatePlayerProgress(current.id, progress);
    emitChange();
    return updated;
  }, []);

  const resetProgress = useCallback(() => {
    const current = getActivePlayer();
    if (!current) return null;
    const updated = resetPlayerProgress(current.id);
    emitChange();
    return updated;
  }, []);

  const saveSettings = useCallback((partial: Partial<AppSettings>) => {
    const next = updateSettings(partial);
    emitChange();
    return next;
  }, []);

  return {
    hydrated,
    players: data.players as Player[],
    activePlayer,
    settings: data.settings,
    selectPlayer,
    addPlayer,
    saveProgress,
    resetProgress,
    saveSettings,
    refresh: emitChange,
  };
}
