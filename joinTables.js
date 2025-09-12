var JoinTables = (function () {
  'use strict';

  function validateJoinParamsAndBuildTableMap(tables, joins) {
    if (!Array.isArray(tables)) throw new Error("El parámetro 'tables' no es válido.");

    if (tables.length < 2) {
      throw new Error('La cantidad de tablas es incorrecta. Deben ser dos o más.');
    }

    for (const [i, table] of tables.entries()) {
      if (!Utils.isPlainObject(table)) {
        throw new Error(`El elemento ${i} del parámetro 'tables' no es un objeto válido`)
      }
      if (typeof table.name !== 'string' || table.name.trim() === '') {
        throw new Error(`La propiedad 'name' del elemento ${i} del parámetro 'tables' no es un nombre válido`);
      }
      if (!Array.isArray(table.data) || table.data.some(row => !Array.isArray(row))){
        throw new Error(`La propiedad 'data' del elemento ${i} del parámetro 'tables' no es un arreglo válido`);
      } 
      if (!Array.isArray(table.headers)) {
        throw new Error(`La propiedad 'headers' del elemento ${i} del parámetro 'tables' no es un arreglo válido`);
      }
      table.headers.some((title, j) => {
        if (typeof title !== 'string' || title.trim() === '') {
          throw new Error(`El elemento ${j} de la propiedad 'headers' del elemento ${i} del parámetro 'tables' no es un título válido`);
        }
      });
    }

    if (!Array.isArray(joins)) {
      throw new Error("El parámetro 'joins' no es válido.");
    }

    const tableMap = new Map();
    tables.forEach(({ name, headers, data }) => tableMap.set(name, { name, headers, data }));

    const previousJoinsAliases = [];
    joins.some((join, i) => {
      if (!Utils.isPlainObject(join)) {
        throw new Error(`El elemento ${i} del parámetro 'joins' no es un objeto válido.`);
      }
      if (typeof join.alias !== 'string' || join.alias.trim() === '') {
        throw new Error(`La propiedad 'alias' del elemento ${i} del parámetro 'joins' no es un nombre válido.`);
      }
      if (!Array.isArray(join.fieldsOrder)) {
        throw new Error(`La propiedad 'fieldsOrder' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
      }
      join.fieldsOrder.some((name, j) => {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error(`El elemento ${j} de la propiedad 'fieldsOrder' del elemento ${i} del parámetro 'joins' no es un nombre válido.`);
        }
      });
      if (!Array.isArray(join.defaultValues)) {
        throw new Error(`La propiedad 'fieldsOrder' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
      }
      if (join.fieldsOrder.length !== join.defaultValues.length) {
        throw new Error(`Las propiedades 'fieldsOrder' y 'defaultValues' del elemento ${i} del parámetro 'joins' no tienen la misma cantidad de elementos.`);
      }
      if (join.postProcessor && typeof join.postProcessor !== 'function') {
        throw new Error(`La propiedad 'postProcessor' del elemento ${i} del parámetro 'joins' no es una función válida.`);
      }
      if (!Utils.isPlainObject(join.left)) {
        throw new Error(`La propiedad 'left' del elemento ${i} del parámetro 'joins' no es un objeto válido.`);
      }
      if (typeof join.left.table !== 'string' || join.left.table.trim() === '') {
        throw new Error(`La propiedad 'table' de la propiedad 'left' del elemento ${i} del parámetro 'joins' no es un nombre válido.`);
      }
      if (!tableMap.has(join.left.table) && !previousJoinsAliases.includes(join.left.table)) {
        throw new Error(`El valor de la propiedad 'table' de la propiedad 'left' del elemento ${i} del parámetro 'joins' no corresponde al nombre de una tabla ni al alias de una unión previa.`);
      }
      if (!Array.isArray(join.left.selectedFields)) {
        throw new Error(`La propiedad 'selectedFields' de la propiedad 'left' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
      }
      join.left.selectedFields.some((name, j) => {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error(`El elemento ${j} de la propiedad 'selectedFields' de la propiedad 'left' del elemento ${i} del parámetro 'joins' no es un nombre válido.`);
        }
      })
      const leftSelectedFieldsCount = join.left.selectedFields.length;
      const leftSelectedFiedsSet = new Set(join.left.selectedFields);
      if (leftSelectedFiedsSet.size !== leftSelectedFieldsCount) {
        throw new Error(`La propiedad 'selectedFields' de la propiedad 'left' del elemento ${i} del parámetro 'joins' contiene nombres repetidos.`);
      }
      if (!Array.isArray(join.left.joinedFields)) {
        throw new Error(`La propiedad 'joinedFields' de la propiedad 'left' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
      }
      join.left.joinedFields.some((name, j) => {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error(`El elemento ${j} de la propiedad 'joinedFields' de la propiedad 'left' del elemento ${i} del parámetro 'joins' no es un nombre válido.`);
        }
      })
      const leftJoinedFieldsCount = join.left.joinedFields.length;
      const leftJoinedFiedsSet = new Set(join.left.joinedFields);
      if (leftJoinedFiedsSet.size !== leftJoinedFieldsCount) {
        throw new Error(`La propiedad 'joinedFields' de la propiedad 'left' del elemento ${i} del parámetro 'joins' contiene nombres repetidos.`);
      }
      if (!Utils.isPlainObject(join.right)) {
        throw new Error(`La propiedad 'right' del elemento ${i} del parámetro 'joins' no es un objeto válido.`);
      }
      if (typeof join.right.table !== 'string' || join.right.table.trim() === '') {
        throw new Error(`La propiedad 'table' de la propiedad 'right' del elemento ${i} del parámetro 'joins' no es un nombre válido.`);
      }
      if (!tableMap.has(join.right.table) && !previousJoinsAliases.includes(join.right.table)) {
        throw new Error(`El valor de la propiedad 'table' de la propiedad 'right' del elemento ${i} del parámetro 'joins' no corresponde al nombre de una tabla ni al alias de una unión previa.`);
      }
      if (!Array.isArray(join.right.selectedFields)) {
        throw new Error(`La propiedad 'selectedFields' de la propiedad 'right' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
      }
      join.right.selectedFields.some((name, j) => {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error(`El elemento ${j} de la propiedad 'selectedFields' de la propiedad 'right' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
        }
      })
      const rightSelectedFieldsCount = join.right.selectedFields.length;
      const rightSelectedFiedsSet = new Set(join.right.selectedFields);
      if (rightSelectedFiedsSet.size !== rightSelectedFieldsCount) {
        throw new Error(`La propiedad 'selectedFields' de la propiedad 'right' del elemento ${i} del parámetro 'joins' contiene nombres repetidos.`);
      }
      if (!Array.isArray(join.right.joinedFields)) {
        throw new Error(`La propiedad 'joinedFields' de la propiedad 'right' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
      }
      join.right.joinedFields.some((name, j) => {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error(`El elemento ${j} de la propiedad 'joinedFields' de la propiedad 'right' del elemento ${i} del parámetro 'joins' no es un arreglo válido.`);
        }
      })
      const rightJoinedFieldsCount = join.right.joinedFields.length;
      const rightJoinedFiedsSet = new Set(join.right.joinedFields);
      if (rightJoinedFiedsSet.size !== rightJoinedFieldsCount) {
        throw new Error(`La propiedad 'joinedFields' de la propiedad 'right' del elemento ${i} del parámetro 'joins' contiene nombres repetidos.`);
      }
      const allSelectedFieldsSet = new Set([...join.left.selectedFields, ...join.right.selectedFields]);
      if (allSelectedFieldsSet.size !== leftSelectedFieldsCount + rightSelectedFieldsCount) {
        throw new Error(`Las propiedades 'selectedFields' de las propiedades 'left' y 'right' del elemento ${i} del parámetro 'joins' contienen nombres en común.`);
      }

      previousJoinsAliases.push(join.alias);
    })

    if (joins.length !== tables.length - 1) {
      throw new Error('La cantidad de uniones debe ser igual a la cantidad de tablas menos uno.');
    }

    return tableMap;
  }

  function validateCurrentJoinFields(currentJoin, leftTable, rightTable) {
    if (!leftTable) {
      throw new Error(`No se encontró la tabla ${currentJoin.left.table} al intentar la unión ${currentJoin.alias}`);
    }
    currentJoin.left.joinedFields.some(name => {
      if (!leftTable.headers.includes(name)) {
        throw new Error(`No se encontró el campo ${name} en la tabla ${currentJoin.left.table} al intentar la unión ${currentJoin.alias}`);
      }
    });
    currentJoin.left.selectedFields.some(name => {
      if (!leftTable.headers.includes(name)) {
        throw new Error(`No se encontró el campo ${name} en la tabla ${currentJoin.left.table} al intentar la unión ${currentJoin.alias}`);
      }
    });

    if (!rightTable) {
      throw new Error(`No se encontró la tabla ${currentJoin.right.table} al intentar la unión ${currentJoin.alias}`);
    }
    currentJoin.right.joinedFields.some(name => {
      if (!rightTable.headers.includes(name)) {
        throw new Error(`No se encontró el campo ${name} en la tabla ${currentJoin.right.table} al intentar la unión ${currentJoin.alias}`);
      }
    });
    currentJoin.right.selectedFields.some(name => {
      if (!rightTable.headers.includes(name)) {
        throw new Error(`No se encontró el campo ${name} en la tabla ${currentJoin.right.table} al intentar la unión ${currentJoin.alias}`);
      }
    });
  }

  /**
   * Executes joinProcessor on every join recursively.
   * 
   * @param {Array<Object>} remainingJoins Array of join specifications:
   *   {
   *     left: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     right: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     alias: string                      // Name of the resulting table
   *     postProcessor: function            // Función de post procesamiento
   *     fieldsOrder: Aray<string>          // Final column names and order
   *     defaultValues: Array<any>          // Final column default values
   *   }
   * @param {Map<string, Object>} tableMap Map of table objects indexed by name 
   * @param {function(Map<string, Array<Object>>, Array<Object>)} joinProcessor Join processor
   * @returns Array<Array> - Joined data as list of rows.
   */
  function doJoins(remainingJoins, tableMap, joinProcessor) {
    const [currentJoin, ... restJoins] = remainingJoins;

    // Se demora hasta este punto la verificación de las tablas y los campos que partician 
    // en la unión actual porque una unión puede utilizar la tabla resultado de la unión 
    // previa. La tabla es adicionada a tableMap solo al final del procesamiento de la unión.
    const leftTable = tableMap.get(currentJoin.left.table);
    const rightTable = tableMap.get(currentJoin.right.table);
    validateCurrentJoinFields(currentJoin, leftTable, rightTable);

    const tables = [{ 
        ...leftTable,
        joinedFields: currentJoin.left.joinedFields,
        selectedFields: currentJoin.left.selectedFields
      }, {
        ...rightTable,
        joinedFields: currentJoin.right.joinedFields,
        selectedFields: currentJoin.right.selectedFields
      }];

    const initialMap = null;
    const resultMap = joinProcessor(initialMap, tables);

    if (currentJoin.postProcessor) {
      for (const obj of flattenMapValues(resultMap)) {
        currentJoin.postProcessor(obj);
      }
    }

    const data = buildMatrixFromObjectsMap(resultMap, currentJoin.fieldsOrder, currentJoin.defaultValues);

    if (restJoins.length === 0) return data;

    tableMap.set(currentJoin.alias, { 
      name: currentJoin.alias,
      headers: currentJoin.fieldsOrder,
      data, 
    });

    return doJoins(restJoins, tableMap, joinProcessor);
  }

  /**
   * Do a full outer join of multiple tables by key columns and 
   * allowing post-processing on each combined row. Admits 
   * one-to-one and one-to-many joins.
   * 
   * @param {Array<Object>} tables Array of tables specifications
   *   {
   *     name: string,           // Table name
   *     headers: Array<string>, // Column names
   *     data: Array<Array>,     // Data as list of rows
   *   }
   * @param {Array<Object>} joins Array of join specifications:
   *   {
   *     left: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     right: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     alias: string                      // Name of the resulting table
   *     postProcessor: function            // Función de post procesamiento
   *     fieldsOrder: Aray<string>          // Final column names and order
   *     defaultValues: Array<any>          // Final column default values
   *   }
   * @returns Array<Array> - Joined data as list of rows.
   */
  function joinTablesFullOuter(tables, joins) {
    const tableMap = validateJoinParamsAndBuildTableMap(tables, joins);

    function combineAllRows(currentMap, remainingTables) {
      if (remainingTables.length === 0) return currentMap;

      const [currentTable, ...restTables] = remainingTables;

      const { data, headers, joinedFields, selectedFields } = currentTable;
      const tempMap = new Map();

      for (const row of data) {
        const key = buildKey(row, headers, joinedFields);

        if (!key || key.trim() === '') continue;

        const rowObject = toRowObject(row, headers, selectedFields);

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

      return combineAllRows(currentMap, restTables);
    }

    return doJoins(joins, tableMap, combineAllRows);
  }

  /**
   * Do a left outer join of multiple tables by key columns and 
   * allowing post-processing on each combined row. Admits 
   * one-to-one and one-to-many joins.
   * 
   * @param {Array<Object>} tables Array of tables specifications
   *   {
   *     name: string,           // Table name
   *     headers: Array<string>, // Column names
   *     data: Array<Array>,     // Data as list of rows
   *   }
   * @param {Array<Object>} joins Array of join specifications:
   *   {
   *     left: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     right: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     alias: string                      // Name of the resulting table
   *     postProcessor: function            // Función de post procesamiento
   *     fieldsOrder: Aray<string>          // Final column names and order
   *     defaultValues: Array<any>          // Final column default values
   *   }
   * @returns Array<Array> - Joined data as list of rows.
   */
 function joinTablesLeftOuter(tables, joins) {
    const tableMap = validateJoinParamsAndBuildTableMap(tables, joins);

    function combineLeftMatchedRows(currentMap, remainingTables) {
      if (remainingTables.length === 0) return currentMap;

      const [currentTable, ...restTables] = remainingTables;

      const { data, headers, joinedFields, selectedFields } = currentTable;
      const tempMap = new Map();

      for (const row of data) {
        const key = buildKey(row, headers, joinedFields);

        if (!key || key.trim() === '') continue;

        const rowObject = toRowObject(row, headers, selectedFields);

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

      return combineLeftMatchedRows(currentMap, restTables);
    }

    return doJoins(joins, tableMap, combineLeftMatchedRows);
  }

  /**
   * Do a right outer join of multiple tables by key columns and
   * allowing post-processing on each combined row. Admits 
   * one-to-one and one-to-many joins.
   * 
   * @param {Array<Object>} tables Array of tables specifications
   *   {
   *     name: string,           // Table name
   *     headers: Array<string>, // Column names
   *     data: Array<Array>,     // Data as list of rows
   *   }
   * @param {Array<Object>} joins Array of join specifications:
   *   {
   *     left: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     right: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     alias: string                      // Name of the resulting table
   *     postProcessor: function            // Función de post procesamiento
   *     fieldsOrder: Aray<string>          // Final column names and order
   *     defaultValues: Array<any>          // Final column default values
   *   }
   * @returns Array<Array> - Joined data as list of rows.
   */
  function joinTablesRightOuter(tables, joins) {
    const tableMap = validateJoinParamsAndBuildTableMap(tables, joins);

    function combineRightMatchedRows(currentMap, remainingTables) {
      if (remainingTables.length === 0) return currentMap;

      const [currentTable, ...restTables] = remainingTables;

      const { data, headers, joinedFields, selectedFields } = currentTable;
      const tempMap = new Map();

      for (const row of data) {
        const key = buildKey(row, headers, joinedFields);

        if (!key || key.trim() === '') continue;

        const rowObject = toRowObject(row, headers, selectedFields);

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

      return combineRightMatchedRows(currentMap, restTables);
    }

    return doJoins(joins, tableMap, combineRightMatchedRows);
  }

  /**
   * Do an inner join of multiple tables by key columns and 
   * allows post-processing on each combined row. Admits 
   * one-to-one and one-to-many joins.
   * 
   * @param {Array<Object>} tables Array of tables specifications
   *   {
   *     name: string,           // Table name
   *     headers: Array<string>, // Column names
   *     data: Array<Array>,     // Data as list of rows
   *   }
   * @param {Array<Object>} joins Array of join specifications:
   *   {
   *     left: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     right: {
   *       table: string,                   // Name of the table
   *       selectedFields: Array<string>,   // Name of selected fields
   *       joinedFields: Array<string>      // Name of joined fields
   *     },
   *     alias: string                      // Name of the resulting table
   *     postProcessor: function            // Función de post procesamiento
   *     fieldsOrder: Aray<string>          // Final column names and order
   *     defaultValues: Array<any>          // Final column default values
   *   }
   * @returns Array<Array> - Joined data as list of rows.
   */
  function joinTablesInner(tables, joins) {
    const tableMap = validateJoinParamsAndBuildTableMap(tables, joins);

    function combineMatchedRows(resultMap, remainingTables) {
      if (remainingTables.length === 0) return resultMap;

      const [currentTable, ...restTables] = remainingTables;

      const { data, headers, joinedFields, selectedFields } = currentTable;
      const matchMap = new Map();

      for (const row of data) {
        const key = buildKey(row, headers, joinedFields);

        if (!key || key.trim() === '') continue;
        if (resultMap && !resultMap.has(key)) continue;

        if (!matchMap.has(key)) matchMap.set(key, []);

        const rowObject = toRowObject(row, headers, selectedFields);

        if (resultMap)
          resultMap.get(key).forEach(
            resultRow => matchMap.get(key).push({ ...resultRow, ...rowObject }));
        else
          matchMap.get(key).push(rowObject);
      }

      return combineMatchedRows(matchMap, restTables);
    }

    return doJoins(joins, tableMap, combineMatchedRows);
  }

  /**
   * Helper to create join specifications
   * 
   * @param {string} leftTable Left table name
   * @param {string} rightTable Right table name
   * @param {{ left: [], right: [] }} joinFields Join fields
   * @param {{ left: [], right: [] }} selectFields Selection fields
   * @param {string} alias Alias for join result
   * @param {Array<string>} fieldsOrder Array for ordering result fields
   * @param {Array<string>} defaultValues Default values for result fields
   * @param {Function} [postProcessor] Post-processor function
   * @returns {Object} Join specifications
   */
  function createJoinSpec(leftTable, rightTable, joinFields, selectFields, alias, fieldsOrder = null, defaultValues = null, postProcessor = null) {
    if (typeof leftTable !== 'string' || leftTable.trim() === '') {
      throw new Error(`El parámetro 'leftTable' no es un nombre válido.`);
    }
    if (typeof rightTable !== 'string' || rightTable.trim() === '') {
      throw new Error(`El parámetro 'rightTable' no es un nombre válido.`);
    }
    if (!Utils.isPlainObject(joinFields)) {
      throw new Error(`El parámetro 'joinFields' no es un objeto válido.`);
    }
    if (!Array.isArray(joinFields.left)) {
      throw new Error(`La propiedad 'left' del parámetro 'joinFields' no es un arreglo válido.`);
    }
    joinFields.left.some((name, j) => {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error(`El elemento ${j} de la propiedad 'left' del parámetro 'joinFields' no es un nombre válido.`);
      }
    })
    const joinFieldsLeftCount = joinFields.left.length;
    const joinFieldsLeftSet = new Set(joinFields.left);
    if (joinFieldsLeftSet.size !== joinFieldsLeftCount) {
      throw new Error(`La propiedad 'left' del parámetro 'joinFields' contiene nombres repetidos.`);
    }
    if (!Array.isArray(joinFields.right)) {
      throw new Error(`La propiedad 'right' del parámetro 'joinFields' no es un arreglo válido.`);
    }
    joinFields.right.some((name, j) => {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error(`El elemento ${j} de la propiedad 'right' del parámetro 'joinFields' no es un nombre válido.`);
      }
    })
    const joinFieldsRightCount = joinFields.right.length;
    const joinFieldsRightSet = new Set(joinFields.right);
    if (joinFieldsRightSet.size !== joinFieldsRightCount) {
      throw new Error(`La propiedad 'right' del parámetro 'joinFields' contiene nombres repetidos.`);
    }

    if (!Utils.isPlainObject(selectFields)) {
      throw new Error(`El parámetro 'selectFields' no es un objeto válido.`);
    }
    if (!Array.isArray(selectFields.left)) {
      throw new Error(`La propiedad 'left' del parámetro 'selectFields' no es un arreglo válido.`);
    }
    selectFields.left.some((name, j) => {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error(`El elemento ${j} de la propiedad 'left' del parámetro 'selectFields' no es un nombre válido.`);
      }
    })
    const selectFieldsLeftCount = selectFields.left.length;
    const selectFieldsLeftSet = new Set(selectFields.left);
    if (selectFieldsLeftSet.size !== selectFieldsLeftCount) {
      throw new Error(`La propiedad 'left' del parámetro 'selectFields' contiene nombres repetidos.`);
    }
    if (!Array.isArray(selectFields.right)) {
      throw new Error(`La propiedad 'right' del parámetro 'selectFields' no es un arreglo válido.`);
    }
    selectFields.right.some((name, j) => {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error(`El elemento ${j} de la propiedad 'right' del parámetro 'selectFields' no es un nombre válido.`);
      }
    })
    const selectFieldsRightCount = selectFields.right.length;
    const selectFieldsRightSet = new Set(selectFields.right);
    if (selectFieldsRightSet.size !== selectFieldsRightCount) {
      throw new Error(`La propiedad 'right' del parámetro 'selectFields' contiene nombres repetidos.`);
    }

    const allSelectedFieldsSet = new Set([...selectFields.left, ...selectFields.right]);
    if (allSelectedFieldsSet.size !== selectFieldsLeftCount + selectFieldsRightCount) {
      throw new Error(`Las propiedades 'left' y 'right' del parámetro 'selectedFields' contienen nombres en común.`);
    }

    if (typeof alias !== 'string' || alias.trim() === '') {
      throw new Error(`El parámetro 'alias' no es un nombre válido.`);
    }
    if (fieldsOrder) {
      if (!Array.isArray(fieldsOrder)) {
        throw new Error(`El parámetro 'fieldsOrder' no es un arreglo válido.`);
      }
      fieldsOrder.some((name, j) => {
        if (typeof name !== 'string' || name.trim() === '') {
          throw new Error(`El elemento ${j} del parámetro 'fieldsOrder' no es un nombre válido.`);
        }
      });
    }
    if (defaultValues && !Array.isArray(defaultValues)) {
      throw new Error(`El parámetro 'defaultValues' no es un arreglo válido.`);
    }

    const resolvedFieldsOrder = fieldsOrder ?? [...selectFields.left, ...selectFields.right];
    const resolvedDefaultValues = defaultValues ?? Array(resolvedFieldsOrder.length).fill(null);
    if (resolvedFieldsOrder.length !== resolvedDefaultValues.length) {
      if (fieldsOrder && defaultValues) {
        throw new Error(`Los parámetros 'fieldsOrder' y 'defaultValues' no tienen la misma cantidad de elementos.`);
      } else {
        throw new Error(`La cantidad de campos del resultado y la cantidad de valores predeterminados no coinciden`);
      }
    }

    if (postProcessor && typeof postProcessor !== 'function') {
      throw new Error(`El parámetro 'postProcessor' no es una función válida.`);
    }

    return {
      left: {
        table: leftTable,
        joinedFields: joinFields.left,
        selectedFields: selectFields.left
      },
      right: {
        table: rightTable, 
        joinedFields: joinFields.right,
        selectedFields: selectFields.right
      },
      alias: alias,
      fieldsOrder: resolvedFieldsOrder,
      defaultValues: resolvedDefaultValues,
      postProcessor: postProcessor
    };
  }

  /**
   * Helper para crear especificación de tabla
   * @param {string} name - Nombre de la tabla
   * @param {Array<string>} headers - Nombres de columnas
   * @param {Array<Array>} data - Datos de la tabla
   * @returns {Object} Especificación de tabla
   */
  function createTableSpec(name, headers, data) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error("El parámetro 'name' no es un nombre válido");
    }
    if (!Array.isArray(data) || data.some(row => !Array.isArray(row))){
      throw new Error("El parámetro 'data' no es un arreglo válido");
    } 
    if (!Array.isArray(headers)) {
      throw new Error("El parámetro 'headers' no es un arreglo válido");
    }
    headers.some((title, i) => {
      if (typeof title !== 'string' || title.trim() === '') {
        throw new Error(`El elemento ${i} del parámetro 'headers' no es un nombre válido`);
      }
    });
    return { name, headers, data };
  }

  /**
   * Converts an array of values to an object. The headers are used for
   * property names. If `prefix` value is provided, every property name
   * is prefixed.
   * 
   * @param {Array<any>} row            The row values array.
   * @param {Array<string>} headers     The array of header names.
   * @param {Array<string>} [selected]  The columns to include in the object. 
   *                                    If not provided, asumes all.
   * @param {string} [prefix='']        If provided, the property names prefix.
   * @returns {Object}                  The row object.
   * @throws {TypeError} If row or headers are not an Array.
   * @throws {TypeError} If row and headers does not have the same length.
   * @throws {TypeError} If selected is provided and it's not an Array or it's empty.
   */
  function toRowObject(row, headers, selected, prefix='') {
    if (!Array.isArray(row)) {
      throw new Error('El parámetro row debe ser de tipo Array.');
    }

    if (!Array.isArray(headers)) {
      throw new Error('El parámetro headers debe ser de tipo Array.');
    }

    if (selected) {
      if (!Array.isArray(selected)) {
        throw new Error('El parámetro selected debe ser de tipo Array.');
      }

      if (selected.length === 0) {
        throw new Error('El parámetro selected debe incluir al menos un nombre de columna.');
      }
    }

    if (row.length !== headers.length) {
      throw new Error('La cantidad de elementos del registro y de los encabezados debe coincidir.');
    }

    const obj = {};
    headers.forEach((col, i) => {
      if (selected && selected.length && !selected.includes(col)) return;
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

  // --- API de testing ---
  const _test = {
    createJoinSpec,
    createTableSpec,
    joinTablesFullOuter,
    joinTablesLeftOuter,
    joinTablesRightOuter,
    joinTablesInner,
    toRowObject,
    buildKey,
    normalizeKeyValue,
    buildMatrixFromObjectsMap,
    buildMatrixFromObjectsArray,
    flattenMapValues,
  };

  // --- API pública ---
  var api = {
    createJoinSpec,
    createTableSpec,
    joinTablesFullOuter,
    joinTablesLeftOuter,
    joinTablesRightOuter,
    joinTablesInner,
    _test,
  };

  return api;

})()
