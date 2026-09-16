const enum HttpSuccessMessage {
    GET_ALL_RECORDS = 'Records retrieved successfully.',
    GET_RECORD = 'Record retrieved successfully.',
    RECORD_CREATED = 'Record created successfully.',
    RECORD_UPDATED = 'Record updated successfully.',
    RECORD_DELETED = 'Record deleted successfully.',
    LOGIN_SUCCESS = 'Logged in successfully.',
    LOGOUT_SUCCESS = 'Logged out successfully.',
    TOKEN_REFRESHED = 'Access token refreshed successfully.',
    OTP_SENT = 'OTP sent successfully.'
}

export default HttpSuccessMessage;
