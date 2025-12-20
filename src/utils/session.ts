export function getSessionId(): string {
  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }

  return sessionId;
}
