import appConfig from "@/appConfig";
import { getTokens, setTokens } from "@/cache/rateLimit";

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