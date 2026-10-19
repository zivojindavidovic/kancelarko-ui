import { sr, srLatn, hr, enUS } from 'date-fns/locale';

export function resolveDatePickerLocale(locale) {
    switch (locale) {

        // SRPSKI ĆIRILICA
        case 'rs_cyr':
        case 'ba_cyr':
        case 'cg_cyr':
            return sr;

        // SRPSKI LATINICA
        case 'rs':
        case 'ba':
        case 'cg':
            return srLatn;

        // HRVATSKI
        case 'hr':
            return hr;

        // ENGLESKI
        case 'eng':
        case 'en':
            return enUS;

        // fallback
        default:
            return srLatn;
    }
}

export function resolveFullCalendarLocale(locale) {
    locale = String(locale || 'rs').toLowerCase();

    const locales = {
        en: {
            code: 'en-GB',
            buttonText: { today: 'Today', month: 'Month', week: 'Week', day: 'Day' },
            weekText: 'Wk',
            allDayText: 'All day',
            moreLinkText: 'more',
            noEventsText: 'No events',
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        },

        hr: {
            code: 'hr',
            buttonText: { today: 'Danas', month: 'Mjesec', week: 'Tjedan', day: 'Dan' },
            weekText: 'Tj',
            allDayText: 'Cijeli dan',
            moreLinkText: 'više',
            noEventsText: 'Nema događaja',
            daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
            daysLong: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'],
            monthsShort: ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'],
            monthsLong: ['Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj', 'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'],
        },

        rs: {
            code: 'sr-Latn',
            buttonText: { today: 'Danas', month: 'Mesec', week: 'Nedelja', day: 'Dan' },
            weekText: 'Ned',
            allDayText: 'Ceo dan',
            moreLinkText: 'još',
            noEventsText: 'Nema događaja',
            daysShort: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'],
            daysLong: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
            monthsLong: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
        },

        ba: {
            code: 'bs',
            buttonText: { today: 'Danas', month: 'Mjesec', week: 'Sedmica', day: 'Dan' },
            weekText: 'Sed',
            allDayText: 'Cijeli dan',
            moreLinkText: 'još',
            noEventsText: 'Nema događaja',
            daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
            daysLong: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
            monthsLong: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
        },

        cg: {
            code: 'sr-Latn',
            buttonText: { today: 'Danas', month: 'Mjesec', week: 'Sedmica', day: 'Dan' },
            weekText: 'Sed',
            allDayText: 'Cio dan',
            moreLinkText: 'još',
            noEventsText: 'Nema događaja',
            daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
            daysLong: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
            monthsLong: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
        },

        rs_cyr: {
            code: 'sr',
            buttonText: { today: 'Данас', month: 'Месец', week: 'Недеља', day: 'Дан' },
            weekText: 'Нед',
            allDayText: 'Цео дан',
            moreLinkText: 'још',
            noEventsText: 'Нема догађаја',
            daysShort: ['Нед', 'Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб'],
            daysLong: ['Недеља', 'Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота'],
            monthsShort: ['Јан', 'Феб', 'Мар', 'Апр', 'Мај', 'Јун', 'Јул', 'Авг', 'Сеп', 'Окт', 'Нов', 'Дец'],
            monthsLong: ['Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јун', 'Јул', 'Август', 'Септембар', 'Октобар', 'Новембар', 'Децембар'],
        },

        ba_cyr: {
            code: 'sr',
            buttonText: { today: 'Данас', month: 'Мјесец', week: 'Седмица', day: 'Дан' },
            weekText: 'Сед',
            allDayText: 'Цијели дан',
            moreLinkText: 'још',
            noEventsText: 'Нема догађаја',
            daysShort: ['Нед', 'Пон', 'Уто', 'Сри', 'Чет', 'Пет', 'Суб'],
            daysLong: ['Недјеља', 'Понедјељак', 'Уторак', 'Сриједа', 'Четвртак', 'Петак', 'Субота'],
            monthsShort: ['Јан', 'Феб', 'Мар', 'Апр', 'Мај', 'Јун', 'Јул', 'Авг', 'Сеп', 'Окт', 'Нов', 'Дец'],
            monthsLong: ['Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јуни', 'Јули', 'Август', 'Септембар', 'Октобар', 'Новембар', 'Децембар'],
        },

        cg_cyr: {
            code: 'sr',
            buttonText: { today: 'Данас', month: 'Мјесец', week: 'Седмица', day: 'Дан' },
            weekText: 'Сед',
            allDayText: 'Цио дан',
            moreLinkText: 'још',
            noEventsText: 'Нема догађаја',
            daysShort: ['Нед', 'Пон', 'Уто', 'Сри', 'Чет', 'Пет', 'Суб'],
            daysLong: ['Недјеља', 'Понедјељак', 'Уторак', 'Сриједа', 'Четвртак', 'Петак', 'Субота'],
            monthsShort: ['Јан', 'Феб', 'Мар', 'Апр', 'Мај', 'Јун', 'Јул', 'Авг', 'Сеп', 'Окт', 'Нов', 'Дец'],
            monthsLong: ['Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јун', 'Јул', 'Август', 'Септембар', 'Октобар', 'Новембар', 'Децембар'],
        },
    };

    return locales[locale] || locales.rs;
}