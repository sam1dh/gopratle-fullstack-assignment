export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(fields: Record<string, string>) {
    super(400, "Please correct the highlighted fields.", "VALIDATION_ERROR", fields);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found.`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
