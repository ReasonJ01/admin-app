export type GeneralSettings = {
    preBufferMinutes: number;
    postBufferMinutes: number;
    minBookingNotice: number;
    minBookingNoticeUnit: "minutes" | "hours" | "days" | "weeks" | "months";
    slotIntervalMinutes: number;
    bookingWindowDays: number;
    rollingBookingWindow: boolean;
}; 