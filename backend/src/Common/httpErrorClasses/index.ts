/**
 * Generic, cross-module HTTP error hierarchy. Every thrown instance carries the HTTP
 * status code it should be rendered with — ErrorHandler.commonErrorHandler() reads it.
 */
export class AppError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidCredentialsException extends AppError {
    constructor(message: string = 'Invalid credentials.') {
        super(401, message);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message: string = 'You are not authorized to perform this action.') {
        super(401, message);
    }
}

export class ForbiddenException extends AppError {
    constructor(message: string = 'Access to this resource is forbidden.') {
        super(403, message);
    }
}

export class TokenException extends AppError {
    constructor(message: string = 'Invalid or expired token.') {
        super(401, message);
    }
}

export class RecordNotFoundException extends AppError {
    constructor(message: string = 'Record not found.') {
        super(404, message);
    }
}

export class DuplicateRecordException extends AppError {
    constructor(message: string = 'A record with these details already exists.') {
        super(409, message);
    }
}

export class ValidationException extends AppError {
    public readonly errors?: object;

    constructor(message: string = 'Invalid request.', errors?: object) {
        super(422, message);
        this.errors = errors;
    }
}

export class BadRequestException extends AppError {
    constructor(message: string = 'Bad request.') {
        super(400, message);
    }
}
