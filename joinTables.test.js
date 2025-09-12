const _runJoinTablesTests = () => {
  const lib = JoinTables._test;

  console.info(`=== JOIN TABLES ===`);

  // --- Tests para flattenMapValues ---

  Utils.describe("flattenMapValues", () => {
    
    Utils.it("debería aplanar correctamente los valores de un Map", () => {
      const map = new Map([
        ["grupo1", [{ id: 1 }, { id: 2 }]],
        ["grupo2", [{ id: 3 }, { id: 4 }]]
      ]);
      
      const result = lib.flattenMapValues(map);
      
      const expected = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería retornar array vacío para Map vacío", () => {
      const map = new Map();
      const result = lib.flattenMapValues(map);
      
      Utils.assertEquals(result, []);
    });

    Utils.it("debería manejar arrays vacíos dentro del Map", () => {
      const map = new Map([
        ["grupo1", []],
        ["grupo2", [{ id: 1 }]],
        ["grupo3", []]
      ]);
      
      const result = lib.flattenMapValues(map);
      
      Utils.assertEquals(result, [{ id: 1 }]);
    });

    Utils.it("debería funcionar con un solo grupo en el Map", () => {
      const map = new Map([["grupo1", [{ name: "A" }, { name: "B" }]]]);
      const result = lib.flattenMapValues(map);

      Utils.assertEquals(result, [{ name: "A" }, { name: "B" }]);
    });

    Utils.it("debería manejar objetos con propiedades complejas", () => {
      const map = new Map([
        ["users", [{ user: { id: 1, name: "Alice" }, roles: ["admin"] }]],
        ["products", [{ product: "item1", price: 100 }]]
      ]);
      
      const result = lib.flattenMapValues(map);
      
      const expected = [
        { user: { id: 1, name: "Alice" }, roles: ["admin"] },
        { product: "item1", price: 100 }
      ];
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería lanzar TypeError cuando el argumento no es Map", () => {
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [{}],
        true,
        "El argumento debe ser una instancia de Map"
      );
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [[]],
        true,
        "El argumento debe ser una instancia de Map"
      );
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        ["string"],
        true,
        "El argumento debe ser una instancia de Map"
      );
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [123],
        true,
        "El argumento debe ser una instancia de Map"
      );
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [null],
        true,
        "El argumento debe ser una instancia de Map"
      );
    });

    Utils.it("debería lanzar TypeError cuando un valor no es array", () => {
      const map = new Map([["clave", "no-es-array"]]);
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [map],
        true,
        'El valor asociado a la clave "clave" no es un arreglo'
      );
    });

    Utils.it("debería lanzar TypeError cuando un elemento no es objeto", () => {
      const map = new Map([["grupo", ["string", { obj: true }]]]);
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [map],
        true,
        'Uno de los elementos del arreglo asociado a la clave "grupo" no es un objeto'
      );
    });

    Utils.it("debería lanzar TypeError cuando un elemento es array", () => {
      const map = new Map([["grupo", [[1, 2, 3]]]]);
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [map],
        true,
        'Uno de los elementos del arreglo asociado a la clave "grupo" no es un objeto'
      );
    });

    Utils.it("debería lanzar TypeError cuando un elemento es null", () => {
      const map = new Map([["grupo", [null, { valid: true }]]]);
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [map],
        true,
        'Uno de los elementos del arreglo asociado a la clave "grupo" no es un objeto'
      );
    });

    Utils.it("debería detectar el primer error encontrado", () => {
      const map = new Map([
        ["grupo1", "no-array"], 
        ["grupo2", [123]]       
      ]);
      
      Utils.assertFunctionParams(
        lib.flattenMapValues,
        [map],
        true,
        'El valor asociado a la clave "grupo1" no es un arreglo'
      );
    });

    Utils.it("debería mantener el orden de los elementos según el Map", () => {
      const map = new Map([
        ["first", [{ order: 1 }, { order: 2 }]],
        ["second", [{ order: 3 }]],
        ["third", [{ order: 4 }, { order: 5 }]]
      ]);
      
      const result = lib.flattenMapValues(map);
      
      const expectedOrders = [1, 2, 3, 4, 5];
      result.forEach((item, index) => {
        Utils.assertEquals(item.order, expectedOrders[index]);
      });
    });

  });

  // --- Tests para buildMatrixFromObjectsArray ---

  Utils.describe("buildMatrixFromObjectsArray", () => {
    
    Utils.it("debería convertir array de objetos a matriz correctamente", () => {
      const array = [
        { id: 1, name: "Alice", age: 25 },
        { id: 2, name: "Bob", age: 30 }
      ];
      const outputColumns = ["id", "name", "age"];
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      const expected = [
        [1, "Alice", 25],
        [2, "Bob", 30]
      ];
      Utils.assertEquals(result, expected);
    });
    
    Utils.it("debería usar valores por defecto cuando propiedades faltan", () => {
      const array = [
        { id: 1, name: "Alice" }, 
        { id: 2, age: 30 }        
      ];
      const outputColumns = ["id", "name", "age"];
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      const expected = [
        [1, "Alice", 0],
        [2, "Unknown", 30]
      ];
      Utils.assertEquals(result, expected);
    });
    
    Utils.it("debería manejar valores null y undefined correctamente", () => {
      const array = [
        { id: 1, name: null, age: undefined },
        { id: 2, name: "Bob", age: 30 }
      ];
      const outputColumns = ["id", "name", "age"];
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      const expected = [
        [1, "Unknown", 0], 
        [2, "Bob", 30]
      ];
      Utils.assertEquals(result, expected);
    });
    
    Utils.it("debería retornar array vacío cuando input está vacío", () => {
      const array = [];
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      Utils.assertEquals(result, []);
    });
    
    Utils.it("debería lanzar error cuando array no es un array", () => {
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsArray,
        ["no-es-array", ["id"], [0]],
        true,
        "El parámetro array debe ser un arreglo"
      );
    });
    
    Utils.it("debería lanzar error cuando outputColumns no es un array", () => {
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsArray,
        [[], "no-es-array", [0]],
        true,
        "El parámetro outputColumns debe ser un arreglo"
      );
    });
    
    Utils.it("debería lanzar error cuando columnDefaults no es un array", () => {
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsArray,
        [[], ["id"], "no-es-array"],
        true,
        "El parámetro columnDefaults debe ser un arreglo"
      );
    });
    
    Utils.it("debería lanzar error cuando outputColumns y columnDefaults tienen longitudes diferentes", () => {
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsArray,
        [[], ["id", "name"], [0]],
        true,
        "Las longitudes de outputColumns y columnDefaults deben coincidir"
      );
    });
    
    Utils.it("debería lanzar error cuando array contiene elementos no objetos", () => {
      const array = [1, "string", true];
      
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsArray,
        [array, ["id"], [0]],
        true,
        "El parámetro array sólo debe contener objetos"
      );
    });
    
    Utils.it("debería funcionar con objetos vacíos usando defaults", () => {
      const array = [{}];
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      Utils.assertEquals(result, [[0, "Unknown"]]);
    });
    
    Utils.it("debería ignorar propiedades no especificadas en outputColumns", () => {
      const array = [
        { id: 1, name: "Alice", extra: "ignorado", otro: "también" }
      ];
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      Utils.assertEquals(result, [[1, "Alice"]]);
    });
    
    Utils.it("debería respetar el orden de outputColumns", () => {
      const array = [
        { id: 1, name: "Alice", age: 25 }
      ];
      const outputColumns = ["age", "name", "id"]; 
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      Utils.assertEquals(result, [[25, "Alice", 1]]);
    });
    
    Utils.it("debería manejar diferentes tipos de datos correctamente", () => {
      const array = [
        { 
          string: "texto", 
          number: 42, 
          boolean: true, 
          array: [1, 2, 3], 
          object: { key: "value" },
          nullValue: null
        }
      ];
      const outputColumns = ["string", "number", "boolean", "array", "object", "nullValue"];
      const columnDefaults = ["default", 0, false, [], {}, null];
      
      const result = lib.buildMatrixFromObjectsArray(array, outputColumns, columnDefaults);
      
      const expected = [
        ["texto", 42, true, [1, 2, 3], { key: "value" }, null]
      ];
      Utils.assertEquals(JSON.stringify(result), JSON.stringify(expected));
    });

  });

  // --- Tests para buildMatrixFromObjectsMap ---

  Utils.describe("buildMatrixFromObjectsMap", () => {
    
    Utils.it("debería convertir Map de objetos a matriz correctamente", () => {
      const map = new Map([
        ["grupo1", [{ id: 1, name: "Alice", age: 25 }]],
        ["grupo2", [{ id: 2, name: "Bob", age: 30 }]]
      ]);
      const outputColumns = ["id", "name", "age"];
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      const expected = [
        [1, "Alice", 25],
        [2, "Bob", 30]
      ];
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería manejar múltiples objetos por grupo en el Map", () => {
      const map = new Map([
        ["grupo1", [
          { id: 1, name: "Alice", age: 25 },
          { id: 2, name: "Charlie", age: 28 }
        ]],
        ["grupo2", [
          { id: 3, name: "Bob", age: 30 }
        ]]
      ]);
      const outputColumns = ["id", "name", "age"];
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      const expected = [
        [1, "Alice", 25],
        [2, "Charlie", 28],
        [3, "Bob", 30]
      ];
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería usar valores por defecto cuando propiedades faltan", () => {
      const map = new Map([
        ["grupo1", [
          { id: 1, name: "Alice" }, 
          { id: 2, age: 30 }        
        ]]
      ]);
      const outputColumns = ["id", "name", "age"];
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      const expected = [
        [1, "Alice", 0],
        [2, "Unknown", 30]
      ];
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería retornar array vacío para Map vacío", () => {
      const map = new Map();
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      Utils.assertEquals(result, []);
    });

    Utils.it("debería manejar arrays vacíos dentro del Map", () => {
      const map = new Map([
        ["grupo1", []],
        ["grupo2", [{ id: 1, name: "Test" }]],
        ["grupo3", []]
      ]);
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      const expected = [[1, "Test"]];
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería mantener el orden de los elementos según el Map", () => {
      const map = new Map([
        ["first", [
          { id: 1, name: "First1" },
          { id: 2, name: "First2" }
        ]],
        ["second", [
          { id: 3, name: "Second" }
        ]],
        ["third", [
          { id: 4, name: "Third1" },
          { id: 5, name: "Third2" }
        ]]
      ]);
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      const expectedIds = [1, 2, 3, 4, 5];
      result.forEach((row, index) => {
        Utils.assertEquals(row[0], expectedIds[index]);
      });
    });

    Utils.it("debería propagar errores de flattenMapValues", () => {
      const map = "no-es-map"; 
      const outputColumns = ["id", "name"];
      const columnDefaults = [0, "Unknown"];
      
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsMap,
        [map, outputColumns, columnDefaults],
        true,
        "El argumento debe ser una instancia de Map"
      );
    });

    Utils.it("debería propagar errores de buildMatrixFromObjectsArray", () => {
      const map = new Map([["grupo", [{ id: 1 }]]]);
      const outputColumns = "no-es-array"; 
      const columnDefaults = [0];
      
      Utils.assertFunctionParams(
        lib.buildMatrixFromObjectsMap,
        [map, outputColumns, columnDefaults],
        true,
        "El parámetro outputColumns debe ser un arreglo"
      );
    });

    Utils.it("debería respetar el orden de outputColumns", () => {
      const map = new Map([
        ["grupo", [
          { id: 1, name: "Alice", age: 25 }
        ]]
      ]);
      const outputColumns = ["age", "name", "id"]; 
      const columnDefaults = [0, "Unknown", 0];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      Utils.assertEquals(result, [[25, "Alice", 1]]);
    });

    Utils.it("debería manejar objetos con propiedades complejas", () => {
      const map = new Map([
        ["users", [
          { user: "Alice", data: { age: 25, city: "NY" } }
        ]],
        ["products", [
          { product: "Item1", details: { price: 100, stock: 50 } }
        ]]
      ]);
      const outputColumns = ["user", "product"];
      const columnDefaults = ["Unknown", "NoProduct"];
      
      const result = lib.buildMatrixFromObjectsMap(map, outputColumns, columnDefaults);
      
      const expected = [
        ["Alice", "NoProduct"],
        ["Unknown", "Item1"]
      ];
      Utils.assertEquals(result, expected);
    });

  });

  // --- Tests para normalizeKeyValue ---

  Utils.describe("normalizeKeyValue", () => {
    
    Utils.it("debería convertir Date a ISO string (YYYY-MM-DD)", () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = lib.normalizeKeyValue(date);
      
      Utils.assertEquals(result, "2023-12-25");
    });

    Utils.it("debería manejar diferentes fechas correctamente", () => {
      const date1 = new Date('2024-01-01T00:00:00Z');
      const date2 = new Date('1999-12-31T23:59:59Z');
      
      Utils.assertEquals(lib.normalizeKeyValue(date1), "2024-01-01");
      Utils.assertEquals(lib.normalizeKeyValue(date2), "1999-12-31");
    });

    Utils.it("debería convertir strings a mayúsculas y trim", () => {
      Utils.assertEquals(lib.normalizeKeyValue("hello"), "HELLO");
      Utils.assertEquals(lib.normalizeKeyValue("  world  "), "WORLD");
      Utils.assertEquals(lib.normalizeKeyValue("MixED CaSe"), "MIXED CASE");
      Utils.assertEquals(lib.normalizeKeyValue(""), "");
    });

    Utils.it("debería convertir null y undefined a string vacío", () => {
      Utils.assertEquals(lib.normalizeKeyValue(null), "");
      Utils.assertEquals(lib.normalizeKeyValue(undefined), "");
    });

    Utils.it("debería convertir números a string", () => {
      Utils.assertEquals(lib.normalizeKeyValue(123), "123");
      Utils.assertEquals(lib.normalizeKeyValue(0), "0");
      Utils.assertEquals(lib.normalizeKeyValue(-45.67), "-45.67");
      Utils.assertEquals(lib.normalizeKeyValue(3.14159), "3.14159");
    });

    Utils.it("debería convertir booleanos a string", () => {
      Utils.assertEquals(lib.normalizeKeyValue(true), "true");
      Utils.assertEquals(lib.normalizeKeyValue(false), "false");
    });

    Utils.it("debería convertir arrays a string", () => {
      Utils.assertEquals(lib.normalizeKeyValue([1, 2, 3]), "1,2,3");
      Utils.assertEquals(lib.normalizeKeyValue(["a", "b"]), "a,b");
      Utils.assertEquals(lib.normalizeKeyValue([]), "");
    });

    Utils.it("debería convertir objetos a string", () => {
      Utils.assertEquals(lib.normalizeKeyValue({ key: "value" }), "[object Object]");
      Utils.assertEquals(lib.normalizeKeyValue({}), "[object Object]");
    });

    Utils.it("debería manejar valores especiales correctamente", () => {
      Utils.assertEquals(lib.normalizeKeyValue(NaN), "NaN");
      Utils.assertEquals(lib.normalizeKeyValue(Infinity), "Infinity");
      Utils.assertEquals(lib.normalizeKeyValue(-Infinity), "-Infinity");
    });

    Utils.it("debería manejar strings numéricos correctamente", () => {
      Utils.assertEquals(lib.normalizeKeyValue("123"), "123");
      Utils.assertEquals(lib.normalizeKeyValue("  45.67  "), "45.67");
    });

    Utils.it("debería manejar caracteres especiales en strings", () => {
      Utils.assertEquals(lib.normalizeKeyValue("áéíóú"), "ÁÉÍÓÚ");
      Utils.assertEquals(lib.normalizeKeyValue("ñÑ"), "ÑÑ");
      Utils.assertEquals(lib.normalizeKeyValue("ç@#$%"), "Ç@#$%");
    });

    Utils.it("debería usar UTC para fechas", () => {
      const date = new Date(Date.UTC(2023, 11, 25)); // 25 de diciembre 2023 UTC
      const result = lib.normalizeKeyValue(date);
      
      Utils.assertEquals(result, "2023-12-25");
    });

    Utils.it("debería manejar edge cases de strings", () => {
      Utils.assertEquals(lib.normalizeKeyValue("   "), ""); 
      Utils.assertEquals(lib.normalizeKeyValue("\t\n\r"), ""); 
      Utils.assertEquals(lib.normalizeKeyValue("  test  "), "TEST"); 
    });

    Utils.it("debería siempre retornar string", () => {
      const testValues = [
        new Date(),
        "hello",
        123,
        true,
        null,
        undefined,
        [1, 2, 3],
        { key: "value" }
      ];
      
      testValues.forEach(value => {
        const result = lib.normalizeKeyValue(value);
        Utils.assertEquals(typeof result, "string");
      });
    });

  });

  // Tests para buildKey

  Utils.describe("buildKey", () => {
    
    Utils.it("debería construir key compuesta correctamente", () => {
      const row = [1, "Juan", new Date('2023-12-25')];
      const headers = ["id", "nombre", "fecha"];
      const keys = ["fecha", "nombre"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "2023-12-25|JUAN");
    });

    Utils.it("debería funcionar con un solo key", () => {
      const row = [1, "Juan", 30];
      const headers = ["id", "nombre", "edad"];
      const keys = ["nombre"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "JUAN");
    });

    Utils.it("debería funcionar con múltiples keys", () => {
      const row = [1, "Juan", "Pérez", 30];
      const headers = ["id", "nombre", "apellido", "edad"];
      const keys = ["nombre", "apellido", "edad"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "JUAN|PÉREZ|30");
    });

    Utils.it("debería respetar el orden de los keys especificados", () => {
      const row = [1, "Juan", "Pérez"];
      const headers = ["id", "nombre", "apellido"];
      const keys = ["apellido", "nombre"]; 
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "PÉREZ|JUAN");
    });

    Utils.it("debería manejar valores null/undefined correctamente", () => {
      const row = [null, undefined, "valor"];
      const headers = ["col1", "col2", "col3"];
      const keys = ["col1", "col2", "col3"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "||VALOR");
    });

    Utils.it("debería usar string vacío para keys que no existen", () => {
      const row = [1, "Juan"];
      const headers = ["id", "nombre"];
      const keys = ["id", "apellido", "edad"]; 
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "1||");
    });

    Utils.it("debería retornar string vacío para array vacío de keys", () => {
      const row = [1, "Juan"];
      const headers = ["id", "nombre"];
      const keys = [];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "");
    });

    Utils.it("debería normalizar diferentes tipos de datos", () => {
      const row = [
        123,
        "  texto  ",
        new Date('2023-12-25T10:30:00Z'),
        true,
        null
      ];
      const headers = ["numero", "texto", "fecha", "booleano", "nulo"];
      const keys = ["numero", "texto", "fecha", "booleano", "nulo"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "123|TEXTO|2023-12-25|true|");
    });

    Utils.it("debería manejar headers vacíos correctamente", () => {
      const row = [];
      const headers = [];
      const keys = ["key1", "key2"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "|");
    });

    Utils.it("debería manejar rows más cortos que headers", () => {
      const row = [1, "Juan"]; 
      const headers = ["id", "nombre", "apellido", "edad"]; 
      const keys = ["id", "apellido"]; 
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "1|");
    });

    Utils.it("debería aplicar normalizeKeyValue a todos los valores", () => {
      const row = ["  juan  ", "pérez  "];
      const headers = ["nombre", "apellido"];
      const keys = ["nombre", "apellido"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "JUAN|PÉREZ");
    });

    Utils.it("debería normalizar fechas correctamente", () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const row = [date, "Juan"];
      const headers = ["fecha", "nombre"];
      const keys = ["fecha", "nombre"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "2023-12-25|JUAN");
    });

    Utils.it("debería manejar valores booleanos correctamente", () => {
      const row = [true, false, "texto"];
      const headers = ["verdadero", "falso", "texto"];
      const keys = ["verdadero", "falso", "texto"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "true|false|TEXTO");
    });

    Utils.it("debería manejar números y strings numéricos", () => {
      const row = [123, "456", 7.89];
      const headers = ["num1", "num2", "num3"];
      const keys = ["num1", "num2", "num3"];
      
      const result = lib.buildKey(row, headers, keys);
      
      Utils.assertEquals(result, "123|456|7.89");
    });

  });

  // Tests para toRowObject

  Utils.describe("toRowObject - Nueva versión con parámetro selected", () => {
    
    Utils.it("debería convertir array a objeto correctamente", () => {
      const row = [1, "Juan", 30, "IT"];
      const headers = ["id", "nombre", "edad", "departamento"];
      
      const result = lib.toRowObject(row, headers);
      
      const expected = { id: 1, nombre: "Juan", edad: 30, departamento: "IT" };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería incluir solo campos especificados en selected", () => {
      const row = [1, "Juan", 30, "IT"];
      const headers = ["id", "nombre", "edad", "departamento"];
      const selected = ["id", "nombre"]; 
      
      const result = lib.toRowObject(row, headers, selected);
      
      const expected = { id: 1, nombre: "Juan" };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería incluir solo campos seleccionados con prefix", () => {
      const row = [1, "Juan", 30, "IT"];
      const headers = ["id", "nombre", "edad", "departamento"];
      const selected = ["id", "nombre"];
      const prefix = "user";
      
      const result = lib.toRowObject(row, headers, selected, prefix);
      
      const expected = { "user.id": 1, "user.nombre": "Juan" };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería respetar el orden de los headers, no de selected", () => {
      const row = [1, "Juan", 30, "IT"];
      const headers = ["id", "nombre", "edad", "departamento"];
      const selected = ["nombre", "id"]; 
      
      const result = lib.toRowObject(row, headers, selected);
      
      const expected = { id: 1, nombre: "Juan" }; 
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería ignorar campos de selected que no existen en headers", () => {
      const row = [1, "Juan", 30];
      const headers = ["id", "nombre", "edad"];
      const selected = ["id", "inexistente", "nombre"]; 
      
      const result = lib.toRowObject(row, headers, selected);
      
      const expected = { id: 1, nombre: "Juan" };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería lanzar error si selected está vacío", () => {
      const row = [1, "Juan"];
      const headers = ["id", "nombre"];
      
      Utils.assertFunctionParams(
        lib.toRowObject,
        [row, headers, []],
        true,
        "El parámetro selected debe incluir al menos un nombre de columna"
      );
    });

    Utils.it("debería lanzar error si selected no es array", () => {
      const row = [1, "Juan"];
      const headers = ["id", "nombre"];
      
      Utils.assertFunctionParams(
        lib.toRowObject,
        [row, headers, "no-es-array"],
        true,
        "El parámetro selected debe ser de tipo Array"
      );
      
      Utils.assertFunctionParams(
        lib.toRowObject,
        [row, headers, 123],
        true,
        "El parámetro selected debe ser de tipo Array"
      );
      
      Utils.assertFunctionParams(
        lib.toRowObject,
        [row, headers, {}],
        true,
        "El parámetro selected debe ser de tipo Array"
      );
    });

    Utils.it("debería incluir todos los campos cuando selected no se provee", () => {
      const row = [1, "Juan", 30];
      const headers = ["id", "nombre", "edad"];
      
      const result = lib.toRowObject(row, headers);
      
      const expected = { id: 1, nombre: "Juan", edad: 30 };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería comportarse como selected no provisto con undefined/null", () => {
      const row = [1, "Juan", 30];
      const headers = ["id", "nombre", "edad"];
      
      const result1 = lib.toRowObject(row, headers, undefined);
      const result2 = lib.toRowObject(row, headers, null);
      
      const expected = { id: 1, nombre: "Juan", edad: 30 };
      Utils.assertEquals(result1, expected);
      Utils.assertEquals(result2, expected);
    });

    Utils.it("debería aplicar prefix a todos los campos cuando no hay selected", () => {
      const row = [1, "Juan", 30];
      const headers = ["id", "nombre", "edad"];
      const prefix = "user";
      
      const result = lib.toRowObject(row, headers, undefined, prefix);
      
      const expected = { "user.id": 1, "user.nombre": "Juan", "user.edad": 30 };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería retornar objeto vacío con arrays vacíos", () => {
      const result = lib.toRowObject([], []);
      Utils.assertEquals(result, {});
    });

    Utils.it("debería retornar objeto vacío con arrays vacíos y selected", () => {
      const result = lib.toRowObject([], [], ["campo"]);
      Utils.assertEquals(result, {});
    });

    Utils.it("debería manejar diferentes tipos de valores con selected", () => {
      const row = [1, "texto", true, null, undefined, { key: "value" }];
      const headers = ["numero", "string", "booleano", "nulo", "indefinido", "objeto"];
      const selected = ["numero", "string", "objeto"];
      
      const result = lib.toRowObject(row, headers, selected);
      
      const expected = {
        numero: 1,
        string: "texto",
        objeto: { key: "value" }
      };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería manejar headers con puntos en selected", () => {
      const row = [1, "Juan"];
      const headers = ["user.id", "user.name"];
      const selected = ["user.id", "user.name"];
      const prefix = "data";
      
      const result = lib.toRowObject(row, headers, selected, prefix);
      
      const expected = { 
        "data.user.id": 1, 
        "data.user.name": "Juan" 
      };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería manejar duplicados en selected (último valor prevalece)", () => {
      const row = [1, "Juan", 30];
      const headers = ["id", "nombre", "edad"];
      const selected = ["id", "id", "nombre"]; 
      
      const result = lib.toRowObject(row, headers, selected);
      
      const expected = { id: 1, nombre: "Juan" }; 
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería mantener validaciones existentes", () => {
      Utils.assertFunctionParams(
        lib.toRowObject,
        ["no-array", ["id"], ["id"]],
        true,
        "El parámetro row debe ser de tipo Array"
      );
      
      Utils.assertFunctionParams(
        lib.toRowObject,
        [[1], "no-array", ["id"]],
        true,
        "El parámetro headers debe ser de tipo Array"
      );
      
      Utils.assertFunctionParams(
        lib.toRowObject,
        [[1, 2], ["id"], ["id"]],
        true,
        "La cantidad de elementos del registro y de los encabezados debe coincidir"
      );
    });

    Utils.it("debería integrarse correctamente con joinTablesInner", () => {
      const usersTable = lib.createTableSpec(
        "users", 
        ["id", "name", "department"], 
        [[1, "Juan", "IT"]]
      );

      const projectsTable = lib.createTableSpec(
        "projects",
        ["project_id", "user_id", "project_name"],
        [[101, 1, "Sistema A"]]
      );
      
      const joinConfig = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["id", "name"], right: ["project_name"] }, 
        "user_projects"
      );
      
      const result = lib.joinTablesInner([usersTable, projectsTable], [joinConfig]);
      
      const expected = [[1, "Juan", "Sistema A"]];
      Utils.assertEquals(result, expected);
    });

  });

  // Tests para createTableSpec
  
  Utils.describe("createTableSpec", () => {
    
    Utils.it("debería crear especificación de tabla correctamente", () => {
      const name = "users";
      const headers = ["id", "name", "email"];
      const data = [[1, "Juan", "juan@email.com"]];
      
      const result = lib.createTableSpec(name, headers, data);
      
      const expected = { name, headers, data };
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería lanzar error por nombre inválido", () => {
      Utils.assertFunctionParams(
        lib.createTableSpec,
        ["", ["id"], [[1]]],
        true,
        "El parámetro 'name' no es un nombre válido"
      );
      
      Utils.assertFunctionParams(
        lib.createTableSpec,
        [123, ["id"], [[1]]],
        true,
        "El parámetro 'name' no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error por headers inválidos", () => {
      Utils.assertFunctionParams(
        lib.createTableSpec,
        ["users", "no-array", [[1]]],
        true,
        "El parámetro 'headers' no es un arreglo válido"
      );
      
      Utils.assertFunctionParams(
        lib.createTableSpec,
        ["users", [123], [[1]]],
        true,
        "no es un nombre válido"
      );
      
      Utils.assertFunctionParams(
        lib.createTableSpec,
        ["users", [""], [[1]]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error por data inválido", () => {
      Utils.assertFunctionParams(
        lib.createTableSpec,
        ["users", ["id"], "no-array"],
        true,
        "El parámetro 'data' no es un arreglo válido"
      );
      
      Utils.assertFunctionParams(
        lib.createTableSpec,
        ["users", ["id"], [["ok"], "no-array"]],
        true,
        "El parámetro 'data' no es un arreglo válido"
      );
    });

    Utils.it("debería permitir data vacío", () => {
      const result = lib.createTableSpec("empty", ["id"], []);
      Utils.assertEquals(result, { name: "empty", headers: ["id"], data: [] });
    });

  });

  // Tests para createJoinSpec
  
  Utils.describe("createJoinSpec", () => {
    
    Utils.it("debería crear especificación de join correctamente", () => {
      const result = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects"
      );
      
      const expected = {
        left: {
          table: "users",
          joinedFields: ["id"],
          selectedFields: ["name"]
        },
        right: {
          table: "projects",
          joinedFields: ["user_id"],
          selectedFields: ["project_name"]
        },
        alias: "user_projects",
        fieldsOrder: ["name", "project_name"],
        defaultValues: [null, null],
        postProcessor: null
      };
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería aceptar fieldsOrder y defaultValues personalizados", () => {
      const result = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["project_name", "name"], 
        ["No Project", "Unknown"] 
      );
      
      Utils.assertEquals(result.fieldsOrder, ["project_name", "name"]);
      Utils.assertEquals(result.defaultValues, ["No Project", "Unknown"]);
    });

    Utils.it("debería aceptar postProcessor function", () => {
      const processor = () => {};
      const result = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        null,
        null,
        processor
      );
      
      Utils.assertEquals(result.postProcessor, processor);
    });

    Utils.it("debería lanzar error por parámetros requeridos inválidos", () => {
      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias"],
        true,
        "El parámetro 'leftTable' no es un nombre válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias"],
        true,
        "El parámetro 'rightTable' no es un nombre válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, ""],
        true,
        "El parámetro 'alias' no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error por joinFields inválido", () => {
      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", "no-object", { left: ["name"], right: ["project_name"] }, "alias"],
        true,
        "El parámetro 'joinFields' no es un objeto válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: "no-array", right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias"],
        true,
        "La propiedad 'left' del parámetro 'joinFields' no es un arreglo válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: [""], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias"],
        true,
        "El elemento 0 de la propiedad 'left' del parámetro 'joinFields' no es un nombre válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id", "id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias"],
        true,
        "La propiedad 'left' del parámetro 'joinFields' contiene nombres repetidos"
      );
    });

    Utils.it("debería lanzar error por selectFields inválido", () => {
      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, "no-object", "alias"],
        true,
        "El parámetro 'selectFields' no es un objeto válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["name"] }, "alias"],
        true,
        "contienen nombres en común"
      );
    });

    Utils.it("debería lanzar error por fieldsOrder/defaultValues inválidos", () => {
      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias", "no-array"],
        true,
        "El parámetro 'fieldsOrder' no es un arreglo válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias", null, "no-array"],
        true,
        "El parámetro 'defaultValues' no es un arreglo válido"
      );

      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias", ["field1"], ["def1", "def2"]],
        true,
        "no tienen la misma cantidad de elementos"
      );
    });

    Utils.it("debería lanzar error por postProcessor inválido", () => {
      Utils.assertFunctionParams(
        lib.createJoinSpec,
        ["users", "projects", { left: ["id"], right: ["user_id"] }, { left: ["name"], right: ["project_name"] }, "alias", null, null, "no-function"],
        true,
        "El parámetro 'postProcessor' no es una función válida"
      );
    });

    Utils.it("debería manejar campos compuestos en joinFields", () => {
      const result = lib.createJoinSpec(
        "table1",
        "table2",
        { left: ["id", "type"], right: ["ref_id", "ref_type"] },
        { left: ["value"], right: ["description"] },
        "joined_data"
      );
      
      Utils.assertEquals(result.left.joinedFields, ["id", "type"]);
      Utils.assertEquals(result.right.joinedFields, ["ref_id", "ref_type"]);
    });

    Utils.it("debería manejar múltiples campos seleccionados", () => {
      const result = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["id", "name", "email"], right: ["project_id", "project_name"] },
        "user_projects"
      );
      
      Utils.assertEquals(result.fieldsOrder, ["id", "name", "email", "project_id", "project_name"]);
      Utils.assertEquals(result.defaultValues.length, 5);
    });

    Utils.it("debería integrarse con joinTablesInner", () => {
      const usersTable = lib.createTableSpec("users", 
        ["id", "name"], 
        [[1, "Juan"], [2, "Maria"]]
      );
      
      const projectsTable = lib.createTableSpec("projects",
        ["project_id", "user_id", "project_name"],
        [[101, 1, "Proyecto A"], [102, 2, "Proyecto B"]]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects"
      );
      
      const result = lib.joinTablesInner([usersTable, projectsTable], [joinSpec]);
      
      const expected = [["Juan", "Proyecto A"], ["Maria", "Proyecto B"]];
      Utils.assertEquals(result, expected);
    });

  });

  // --- Tests para joinTablesInner ---

  
  Utils.describe("joinTablesInner", () => {
    
    const usersTable = lib.createTableSpec("users", 
      ["id", "name", "department"], 
      [
        [1, "Juan", "IT"],
        [2, "Maria", "HR"],
        [3, "Pedro", "Sales"]
      ]
    );

    const projectsTable = lib.createTableSpec("projects",
      ["project_id", "user_id", "project_name", "budget"],
      [
        [101, 1, "Sistema A", 50000],
        [102, 1, "Sistema B", 75000],
        [103, 2, "Portal HR", 30000]
      ]
    );

    const departmentsTable = lib.createTableSpec("departments",
      ["dept_code", "dept_name", "manager"],
      [
        ["IT", "Tecnología", "Carlos"],
        ["HR", "Recursos Humanos", "Ana"],
        ["Sales", "Ventas", "Luis"]
      ]
    );

    Utils.it("debería hacer join de dos tablas correctamente", () => {
      const tables = [usersTable, projectsTable];
      
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["id", "name"], right: ["project_name", "budget"] },
        "user_projects"
      );
      
      const result = lib.joinTablesInner(tables, [join1]);
      
      const expected = [
        [1, "Juan", "Sistema A", 50000],
        [1, "Juan", "Sistema B", 75000],
        [2, "Maria", "Portal HR", 30000]
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer join de tres tablas en cadena", () => {
      const tables = [usersTable, projectsTable, departmentsTable];
      
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["id", "name", "department"], right: ["project_name", "budget"] },
        "user_projects"
      );
      
      const join2 = lib.createJoinSpec(
        "user_projects",
        "departments",
        { left: ["department"], right: ["dept_code"] },
        { left: ["id", "name", "project_name", "budget"], right: ["dept_name", "manager"] },
        "final_result"
      );
      
      const result = lib.joinTablesInner(tables, [join1, join2]);
      
      const expected = [
        [1, "Juan", "Sistema A", 50000, "Tecnología", "Carlos"],
        [1, "Juan", "Sistema B", 75000, "Tecnología", "Carlos"],
        [2, "Maria", "Portal HR", 30000, "Recursos Humanos", "Ana"]
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería aplicar post-processor correctamente", () => {
      let processedCount = 0;
      const customProcessor = (row) => {
        processedCount++;
        row.processed = true;
      };
      
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["id", "name"], right: ["project_name"] },
        "user_projects",
        undefined,
        undefined,
        customProcessor
      );
      
      const result = lib.joinTablesInner([usersTable, projectsTable], [join1]);
      
      Utils.assertEquals(processedCount, 3); 
      Utils.assertEquals(result.length, 3);
    });

    Utils.it("debería seleccionar solo campos especificados", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] }, 
        "user_projects"
      );
      
      const result = lib.joinTablesInner([usersTable, projectsTable], [join1]);
      
      const expected = [
        ["Juan", "Sistema A"],
        ["Juan", "Sistema B"],
        ["Maria", "Portal HR"]
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería manejar joins compuestos con múltiples campos", () => {
      const complexTable1 = lib.createTableSpec("table1",
        ["id", "type", "value"],
        [
          [1, "A", 100],
          [1, "B", 200]
        ]
      );
      
      const complexTable2 = lib.createTableSpec("table2",
        ["id", "type", "description"],
        [
          [1, "A", "Descripción A"],
          [1, "B", "Descripción B"]
        ]
      );
      
      const join1 = lib.createJoinSpec(
        "table1",
        "table2",
        { left: ["id", "type"], right: ["id", "type"] }, 
        { left: ["value"], right: ["description"] },
        "joined_data"
      );
      
      const result = lib.joinTablesInner([complexTable1, complexTable2], [join1]);
      
      const expected = [
        [100, "Descripción A"],
        [200, "Descripción B"]
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería lanzar error por tabla inexistente", () => {
      const invalidJoin = lib.createJoinSpec(
        "tabla_inexistente",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "result"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[usersTable, projectsTable], [invalidJoin]],
        true,
        "no corresponde al nombre de una tabla"
      );
    });

    Utils.it("debería lanzar error por campo inexistente", () => {
      const invalidJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["campo_inexistente"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "result"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[usersTable, projectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error por join sin selectedFields", () => {
      const invalidJoin = {
        left: { table: "users", joinedFields: ["id"] }, 
        right: { table: "projects", joinedFields: ["user_id"], selectedFields: ["project_name"] },
        alias: "test",
        fieldsOrder: ["name", "project_name"],
        defaultValues: [null, null]
      };
      
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[usersTable, projectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido" 
      );
    });

    Utils.it("debería lanzar error por join sin fieldsOrder", () => {
      const invalidJoin = {
        left: { table: "users", joinedFields: ["id"], selectedFields: ["name"] },
        right: { table: "projects", joinedFields: ["user_id"], selectedFields: ["project_name"] },
        alias: "test"
        // Falta fieldsOrder y defaultValues
      };
      
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[usersTable, projectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido" 
      );
    });

    Utils.it("debería usar valores por defecto personalizados", () => {
      const joinWithDefaults = {
        ...lib.createJoinSpec(
          "users",
          "projects",
          { left: ["id"], right: ["user_id"] },
          { left: ["id", "name"], right: ["project_name"] },
          "user_projects"
        ),
        defaultValues: [0, "Unknown", "No Project"]
      };
      
      const usersWithExtra = lib.createTableSpec("users",
        ["id", "name", "department"],
        [
          [1, "Juan", "IT"],
          [4, "Luis", "Finance"] 
        ]
      );
      
      const result = lib.joinTablesInner([usersWithExtra, projectsTable], [joinWithDefaults]);
      
      Utils.assertEquals(result.length, 2);
      Utils.assertTrue(result.every(row => row[0] !== 4));
    });

    Utils.it("debería poder usar alias de joins previos", () => {
      const tables = [usersTable, projectsTable, departmentsTable];
      
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["id", "name", "department"], right: ["project_name"] },
        "user_projects"
      );
      
      const join2 = lib.createJoinSpec(
        "user_projects", 
        "departments",
        { left: ["department"], right: ["dept_code"] },
        { left: ["name", "project_name"], right: ["dept_name"] },
        "final_result"
      );
      
      const result = lib.joinTablesInner(tables, [join1, join2]);
      
      const expected = [
        ["Juan", "Sistema A", "Tecnología"],
        ["Juan", "Sistema B", "Tecnología"],
        ["Maria", "Portal HR", "Recursos Humanos"]
      ];
      
      Utils.assertEquals(result, expected);
    });

  });

  Utils.describe("joinTablesInner - Validación de errores exhaustiva", () => {
    
    const validUsersTable = lib.createTableSpec("users", ["id", "name"], [[1, "Juan"]]);
    const validProjectsTable = lib.createTableSpec("projects", ["user_id", "project_name"], [[1, "Proyecto A"]]);
    const validDepartmentsTable = lib.createTableSpec("departments", ["dept_code", "dept_name"], [["IT", "Tecnología"]]);

    const validJoin = lib.createJoinSpec(
      "users",
      "projects",
      { left: ["id"], right: ["user_id"] },
      { left: ["name"], right: ["project_name"] },
      "user_projects"
    );

    Utils.it("debería lanzar error si 'tables' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
    });

    Utils.it("debería lanzar error si menos de 2 tablas", () => {
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable], [validJoin]],
        true,
        "La cantidad de tablas es incorrecta"
      );
    });

    Utils.it("debería lanzar error si elemento de tables no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [["no-objeto", validProjectsTable], [validJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si name de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, name: "" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si data de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, data: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si headers de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si header individual no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: ["id", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un título válido"
      );
    });

    Utils.it("debería lanzar error si 'joins' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], "no-array"],
        true,
        "El parámetro 'joins' no es válido"
      );
    });

    Utils.it("debería lanzar error si cantidad de joins incorrecta", () => {
      const extraJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "extra_join"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [validJoin, extraJoin]],
        true,
        "La cantidad de uniones debe ser igual a la cantidad de tablas menos uno"
      );
    });

    Utils.it("debería lanzar error si elemento de joins no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], ["no-objeto"]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si alias de join no es válido", () => {
      const invalidJoin = { ...validJoin, alias: "" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder no es array", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si elemento de fieldsOrder no es válido", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: ["valid", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si defaultValues no es array", () => {
      const invalidJoin = { ...validJoin, defaultValues: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder y defaultValues tienen length diferente", () => {
      const invalidJoin = { 
        ...validJoin, 
        fieldsOrder: ["field1", "field2"], 
        defaultValues: ["default1"] 
      };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no tienen la misma cantidad de elementos"
      );
    });

    Utils.it("debería lanzar error si postProcessor no es función", () => {
      const invalidJoin = { ...validJoin, postProcessor: "no-function" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es una función válida"
      );
    });

    Utils.it("debería lanzar error si left no es objeto", () => {
      const invalidJoin = { ...validJoin, left: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si left.table no es válido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "" } };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.table no existe", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "tabla_inexistente" } };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no corresponde al nombre de una tabla"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene elemento inválido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["valid", ""] } };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene duplicados", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["name", "name"] } };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contiene nombres repetidos"
      );
    });

    Utils.it("debería lanzar error si left.joinedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, joinedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si right no es objeto", () => {
      const invalidJoin = { ...validJoin, right: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si selectedFields de left y right tienen nombres en común", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["name"] },
        right: { ...validJoin.right, selectedFields: ["name"] } 
      };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contienen nombres en común"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si selectedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla derecha", () => {
      const invalidJoin = {
        ...validJoin,
        right: { ...validJoin.right, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si se referencia alias inexistente en join posterior", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects"
      );
      
      const join2 = lib.createJoinSpec(
        "alias_inexistente", 
        "departments",
        { left: ["dept"], right: ["dept_code"] },
        { left: ["project_name"], right: ["dept_name"] },
        "final_result"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesInner,
        [[validUsersTable, validProjectsTable, validDepartmentsTable], [join1, join2]],
        true,
        "no corresponde al nombre de una tabla ni al alias de una unión previa"
      );
    });

    Utils.it("debería funcionar correctamente con parámetros válidos", () => {
      const result = lib.joinTablesInner(
        [validUsersTable, validProjectsTable], 
        [validJoin]
      );
      
      const expected = [["Juan", "Proyecto A"]];
      Utils.assertEquals(result, expected);
    });

  });

  // --- Tests para joinTablesRightOuter ---

  Utils.describe("joinTablesRightOuter", () => {
    
    const usersTable = lib.createTableSpec("users", 
      ["id", "name", "department"], 
      [
        [1, "Juan", "IT"],
        [2, "Maria", "HR"]
      ]
    );

    const projectsTable = lib.createTableSpec("projects",
      ["project_id", "user_id", "project_name", "status"],
      [
        [101, 1, "Sistema A", "Activo"],
        [102, 3, "Sistema B", "Pendiente"], 
        [103, 2, "Portal HR", "Activo"]
      ]
    );

    const departmentsTable = lib.createTableSpec("departments",
      ["dept_code", "dept_name", "manager"],
      [
        ["IT", "Tecnología", "Carlos"],
        ["HR", "Recursos Humanos", "Ana"],
        ["Finance", "Finanzas", "Luis"] 
      ]
    );

    Utils.it("debería hacer RIGHT OUTER JOIN manteniendo todos los registros de la tabla derecha", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name", "status"] },
        "user_projects",
        ["name", "department", "project_name", "status"],
      );
      
      const result = lib.joinTablesRightOuter([usersTable, projectsTable], [joinSpec]);
      
      const expected = [
        ["Juan", "IT", "Sistema A", "Activo"],
        [null, null, "Sistema B", "Pendiente"], 
        ["Maria", "HR", "Portal HR", "Activo"]
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer RIGHT OUTER JOIN con valores predeterminados personalizados", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name", "status"] },
        "user_projects",
        ["name", "department", "project_name", "status"],
        ["Unknown", "No Dept", "No Project", "No Status"]
      );
      
      const result = lib.joinTablesRightOuter([usersTable, projectsTable], [joinSpec]);
      
      const expected = [
        ["Juan", "IT", "Sistema A", "Activo"],
        ["Unknown", "No Dept", "Sistema B", "Pendiente"], 
        ["Maria", "HR", "Portal HR", "Activo"]
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer RIGHT OUTER JOIN en cadena con múltiples tablas", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name"] },
        "user_projects",
        ["name", "department", "project_name"],
        ["Unknown", "No Dept", "No Project"]
      );
      
      const join2 = lib.createJoinSpec(
        "user_projects",
        "departments",
        { left: ["department"], right: ["dept_code"] },
        { left: ["name", "project_name"], right: ["dept_name", "manager"] },
        "final_result",
        ["name", "project_name", "dept_name", "manager"],
        ["Unknown", "No Project", "No Dept", "No Manager"]
      );
      
      const result = lib.joinTablesRightOuter(
        [usersTable, projectsTable, departmentsTable], 
        [join1, join2]
      );
      
      const expected = [
        ["Juan", "Sistema A", "Tecnología", "Carlos"],
        ["Maria", "Portal HR", "Recursos Humanos", "Ana"],
        ["Unknown", "No Project", "Finanzas", "Luis"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería mantener todos los registros cuando no hay coincidencias", () => {
      const isolatedTable = lib.createTableSpec("isolated",
        ["iso_id", "iso_value"],
        [
          [4, "Aislado 1"],
          [5, "Aislado 2"]
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "isolated",
        { left: ["id"], right: ["iso_id"] },
        { left: ["name"], right: ["iso_value"] },
        "user_isolated",
        ["name", "iso_value"],
        ["No User", "No Value"]
      );
      
      const result = lib.joinTablesRightOuter([usersTable, isolatedTable], [joinSpec]);
      
      Utils.assertEquals(result.length, 2);
      Utils.assertTrue(result.every(row => row[0] === "No User")); 
    });

    Utils.it("debería aplicar postProcessor en RIGHT OUTER JOIN", () => {
      let processedCount = 0;
      const postProcessor = (row) => {
        processedCount++;
        if (!row.name) row.name = "Procesado";
      };
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        [null, "No Project"],
        postProcessor
      );
      
      const result = lib.joinTablesRightOuter([usersTable, projectsTable], [joinSpec]);
      
      Utils.assertEquals(processedCount, 3);
      
      const ghostProject = result.find(row => row[1] === "Sistema B");
      Utils.assertEquals(ghostProject[0], "Procesado");
    });

    Utils.it("debería lanzar los mismos errores de validación que joinTablesInner", () => {
      const validJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["No user", "No Project"],
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
      
      const invalidJoin = {
        left: { table: "users" }, 
        alias: "test"
      };
      
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[usersTable, projectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería manejar tablas vacías correctamente", () => {
      const emptyTable = lib.createTableSpec("empty", ["id"], []);
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "empty",
        { left: ["id"], right: ["id"] },
        { left: ["name"], right: [] },
        "user_empty",
        ["name"],
        ["Unknown"]
      );
      
      const result = lib.joinTablesRightOuter([usersTable, emptyTable], [joinSpec]);
      
      Utils.assertEquals(result, []);
    });

    Utils.it("debería manejar relaciones one-to-many en RIGHT OUTER JOIN", () => {
      const multipleProjectsTable = lib.createTableSpec("multiple_projects",
        ["project_id", "user_id", "project_name"],
        [
          [101, 1, "Proyecto A1"],
          [102, 1, "Proyecto A2"], 
          [103, 3, "Proyecto B"]   
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "multiple_projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      );
      
      const result = lib.joinTablesRightOuter([usersTable, multipleProjectsTable], [joinSpec]);
      
      // Debería tener 3 filas (todos los proyectos)
      Utils.assertEquals(result.length, 3);
      
      // Verificar que el usuario 1 tiene 2 proyectos
      const juanProjects = result.filter(row => row[0] === "Juan");
      Utils.assertEquals(juanProjects.length, 2);
      
      // Verificar que el proyecto sin usuario está presente
      const ghostProject = result.find(row => row[0] === "Unknown");
      Utils.assertTrue(!!ghostProject);
    });

    Utils.it("debería manejar datos grandes sin errores", () => {
      const bigLeftData = Array.from({length: 100}, (_, i) => [i, `User${i}`, `Dept${i % 5}`]);
      const bigRightData = Array.from({length: 150}, (_, i) => [i, i % 120, `Project${i}`]);
      
      const bigLeftTable = lib.createTableSpec("big_left", ["id", "name", "dept"], bigLeftData);
      const bigRightTable = lib.createTableSpec("big_right", ["p_id", "user_id", "p_name"], bigRightData);
      
      const joinSpec = lib.createJoinSpec(
        "big_left",
        "big_right",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["p_name"] },
        "big_join",
        ["name", "p_name"],
        ["No User", "No Project"]
      );
      
      const result = lib.joinTablesRightOuter([bigLeftTable, bigRightTable], [joinSpec]);
      Utils.assertTrue(Array.isArray(result));
      Utils.assertTrue(result.length >= 150); 
    });

    Utils.it("debería manejar campos compuestos en RIGHT OUTER JOIN", () => {
      const complexLeft = lib.createTableSpec("complex_left",
        ["id", "type", "value"],
        [
          [1, "A", 100],
          [2, "B", 200]
        ]
      );
      
      const complexRight = lib.createTableSpec("complex_right",
        ["ref_id", "ref_type", "description"],
        [
          [1, "A", "Descripción A"],
          [1, "B", "Descripción B"], 
          [3, "C", "Descripción C"]  
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "complex_left",
        "complex_right",
        { left: ["id", "type"], right: ["ref_id", "ref_type"] },
        { left: ["value"], right: ["description"] },
        "complex_join",
        ["value", "description"],
        [0, "No Description"]
      );
      
      const result = lib.joinTablesRightOuter([complexLeft, complexRight], [joinSpec]);
      
      const expected = [
        [100, "Descripción A"],
        [0, "Descripción B"], 
        [0, "Descripción C"]  
      ];
      
      Utils.assertEquals(result, expected);
    });

  });

  Utils.describe("joinTablesRightOuter - Validación de errores exhaustiva", () => {
    
    const validUsersTable = lib.createTableSpec("users", ["id", "name"], [[1, "Juan"]]);
    const validProjectsTable = lib.createTableSpec("projects", ["user_id", "project_name"], [[1, "Proyecto A"]]);
    const validDepartmentsTable = lib.createTableSpec("departments", ["dept_code", "dept_name"], [["IT", "Tecnología"]]);

    const validJoin = lib.createJoinSpec(
      "users",
      "projects",
      { left: ["id"], right: ["user_id"] },
      { left: ["name"], right: ["project_name"] },
      "user_projects"
    );

    Utils.it("debería lanzar error si 'tables' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
    });

    Utils.it("debería lanzar error si menos de 2 tablas", () => {
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable], [validJoin]],
        true,
        "La cantidad de tablas es incorrecta"
      );
    });

    Utils.it("debería lanzar error si elemento de tables no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [["no-objeto", validProjectsTable], [validJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si name de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, name: "" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si data de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, data: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si headers de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si header individual no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: ["id", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un título válido"
      );
    });

    Utils.it("debería lanzar error si 'joins' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], "no-array"],
        true,
        "El parámetro 'joins' no es válido"
      );
    });

    Utils.it("debería lanzar error si cantidad de joins incorrecta", () => {
      const extraJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "extra_join"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [validJoin, extraJoin]],
        true,
        "La cantidad de uniones debe ser igual a la cantidad de tablas menos uno"
      );
    });

    Utils.it("debería lanzar error si elemento de joins no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], ["no-objeto"]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si alias de join no es válido", () => {
      const invalidJoin = { ...validJoin, alias: "" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder no es array", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si elemento de fieldsOrder no es válido", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: ["valid", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si defaultValues no es array", () => {
      const invalidJoin = { ...validJoin, defaultValues: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder y defaultValues tienen length diferente", () => {
      const invalidJoin = { 
        ...validJoin, 
        fieldsOrder: ["field1", "field2"], 
        defaultValues: ["default1"] 
      };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no tienen la misma cantidad de elementos"
      );
    });

    Utils.it("debería lanzar error si postProcessor no es función", () => {
      const invalidJoin = { ...validJoin, postProcessor: "no-function" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es una función válida"
      );
    });

    Utils.it("debería lanzar error si left no es objeto", () => {
      const invalidJoin = { ...validJoin, left: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si left.table no es válido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "" } };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.table no existe", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "tabla_inexistente" } };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no corresponde al nombre de una tabla"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene elemento inválido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["valid", ""] } };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene duplicados", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["name", "name"] } };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contiene nombres repetidos"
      );
    });

    Utils.it("debería lanzar error si left.joinedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, joinedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si right no es objeto", () => {
      const invalidJoin = { ...validJoin, right: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si selectedFields de left y right tienen nombres en común", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["name"] },
        right: { ...validJoin.right, selectedFields: ["name"] } 
      };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contienen nombres en común"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si selectedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla derecha", () => {
      const invalidJoin = {
        ...validJoin,
        right: { ...validJoin.right, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si se referencia alias inexistente en join posterior", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects"
      );
      
      const join2 = lib.createJoinSpec(
        "alias_inexistente", 
        "departments",
        { left: ["dept"], right: ["dept_code"] },
        { left: ["project_name"], right: ["dept_name"] },
        "final_result"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesRightOuter,
        [[validUsersTable, validProjectsTable, validDepartmentsTable], [join1, join2]],
        true,
        "no corresponde al nombre de una tabla ni al alias de una unión previa"
      );
    });

    Utils.it("debería funcionar correctamente con parámetros válidos", () => {
      const result = lib.joinTablesRightOuter(
        [validUsersTable, validProjectsTable], 
        [validJoin]
      );
      
      const expected = [["Juan", "Proyecto A"]];
      Utils.assertEquals(result, expected);
    });

  });

  // --- Tests para joinTablesLeftOuter ---

  Utils.describe("joinTablesLeftOuter", () => {
    
    const usersTable = lib.createTableSpec("users", 
      ["id", "name", "department"], 
      [
        [1, "Juan", "IT"],
        [2, "Maria", "HR"],
        [3, "Pedro", "Sales"] 
      ]
    );

    const projectsTable = lib.createTableSpec("projects",
      ["project_id", "user_id", "project_name", "status"],
      [
        [101, 1, "Sistema A", "Activo"],
        [102, 1, "Sistema B", "Pendiente"], 
        [103, 2, "Portal HR", "Activo"]
        // No hay proyectos para Pedro (id: 3)
      ]
    );

    const departmentsTable = lib.createTableSpec("departments",
      ["dept_code", "dept_name", "manager"],
      [
        ["IT", "Tecnología", "Carlos"],
        ["HR", "Recursos Humanos", "Ana"],
        ["Sales", "Ventas", "Luis"]
      ]
    );

    Utils.it("debería hacer LEFT OUTER JOIN manteniendo todos los registros de la tabla izquierda", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name", "status"] },
        "user_projects",
        ["name", "department", "project_name", "status"],
      );
      
      const result = lib.joinTablesLeftOuter([usersTable, projectsTable], [joinSpec]);
      
      const expected = [
        ["Juan", "IT", "Sistema A", "Activo"],
        ["Juan", "IT", "Sistema B", "Pendiente"], 
        ["Maria", "HR", "Portal HR", "Activo"],
        ["Pedro", "Sales", null, null] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer LEFT OUTER JOIN con valores predeterminados personalizados", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name", "status"] },
        "user_projects",
        ["name", "department", "project_name", "status"],
        ["Unknown", "No Dept", "No Project", "No Status"]
      );
      
      const result = lib.joinTablesLeftOuter([usersTable, projectsTable], [joinSpec]);
      
      const expected = [
        ["Juan", "IT", "Sistema A", "Activo"],
        ["Juan", "IT", "Sistema B", "Pendiente"], 
        ["Maria", "HR", "Portal HR", "Activo"],
        ["Pedro", "Sales", "No Project", "No Status"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer LEFT OUTER JOIN en cadena con múltiples tablas", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name"] },
        "user_projects",
        ["name", "department", "project_name"],
        ["Unknown", "No Dept", "No Project"]
      );
      
      const join2 = lib.createJoinSpec(
        "user_projects",
        "departments",
        { left: ["department"], right: ["dept_code"] },
        { left: ["name", "project_name"], right: ["dept_name", "manager"] },
        "final_result",
        ["name", "project_name", "dept_name", "manager"],
        ["Unknown", "No Project", "No Dept", "No Manager"]
      );
      
      const result = lib.joinTablesLeftOuter(
        [usersTable, projectsTable, departmentsTable], 
        [join1, join2]
      );
      
      const expected = [
        ["Juan", "Sistema A", "Tecnología", "Carlos"],
        ["Juan", "Sistema B", "Tecnología", "Carlos"],
        ["Maria", "Portal HR", "Recursos Humanos", "Ana"],
        ["Pedro", "No Project", "Ventas", "Luis"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería usar valores por defecto personalizados para registros sin match", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Usuario Mantenido", "Sin Proyecto"] 
      );
      
      const result = lib.joinTablesLeftOuter([usersTable, projectsTable], [joinSpec]);
      
      const pedroRow = result.find(row => row[0] === "Pedro");
      Utils.assertEquals(pedroRow, ["Pedro", "Sin Proyecto"]);
    });

    Utils.it("debería mantener todos los registros izquierdos cuando no hay coincidencias", () => {
      const isolatedTable = lib.createTableSpec("isolated",
        ["iso_id", "iso_value"],
        [
          [99, "Aislado 1"],
          [100, "Aislado 2"] 
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "isolated",
        { left: ["id"], right: ["iso_id"] },
        { left: ["name"], right: ["iso_value"] },
        "user_isolated",
        ["name", "iso_value"],
        ["User Kept", "No Value"]
      );
      
      const result = lib.joinTablesLeftOuter([usersTable, isolatedTable], [joinSpec]);
      
      Utils.assertEquals(result.length, 3);
      Utils.assertTrue(result.every(row => row[1] === "No Value"));
    });

    Utils.it("debería aplicar postProcessor en LEFT OUTER JOIN", () => {
      let processedCount = 0;
      const postProcessor = (row) => {
        processedCount++;
        if (!row.project_name) {
          row.project_name = "Proyecto Asignado";
        }
      };
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Unknown", "No Project"],
        postProcessor
      );
      
      const result = lib.joinTablesLeftOuter([usersTable, projectsTable], [joinSpec]);
      
      Utils.assertEquals(processedCount, 4);
      
      const pedroRow = result.find(row => row[0] === "Pedro");
      Utils.assertEquals(pedroRow[1], "Proyecto Asignado");
    });

    Utils.it("debería lanzar los mismos errores de validación que joinTablesInner", () => {
      const validJoin = lib.createJoinSpec(
        "empty",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: [], right: ["project_name"] },
        "empty_projects",
        ["project_name"],
        ["No Project"]
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
    });

    Utils.it("debería manejar tablas izquierdas vacías correctamente", () => {
      const emptyTable = lib.createTableSpec("empty", ["id"], []);
      
      const joinSpec = lib.createJoinSpec(
        "empty",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: [], right: ["project_name"] },
        "empty_projects",
        ["project_name"],
        ["No Project"]
      );
      
      const result = lib.joinTablesLeftOuter([emptyTable, projectsTable], [joinSpec]);
      
      Utils.assertEquals(result, []);
    });

    Utils.it("debería manejar relaciones one-to-many en LEFT OUTER JOIN", () => {
      const multipleProjectsTable = lib.createTableSpec("multiple_projects",
        ["project_id", "user_id", "project_name"],
        [
          [101, 1, "Proyecto A1"],
          [102, 1, "Proyecto A2"], 
          [103, 2, "Proyecto B1"],
          [104, 2, "Proyecto B2"]  
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "multiple_projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      );
      
      const result = lib.joinTablesLeftOuter([usersTable, multipleProjectsTable], [joinSpec]);
      
      Utils.assertEquals(result.length, 5);
      
      const pedroRows = result.filter(row => row[0] === "Pedro");
      Utils.assertEquals(pedroRows.length, 1);
      Utils.assertEquals(pedroRows[0][1], "No Project");
    });

    Utils.it("debería manejar campos compuestos en LEFT OUTER JOIN", () => {
      const complexLeft = lib.createTableSpec("complex_left",
        ["id", "type", "value"],
        [
          [1, "A", 100],
          [2, "B", 200],
          [3, "C", 300] 
        ]
      );
      
      const complexRight = lib.createTableSpec("complex_right",
        ["ref_id", "ref_type", "description"],
        [
          [1, "A", "Descripción A"],
          [2, "B", "Descripción B"]
          // No hay match para [3, "C"]
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "complex_left",
        "complex_right",
        { left: ["id", "type"], right: ["ref_id", "ref_type"] },
        { left: ["value"], right: ["description"] },
        "complex_join",
        ["value", "description"],
        [0, "No Description"]
      );
      
      const result = lib.joinTablesLeftOuter([complexLeft, complexRight], [joinSpec]);
      
      const expected = [
        [100, "Descripción A"],
        [200, "Descripción B"],
        [300, "No Description"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería tener más registros que INNER JOIN cuando hay datos sin match", () => {
      const innerResult = lib.joinTablesInner([usersTable, projectsTable], [lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects_inner",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      )]);
      
      const leftResult = lib.joinTablesLeftOuter([usersTable, projectsTable], [lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects_left",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      )]);
      
      Utils.assertTrue(leftResult.length > innerResult.length);
      Utils.assertEquals(innerResult.length, 3); 
      Utils.assertEquals(leftResult.length, 4);  
    });

  });

  Utils.describe("joinTablesLeftOuter - Validación de errores exhaustiva", () => {
    
    const validUsersTable = lib.createTableSpec("users", ["id", "name"], [[1, "Juan"]]);
    const validProjectsTable = lib.createTableSpec("projects", ["user_id", "project_name"], [[1, "Proyecto A"]]);
    const validDepartmentsTable = lib.createTableSpec("departments", ["dept_code", "dept_name"], [["IT", "Tecnología"]]);

    const validJoin = lib.createJoinSpec(
      "users",
      "projects",
      { left: ["id"], right: ["user_id"] },
      { left: ["name"], right: ["project_name"] },
      "user_projects"
    );

    Utils.it("debería lanzar error si 'tables' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
    });

    Utils.it("debería lanzar error si menos de 2 tablas", () => {
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable], [validJoin]],
        true,
        "La cantidad de tablas es incorrecta"
      );
    });

    Utils.it("debería lanzar error si elemento de tables no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [["no-objeto", validProjectsTable], [validJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si name de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, name: "" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si data de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, data: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si headers de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si header individual no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: ["id", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un título válido"
      );
    });

    Utils.it("debería lanzar error si 'joins' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], "no-array"],
        true,
        "El parámetro 'joins' no es válido"
      );
    });

    Utils.it("debería lanzar error si cantidad de joins incorrecta", () => {
      const extraJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "extra_join"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [validJoin, extraJoin]],
        true,
        "La cantidad de uniones debe ser igual a la cantidad de tablas menos uno"
      );
    });

    Utils.it("debería lanzar error si elemento de joins no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], ["no-objeto"]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si alias de join no es válido", () => {
      const invalidJoin = { ...validJoin, alias: "" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder no es array", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si elemento de fieldsOrder no es válido", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: ["valid", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si defaultValues no es array", () => {
      const invalidJoin = { ...validJoin, defaultValues: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder y defaultValues tienen length diferente", () => {
      const invalidJoin = { 
        ...validJoin, 
        fieldsOrder: ["field1", "field2"], 
        defaultValues: ["default1"] 
      };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no tienen la misma cantidad de elementos"
      );
    });

    Utils.it("debería lanzar error si postProcessor no es función", () => {
      const invalidJoin = { ...validJoin, postProcessor: "no-function" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es una función válida"
      );
    });

    Utils.it("debería lanzar error si left no es objeto", () => {
      const invalidJoin = { ...validJoin, left: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si left.table no es válido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "" } };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.table no existe", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "tabla_inexistente" } };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no corresponde al nombre de una tabla"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene elemento inválido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["valid", ""] } };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene duplicados", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["name", "name"] } };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contiene nombres repetidos"
      );
    });

    Utils.it("debería lanzar error si left.joinedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, joinedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si right no es objeto", () => {
      const invalidJoin = { ...validJoin, right: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si selectedFields de left y right tienen nombres en común", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["name"] },
        right: { ...validJoin.right, selectedFields: ["name"] } 
      };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contienen nombres en común"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si selectedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla derecha", () => {
      const invalidJoin = {
        ...validJoin,
        right: { ...validJoin.right, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si se referencia alias inexistente en join posterior", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects"
      );
      
      const join2 = lib.createJoinSpec(
        "alias_inexistente", 
        "departments",
        { left: ["dept"], right: ["dept_code"] },
        { left: ["project_name"], right: ["dept_name"] },
        "final_result"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesLeftOuter,
        [[validUsersTable, validProjectsTable, validDepartmentsTable], [join1, join2]],
        true,
        "no corresponde al nombre de una tabla ni al alias de una unión previa"
      );
    });

    Utils.it("debería funcionar correctamente con parámetros válidos", () => {
      const result = lib.joinTablesLeftOuter(
        [validUsersTable, validProjectsTable], 
        [validJoin]
      );
      
      const expected = [["Juan", "Proyecto A"]];
      Utils.assertEquals(result, expected);
    });

  });

  // --- Tests para joinTablesFullOuter ---

  Utils.describe("joinTablesFullOuter", () => {
    
    const usersTable = lib.createTableSpec("users", 
      ["id", "name", "department"], 
      [
        [1, "Juan", "IT"],
        [2, "Maria", "HR"],
        [3, "Pedro", "Sales"] 
      ]
    );

    const projectsTable = lib.createTableSpec("projects",
      ["project_id", "user_id", "project_name", "status"],
      [
        [101, 1, "Sistema A", "Activo"],
        [102, 1, "Sistema B", "Pendiente"], 
        [103, 2, "Portal HR", "Activo"],
        [104, 4, "App Móvil", "Desarrollo"] 
      ]
    );

    const departmentsTable = lib.createTableSpec("departments",
      ["dept_code", "dept_name", "manager"],
      [
        ["IT", "Tecnología", "Carlos"],
        ["HR", "Recursos Humanos", "Ana"],
        ["Sales", "Ventas", "Luis"],
        ["Finance", "Finanzas", "Marta"] 
      ]
    );

    Utils.it("debería hacer FULL OUTER JOIN manteniendo todos los registros de ambas tablas", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name", "status"] },
        "user_projects",
        ["name", "department", "project_name", "status"],
      );
      
      const result = lib.joinTablesFullOuter([usersTable, projectsTable], [joinSpec]);
      
      const expected = [
        ["Juan", "IT", "Sistema A", "Activo"],
        ["Juan", "IT", "Sistema B", "Pendiente"], 
        ["Maria", "HR", "Portal HR", "Activo"],
        ["Pedro", "Sales", null, null], 
        [null, null, "App Móvil", "Desarrollo"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer FULL OUTER JOIN con valores predeterminados personalizados", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name", "status"] },
        "user_projects",
        ["name", "department", "project_name", "status"],
        ["Unknown User", "No Dept", "No Project", "No Status"]
      );
      
      const result = lib.joinTablesFullOuter([usersTable, projectsTable], [joinSpec]);
      
      const expected = [
        ["Juan", "IT", "Sistema A", "Activo"],
        ["Juan", "IT", "Sistema B", "Pendiente"], 
        ["Maria", "HR", "Portal HR", "Activo"],
        ["Pedro", "Sales", "No Project", "No Status"], 
        ["Unknown User", "No Dept", "App Móvil", "Desarrollo"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería hacer FULL OUTER JOIN en cadena con múltiples tablas", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name", "department"], right: ["project_name"] },
        "user_projects",
        ["name", "department", "project_name"],
        ["Unknown User", "No Dept", "No Project"]
      );
      
      const join2 = lib.createJoinSpec(
        "user_projects",
        "departments",
        { left: ["department"], right: ["dept_code"] },
        { left: ["name", "project_name"], right: ["dept_name", "manager"] },
        "final_result",
        ["name", "project_name", "dept_name", "manager"],
        ["Unknown User", "No Project", "No Dept", "No Manager"]
      );
      
      const result = lib.joinTablesFullOuter(
        [usersTable, projectsTable, departmentsTable], 
        [join1, join2]
      );
      
      const expected = [
        ["Juan", "Sistema A", "Tecnología", "Carlos"],
        ["Juan", "Sistema B", "Tecnología", "Carlos"],
        ["Maria", "Portal HR", "Recursos Humanos", "Ana"],
        ["Pedro", "No Project", "Ventas", "Luis"], 
        ["Unknown User", "App Móvil", "No Dept", "No Manager"], 
        ["Unknown User", "No Project", "Finanzas", "Marta"] 
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería usar valores por defecto personalizados para registros sin match", () => {
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Usuario Fantasma", "Proyecto Huérfano"] 
      );
      
      const result = lib.joinTablesFullOuter([usersTable, projectsTable], [joinSpec]);
      
      const pedroRow = result.find(row => row[0] === "Pedro");
      const orphanProject = result.find(row => row[1] === "App Móvil");
      
      Utils.assertEquals(pedroRow, ["Pedro", "Proyecto Huérfano"]);
      Utils.assertEquals(orphanProject, ["Usuario Fantasma", "App Móvil"]);
    });

    Utils.it("debería mantener todos los registros cuando no hay coincidencias entre tablas", () => {
      const disjointTable = lib.createTableSpec("disjoint",
        ["dis_id", "dis_value"],
        [
          [100, "Disjunto 1"],
          [200, "Disjunto 2"] 
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "disjoint",
        { left: ["id"], right: ["dis_id"] },
        { left: ["name"], right: ["dis_value"] },
        "user_disjoint",
        ["name", "dis_value"],
        ["Sin Usuario", "Sin Valor"]
      );
      
      const result = lib.joinTablesFullOuter([usersTable, disjointTable], [joinSpec]);
      
      Utils.assertEquals(result.length, 5); 
      
      const userRows = result.filter(row => row[0] !== "Sin Usuario");
      Utils.assertTrue(userRows.every(row => row[1] === "Sin Valor"));
      
      const disjointRows = result.filter(row => row[1] !== "Sin Valor");
      Utils.assertTrue(disjointRows.every(row => row[0] === "Sin Usuario"));
    });

    Utils.it("debería aplicar postProcessor en FULL OUTER JOIN", () => {
      let processedCount = 0;
      const postProcessor = (row) => {

        processedCount++;
        if (!row.name) row.name = "Usuario Anónimo";
        if (!row.project_name) row.project_name = "Proyecto por Asignar";
      };
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Unknown User", "No Project"],
        postProcessor
      );
      
      const result = lib.joinTablesFullOuter([usersTable, projectsTable], [joinSpec]);

      Utils.assertEquals(processedCount, 5);
      
      const orphanProject = result.find(row => row[1] === "App Móvil");
      const userWithoutProject = result.find(row => row[0] === "Pedro");
      
      Utils.assertEquals(orphanProject[0], "Usuario Anónimo");
      Utils.assertEquals(userWithoutProject[1], "Proyecto por Asignar");
    });

    Utils.it("debería lanzar los mismos errores de validación que joinTablesInner", () => {
      const validJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Unknown User", "No Project"],
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
    });

    Utils.it("debería manejar tablas vacías correctamente", () => {
      const emptyTable = lib.createTableSpec("empty", ["id"], []);
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "empty",
        { left: ["id"], right: ["id"] },
        { left: ["name"], right: [] },
        "user_empty",
        ["name"],
        ["Unknown"]
      );
      
      const result = lib.joinTablesFullOuter([usersTable, emptyTable], [joinSpec]);
      
      Utils.assertEquals(result.length, 3);
      Utils.assertTrue(result.every(row => Array.isArray(row) && row.length === 1));
    });

    Utils.it("debería manejar relaciones one-to-many en FULL OUTER JOIN", () => {
      const multipleProjectsTable = lib.createTableSpec("multiple_projects",
        ["project_id", "user_id", "project_name"],
        [
          [101, 1, "Proyecto A1"],
          [102, 1, "Proyecto A2"], 
          [103, 4, "Proyecto B"]   
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "users",
        "multiple_projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects",
        ["name", "project_name"],
        ["Unknown User", "No Project"]
      );
      
      const result = lib.joinTablesFullOuter([usersTable, multipleProjectsTable], [joinSpec]);
      
      Utils.assertEquals(result.length, 5);
      
      const juanProjects = result.filter(row => row[0] === "Juan");
      Utils.assertEquals(juanProjects.length, 2);
      
      const orphanProject = result.find(row => row[0] === "Unknown User");
      Utils.assertTrue(!!orphanProject);
    });

    Utils.it("debería manejar campos compuestos en FULL OUTER JOIN", () => {
      const complexLeft = lib.createTableSpec("complex_left",
        ["id", "type", "value"],
        [
          [1, "A", 100],
          [2, "B", 200],
          [3, "C", 300] 
        ]
      );
      
      const complexRight = lib.createTableSpec("complex_right",
        ["ref_id", "ref_type", "description"],
        [
          [1, "A", "Descripción A"],
          [2, "X", "Descripción X"], 
          [4, "D", "Descripción D"]  
        ]
      );
      
      const joinSpec = lib.createJoinSpec(
        "complex_left",
        "complex_right",
        { left: ["id", "type"], right: ["ref_id", "ref_type"] },
        { left: ["value"], right: ["description"] },
        "complex_join",
        ["value", "description"],
        [0, "No Description"]
      );
      
      const result = lib.joinTablesFullOuter([complexLeft, complexRight], [joinSpec]);
      
      const expected = [
        [100, "Descripción A"],    
        [200, "No Description"],   
        [300, "No Description"],   
        [0, "Descripción X"],      
        [0, "Descripción D"]       
      ];
      
      Utils.assertEquals(result, expected);
    });

    Utils.it("debería tener más registros que INNER y LEFT/RIGHT OUTER joins", () => {
      const innerResult = lib.joinTablesInner([usersTable, projectsTable], [lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects_inner",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      )]);
      
      const leftResult = lib.joinTablesLeftOuter([usersTable, projectsTable], [lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects_left",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      )]);
      
      const rightResult = lib.joinTablesRightOuter([usersTable, projectsTable], [lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects_right",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      )]);
      
      const fullResult = lib.joinTablesFullOuter([usersTable, projectsTable], [lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects_full",
        ["name", "project_name"],
        ["Unknown", "No Project"]
      )]);
      
      Utils.assertTrue(fullResult.length > innerResult.length);
      Utils.assertTrue(fullResult.length > leftResult.length);
      Utils.assertTrue(fullResult.length > rightResult.length);
      
      Utils.assertEquals(innerResult.length, 3);   
      Utils.assertEquals(leftResult.length, 4);    
      Utils.assertEquals(rightResult.length, 4);   
      Utils.assertEquals(fullResult.length, 5);    
    });

  });

  Utils.describe("joinTablesFullOuter - Validación de errores exhaustiva", () => {
    
    const validUsersTable = lib.createTableSpec("users", ["id", "name"], [[1, "Juan"]]);
    const validProjectsTable = lib.createTableSpec("projects", ["user_id", "project_name"], [[1, "Proyecto A"]]);
    const validDepartmentsTable = lib.createTableSpec("departments", ["dept_code", "dept_name"], [["IT", "Tecnología"]]);

    const validJoin = lib.createJoinSpec(
      "users",
      "projects",
      { left: ["id"], right: ["user_id"] },
      { left: ["name"], right: ["project_name"] },
      "user_projects"
    );

    Utils.it("debería lanzar error si 'tables' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        ["no-array", [validJoin]],
        true,
        "El parámetro 'tables' no es válido"
      );
    });

    Utils.it("debería lanzar error si menos de 2 tablas", () => {
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable], [validJoin]],
        true,
        "La cantidad de tablas es incorrecta"
      );
    });

    Utils.it("debería lanzar error si elemento de tables no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [["no-objeto", validProjectsTable], [validJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si name de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, name: "" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si data de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, data: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si headers de tabla no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si header individual no es válido", () => {
      const invalidTable = { ...validUsersTable, headers: ["id", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[invalidTable, validProjectsTable], [validJoin]],
        true,
        "no es un título válido"
      );
    });

    Utils.it("debería lanzar error si 'joins' no es array", () => {
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], "no-array"],
        true,
        "El parámetro 'joins' no es válido"
      );
    });

    Utils.it("debería lanzar error si cantidad de joins incorrecta", () => {
      const extraJoin = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "extra_join"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [validJoin, extraJoin]],
        true,
        "La cantidad de uniones debe ser igual a la cantidad de tablas menos uno"
      );
    });

    Utils.it("debería lanzar error si elemento de joins no es objeto", () => {
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], ["no-objeto"]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si alias de join no es válido", () => {
      const invalidJoin = { ...validJoin, alias: "" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder no es array", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si elemento de fieldsOrder no es válido", () => {
      const invalidJoin = { ...validJoin, fieldsOrder: ["valid", ""] };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si defaultValues no es array", () => {
      const invalidJoin = { ...validJoin, defaultValues: "no-array" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si fieldsOrder y defaultValues tienen length diferente", () => {
      const invalidJoin = { 
        ...validJoin, 
        fieldsOrder: ["field1", "field2"], 
        defaultValues: ["default1"] 
      };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no tienen la misma cantidad de elementos"
      );
    });

    Utils.it("debería lanzar error si postProcessor no es función", () => {
      const invalidJoin = { ...validJoin, postProcessor: "no-function" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es una función válida"
      );
    });

    Utils.it("debería lanzar error si left no es objeto", () => {
      const invalidJoin = { ...validJoin, left: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si left.table no es válido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "" } };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.table no existe", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, table: "tabla_inexistente" } };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no corresponde al nombre de una tabla"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene elemento inválido", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["valid", ""] } };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un nombre válido"
      );
    });

    Utils.it("debería lanzar error si left.selectedFields tiene duplicados", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, selectedFields: ["name", "name"] } };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contiene nombres repetidos"
      );
    });

    Utils.it("debería lanzar error si left.joinedFields no es array", () => {
      const invalidJoin = { ...validJoin, left: { ...validJoin.left, joinedFields: "no-array" } };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un arreglo válido"
      );
    });

    Utils.it("debería lanzar error si right no es objeto", () => {
      const invalidJoin = { ...validJoin, right: "no-object" };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "no es un objeto válido"
      );
    });

    Utils.it("debería lanzar error si selectedFields de left y right tienen nombres en común", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["name"] },
        right: { ...validJoin.right, selectedFields: ["name"] } 
      };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "contienen nombres en común"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si selectedField no existe en tabla izquierda", () => {
      const invalidJoin = {
        ...validJoin,
        left: { ...validJoin.left, selectedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si joinedField no existe en tabla derecha", () => {
      const invalidJoin = {
        ...validJoin,
        right: { ...validJoin.right, joinedFields: ["campo_inexistente"] }
      };
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable], [invalidJoin]],
        true,
        "No se encontró el campo campo_inexistente"
      );
    });

    Utils.it("debería lanzar error si se referencia alias inexistente en join posterior", () => {
      const join1 = lib.createJoinSpec(
        "users",
        "projects",
        { left: ["id"], right: ["user_id"] },
        { left: ["name"], right: ["project_name"] },
        "user_projects"
      );
      
      const join2 = lib.createJoinSpec(
        "alias_inexistente", 
        "departments",
        { left: ["dept"], right: ["dept_code"] },
        { left: ["project_name"], right: ["dept_name"] },
        "final_result"
      );
      
      Utils.assertFunctionParams(
        lib.joinTablesFullOuter,
        [[validUsersTable, validProjectsTable, validDepartmentsTable], [join1, join2]],
        true,
        "no corresponde al nombre de una tabla ni al alias de una unión previa"
      );
    });

    Utils.it("debería funcionar correctamente con parámetros válidos", () => {
      const result = lib.joinTablesFullOuter(
        [validUsersTable, validProjectsTable], 
        [validJoin]
      );
      
      const expected = [["Juan", "Proyecto A"]];
      Utils.assertEquals(result, expected);
    });

  });

  Utils.endTests();  
}
