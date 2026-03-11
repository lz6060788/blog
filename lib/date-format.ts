const FIXED_TIME_ZONE = 'Asia/Shanghai'
const FIXED_LOCALE = 'en-US'

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

export function formatDateShort(value: string | Date): string {
  return new Intl.DateTimeFormat(FIXED_LOCALE, {
    timeZone: FIXED_TIME_ZONE,
    month: 'short',
    day: 'numeric',
  }).format(toDate(value))
}

export function formatDateLong(value: string | Date): string {
  return new Intl.DateTimeFormat(FIXED_LOCALE, {
    timeZone: FIXED_TIME_ZONE,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(toDate(value))
}
