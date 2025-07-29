/**
 * Do a full outer join of multiple tables by common key columns, 
 * applying prefixes to column names and allowing post-processing 
 * on each combined row. Admits one-to-one and one-to-many joins.
 * 
 * Keys are built from the values of key columns,
 * and combined data is stored with prefixed column names.
 * 
 * @param {Array<Object>} tables - List of tables in the format:
 *   {
 *     data: Array<Array>,          // Data as list of rows
 *     headers: Array<string>,      // Column names (without prefix)
 *     prefix: string,              // Prefix to identify source table
 *     keys: Array<string>          // Column names used as join keys
 *   }
 * @param Array<string> columnNames - Final column names and order
 * @param Array<any> columnDefaults - Final column default values
 * @param {Function[]} [postProcessors=[]] - Optional list of functions (one per join) that
 *   process each combined row. Each function receives one combined row object.
 * @returns Array<Array> - Joined data as list of rows.
 */
function joinTablesFullOuter(tables, columnNames, columnDefaults, postProcessors = []) {
  if (tables.length < 2) {
    throw new Error('La cantidad de tablas es incorrecta. Deben ser dos o más.');
  }

  for (const [i, table] of tables.entries()) {
    if (!table.data || !table.headers || !table.prefix || !table.keys) {
      throw new Error(`La tabla en posición ${i} no tiene la estructura esperada.`);
    }
  }

  if (columnNames.length !== columnDefaults.length) {
    throw new Error('Las cantidades de nombres de columna y valores predeterminados deben coincidir.');
  }

  if (postProcessors.length >= tables.length) {
    console.warn('La cantidad de procesadores debe ser menor a la cantidad de tablas.');
  }

  function combineAllRows(currentMap, remainingTables, remainingProcessors) {
    if (remainingTables.length === 0) return currentMap;

    const [currentTable, ...restTables] = remainingTables;
    const [currentProcessor, ...restProcessors] = remainingProcessors;

    const { data, headers, prefix, keys } = currentTable;
    const tempMap = new Map();

    for (const row of data) {
      const key = buildKey(row, headers, keys);

      if (!key || key.trim() === '') continue;

      const rowObject = toRowObject(row, headers, prefix);

      if (!tempMap.has(key)) tempMap.set(key, []);

      if (currentMap && currentMap.has(key)) {
        currentMap.get(key).forEach(
          currentRow => tempMap.get(key).push({...currentRow, ...rowObject}));
      } else {
        tempMap.get(key).push(rowObject);
      }
    }

    if (currentMap)
      tempMap.forEach((value, key) => currentMap.set(key, value));
    else
      currentMap = tempMap;

    if (typeof currentProcessor === 'function') {
      for (const obj of flattenMapValues(currentMap)) {
        currentProcessor(obj);
      }
    }

    return combineAllRows(currentMap, restTables, restProcessors);
  }

  const initialMap = null;
  const initialProcessors = [null, ...postProcessors];
  const resultMap = combineAllRows(initialMap, tables, initialProcessors);

  return buildMatrixFromObjectsMap(resultMap, columnNames, columnDefaults);
}

/**
 * Do a left outer join of multiple tables by common key columns, 
 * applying prefixes to column names and allowing post-processing 
 * on each combined row. Admits one-to-one and one-to-many joins.
 * 
 * Keys are built from the values of key columns,
 * and combined data is stored with prefixed column names.
 * 
 * @param {Array<Object>} tables - List of tables in the format:
 *   {
 *     data: Array<Array>,          // Data as list of rows
 *     headers: Array<string>,      // Column names (without prefix)
 *     prefix: string,              // Prefix to identify source table
 *     keys: Array<string>          // Column names used as join keys
 *   }
 * @param Array<string> columnNames - Final column names and order
 * @param Array<any> columnDefaults - Final column default values
 * @param {Function[]} [postProcessors=[]] - Optional list of functions (one per join) that
 *   process each combined row. Each function receives one combined row object.
 * @returns Array<Array> - Joined data as list of rows.
 */
