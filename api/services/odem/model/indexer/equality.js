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

module.exports = function() {
	const api = this; // eslint-disable-line consistent-this
	const { services: Services } = api.runtime;

	/**
	 * Implements equality index for single property.
	 *
	 * FIXME Always provide revision number explicitly instead of using local default.
	 */
	class OdemModelIndexerEquality extends Services.OdemModelIndexer {
		/**
		 * @param {function} compare function that compares two keys, omit for default compare function
		 * @param {function(*):*} reducer optional function for reducing indexed property's values
		 * @param {number|string} revision revision of the index
		 */
		constructor( { compare = null, reducer = null, revision } = {} ) {
			const revisionNumber = parseInt( revision );
			if ( isNaN( revisionNumber ) ) {
				throw new Error( "revision must be integer" );
			}

			if ( reducer != null && typeof reducer !== "function" ) {
				throw new Error( "invalid index reducer" );
			}


			super();

			Object.defineProperties( this, {
				/**
				 * Exposes method provided to compare two given values covered by
				 * current index.
				 *
				 * @name OdemModelIndexerEquality#compare
				 * @property {function(*,*):number}
				 * @readonly
				 */
				compare: { value: compare },

				/**
				 * Collects UUIDs of records currently not part of index tree due to
				 * having null/undefined value.
				 *
				 * @name OdemModelIndexerEquality#nullItems
				 * @property {Array<Buffer>}
				 * @readonly
				 */
				nullItems: { value: [] },

				/**
				 * Exposes optionally defined reducer function for mapping actual
				 * values of indexed property into values to be indexed eventually.
				 *
				 * @name OdemModelIndexerEquality#reducer
				 * @property {?function}
				 * @readonly
				 */
				reducer: { value: reducer },
			} );

			this.tree = RBTree( compare );
			this.revision = revisionNumber;
		}

		/**
		 * Lists types of indices this handler is suitable for.
		 *
		 * @returns {string[]} lists index types
		 */
		static get indexTypes() {
			// FIXME drop these aliases as soon as there are actual handlers for other types but eq
			//       (have been listed here to support scenarios in unit testing definitions, only)
			return [ "eq", "gt", "lt", "gte", "lte" ];
		}

		/** @inheritDoc */
		static create( options ) {
			const { $type, reducer } = options || {};

			return new this( {
				compare: $type.sort,
				reducer: reducer || $type.indexReducer,
				revision: 0,
			} );
		}

		/**
		 * Clearing the Index
		 * @param{number|string} revision revision that was used to create the index
		 * @return{void}
		 */
		clear( revision = this.revision ) {
			const revisionNumber = parseInt( revision );

			if ( isNaN( revisionNumber ) ) {
				throw new TypeError( "revision must be integer" );
			}

			this.revision = revision;
			this.nullItems.splice( 0 );
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
			const revisionNumber = parseInt( revision );

			if ( isNaN( revisionNumber ) || revisionNumber !== parseFloat( revision ) ) {
				throw new Error( "revision must be integer" );
			}

			if ( update ) {
				switch ( revisionNumber - this.revision ) {
					case 1 :
						this.revision = revisionNumber;
						break;

					case 0 :
						break;

					default :
						throw new Error( "revision out of sync" );
				}
			} else if ( this.revision !== revisionNumber ) {
				throw new Error( "revision out of sync" );
			}
		}

		/**
		 * Adds value of an item's indexed property.
		 *
		 * @param {Buffer} uuid UUID of new item with given value of property
		 * @param {*} value value of item's indexed property
		 * @param {number} revision revision that was used to create the index
		 * @param {boolean} ignoreDuplicates if true there will not be checked if entry is already in list
		 * @returns {void} true if new entry for index was created
		 */
		add( uuid, value, revision = this.revision, ignoreDuplicates = false ) {
			this.checkRevision( revision );

			let uuidList, reduced;

			if ( value == null ) {
				uuidList = this.nullItems;
			} else {
				reduced = this.reducer ? this.reducer( value ) : value;
				uuidList = this.tree.find( reduced ).value;
			}

			if ( uuidList ) {
				if ( !ignoreDuplicates ) {
					const length = uuidList.length;

					for ( let index = 0; index < length; index++ ) {
						const _uuid = uuidList[index];

						if ( uuid.equals( _uuid ) ) {
							return;
						}
					}
				}

				uuidList.push( uuid );
			} else {
				this.tree = this.tree.insert( reduced, [uuid] );
			}
		}

		/**
		 * Generates UUIDs of items with matching given value in indexed property.
		 *
		 * @param {*} value property value to be met by resulting items
		 * @param {number} revision revision of the index
		 * @param {boolean} withKey if true generator function will yield [uuid, key] else it will yield uuid;
		 * @return {GeneratorFunction} generator function yielding UUIDs of matching items
		 */
		find( value, revision = this.revision, withKey = false ) {
			this.checkRevision( revision );

			let items, key;

			if ( value == null ) {
				items = this.nullItems;
				key = null;
			} else {
				const iterator = this.tree.find( this.reducer ? this.reducer( value ) : value );

				if ( iterator ) {
					items = iterator.value;
					key = iterator.key;
				}
			}

			if ( items ) {
				return function* () {
					const numItems = items.length;

					for ( let i = 0; i < numItems; i++ ) {
						yield withKey ? [ items[i], key ] : items[i];
					}
				};
			}

			return function* () {}; // eslint-disable-line no-empty-function
		}

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
		 */
		removeValue( uuid, value, revision = this.revision ) {
			this.checkRevision( revision );

			const uuidList = value == null ? this.nullItems : this.tree.find( this.reducer ? this.reducer( value ) : value ).value;

			if ( uuidList ) {
				const length = uuidList.length;

				for ( let index = 0; index < length; index++ ) {
					const _uuid = uuidList[index];

					if ( uuid.equals( _uuid ) ) {
						uuidList.splice( index, 1 );
						return true;
					}
				}
			}

			return false;
		}

		/**
		 * Removes an item form the index.
		 *
		 * @note Use this method if you don't know the current value of property.
		 * @note This method doesn't perform as well as OdemModelIndexerEquality#removeValue()
		 *       but doesn't require to read the record's properties first to get
		 *       a property's current value.
		 *
		 * @param {Buffer} uuid UUID of item to remove from index
		 * @param {number} revision revision of the index
		 * @return {boolean} true if item has been removed actually, false if item isn't covered by index
		 */
		remove( uuid, revision = this.revision ) {
			this.checkRevision( revision );

			const end = this.tree.end.key;
			const iter = this.tree.begin;

			while ( true ) { // eslint-disable-line no-constant-condition
				const uuids = iter.value;
				if ( uuids ) {
					const numUUIDs = uuids.length;

					for ( let i = 0; i < numUUIDs; i++ ) {
						if ( uuids[i].equals( uuid ) ) {
							uuids.splice( i, 1 );
							return true;
						}
					}
				}

				if ( iter.key === end ) {
					break;
				}

				iter.next();
			}

			const items = this.nullItems;
			const numItems = items.length;

			for ( let i = 0; i < numItems; i++ ) {
				if ( items[i].equals( uuid ) ) {
					items.splice( i, 1 );
					return true;
				}
			}

			return false;
		}


		/**
		 * Updates index due to changing value of an item's indexed property.
		 *
		 * @param {Buffer} uuid UUID of item with change of indexed property's value
		 * @param {*} oldValue previous value of indexed property
		 * @param {*} newValue current value of indexed property
		 * @param {boolean} searchExisting set true if existing track should be search while ignoring **oldValue**
		 * @return {void}
		 */
		update( uuid, oldValue, newValue, searchExisting = false ) {
			if ( searchExisting ) {
				if ( this.remove( uuid ) ) {
					this.add( uuid, newValue );
					return;
				}
			} else {
				const uuidList = oldValue == null ? this.nullItems : this.tree.find( this.reducer ? this.reducer( oldValue ) : oldValue ).value;

				if ( uuidList ) {
					const length = uuidList.length;

					for ( let index = 0; index < length; index++ ) {
						const _uuid = uuidList[index];

						if ( uuid.equals( _uuid ) ) {
							uuidList.splice( index, 1 );
							this.add( uuid, newValue );
							return;
						}
					}

					throw new Error( "index didn't cover item as expected, is it out of sync?" );
				}
			}

			throw new Error( "there is no entry at that index" );
		}

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
		 */
		findBetween( { lowerLimit = null, upperLimit = null, descending = false, revision = this.revision, withKey = false, appendNullItems = false } = {} ) {
			// FIXME add support for optionally generating stream instead of iterator to reduce code involved on iterating over tree for testers

			this.checkRevision( revision );

			const lower = lowerLimit == null ? this.tree.begin : this.tree.ge( this.reducer ? this.reducer( lowerLimit ) : lowerLimit );
			const upper = upperLimit == null ? this.tree.end : this.tree.le( this.reducer ? this.reducer( upperLimit ) : upperLimit );
			const endKey = descending ? lower.key : upper.key;
			const next = descending ? "prev" : "next";
			const iterator = descending ? upper : lower;
			const nullItems = this.nullItems;

			return function* () {
				while ( iterator.key ) {
					const { key, value: items } = iterator;

					if ( items ) {
						// always list items attached to node in ascending order for
						// they have the same value anyway
						const numItems = items.length;

						for ( let i = 0; i < numItems; i++ ) {
							yield withKey ? [ items[i], key ] : items[i];
						}
					}

					if ( key === endKey ) {
						break;
					}

					iterator[next]();
				}

				if ( appendNullItems ) {
					const numNullItems = nullItems.length;

					for ( let i = 0; i < numNullItems; i++ ) {
						yield withKey ? [ nullItems[i], null ] : nullItems[i];
					}
				}
			};
		}
	}

	return OdemModelIndexerEquality;
};
