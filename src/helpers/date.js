import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

/**
 * Proširuje dayjs sa ISO week pluginom.
 *
 * ISO-8601 standard definiše:
 * - Nedelja počinje u ponedeljak (1)
 * - Nedelja se završava u nedelju (7)
 * - Prva nedelja u godini je ona koja sadrži 4. januar
 *
 * Nakon poziva dayjs.extend(isoWeek), dostupne su sledeće metode:
 *
 * @example
 * dayjs().isoWeek()        // broj nedelje u godini (1–53)
 * dayjs().isoWeek(10)      // postavlja nedelju u godini
 *
 * @example
 * dayjs().isoWeekday()     // dan u nedelji (1 = ponedeljak, 7 = nedelja)
 * dayjs().isoWeekday(1)    // postavlja na ponedeljak
 *
 * @example
 * dayjs().isoWeekYear()    // ISO godina (može se razlikovati od kalendarske)
 */
dayjs.extend(isoWeek);

/**
 * Ekspostuje prethodno konfigurisan dayjs instance.
 *
 * Ovo omogućava da se kroz ceo projekat koristi jedinstvena
 * konfiguracija (pluginovi, locale, itd.), bez potrebe da se
 * dayjs ponovo podešava u svakom fajlu.
 *
 * @example
 * import { dayjs } from '@/utils/date';
 *
 * const now = dayjs();
 * const week = now.isoWeek();
 */
export { dayjs }

/**
 * Normalizuje ulaz u JavaScript Date objekat (ili null).
 *
 * Podržani ulazi:
 * - Date
 * - SQL date:        "YYYY-MM-DD"
 * - SQL datetime:    "YYYY-MM-DD HH:mm:ss"
 * - ISO string
 * - timestamp (ms)
 * - Dayjs / Moment alternativa (obj.toDate())
 * - Luxon DateTime (obj.toJSDate())
 */
export function toJSDate(input) {
    if (input == null || input === '') return null;

    // 1) Već je Date
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
    }

    // 2) Timestamp (ms)
    if (typeof input === 'number') {
        const d = new Date(input);
        return isNaN(d.getTime()) ? null : d;
    }

    // 3) Dayjs / moment-alike
    if (typeof input === 'object' && typeof input.toDate === 'function') {
        const d = input.toDate();
        return d instanceof Date && !isNaN(d.getTime()) ? d : null;
    }

    // 4) Luxon DateTime
    if (typeof input === 'object' && typeof input.toJSDate === 'function') {
        const d = input.toJSDate();
        return d instanceof Date && !isNaN(d.getTime()) ? d : null;
    }

    // 5) String parsing
    if (typeof input === 'string') {
        const s = input.trim();

        // YYYY-MM-DD
        let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            const d = new Date(+m[1], +m[2] - 1, +m[3]);
            return isNaN(d.getTime()) ? null : d;
        }

        // YYYY-MM-DD HH:mm:ss (sekunde opcione)
        m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (m) {
            const d = new Date(
                +m[1],
                +m[2] - 1,
                +m[3],
                +m[4],
                +m[5],
                +(m[6] || 0)
            );
            return isNaN(d.getTime()) ? null : d;
        }

        // ISO ili browser-parsable string
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }

  return null;
}

/**
 * Pretvara Date u SQL format "YYYY-MM-DD".
 * Ako nije validan Date → vraća null.
 */
export function toSqlDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}


/**
 * Formatira datum u SQL date format: YYYY-MM-DD
 *
 * Prihvata bilo koji validan datum koji Day.js može da parsira, uključujući:
 * - Date objekt
 * - ISO string
 * - MySQL date/datetime string
 * - timestamp (ms)
 *
 * Ako input nije validan → vraća null.
 */
export function toSqlDateFormat(input) {
    if (input == null || input === '') return null;

    if (typeof input === 'string') {
        input = input.trim();
        
        if (input === '') return null;
    }
    
    const d = dayjs(input);
    if (!d.isValid()) return null;

    return d.format('YYYY-MM-DD');
}

/**
 * Formatira datum u SQL datetime format: YYYY-MM-DD HH:mm:ss
 *
 * Prihvata bilo koji validan datum koji Day.js može da parsira, uključujući:
 * - Date objekt
 * - ISO string
 * - MySQL date/datetime string
 * - timestamp (ms)
 *
 * Ako input nije validan → vraća null.
 */
export function toSqlDateTimeFormat(input) {
    if (input == null) return null;

    if (typeof input === 'string') {
        input = input.trim();
        
        if (input === '') return null;
    }

    const d = dayjs(input);
    if (!d.isValid()) return null;

    return d.format('YYYY-MM-DD HH:mm:ss');
}


/**
 * Formatira datum u Kancelarko format: DD.MM.YYYY
 *
 * Podržani input:
 * - Date objekt
 * - MySQL date: "YYYY-MM-DD"
 * - MySQL datetime: "YYYY-MM-DD HH:mm:ss"
 * - ISO string
 * - timestamp (ms)
 *
 * Ako input nije validan datum → vraća null.
 *
 * Primer:
 * toKancelarkoDateFormat("2026-03-23") -> "23.03.2026"
 */
export function toKancelarkoDateFormat(input) {
    if (input == null || input === '') return null;

    if (typeof input === 'string') {
        input = input.trim();
        
        if (input === '') return null;
    }

    const d = dayjs(input);
    if (!d.isValid()) return null;

    return d.format('DD.MM.YYYY');
}

/**
 * Formatira vreme u kancelarijski format: HH:mm
 *
 * Prihvata bilo koji validan datum koji Day.js može da parsira, uključujući:
 * - Date objekt
 * - MySQL datetime string ("YYYY-MM-DD HH:mm:ss" ili "YYYY-MM-DD HH:mm")
 * - ISO string
 * - timestamp (ms)
 *
 * Ako input nije validan datum → vraća null.
 *
 * Primeri:
 * toKancelarkoTimeFormat("1970-01-01 08:00") -> "08:00"
 */
export function toKancelarkoTimeFormat(input) {
    if (input == null) return null;

    if (typeof input === 'string') {
        input = input.trim();
        if (input === '') return null;
    }

    const d = dayjs(input);
    if (!d.isValid()) return null;

    return d.format('HH:mm');
}

/**
 * Formatira datum i vreme u kancelarijski format: DD.MM.YYYY HH:mm
 *
 * Podržani input:
 * - Date objekt
 * - MySQL date: "YYYY-MM-DD"
 * - MySQL datetime: "YYYY-MM-DD HH:mm:ss"
 * - ISO string
 * - timestamp (ms)
 *
 * Ako input nije validan datum → vraća null.
 *
 * Primeri:
 * toKancelarkoDateTimeFormat("2026-03-23 14:25:00") -> "23.03.2026 14:25"
 * toKancelarkoDateTimeFormat(new Date()) -> "23.03.2026 14:25"
 */
export function toKancelarkoDateTimeFormat(input) {
    if (input == null || input === '') return null;

    if (typeof input === 'string') {
        input = input.trim();
        
        if (input === '') return null;
    }

    const d = dayjs(input);
    if (!d.isValid()) return null;

    return d.format('DD.MM.YYYY HH:mm');
}