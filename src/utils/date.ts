/**
 * Generates the current Solar Hijri (Shamsi/Jalali) date string in YYYY/MM/DD format
 * using standard Intl.DateTimeFormat with a fallback to a default date.
 */
export function getPersianDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const formatted = formatter.format(date); // e.g. "۱۴۰۲/۰۷/۱۵" or "1402/07/15" depending on platform

    // Map Persian numerals to standard Latin numerals
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let result = formatted;
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianDigits[i], 'g'), String(i));
    }
    
    // Clean all characters except digits and slashes
    result = result.replace(/[^\d/]/g, '');

    const parts = result.split('/');
    if (parts.length === 3) {
      let year = parts[0];
      let month = parts[1];
      let day = parts[2];
      
      // If the year is parsed at the end (due to formatting differences)
      if (year.length === 2 && day.length === 4) {
        const temp = year;
        year = day;
        day = temp;
      }
      
      // Pad single-digit month and day
      if (month.length === 1) month = `0${month}`;
      if (day.length === 1) day = `0${day}`;
      
      return `${year}/${month}/${day}`;
    }
    return result;
  } catch (e) {
    // Sensible fallback date in case Intl formatting fails
    return "1405/03/09";
  }
}

/**
 * Checks if a Shamsi date (YYYY/MM/DD) is older than 6 months from today.
 */
export function isServiceOverdue(lastServiced: string | undefined): boolean {
  if (!lastServiced) return false;
  
  // Ensure we clean any Persian numerals or non-standard characters from lastServiced
  let cleanLast = lastServiced;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  for (let i = 0; i < 10; i++) {
    cleanLast = cleanLast.replace(new RegExp(persianDigits[i], 'g'), String(i));
  }
  cleanLast = cleanLast.replace(/[^\d/]/g, '');

  const lastParts = cleanLast.split('/');
  if (lastParts.length !== 3) return false;

  const y1 = parseInt(lastParts[0], 10);
  const m1 = parseInt(lastParts[1], 10);
  const d1 = parseInt(lastParts[2], 10);

  if (isNaN(y1) || isNaN(m1) || isNaN(d1)) return false;

  // Get current Persian date string
  const todayStr = getPersianDateString();
  const todayParts = todayStr.split('/');
  if (todayParts.length !== 3) return false;

  const y2 = parseInt(todayParts[0], 10);
  const m2 = parseInt(todayParts[1], 10);
  const d2 = parseInt(todayParts[2], 10);

  if (isNaN(y2) || isNaN(m2) || isNaN(d2)) return false;

  const monthDiff = (y2 - y1) * 12 + (m2 - m1);
  if (monthDiff > 6) return true;
  if (monthDiff === 6 && d2 >= d1) return true;

  return false;
}

