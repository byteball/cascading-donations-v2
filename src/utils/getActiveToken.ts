import appConfig from "@/appConfig";
import { getTokens, setTokens } from "@/cache/rateLimit";

const RESET_INTERVALS = {
  request: 1000 * 60 * 60, // 1 hour
  search: 1000 * 60,       // 1 minute
};

export async function getActiveToken(type: 'search' | 'request') {
  const tokens = getTokens();
  const now = Date.now();

  const activeToken = tokens.find((token, index) => {
    if (type === 'search') {
      if (token.search_limit > 0) {
        tokens[index].search_limit -= 1;
        return true;
      } else if ((token.search_limit_last_reset + 1000 * 60) < Date.now()) {
        tokens[index].search_limit = appConfig.SEARCH_RATE_LIMIT - 1;
        tokens[index].search_limit_last_reset = now;
        return true;
      }

    } else if (type === 'request') {

      if (token.limit > 0) {
        tokens[index].limit -= 1;
        return true;
      } else if ((token.limit_last_reset + 1000 * 60 * 60) < Date.now()) {
        tokens[index].limit = appConfig.REQUEST_RATE_LIMIT - 1;
        tokens[index].limit_last_reset = now;
        return true;
      }
    } else {
      return null;
    }
  });

  if (activeToken === undefined) {
    console.error('No active token found');
  }

  setTokens(tokens);

  return activeToken?.token;
}

export async function getActiveTokenOrWait(type: 'search' | 'request'): Promise<string> {
  const MAX_WAIT_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_WAIT_ATTEMPTS; attempt++) {
    const token = await getActiveToken(type);
    if (token) return token;

    // find the earliest token reset time
    const tokens = getTokens();
    const resetInterval = RESET_INTERVALS[type];
    const resetField = type === 'search' ? 'search_limit_last_reset' : 'limit_last_reset';

    let earliestReset = Infinity;
    for (const t of tokens) {
      const resetAt = t[resetField] + resetInterval;
      if (resetAt < earliestReset) {
        earliestReset = resetAt;
      }
    }

    const waitMs = Math.max(earliestReset - Date.now(), 1000);
    console.log(`getActiveTokenOrWait: all ${type} tokens exhausted, waiting ${Math.round(waitMs / 1000)}s for reset`);
    await new Promise((resolve) => setTimeout(resolve, waitMs + 500)); // +500ms buffer
  }

  throw new Error(`getActiveTokenOrWait: could not get a ${type} token after ${MAX_WAIT_ATTEMPTS} attempts`);
}