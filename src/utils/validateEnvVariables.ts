export function validateEnvVariables() {
  const requiredVars = [
    "PAGE_SEMINUEVOS",
    "PAGE_SEMINUEVOS_LOGIN",
    "EMAIL_SEMINUEVOS",
    "PASSWORD_SEMINUEVOS",
    "DEFAULT_TIMEOUT",
    "NAVIGATION_TIMEOUT",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}
