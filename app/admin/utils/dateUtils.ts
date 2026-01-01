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
 * Returns in Western digits format for database compatibility
 */
export function getCurrentMonthYear(): { month: string; year: string } {
  const today = new Date()
  const persianDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    calendar: "persian",
  }).format(today)

  // Convert Persian digits to Western digits
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  const westernDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
  
  let westernDate = persianDate
  for (let i = 0; i < 10; i++) {
    westernDate = westernDate.replace(new RegExp(persianDigits[i], "g"), westernDigits[i])
  }

  const [year, month] = westernDate.split("/")
  return { year, month }
}

/**
 * Format number in Persian format
 */
export function formatPersianNumber(num: number): string {
  return num.toLocaleString("fa-IR")
}

/**
 * Convert Persian/Arabic digits to Western digits
 * Exported for use in other modules
 */
export function convertToWesternDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  const westernDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
  
  let result = str
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), westernDigits[i])
    result = result.replace(new RegExp(arabicDigits[i], "g"), westernDigits[i])
  }
  return result
}

/**
 * Calculate number of days between two Persian dates
 * Returns the actual number of days including both start and end dates
 */
export function calculateDaysBetweenPersianDates(startDate: string, endDate: string): number {
  // If dates are the same, return 1
  if (startDate === endDate) {
    return 1
  }

  try {
    // Convert Persian/Arabic digits to Western digits
    const startDateWestern = convertToWesternDigits(startDate)
    const endDateWestern = convertToWesternDigits(endDate)
    
    // Parse dates with validation
    const startParts = startDateWestern.split("/")
    const endParts = endDateWestern.split("/")
    
    if (startParts.length !== 3 || endParts.length !== 3) {
      console.warn("[calculateDaysBetweenPersianDates] Invalid date format:", { startDate, endDate })
      return 1
    }
    
    const startYear = Number.parseInt(startParts[0], 10)
    const startMonth = Number.parseInt(startParts[1], 10)
    const startDay = Number.parseInt(startParts[2], 10)
    
    const endYear = Number.parseInt(endParts[0], 10)
    const endMonth = Number.parseInt(endParts[1], 10)
    const endDay = Number.parseInt(endParts[2], 10)
    
    // Validate parsed numbers
    if (
      Number.isNaN(startYear) || Number.isNaN(startMonth) || Number.isNaN(startDay) ||
      Number.isNaN(endYear) || Number.isNaN(endMonth) || Number.isNaN(endDay) ||
      startYear < 1300 || startYear > 1500 ||
      endYear < 1300 || endYear > 1500 ||
      startMonth < 1 || startMonth > 12 ||
      endMonth < 1 || endMonth > 12 ||
      startDay < 1 || startDay > 31 ||
      endDay < 1 || endDay > 31
    ) {
      console.warn("[calculateDaysBetweenPersianDates] Invalid date values:", {
        startYear, startMonth, startDay,
        endYear, endMonth, endDay
      })
      return 1
    }
    
    // Same date check
    if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
      return 1
    }
    
    // Simple calculation for same month
    if (startYear === endYear && startMonth === endMonth) {
      const diff = Math.abs(endDay - startDay) + 1
      return diff > 0 ? diff : 1
    }
    
    // Convert to Gregorian for accurate calculation
    // Persian year offset: approximately 621-622 years
    const persianToGregorian = (py: number, pm: number, pd: number): Date | null => {
      try {
        // Persian year 1400 ≈ Gregorian 2021-2022
        const gregorianYear = py + 621
        // Validate month (0-11 in JavaScript Date)
        if (pm < 1 || pm > 12) return null
        // Validate day
        if (pd < 1 || pd > 31) return null
        
        const date = new Date(gregorianYear, pm - 1, pd)
        // Check if date is valid
        if (Number.isNaN(date.getTime())) return null
        return date
      } catch (err) {
        return null
      }
    }
    
    const startGregorian = persianToGregorian(startYear, startMonth, startDay)
    const endGregorian = persianToGregorian(endYear, endMonth, endDay)
    
    if (startGregorian && endGregorian) {
      // Calculate difference in milliseconds
      const diffTime = Math.abs(endGregorian.getTime() - startGregorian.getTime())
      // Convert to days and add 1 to include both start and end dates
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      if (!Number.isNaN(diffDays) && diffDays > 0) {
        return diffDays
      }
    }
    
    // Fallback: manual calculation for Persian calendar
    if (startYear === endYear) {
      // Same year
      if (startMonth === endMonth) {
        // Same month
        return Math.abs(endDay - startDay) + 1
      } else {
        // Different months in same year
        // Persian calendar: months 1-6 have 31 days, 7-11 have 30 days, 12 has 29/30
        const daysInMonth = (month: number): number => {
          if (month <= 6) return 31
          if (month <= 11) return 30
          return 29 // Month 12, approximate
        }
        
        let totalDays = 0
        // Days remaining in start month
        totalDays += daysInMonth(startMonth) - startDay + 1
        // Days in months between
        for (let m = startMonth + 1; m < endMonth; m++) {
          totalDays += daysInMonth(m)
        }
        // Days in end month
        totalDays += endDay
        
        return totalDays > 0 ? totalDays : 1
      }
    } else {
      // Different years - use approximation
      const yearDiff = Math.abs(endYear - startYear)
      const monthDiff = Math.abs(endMonth - startMonth)
      const dayDiff = Math.abs(endDay - startDay)
      
      // Approximate: 365 days per year, 30 days per month
      const approximateDays = (yearDiff * 365) + (monthDiff * 30) + dayDiff + 1
      return approximateDays > 0 ? approximateDays : 1
    }
  } catch (error) {
    console.error("[calculateDaysBetweenPersianDates] Error:", error, { startDate, endDate })
    // Ultimate fallback
    return 1
  }
}
