// ECZ Announced Figures Store — persisted in localStorage

export type ECZElectionType = 'presidential' | 'mp' | 'mayoral' | 'councillor';
export type ECZLevelType = 'ward' | 'constituency' | 'district' | 'province' | 'national';

export interface ECZCandidateFigure {
  candidateId: string;
  votes: number;
}

export interface ECZLevelData {
  levelType: ECZLevelType;
  levelId: string;
  electionType: ECZElectionType;
  figures: ECZCandidateFigure[];
  totalVotesCast: number;
  rejectedBallots: number;
  enteredBy: string;
  timestamp: string;
}

const storageKey = (levelType: ECZLevelType, levelId: string, electionType: ECZElectionType) =>
  `ecz-figures::${levelType}::${levelId}::${electionType}`;

export function getECZFigures(
  levelType: ECZLevelType,
  levelId: string,
  electionType: ECZElectionType
): ECZLevelData | null {
  try {
    const raw = localStorage.getItem(storageKey(levelType, levelId, electionType));
    return raw ? (JSON.parse(raw) as ECZLevelData) : null;
  } catch {
    return null;
  }
}

export function saveECZFigures(data: ECZLevelData): void {
  try {
    localStorage.setItem(
      storageKey(data.levelType, data.levelId, data.electionType),
      JSON.stringify(data)
    );
  } catch {
    // Storage may be full or unavailable
  }
}

export function deleteECZFigures(
  levelType: ECZLevelType,
  levelId: string,
  electionType: ECZElectionType
): void {
  localStorage.removeItem(storageKey(levelType, levelId, electionType));
}

// List all stored ECZ entries (for admin overview)
export function listAllECZFigures(): ECZLevelData[] {
  const results: ECZLevelData[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ecz-figures::')) {
        const raw = localStorage.getItem(key);
        if (raw) results.push(JSON.parse(raw) as ECZLevelData);
      }
    }
  } catch {
    // ignore
  }
  return results;
}
