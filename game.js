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

const ITEMS_RENDERED = new GRenderer(document.querySelector('#rows'), {rows: [], categories: []}, {}, {ft: formatTime, $onValueChange: onValueChanges});

async function renderRows() {
    const selectedDate = new Date(INPUT_DATE.value);
    const selectedDay = selectedDate.getDate();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const rows = await loadRows();
    ITEMS_RENDERED.variables.rows = rows.filter(row => {
        const rowDate = new Date(row.From);
        return rowDate.getDate() === selectedDay &&
            rowDate.getMonth() === selectedMonth &&
            rowDate.getFullYear() === selectedYear;
    });
    ITEMS_RENDERED.variables.categories = Array.from(new Set(rows.map(row => row.Category)));

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

    renderRows().then(() => BTN_ADD.disabled = false);
});

INPUT_DATE.addEventListener('change', () => renderRows().then());
INPUT_DATE.value = new Date().toISOString().split('T')[0];
renderRows().then();