function joinTablesLeftOuter(tables, columnNames, columnDefaults, postProcessors = []) {
  if (tables.length < 2) {
    throw new Error('La cantidad de tablas es incorrecta. Deben ser dos o más.');
  }

  for (const [i, table] of tables.entries()) {
    if (!table.data || !table.headers || !table.prefix || !table.keys) {
      throw new Error(`La tabla en posición ${i} no tiene la estructura esperada.`);
    }
  }

  if (columnNames.length !== columnDefaults.length) {
    throw new Error('Las cantidades de nombres de columna y valores predeterminados deben coincidir.');
  }

  if (postProcessors.length >= tables.length) {
    console.warn('La cantidad de procesadores debe ser menor a la cantidad de tablas.');
  }

  function combineLeftMatchedRows(currentMap, remainingTables, remainingProcessors) {
    if (remainingTables.length === 0) return currentMap;

    const [currentTable, ...restTables] = remainingTables;
    const [currentProcessor, ...restProcessors] = remainingProcessors;

    const { data, headers, prefix, keys } = currentTable;
    const tempMap = new Map();

    for (const row of data) {
      const key = buildKey(row, headers, keys);

      if (!key || key.trim() === '') continue;

      const rowObject = toRowObject(row, headers, prefix);

      if (currentMap) {
        if (!currentMap.has(key)) continue;
        if (!tempMap.has(key)) tempMap.set(key, []);
        currentMap.get(key).forEach(
          currentRow => tempMap.get(key).push({...currentRow, ...rowObject}));
      } else {
        if (!tempMap.has(key)) tempMap.set(key, []);
        tempMap.get(key).push(rowObject);
      }
    }

    if (currentMap)
      // Actualiza solo claves que tuvieron match; las demás se preservan tal como están
      tempMap.forEach((value, key) => currentMap.set(key, value));
    else
      currentMap = tempMap;

    if (typeof currentProcessor === 'function') {
      for (const obj of flattenMapValues(currentMap)) {
        currentProcessor(obj);
      }
    }

    return combineLeftMatchedRows(currentMap, restTables, restProcessors);
  }

  const initialMap = null;
  const initialProcessors = [null, ...postProcessors];
  const resultMap = combineLeftMatchedRows(initialMap, tables, initialProcessors);

  return buildMatrixFromObjectsMap(resultMap, columnNames, columnDefaults);
}

/**
 * Do a right outer join of multiple tables by common key columns, 
 * applying prefixes to column names and allowing post-processing 
 * on each combined row. Admits one-to-one and one-to-many joins.
 * 
 * Keys are built from the values of key columns,
 * and combined data is stored with prefixed column names.
 * 
 * @param {Array<Object>} tables - List of tables in the format:
 *   {
 *     data: Array<Array>,          // Data as list of rows
 *     headers: Array<string>,      // Column names (without prefix)
 *     prefix: string,              // Prefix to identify source table
 *     keys: Array<string>          // Column names used as join keys
 *   }
 * @param Array<string> columnNames - Final column names and order
 * @param Array<any> columnDefaults - Final column default values
 * @param {Function[]} [postProcessors=[]] - Optional list of functions (one per join) that
 *   process each combined row. Each function receives one combined row object.
 * @returns Array<Array> - Joined data as list of rows.
 */
function joinTablesRightOuter(tables, columnNames, columnDefaults, postProcessors = []) {
  if (tables.length < 2) {
    throw new Error('La cantidad de tablas es incorrecta. Deben ser dos o más.');
  }

  for (const [i, table] of tables.entries()) {
    if (!table.data || !table.headers || !table.prefix || !table.keys) {
      throw new Error(`La tabla en posición ${i} no tiene la estructura esperada.`);
    }
  }

  if (columnNames.length !== columnDefaults.length) {
    throw new Error('Las cantidades de nombres de columna y valores predeterminados deben coincidir.');
  }

  if (postProcessors.length >= tables.length) {
    console.warn('La cantidad de procesadores debe ser menor a la cantidad de tablas.');
  }


  function combineRightMatchedRows(currentMap, remainingTables, remainingProcessors) {
    if (remainingTables.length === 0) return currentMap;

    const [currentTable, ...restTables] = remainingTables;
    const [currentProcessor, ...restProcessors] = remainingProcessors;

    const { data, headers, prefix, keys } = currentTable;
    const tempMap = new Map();

    for (const row of data) {
      const key = buildKey(row, headers, keys);

      if (!key || key.trim() === '') continue;

      const rowObject = toRowObject(row, headers, prefix);

      if (!tempMap.has(key)) tempMap.set(key, []);

      if (currentMap && currentMap.has(key)) {
        currentMap.get(key).forEach(
          currentRow => tempMap.get(key).push({...currentRow, ...rowObject}));
      } else {
        tempMap.get(key).push(rowObject);
      }
    }

    // Se toman solo los registros de currentTable, tuvieran match o no
    currentMap = tempMap;

    if (typeof currentProcessor === 'function') {
      for (const obj of flattenMapValues(currentMap)) {
        currentProcessor(obj);
      }
    }

    return combineRightMatchedRows(currentMap, restTables, restProcessors);
  }

  const initialMap = null;
  const initialProcessors = [null, ...postProcessors];
  const resultMap = combineRightMatchedRows(initialMap, tables, initialProcessors);

  return buildMatrixFromObjectsMap(resultMap, columnNames, columnDefaults);
}

