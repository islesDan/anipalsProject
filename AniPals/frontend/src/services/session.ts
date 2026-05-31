export type AuthSession = {
  email: string;
  playerKey: string;
  uid: string;
  tutorialCompleted: boolean;
};

const sessionKey = 'anipals.authSession';
const legacySessionKeys = [
  'anipals.playerKey',
  'anipals.playerUid',
  'anipals.playerName',
  'anipals.farmName',
  'anipals.tutorial.completedSteps',
  'anipals.friendMessages.v1',
];

export function getSession(): AuthSession | null {
  const stored = localStorage.getItem(sessionKey);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as AuthSession;
    return parsed?.playerKey ? parsed : null;
  } catch {
    return null;
  }
}

export function currentPlayerKey() {
  return getSession()?.playerKey ?? localStorage.getItem('anipals.playerKey') ?? 'demo-player';
}

export function setSession(next: AuthSession) {
  localStorage.setItem(sessionKey, JSON.stringify(next));
  localStorage.setItem('anipals.playerKey', next.playerKey);
  localStorage.setItem('anipals.playerUid', next.uid);
}

export function clearSession() {
  localStorage.removeItem(sessionKey);
  clearAccountScopedState();
}

export function markSessionTutorialComplete() {
  const session = getSession();
  if (!session) return;
  setSession({ ...session, tutorialCompleted: true });
}

export function clearAccountScopedState() {
  for (const key of legacySessionKeys) {
    localStorage.removeItem(key);
  }
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('anipals.friendMessages.')) {
      localStorage.removeItem(key);
    }
  }
}

export function prepareFreshAccountSession(next: AuthSession) {
  clearAccountScopedState();
  setSession(next);
}
