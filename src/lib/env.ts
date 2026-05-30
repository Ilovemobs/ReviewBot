// @ts-nocheck
/**
 * Validates that all required environment variables are set.
 * Throws an error if any are missing.
 */
export function validateEnv(): void {
  const requiredVars = [
    "SESSION_SECRET",
    "GITHUB_APP_ID",
    "GITHUB_APP_PRIVATE_KEY",
    "GITHUB_WEBHOOK_SECRET",
    "GROQ_API_KEY",
    "APP_URL",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Please check your .env file and ensure all variables from .env.example are set.`
    );
  }
}

/**
 * Gets an environment variable with optional default.
 * Validates it's set if no default is provided.
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  return value || defaultValue || "";
}
