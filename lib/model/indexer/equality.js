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

const RBTree = require( "functional-red-black-tree" );

/**
 * Implements equality index for single property.
 *
 * FIXME Always provide revision number explicitly instead of using local default.
 */
class EqualityIndex {
	/**
	 * @param {function} compare function that compares two keys, omit for default compare function
	 * @param {number|string} revision revision of the index
	 */
	constructor( { compare = null, revision } = {} ) {
		const revisionNumber = parseInt( revision );

		if ( isNaN( revisionNumber ) ) {
			throw new Error( "revision must be integer" );
		}

		Object.defineProperties( this, {
			/**
			 * Exposes method provided to compare two given values covered by
			 * current index.
			 *
			 * @name EqualityIndex#compare
			 * @property {function(*,*):number}
			 * @readonly
			 */
			compare: { value: compare },
		} );

		this.tree = RBTree( compare );
		this.revision = revisionNumber;
	}

	/**
	 * Clearing the Index
	 * @param{number|string} revision revision that was used to create the index
	 * @return{void}
	 */
	clear( revision = this.revision ) {
		const revisionNumber = parseInt( revision );

		if ( isNaN( revisionNumber ) ) {
			throw new Error( "revision must be integer" );
		}

		this.revision = revision;
		this.tree = RBTree( this.compare );
	}

	/**
	 * Checks if revision matches intern revision.
	 *
	 * @param {number|string} revision revision of the index
	 * @param {boolean} update should the internal revision be updated
	 * @return {void}
	 */
	checkRevision( revision = this.revision, update = false ) {
		const revisonNumber = parseInt( revision );

		if ( isNaN( revisonNumber ) ) {
			throw new Error( "revision must be integer" );
		}

		if ( update ) {
			switch ( revisonNumber - this.revision ) {
				case 1 :
					this.revision = revisonNumber;
					break;

				case 0 :
					break;

				default :
					throw new Error( "revision out of sync" );
			}
		} else if ( this.revision !== revisonNumber ) {
			throw new Error( "revision out of sync" );
		}
	}

	/**
	 * Adds value of an item's indexed property.
	 *
	 * @param {uuid} uuid UUID of new item with given value of property
	 * @param {*} value value of item's indexed property
	 * @param {number} revision revision that was used to create the index
	 * @returns {boolean} true if new entry for index was created // TODO check sense of providing this information
	 */
	add( uuid, value, revision = this.revision ) {
		this.checkRevision( revision );

		const entry = this.tree.find( value );

		if ( entry.valid ) {
			if ( entry.value.indexOf( uuid ) < 0 ) {
				entry.value.push( uuid );
			}

			return false;
		}

		this.tree = this.tree.insert( value, [uuid] );

		return true;
	}

	/**
	 * Generates UUIDs of items having given value in indexed property.
	 *
	 * @param {*} value property value to be met by resulting items
	 * @param {boolean} reverse return UUIDs in reverse chronological order
	 * @param {number} revision revision of the index
	 * @param {boolean} withKey if true generator function will yield [uuid, key] else it will yield uuid;
	 * @return {function} generator function generating UUIDs of matching items
	 */
	find( value, reverse = false, revision = this.revision, withKey = false ) {
		this.checkRevision( revision );

		const iterator = this.tree.find( value );

		if ( iterator.valid ) {
			const items = iterator.value;
			let start, stop, step;

			if ( reverse ) {
				start = items.length - 1;
				stop = step = -1;
			} else {
				start = 0;
				stop = items.length;
				step = 1;
			}

			return function* () {
				for ( let i = start; i !== stop; i += step ) {
					yield withKey ? [ items[i], iterator.key ] : items[i];
				}
			};
		}

		return function* () {}; // eslint-disable-line no-empty-function
	}

	/**
	 * Removes an item form the index.
	 *
	 * @param {uuid} uuid UUID of item to remove from index
	 * @param {*} value latest value of item's indexed property
	 * @param {number} revision revision of the index
	 * @return {boolean} true if item has been removed actually, false if item isn't covered by index
	 */
	remove( uuid, value, revision = this.revision ) {
		this.checkRevision( revision );

		const iterator = this.tree.find( value );

		if ( iterator.valid ) {
			const items = iterator.value;
			const position = items.indexOf( uuid );

			if ( position >= 0 ) {
				items.splice( position, 1 );

				return true;
			}
		}

		return false;
	}


	/**
	 * Updates index due to changing value of an item's indexed property.
	 *
	 * @param {uuid} uuid UUID of item with change of indexed property's value
	 * @param {*} oldValue previous value of indexed property
	 * @param {*} newValue current value of indexed property
	 * @return {void}
	 */
	updateIndex( uuid, oldValue, newValue ) {
		const iter = this.tree.find( oldValue );
		const index = iter.value.indexOf( uuid );

		if ( index < 0 ) {
			throw new Error( "index didn't cover item as expected, is it out of sync?" );
		}

		iter.value.splice( index, 1 );

		this.add( uuid, newValue );
	}

	/**
	 * Generates UUIDs of items between two values of indexed property.
	 *
	 * @param {*} lowerLimit lowest value of property to be found in resulting list
	 * @param {*} upperLimit highest value of property to be found in resulting list
	 * @param {boolean} descending set true to get UUIDs of matching items with property's value sorted in descending order
	 * @param {number} revision revision of the index
	 * @param {boolean} withKey if true generator function will yield [uuid, key] else it will yield uuid;
	 * @return {function} generator function yielding matching item's UUIDs
	 */
	findBetween( { lowerLimit = null, upperLimit = null, descending = false, revision = this.revision, withKey = false, } = {} ) {
		this.checkRevision( revision );

		const lower = lowerLimit ? this.tree.ge( lowerLimit ) : this.tree.begin;
		const upper = upperLimit ? this.tree.le( upperLimit ) : this.tree.end;
		const endKey = descending ? lower.key : upper.key;
		const next = descending ? "prev" : "next";
		const iterator = descending ? upper : lower;
		let index = descending ? iterator.value.length - 1 : 0;
		let items = iterator.value;
		let finished = false;

		return function* () {
			while ( !finished ) {
				if ( index < items.length && index >= 0 ) {
					yield withKey ? [ items[index], iterator.key ] : items[index];
					if ( descending ) {
						index--;
					} else {
						index++;
					}
				} else {
					if ( iterator.key === endKey ) {
						finished = true;
						return;
					}

					iterator[next]();
					items = iterator.value;
					index = descending ? items.length - 1 : 0;
				}
			}
		};
	}
}

module.exports = EqualityIndex;
