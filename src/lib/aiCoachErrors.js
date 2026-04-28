export function mapAICoachError(status, payload = {}) {
  if (status === 503) {
    return 'AI coaching service is temporarily unavailable. Please try again in a few minutes.';
  }

  if (status === 429) {
    return 'AI coaching rate limit exceeded. Please try again later.';
  }

  if (status === 401) {
    return 'Authentication failed. Please sign in again.';
  }

  return payload.error ?? `AI service error ${status}`;
}
