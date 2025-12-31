// Date Utility Functions

/**
 * Get today's date in Persian format
 */
export function getTodayPersianDate(): string {
  const today = new Date()
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    calendar: "persian",
  }).format(today)
}

/**
 * Get current month and year in Persian format
 */
export function getCurrentMonthYear(): { month: string; year: string } {
  const today = new Date()
  const persianDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    calendar: "persian",
  }).format(today)

  const [year, month] = persianDate.split("/")
  return { year, month }
}

/**
 * Format number in Persian format
 */
export function formatPersianNumber(num: number): string {
  return num.toLocaleString("fa-IR")
}