/**
 * Do an inner join of multiple tables by common key columns, 
 * applying prefixes to column names and allowing post-processing 
 * on each combined row. Admits one-to-one and one-to-many joins.
 * 
 * Keys are built from the values of key columns,
 * and combined data is stored with prefixed column names.
 * 
 * @param {Array<Object>} tables - List of tables in the format:
 *   {
 *     data: Array<Array>,          // Data as list of rows
 *     headers: Array<string>,      // Column names (without prefix)
 *     prefix: string,              // Prefix to identify source table
 *     keys: Array<string>          // Column names used as join keys
 *   }
 * @param Array<string> columnNames - Final column names and order
 * @param Array<any> columnDefaults - Final column default values
 * @param {Function[]} [postProcessors=[]] - Optional list of functions (one per join) that
 *   process each combined row. Each function receives one combined row object.
 * @returns Array<Array> - Joined data as list of rows.
 */
function joinTablesInner(tables, columnNames, columnDefaults, postProcessors = []) {
  if (tables.length < 2) {
    throw new Error('La cantidad de tablas es incorrecta. Deben ser dos o más.');
  }

  for (const [i, table] of tables.entries()) {
    if (!table.data || !table.headers || !table.prefix || !table.keys) {
      throw new Error(`La tabla en posición ${i} no tiene la estructura esperada.`);
    }
  }

  if (columnNames.length !== columnDefaults.length) {
    throw new Error('Las cantidades de nombres de columna y valores predeterminados deben coincidir.');
  }

  if (postProcessors.length >= tables.length) {
    console.warn('La cantidad de procesadores debe ser menor a la cantidad de tablas.');
  }

  function combineMatchedRows(resultMap, remainingTables, remainingProcessors) {
    if (remainingTables.length === 0) return resultMap;

    const [currentTable, ...restTables] = remainingTables;
    const [currentProcessor, ...restProcessors] = remainingProcessors;

    const { data, headers, prefix, keys } = currentTable;
    const matchMap = new Map();

    for (const row of data) {
      const key = buildKey(row, headers, keys);

      if (!key || key.trim() === '') continue;
      if (resultMap && !resultMap.has(key)) continue;

      if (!matchMap.has(key)) matchMap.set(key, []);

      const rowObject = toRowObject(row, headers, prefix);

      if (resultMap)
        resultMap.get(key).forEach(
          resultRow => matchMap.get(key).push({...resultRow, ...rowObject}));
      else
        matchMap.get(key).push(rowObject);
    }

    if (typeof currentProcessor === 'function') {
      for (const obj of flattenMapValues(matchMap)) {
        currentProcessor(obj);
      }
    }

    return combineMatchedRows(matchMap, restTables, restProcessors);
  }

  const initialMap = null;
  const initialProcessors = [null, ...postProcessors];
  const resultMap = combineMatchedRows(initialMap, tables, initialProcessors);

  return buildMatrixFromObjectsMap(resultMap, columnNames, columnDefaults);
}

/**
 * Converts an array of values to an object. The headers are used for
 * property names. If `prefix` value is provided, every property name
 * is prefixed.
 * 
 * @param {Array<any>} row          The row values array.
 * @param {Array<string>} headers   The array of header names.
 * @param {string} [prefix='']     If provided, the property names prefix.
 * @returns {Object}                The row object.
 * @throws {TypeError} If row or headers are not an Array.
 * @throws {TypeError} If row and headers does not have the same length.
 */
function toRowObject(row, headers, prefix='') {
  if (!Array.isArray(row)) {
    throw new Error('El parámetro row debe ser de tipo Array.');
  }

  if (!Array.isArray(headers)) {
    throw new Error('El parámetro headers debe ser de tipo Array.');
  }

  if (row.length !== headers.length) {
    throw new Error('La cantidad de elementos del registro y de los encabezados debe coincidir.');
  }

  const obj = {};
  headers.forEach((col, i) => {
    const key = prefix ? `${prefix}.${col}` : col;
    obj[key] = row[i];
  });
  return obj;
}

