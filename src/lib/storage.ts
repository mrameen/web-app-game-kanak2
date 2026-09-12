import {
  STORAGE_KEY,
  DEFAULT_SETTINGS,
  createEmptyProgress,
  type StorageData,
  type Player,
  type PlayerProgress,
  type AppSettings,
  type AgeGroup,
} from "./types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function createDefaultData(): StorageData {
  return {
    players: [],
    activePlayerId: null,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadStorage(): StorageData {
  if (!isBrowser()) return createDefaultData();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();

    const parsed = JSON.parse(raw) as Partial<StorageData>;
    return {
      players: Array.isArray(parsed.players) ? parsed.players : [],
      activePlayerId: parsed.activePlayerId ?? null,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return createDefaultData();
  }
}

export function saveStorage(data: StorageData): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota / private mode errors — app stays usable in-memory.
  }
}

export function getPlayers(): Player[] {
  return loadStorage().players;
}

export function getActivePlayer(): Player | null {
  const data = loadStorage();
  if (!data.activePlayerId) return null;
  return data.players.find((p) => p.id === data.activePlayerId) ?? null;
}

export function setActivePlayer(playerId: string): Player | null {
  const data = loadStorage();
  const player = data.players.find((p) => p.id === playerId);
  if (!player) return null;
  data.activePlayerId = playerId;
  saveStorage(data);
  return player;
}

export function createPlayer(name: string, age: AgeGroup): Player {
  const data = loadStorage();
  const player: Player = {
    id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    age,
    progress: createEmptyProgress(),
    createdAt: new Date().toISOString(),
  };
  data.players.push(player);
  data.activePlayerId = player.id;
  saveStorage(data);
  return player;
}

export function findPlayerByName(name: string): Player | null {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  return (
    loadStorage().players.find((p) => p.name.trim().toLowerCase() === needle) ??
    null
  );
}

/** Public entry: resume same name on this device, or create new profile. */
export function resumeOrCreatePlayer(name: string, age: AgeGroup): Player {
  const existing = findPlayerByName(name);
  if (existing) {
    const data = loadStorage();
    const index = data.players.findIndex((p) => p.id === existing.id);
    if (index !== -1 && data.players[index].age !== age) {
      data.players[index] = { ...data.players[index], age };
    }
    data.activePlayerId = existing.id;
    saveStorage(data);
    return data.players.find((p) => p.id === existing.id) ?? existing;
  }
  return createPlayer(name, age);
}

export function clearActivePlayer(): void {
  const data = loadStorage();
  data.activePlayerId = null;
  saveStorage(data);
}

export function updatePlayerAge(playerId: string, age: AgeGroup): Player | null {
  const data = loadStorage();
  const index = data.players.findIndex((p) => p.id === playerId);
  if (index === -1) return null;
  data.players[index] = { ...data.players[index], age };
  saveStorage(data);
  return data.players[index];
}

export function updatePlayerProgress(
  playerId: string,
  progress: PlayerProgress,
): Player | null {
  const data = loadStorage();
  const index = data.players.findIndex((p) => p.id === playerId);
  if (index === -1) return null;
  data.players[index] = {
    ...data.players[index],
    progress: {
      ...progress,
      lastPlayedAt: new Date().toISOString(),
    },
  };
  saveStorage(data);
  return data.players[index];
}

export function resetPlayerProgress(playerId: string): Player | null {
  return updatePlayerProgress(playerId, createEmptyProgress());
}

export function getSettings(): AppSettings {
  return loadStorage().settings;
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const data = loadStorage();
  data.settings = { ...data.settings, ...partial };
  saveStorage(data);
  return data.settings;
}

export function deletePlayer(playerId: string): void {
  const data = loadStorage();
  data.players = data.players.filter((p) => p.id !== playerId);
  if (data.activePlayerId === playerId) {
    data.activePlayerId = null;
  }
  saveStorage(data);
}

export function deleteAllPlayers(): void {
  const data = loadStorage();
  data.players = [];
  data.activePlayerId = null;
  saveStorage(data);
}
