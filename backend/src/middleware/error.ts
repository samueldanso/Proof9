import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

export const errorHandler = (err: Error | HTTPException, c: Context) => {
  // Handle HTTP exceptions (like 404, 401, etc.)
  if (err instanceof HTTPException) {
    console.error(`HTTP Error ${err.status}:`, err.message)
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    )
  }

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    console.error("Validation Error:", err.errors)
    return c.json(
      {
        success: false,
        error: "Validation failed",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      400,
    )
  }

  // Handle unknown errors
  console.error("Unhandled Error:", err)
  return c.json(
    {
      success: false,
      error: "Internal server error",
    },
    500,
  )
}
