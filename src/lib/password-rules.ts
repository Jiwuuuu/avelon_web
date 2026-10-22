// Mirrors the backend's newPassword schema in auth.routes.ts
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

/** The rules a password still breaks, as one sentence, or null when it passes. */
export function passwordProblem(value: string): string | null {
  const failed = PASSWORD_RULES.filter((r) => !r.test(value))
  return failed.length ? `Password must have: ${failed.map((r) => r.label.toLowerCase()).join(", ")}` : null
}
