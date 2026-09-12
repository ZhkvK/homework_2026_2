'use strict';

/**
 * Создаёт новый объект, содержащий глубокую копию указанных полей исходного объекта.
 * Ключи, которых нет в исходном объекте, игнорируются. Исходный объект не мутируется.
 *
 * @param {Object} obj - Исходный объект, из которого будут извлечены поля.
 * @param {Iterable<string>} keys - Список имён полей, которые нужно клонировать.
 * @returns {Object} Новый объект, содержащий глубокие копии запрошенных полей.
 *                   Если ни один ключ не найден — возвращает пустой объект `{}`.
 *
 * @example
 * // Простой пример с примитивами
 * const source = { name: 'Alice', age: 30, role: 'admin' };
 * filterByKeys(source, ['name', 'age']);
 * // => { name: 'Alice', age: 30 }
 *
 * @example
 * // Глубокое копирование вложенных объектов
 * const source = { user: { profile: { name: 'Bob' } } };
 * const result = filterByKeys(source, ['user']);
 * result.user.profile.name = 'CHANGED';
 * console.log(source.user.profile.name); // 'Bob' — оригинал не изменился
 *
 * @example
 * // Несуществующие ключи игнорируются
 * filterByKeys({ a: 1, b: 2 }, ['a', 'c']);
 * // => { a: 1 }
 */
function filterByKeys(obj, keys) {
    const newObject = {};
    for (const key of keys) {
        if (key in obj) {
            newObject[key] = structuredClone(obj[key]);
        }
    }
    return newObject;
}