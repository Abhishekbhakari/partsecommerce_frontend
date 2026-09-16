const enum HttpErrorMessage {
    RECORD_NOT_FOUND = 'Record not found.',
    INVALID_CREDENTIALS = 'Invalid credentials.',
    UNAUTHORIZED = 'You are not authorized to perform this action.',
    INVALID_TOKEN = 'Invalid or expired token.',
    VALIDATION_FAILED = 'Invalid request.',
    DUPLICATE_RECORD = 'A record with these details already exists.',
    INTERNAL_SERVER_ERROR = 'Internal server error.'
}

export default HttpErrorMessage;
