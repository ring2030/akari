export type ValidationErrorCode =
  | "MOOD_NOTE_TOO_LONG"
  | "MOOD_INVALID_VALUE"
  | "MOMENT_TEXT_TOO_LONG"
  | "MOMENT_TEXT_EMPTY"
  | "MOMENT_INVALID_TAG"
  | "MOMENT_INVALID_VISIBILITY";

export type ValidationError = {
  readonly code: ValidationErrorCode;
  readonly message: string;
};

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };

export function ok<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

export function fail<T>(
  errors: readonly ValidationError[],
): ValidationResult<T> {
  return { ok: false, errors };
}
