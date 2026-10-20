export const DEMO_PASSWORD = "Password@123";

export const DEMO_ACCOUNTS = {
  citizen: {
    email: "citizen@yahoo.com",
    password: DEMO_PASSWORD,
  },
  admin: {
    email: "admin@mucitizen.go.ke",
    password: DEMO_PASSWORD,
  },
  officer: {
    email: "officer@mucitizen.go.ke",
    password: DEMO_PASSWORD,
  },
} as const;
