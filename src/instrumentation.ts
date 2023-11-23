"server strict";

export function register() {
  // check all ENV variables

  if (!process.env.GITHUB_APP_KEYS) {
    throw new Error("GITHUB_APP_KEYS is not set");
  }

  if (!process.env.MAILERLITE_API_KEY) {
    throw new Error("MAILERLITE_API_KEY is not set");
  }

  if (!process.env.NEXT_PUBLIC_HUB_ADDRESS) {
    throw new Error("NEXT_PUBLIC_HUB_ADDRESS is not set");
  }

  if (!process.env.NEXT_PUBLIC_ICON_CDN_URL) {
    throw new Error("NEXT_PUBLIC_ICON_CDN_URL is not set");
  }

  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not set");
  }
  
  if (!process.env.NEXT_PUBLIC_AA_ADDRESS) {
    throw new Error("NEXT_PUBLIC_AA_ADDRESS is not set");
  }

  if (!process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not set");
  }

  if (!process.env.NEXT_PUBLIC_ATTESTOR_AA) {
    throw new Error("NEXT_PUBLIC_ATTESTOR_AA is not set");
  }

  if (!process.env.NEXT_PUBLIC_ATTESTOR) {
    throw new Error("NEXT_PUBLIC_ATTESTOR is not set");
  }

  if (!process.env.NEXT_PUBLIC_PAIRING_URL) {
    throw new Error("NEXT_PUBLIC_PAIRING_URL is not set");
  }

  console.log("env was configured");
}