/**
 * Builds a join key from a row using key columns.
 * Example: "2025-06-18|JUAN"
 * 
 * @param {Array} row - Row data
 * @param {Array<string>} headers - Column names
 * @param {Array<string>} keys - Column names to use for the key
 * @returns {string} Composite key
 */
function buildKey(row, headers, keys) {
  return keys
    .map(colName => {
      const idx = headers.indexOf(colName);
      return idx !== -1 ? normalizeKeyValue(row[idx]) : '';
    })
    .join('|');
}

/**
 * Normalizes key values: dates in ISO format, strings uppercased.
 * 
 * @param {any} value - Value to normalize
 * @returns {string} Normalized value
 */
function normalizeKeyValue(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  } else if (typeof value === 'string') {
    return value.trim().toUpperCase();
  } else if (value == null) {
    return '';
  } else {
    return String(value);
  }
}

/**
 * Converts a map of lists of data objects to a 2D array following specified column order.
 * 
 * @param {Map<string, Array<Object>>} map - Map key => list of objects
 * @param {Array<string>} outputColumns - List of column names in output
 * @param {Array<any>} columnDefaults - Default column values
 * @returns {Array<Array>} - Output matrix
 */
function buildMatrixFromObjectsMap(map, outputColumns, columnDefaults) {
  return buildMatrixFromObjectsArray(flattenMapValues(map), outputColumns, columnDefaults);
}

/**
 * Converts an array of data objects to a 2D array following specified column order.
 * 
 * @param {Array<Object>} array - List of data objects.
 * @param {Array<string>} outputColumns - List of column names in output.
 * @param {Array<any>} columnDefaults - Default column values.
 * @returns {Array<Array>} - Output matrix.
 * @throws {TypeError} If array, outputColumns or columnDefaults is not an Array.
 * @throws {TypeError} If any value of array is not an Object.
 * @throws {TypeError} If outputColumns and columnDefaults does not have the same length.
 */
function buildMatrixFromObjectsArray(array, outputColumns, columnDefaults) {
  if (!Array.isArray(array)) {
    throw new Error('El parámetro array debe ser un arreglo.');
  }

  if (!Array.isArray(outputColumns)) {
    throw new Error('El parámetro outputColumns debe ser un arreglo.');
  }

  if (!Array.isArray(columnDefaults)) {
    throw new Error('El parámetro columnDefaults debe ser un arreglo.');
  }

  if (outputColumns.length !== columnDefaults.length) {
    throw new Error('Las longitudes de outputColumns y columnDefaults deben coincidir.');
  }

  const output = [];
  for (const row of array) {
    if (typeof row !== 'object') {
      throw new Error('El parámetro array sólo debe contener objetos.');
    }

    const line = outputColumns.map((col, i) => row[col] ?? columnDefaults[i]);
    output.push(line);
  }

  return output;
}

/**
 * Flattens all the array values of a Map into a single flat array.
 * Ensures all values are arrays of objects.
 * 
 * @param {Map<any, Array<Object>>} map - A Map whose values are arrays of objects.
 * @returns {Array<Object>} - A flat array containing all objects from all arrays in the map.
 * @throws {TypeError} If the input is not a Map.
 * @throws {TypeError} If any value in the Map is not an array of objects.
 */
function flattenMapValues(map) {
  if (!(map instanceof Map)) {
    throw new TypeError('El argumento debe ser una instancia de Map.');
  }

  const result = [];

  for (const [key, group] of map.entries()) {
    if (!Array.isArray(group)) {
      throw new TypeError(`El valor asociado a la clave "${key}" no es un arreglo.`);
    }

    for (const item of group) {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        throw new TypeError(`Uno de los elementos del arreglo asociado a la clave "${key}" no es un objeto.`);
      }

      result.push(item);
    }
  }

  return result;
}

/**
 * Clones a row object removing certain properties and/or adding new ones.
 * @param {Object} row - Original row
 * @param {string[]} remove - Keys to remove
 * @param {Object} add - Object with keys/values to add
 * @returns {Object} New row object
 */
function processRow(row, remove = [], add = {}) {
  const copy = { ...row };
  remove.forEach(k => delete copy[k]);
  return { ...copy, ...add };
}
