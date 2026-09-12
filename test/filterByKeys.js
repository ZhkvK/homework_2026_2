'use strict';

const blunkTestObject = {};
const simpleTestObject = {
    name: "John",
    age: 18,
};
const testWithArrayObject = {
    name: "Bob",
    age: 20,
    classes: ["Math", "Physics", "PE"],
};
const testNestedObject = {
    user: {
        profile: { firstName: "Alice", lastName: "Smith" },
        settings: { theme: "dark" }
    },
    role: "admin"
};
const testRecursiveObject = {
    name: "Pete",
    age: 19,
    classes: ["Math", "Physics", "PE"],
    friends: [testWithArrayObject, simpleTestObject],
};
const testSpecialValues = {
    a: null,
    b: undefined,
    c: new Date("2026-09-12"),
    d: 42
};


QUnit.module('Тестируем функцию filterByKeys', function () {

    QUnit.test('Клонирует пустой объект', function (assert) {
        assert.deepEqual(filterByKeys(blunkTestObject, ["name"]), {}, 'filterByKeys({}, ["name"]) === {}');
        assert.deepEqual(filterByKeys(blunkTestObject, []), {}, 'filterByKeys({}, []) === {}');
        assert.deepEqual(filterByKeys(blunkTestObject, ["x", "y", "z"]), {}, 'несуществующие ключи в пустом объекте');
    });

    QUnit.test('Клонирует объект с примитивными полями', function (assert) {
        assert.deepEqual(
            filterByKeys(simpleTestObject, ["name", "age"]),
            { name: "John", age: 18 },
            'фильтрация по всем существующим ключам'
        );
        assert.deepEqual(
            filterByKeys(simpleTestObject, ["name"]),
            { name: "John" },
            'фильтрация по одному ключу'
        );
        assert.deepEqual(
            filterByKeys(simpleTestObject, ["age"]),
            { age: 18 },
            'фильтрация по другому ключу'
        );
    });

    QUnit.test('Игнорирует несуществующие ключи', function (assert) {
        assert.deepEqual(
            filterByKeys(simpleTestObject, ["name", "email", "phone"]),
            { name: "John" },
            'несуществующие ключи не попадают в результат'
        );
        assert.deepEqual(
            filterByKeys(simpleTestObject, ["x", "y", "z"]),
            {},
            'все ключи несуществующие → {}'
        );
    });

    QUnit.test('Работает с пустым массивом keys', function (assert) {
        assert.deepEqual(
            filterByKeys(simpleTestObject, []),
            {},
            'пустой keys → {}'
        );
        assert.deepEqual(
            filterByKeys(testWithArrayObject, []),
            {},
            'пустой keys для сложного объекта → {}'
        );
    });

    QUnit.test('Клонирует массивы глубоко (не по ссылке)', function (assert) {
        const filtered = filterByKeys(testWithArrayObject, ["classes"]);

        assert.deepEqual(
            filtered,
            { classes: ["Math", "Physics", "PE"] },
            'массив скопирован корректно'
        );

        filtered.classes.push("Chemistry");
        assert.deepEqual(
            testWithArrayObject.classes,
            ["Math", "Physics", "PE"],
            'оригинальный массив НЕ изменился после мутации копии'
        );
    });

    QUnit.test('Клонирует вложенные объекты глубоко', function (assert) {
        const filtered = filterByKeys(testNestedObject, ["user"]);

        assert.deepEqual(
            filtered,
            {
                user: {
                    profile: { firstName: "Alice", lastName: "Smith" },
                    settings: { theme: "dark" }
                }
            },
            'вложенный объект скопирован корректно'
        );

        filtered.user.profile.firstName = "CHANGED";
        assert.strictEqual(
            testNestedObject.user.profile.firstName,
            "Alice",
            'оригинальный вложенный объект НЕ изменился'
        );
    });

    QUnit.test('Клонирует рекурсивные структуры (массив объектов)', function (assert) {
        const filtered = filterByKeys(testRecursiveObject, ["friends"]);

        assert.strictEqual(filtered.friends.length, 2, 'в friends два элемента');
        assert.strictEqual(filtered.friends[0].name, "Bob", 'первый друг — Bob');
        assert.strictEqual(filtered.friends[1].name, "John", 'второй друг — John');

        filtered.friends[0].name = "CHANGED";
        assert.strictEqual(
            testRecursiveObject.friends[0].name,
            "Bob",
            'оригинальный вложенный объект в массиве НЕ изменился'
        );
    });

    QUnit.test('Работает со специальными значениями (null, undefined, Date)', function (assert) {
        const filtered = filterByKeys(testSpecialValues, ["a", "b", "c", "d"]);

        assert.strictEqual(filtered.a, null, 'null сохранился');
        assert.strictEqual(filtered.b, undefined, 'undefined сохранился');
        assert.strictEqual(filtered.d, 42, 'число сохранилось');
        assert.ok(filtered.c instanceof Date, 'Date остался экземпляром Date');
        assert.strictEqual(
            filtered.c.toISOString(),
            testSpecialValues.c.toISOString(),
            'значение Date совпадает'
        );

        filtered.c.setFullYear(2000);
        assert.strictEqual(
            testSpecialValues.c.getFullYear(),
            2026,
            'оригинальный Date НЕ изменился'
        );
    });

    QUnit.test('Обрабатывает дубликаты ключей в keys', function (assert) {
        assert.deepEqual(
            filterByKeys(simpleTestObject, ["name", "name", "name"]),
            { name: "John" },
            'дубликаты ключей не создают проблем'
        );
    });
});
