// !G.import('src/index.js')

const INPUT_DATE = document.querySelector('#date');
const BTN_ADD = document.querySelector('#add');

/**
 * Format a date object to a HH:MM string
 *
 * @param date {Date} The date to format
 * @return {string} The formatted time
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function onValueChanges(value, input) {
    if (input === "new-category") {
        if (value === "_add-new-category") {
            const newCategory = prompt("Enter the new category name:");
            if (newCategory) {
                ITEMS_RENDERED.variables.categories.push(newCategory);
                ITEMS_RENDERED.render();
                ITEMS_RENDERED.setValue("new-category", newCategory);
            }
        }
    }

    BTN_ADD.disabled = !ITEMS_RENDERED.getValue('new-from') || !ITEMS_RENDERED.getValue('new-to') || !ITEMS_RENDERED.getValue('new-category');
}

const ITEMS_RENDERED = new GRenderer(document.querySelector('body'), {rows: [], categories: [], summary: [], monthName: '', year: ''}, {}, {ft: formatTime, $onValueChange: onValueChanges});

async function renderRows() {
    const selectedDate = new Date(INPUT_DATE.value);
    const selectedDay = selectedDate.getDate();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    ITEMS_RENDERED.variables.monthName = selectedDate.toLocaleString('default', {month: 'long'});
    ITEMS_RENDERED.variables.year = selectedYear;

    const rows = await loadRows();
    // Filter only rows matching current date
    ITEMS_RENDERED.variables.rows = rows.filter(row => {
        const rowDate = new Date(row.From);
        return rowDate.getDate() === selectedDay &&
            rowDate.getMonth() === selectedMonth &&
            rowDate.getFullYear() === selectedYear;
    });
    // Set starting time to the largest ending time if user uses real times
    const largestStartingMinutes = Math.max(...ITEMS_RENDERED.variables.rows.map(row => {
        const rowDate = new Date(row.From);
        return rowDate.getHours() * 60 + rowDate.getMinutes();
    }));
    if (largestStartingMinutes) {
        const largestEndingMinutes = Math.max(...ITEMS_RENDERED.variables.rows.map(row => {
            const rowDate = new Date(row.To);
            return rowDate.getHours() * 60 + rowDate.getMinutes();
        }));
        ITEMS_RENDERED.setValue('new-from', `${Math.floor(largestEndingMinutes / 60).toString().padStart(2, '0')}:${(largestEndingMinutes % 60).toString().padStart(2, '0')}`);
    }

    // Find all existing categories
    ITEMS_RENDERED.variables.categories = Array.from(new Set(rows.map(row => row.Category)));

    // Generate summary for current month
    ITEMS_RENDERED.variables.summary = ITEMS_RENDERED.variables.categories.map(category => ({category, hours: 0}));
    rows.filter((row) => {
        const rowDate = new Date(row.From);
        return rowDate.getMonth() === selectedMonth &&
            rowDate.getFullYear() === selectedYear;
    }).forEach((row) => {
        const hours = (new Date(row.To) - new Date(row.From)) / 3600000;
        ITEMS_RENDERED.variables.summary.find(s => s.category === row.Category).hours += hours;
    });
    ITEMS_RENDERED.variables.summary.sort((a, b) => b.hours - a.hours);

    ITEMS_RENDERED.render();
}

BTN_ADD.addEventListener('click', async () => {
    if (BTN_ADD.disabled) return;

    BTN_ADD.disabled = true;
    const from = new Date(`${INPUT_DATE.value}T${ITEMS_RENDERED.getValue('new-from')}`);
    const to = new Date(`${INPUT_DATE.value}T${ITEMS_RENDERED.getValue('new-to')}`);

    await postData({
        Category: ITEMS_RENDERED.getValue('new-category'),
        From: from.toISOString(),
        To: to.toISOString()
    });

    ITEMS_RENDERED.setValue('new-from', '');
    ITEMS_RENDERED.setValue('new-to', '');
    renderRows().then(() => BTN_ADD.disabled = false);
});

INPUT_DATE.addEventListener('change', () => renderRows().then());
INPUT_DATE.value = new Date().toISOString().split('T')[0];
ITEMS_RENDERED.setValue('new-from', '00:00');
renderRows().then();
