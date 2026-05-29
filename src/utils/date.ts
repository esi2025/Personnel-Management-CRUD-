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
