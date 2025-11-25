export const CALENDAR_TYPES = {
  TAX: 'tax',
  MEETING: 'meeting',
  DEADLINE: 'deadline',
  OTHER: 'other',
} as const;

export type CalendarType = typeof CALENDAR_TYPES[keyof typeof CALENDAR_TYPES];

export const CALENDAR_TYPE_LABELS: Record<CalendarType, string> = {
  [CALENDAR_TYPES.TAX]: 'Tax',
  [CALENDAR_TYPES.MEETING]: 'Meeting',
  [CALENDAR_TYPES.DEADLINE]: 'Deadline',
  [CALENDAR_TYPES.OTHER]: 'Other',
};

