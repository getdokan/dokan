// One opening/closing range: canonical `g:i a`, the FULL_DAY sentinel (opening only), or ''.
export type TimeSlot = {
    opening_time: string;
    closing_time: string;
};

export type WeeklyDay = {
    status: boolean;
    slots: TimeSlot[];
};

// Keyed by day (monday…sunday). Render order comes from `days`, not this map.
export type WeeklyValue = Record< string, WeeklyDay >;

export type SlotError = {
    // Red-border the opening picker.
    opening?: boolean;
    // Red-border the closing picker.
    closing?: boolean;
    // Translated, day-labeled message rendered under the day row.
    message: string;
};

export type WeeklyErrors = Record< string, Record< number, SlotError > >;

export type WeeklyValidator = (
    value: WeeklyValue,
    dayLabels: Record< string, string >
) => WeeklyErrors;

// Message-only overrides — keep the default logic, swap the strings.
export type WeeklyMessages = {
    required?: ( dayLabel: string ) => string;
    order?: ( dayLabel: string ) => string;
    overlap?: ( dayLabel: string ) => string;
};

export type WeeklyTimeSlotsProps = {
    // Controlled value — the parent owns state.
    value: WeeklyValue;
    // Translated day labels; KEY ORDER IS RENDER ORDER (honours start_of_week).
    days: Record< string, string >;
    // false (default): one range per day. true: N ranges with add/remove.
    multiple?: boolean;
    // true (default): switch + pickers right-aligned (admin). false: grouped left by the day name (vendor).
    spread?: boolean;
    // Display-only; storage is always canonical `g:i a`.
    is12Hour?: boolean;
    // Offer the "Full Day" preset in opening dropdowns. Default true.
    allowFullDay?: boolean;
    // Preset increment in minutes. Default 30 (legacy jQuery-timepicker step).
    step?: number;
    openingPlaceholder?: string;
    closingPlaceholder?: string;
    // Full logic override; a mode-appropriate default is used when omitted.
    validate?: WeeklyValidator;
    // Message-only override for the default validators.
    messages?: WeeklyMessages;
    // Validate on mount so pre-existing bad data shows immediately (vendor gates save on it).
    // Default false = admin: errors appear after interaction.
    validateOnMount?: boolean;
    // Slot used when enabling a day / adding a range.
    seedSlot?: () => TimeSlot;
    // Emits the next value AND its error map on every change. Admin ignores the errors
    // (server validation_func gates); the vendor consumer gates Save on hasWeeklyErrors().
    onChange: ( value: WeeklyValue, errors: WeeklyErrors ) => void;
};
