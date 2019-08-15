/**
 * (c) 2018 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

/**
 * Implements abstract base class for any index handler.
 *
 * @abstract
 */
class AbstractIndex {
	/**
	 * Lists types of indices this handler is suitable for.
	 *
	 * @returns {string[]} lists index types
	 * @abstract
	 */
	static get indexTypes() {
		return [];
	}

	/**
	 * Creates instance of current index handler using provided options.
	 *
	 * @param {object} options type-specific options
	 * @returns {AbstractIndex} created index handler
	 * @abstract
	 */
	static create( options ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Drops all information currently managed by index.
	 *
	 * @param {number|string} revision revision that was used to create the index
	 * @returns {void}
	 * @abstract
	 */
	clear( revision = this.revision ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Checks if revision matches intern revision.
	 *
	 * @param {number|string} revision revision of the index
	 * @param {boolean} update should the internal revision be updated
	 * @return {void}
	 * @abstract
	 */
	checkRevision( revision = this.revision, update = false ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Adds value of an item's indexed property.
	 *
	 * @param {Buffer} uuid UUID of new item with given value of property
	 * @param {*} value value of item's indexed property
	 * @param {number} revision revision that was used to create the index
	 * @param {boolean} ignoreDuplicates if true there will not be checked if entry is already in list
	 * @returns {void} true if new entry for index was created
	 * @abstract
	 */
	add( uuid, value, revision = this.revision, ignoreDuplicates = false ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Generates UUIDs of items with matching given value in indexed property.
	 *
	 * @param {*} value property value to be met by resulting items
	 * @param {number} revision revision of the index
	 * @param {boolean} withKey if true generator function will yield [uuid, key] else it will yield uuid;
	 * @return {GeneratorFunction} generator function yielding UUIDs of matching items
	 * @abstract
	 */
	find( value, revision = this.revision, withKey = false ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Removes an item from the index looking up its provided value to find the
	 * proper list a lot faster.
	 *
	 * @note Use this method if you actually know the property's current value.
	 *
	 * @param {Buffer} uuid UUID of item to remove from index
	 * @param {*} value latest value of item's indexed property
	 * @param {number} revision revision of the index
	 * @return {boolean} true if item has been removed actually, false if item isn't covered by index
	 * @abstract
	 */
	removeValue( uuid, value, revision = this.revision ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Removes an item form the index.
	 *
	 * @note Use this method if you don't know the current value of property.
	 * @note This method doesn't perform as well as EqualityIndex#removeValue()
	 *       but doesn't require to read the record's properties first to get
	 *       a property's current value.
	 *
	 * @param {Buffer} uuid UUID of item to remove from index
	 * @param {number} revision revision of the index
	 * @return {boolean} true if item has been removed actually, false if item isn't covered by index
	 * @abstract
	 */
	remove( uuid, revision = this.revision ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Updates index due to changing value of an item's indexed property.
	 *
	 * @param {Buffer} uuid UUID of item with change of indexed property's value
	 * @param {*} oldValue previous value of indexed property
	 * @param {*} newValue current value of indexed property
	 * @return {void}
	 * @abstract
	 */
	update( uuid, oldValue, newValue ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Generates UUIDs of items between two values of indexed property.
	 *
	 * @param {*} lowerLimit lowest value of property to be found in resulting list
	 * @param {*} upperLimit highest value of property to be found in resulting list
	 * @param {boolean} descending set true to get UUIDs of matching items with property's value sorted in descending order
	 * @param {number} revision revision of the index
	 * @param {boolean} withKey if true generator function will yield [uuid, key] else it will yield uuid;
	 * @param {boolean} appendNullItems if true generator function will yield all null items at the end;
	 * @return {function} generator function yielding matching item's UUIDs
	 * @abstract
	 */
	findBetween( { lowerLimit = null, upperLimit = null, descending = false, revision = this.revision, withKey = false, appendNullItems = false } = {} ) {} // eslint-disable-line no-unused-vars,no-empty-function
}

module.exports = AbstractIndex;
