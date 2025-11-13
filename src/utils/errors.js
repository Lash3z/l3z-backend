export class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function isHttpError(error) {
  return error instanceof HttpError || (typeof error?.status === 'number' && error?.message);
}
