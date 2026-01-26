import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = parsed.body ?? req.body;
    req.params = parsed.params ?? req.params;
    req.query = parsed.query ?? req.query;

    return next();
  } catch (err) {
    // Zod validation error
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || []; // safe
      return res.status(400).json({
        error: "Validation failed",
        details: issues.map((e) => ({
          field: (e.path || []).join("."),
          message: e.message,
        })),
      });
    }

    // Not a Zod error -> real server bug
    return next(err);
  }
};
