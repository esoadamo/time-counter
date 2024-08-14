// !G.import('../env.js')

/**
 * @typedef {{Category: string, From: Date, To: Date}} RowCreation
 * @typedef {RowCreation & {id: number}} Row
 */

/**
 * Fetches all field IDs for the table based on saved data object
 *
 * @param dataObject {{[key: string]: any}}
 * @returns {Promise<{[key: string]: string}>}
 */
async function fetchFieldIds(dataObject) {
    const apiUrlFields = `${apiURL}/api/database/fields/table/${tableId}/`;

    try {
        const response = await fetch(apiUrlFields, {
            method: "GET",
            headers: {
                "Authorization": `Token ${apiKey}`,
                "Content-Type": "application/json"
            }
        });
        const fields = await response.json();

        const idMap = {};

        Object.keys(dataObject).forEach(key => {
            const field = fields.find(field => field.name === key);
            if (field) {
                idMap[key] = `field_${field.id}`;
            }
        });

        return idMap;
    } catch (error) {
        console.error("Error fetching fields:", error);
        throw error;
    }
}

/**
 * Create a new row in the table
 * @param dataObject {RowCreation}
 * @returns {Promise<any>}
 */
async function postData(dataObject) {
    const apiUrlRows = `${apiURL}/api/database/rows/table/${tableId}/`;
    const fields = await fetchFieldIds(dataObject);

    const data = {};
    Object.entries(dataObject).forEach(([key, value]) => {
        data[fields[key]] = value;
    });

    try {
        const response = await fetch(apiUrlRows, {
            method: "POST",
            headers: {
                "Authorization": `Token ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Loads all rows from the table
 * @returns {Promise<Row[]>}
 */
async function loadRows() {
    const apiUrlRows = `${apiURL}/api/database/rows/table/${tableId}/?user_field_names=true`;

    const response = await fetch(apiUrlRows, {
        method: "GET",
        headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json"
        }
    });

    // noinspection JSUnresolvedReference
    let rows = (await response.json()).results;

    console.log('rows', rows);

    rows = rows.map(row => ({
        id: row.id,
        Category: row.Category,
        From: new Date(row.From),
        To: new Date(row.To)
    }));

    rows = rows.filter(x => x.Category && !isNaN(x.From.getTime()) && !isNaN(x.To.getTime()));

    return rows;
}


/**
 * Updates an existing row in the table
 *
 * @param rowId {number} - The ID of the row to update
 * @param dataObject {{[key: string]: any}} - The data to update in the row
 * @returns {Promise<any>}
 */
async function updateRow(rowId, dataObject) {
    const apiUrlRow = `${apiURL}/api/database/rows/table/${tableId}/${rowId}/`;
    const fields = await fetchFieldIds(dataObject);

    const data = {};
    Object.entries(dataObject).forEach(([key, value]) => {
        data[fields[key]] = value;
    });

    try {
        const response = await fetch(apiUrlRow, {
            method: "PATCH",
            headers: {
                "Authorization": `Token ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    } catch (error) {
        console.error("Error updating row:", error);
        throw error;
    }
}
