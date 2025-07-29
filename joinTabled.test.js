/**
 * Suite de pruebas unitarias para funciones de joins y utilitarios
 * Desarrollada para Google Apps Script
 */

/**
 * Ejecuta todas las pruebas y muestra un resumen con los resultados.
 */
function testAll() {
  const tests = [
    test_toRowObject,
    test_buildKey,
    test_normalizeKeyValue,
    test_flattenMapValues,
    test_buildMatrixFromObjectsArray,
    test_buildMatrixFromObjectsMap,
    test_joinTablesInner,
    test_joinTablesLeftOuter,
    test_joinTablesRightOuter,
    test_joinTablesFullOuter,
  ];

  let total = 0;
  let passed = 0;
  const failedTests = [];

  for (const testFn of tests) {
    try {
      testFn();  // cada función lanza error si falla alguna aserción
      passed++;
    } catch (e) {
      failedTests.push({ name: testFn.name, error: e.message });
    }
    total++;
  }

  Logger.log(`✅ Pruebas completadas: ${passed} de ${total}`);
  if (failedTests.length === 0) {
    Logger.log("🎉 Todas las pruebas pasaron exitosamente.");
  } else {
    Logger.log(`❌ ${failedTests.length} prueba(s) fallaron:`);
    failedTests.forEach(({ name, error }, i) => {
      Logger.log(`  ${i + 1}. ${name}: ${error}`);
    });
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message}\nEsperado: ${expectedStr}\nObtenido: ${actualStr}`);
  }
}

function test_toRowObject() {
  const row = [1, 'John'];
  const headers = ['id', 'name'];
  const prefix = 't';
  const expected = { 't.id': 1, 't.name': 'John' };
  assertEqual(toRowObject(row, headers, prefix), expected, 'toRowObject con prefijo falló');

  const expected2 = { 'id': 1, 'name': 'John' };
  assertEqual(toRowObject(row, headers), expected2, 'toRowObject sin prefijo falló');

  try {
    toRowObject('notArray', headers);
    throw new Error('toRowObject no lanzó error con row no válido');
  } catch (e) {}

  try {
    toRowObject(row, 'notArray');
    throw new Error('toRowObject no lanzó error con headers no válidos');
  } catch (e) {}

  try {
    toRowObject([1], ['id', 'name']);
    throw new Error('toRowObject no lanzó error con longitudes distintas');
  } catch (e) {}
}

function test_buildKey() {
  const row = [1, 'John', new Date('2024-01-01')];
  const headers = ['id', 'name', 'date'];
  const keys = ['name', 'date'];
  const expected = 'JOHN|2024-01-01';
  assertEqual(buildKey(row, headers, keys), expected, 'buildKey falló');
}

function test_normalizeKeyValue() {
  assertEqual(normalizeKeyValue('abc '), 'ABC', 'normalizeKeyValue string falló');
  assertEqual(normalizeKeyValue(new Date('2024-01-01')), '2024-01-01', 'normalizeKeyValue date falló');
  assertEqual(normalizeKeyValue(123), '123', 'normalizeKeyValue number falló');
  assertEqual(normalizeKeyValue(null), '', 'normalizeKeyValue null falló');
}

function test_flattenMapValues() {
  const map = new Map();
  map.set('A', [{ id: 1 }, { id: 2 }]);
  map.set('B', [{ id: 3 }]);
  const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assertEqual(flattenMapValues(map), expected, 'flattenMapValues básico falló');

  try {
    flattenMapValues('notAMap');
    throw new Error('flattenMapValues no lanzó error con argumento inválido');
  } catch (e) {}

  try {
    const badMap = new Map();
    badMap.set('A', 'notArray');
    flattenMapValues(badMap);
    throw new Error('flattenMapValues no lanzó error con valor no arreglo');
  } catch (e) {}

  try {
    const badMap = new Map();
    badMap.set('A', [1, 2]);
    flattenMapValues(badMap);
    throw new Error('flattenMapValues no lanzó error con elementos no objeto');
  } catch (e) {}
}

function test_buildMatrixFromObjectsArray() {
  const array = [{ a: 1, b: 2 }, { a: 3 }];
  const columns = ['a', 'b'];
  const defaults = [0, 0];
  const expected = [[1, 2], [3, 0]];
  assertEqual(buildMatrixFromObjectsArray(array, columns, defaults), expected, 'buildMatrixFromObjectsArray básico falló');

  try {
    buildMatrixFromObjectsArray('notArray', columns, defaults);
    throw new Error('buildMatrixFromObjectsArray no lanzó error con array inválido');
  } catch (e) {}

  try {
    buildMatrixFromObjectsArray(array, columns, [0]);
    throw new Error('buildMatrixFromObjectsArray no lanzó error con longitudes distintas');
  } catch (e) {}
}

function test_buildMatrixFromObjectsMap() {
  const map = new Map();
  map.set('k1', [{ a: 1, b: 2 }]);
  map.set('k2', [{ a: 3 }]);
  const columns = ['a', 'b'];
  const defaults = [0, 0];
  const expected = [[1, 2], [3, 0]];
  assertEqual(buildMatrixFromObjectsMap(map, columns, defaults), expected, 'buildMatrixFromObjectsMap falló');
}

function test_joinTablesInner() {
  const t1 = {
    data: [[1, 'A'], [2, 'B']],
    headers: ['id', 'name'],
    prefix: 't1',
    keys: ['id']
  };
  const t2 = {
    data: [[1, 10], [3, 30]],
    headers: ['id', 'value'],
    prefix: 't2',
    keys: ['id']
  };
  const cols = ['t1.id', 't1.name', 't2.value'];
  const defs = [0, '', 0];
  const expected = [[1, 'A', 10]];
  const result = joinTablesInner([t1, t2], cols, defs);
  assertEqual(result, expected, 'joinTablesInner con match falló');

  const t3 = {
    data: [[5, 'X']],
    headers: ['id', 'name'],
    prefix: 't3',
    keys: ['id']
  };
  const result2 = joinTablesInner([t3, t2], cols, defs);
  assertEqual(result2, [], 'joinTablesInner sin match falló');
}

function test_joinTablesLeftOuter() {
  const t1 = {
    data: [[1, 'A'], [2, 'B']],
    headers: ['id', 'name'],
    prefix: 't1',
    keys: ['id']
  };
  const t2 = {
    data: [[1, 10]],
    headers: ['id', 'value'],
    prefix: 't2',
    keys: ['id']
  };
  const cols = ['t1.id', 't1.name', 't2.value'];
  const defs = [0, '', 0];
  const expected = [[1, 'A', 10], [2, 'B', 0]];
  const result = joinTablesLeftOuter([t1, t2], cols, defs);
  assertEqual(result, expected, 'joinTablesLeftOuter básico falló');
}

function test_joinTablesRightOuter() {
  const t1 = {
    data: [[1, 'A']],
    headers: ['id', 'name'],
    prefix: 't1',
    keys: ['id']
  };
  const t2 = {
    data: [[1, 10], [2, 20]],
    headers: ['id', 'value'],
    prefix: 't2',
    keys: ['id']
  };
  const cols = ['t1.id', 't1.name', 't2.value'];
  const defs = [0, '', 0];
  const expected = [[1, 'A', 10], [0, '', 20]];
  const result = joinTablesRightOuter([t1, t2], cols, defs);
  assertEqual(result, expected, 'joinTablesRightOuter básico falló');
}

function test_joinTablesFullOuter() {
  const t1 = {
    data: [[1, 'A'], [2, 'B']],
    headers: ['id', 'name'],
    prefix: 't1',
    keys: ['id']
  };
  const t2 = {
    data: [[1, 10], [3, 30]],
    headers: ['id', 'value'],
    prefix: 't2',
    keys: ['id']
  };
  const cols = ['t1.id', 't1.name', 't2.value'];
  const defs = [0, '', 0];
  const expected = [[1, 'A', 10], [2, 'B', 0], [0, '', 30]];
  const result = joinTablesFullOuter([t1, t2], cols, defs);
  assertEqual(result, expected, 'joinTablesFullOuter básico falló');
}
