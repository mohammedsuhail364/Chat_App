import rateLimit from "express-rate-limit";

// LOGIN: brute-force protection
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { error: "Too many login attempts. Try again later." },
});

// SIGNUP: account spam protection
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: "Too many signup attempts. Try again later." },
});

// GENERAL API (safe, loose)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
});
