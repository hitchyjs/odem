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
 * implements an index
 */
class Index {
	/**
	 * @param {function} compare function that compares two keys
	 * @param{number|string} revision revision of the index
	 */
	constructor( { compare = null, revision } = {} ) {
		const revisionNumber = Number.parseInt( revision );
		if( Number.isNaN( revisionNumber ) ) {
			throw new Error( "revision has to be an int" );
		}
		this.compare = compare;
		this.tree = RBTree( compare );
		this.revision = revisionNumber;
	}

	/**
	 * reOrganizing the Index
	 * @param{number|string} revision revision that was used to create the index
	 * @return{void}
	 */
	reOrg( revision = this.revision ) {
		const revisionNumber = Number.parseInt( revision );
		if( Number.isNaN( revisionNumber ) ) {
			throw new Error( "revision has to be an int" );
		}
		this.revision = revision;
		this.tree = RBTree( this.compare );
	}

	/**
	 * checks if revision matches intern revision
	 * @param{number|string} revision revision of the index
	 * @param{boolean} update should the internal revision be updated
	 * @return {void}
	 */
	 checkRevision( revision = this.revision, update = false ) {
		const revisonNumber = Number.parseInt( revision );
		if( Number.isNaN( revisonNumber ) ) {
			throw new Error( "revision has to be an int" );
		}
		if( update ) {
			const difference = revisonNumber - this.revision;
			if( difference === 1 ) {
				this.revision = revisonNumber;
			} else if ( difference !== 0 ) {
				throw new Error( "revision out of sync" );
			}
		} else if( this.revision !== revisonNumber ) {
			throw new Error( "revision out of sync" );
		}

	}

	/**
	 * adds item to key in the index
	 * @param{uuid} uuid item that should be added to the index
 	 * @param{*} index key that item should be indexed for
	 * @param{number} revision revision that was used to create the index
	 * @returns{boolean|number} true if new entry for index was created
	 */
	add( uuid, index, revision = this.revision ) {
		this.checkRevision( revision );
		const entry = this.tree.find( index );
		if( entry.valid ) {
			entry.value.push( uuid );
			return 0;
		}
		this.tree = this.tree.insert( index, [uuid] );
		return 1;
	}

	/**
	 * returns list of items
	 * @param {*} index key that is used as index
	 * @param {boolean} descending return uuids in descending order
	 * @param {number} revision revision of the index
	 * @return {[uuid]} list of uuid
	 */
	find( index, descending = false, revision = this.revision ) {
		this.checkRevision( revision );
		const iterator = this.tree.find( index );
		if( iterator.valid ) {
			const items = iterator.value;
			let i = descending ? items.length - 1 : 0;
			return function*() {
				while( i < items.length && i >= 0 ) {
					yield [ items[i], iterator.key ];
					if( descending ) i--; else i++;
				}
			};
		}
		// eslint-disable-next-line no-empty-function
		return function*() {};
	}

	/**
	 * removes an item form the index
	 * @param {uuid} uuid uuid of the item to remove from index
	 * @param {*} index index to remove item from
	 * @param{number} revision revision of the index
	 * @return {boolean|number} true if removed, false if not in index;
	 */
	remove( uuid, index, revision = this.revision ) {
		this.checkRevision( revision );
		const iterator = this.tree.find( index );
		if( iterator.valid ) {
			const items = iterator.value;
			const position = items.indexOf( uuid );
			if( position >= 0 ) {
				items.splice( position, 1 );
				return 1;
			}
		}
		return 0;
	}


	/**
	 * updates the index of an entry
	 * @param{uuid} uuid uuid of the entry
	 * @param{*} oldIndex index of the entry at the moment
	 * @param{*} newIndex index where the entry need to be
	 * @return {boolean} true if en
	 */
	updateIndex( uuid, oldIndex, newIndex ) {
		const iter = this.tree.find( oldIndex );
		const index = iter.value.indexOf( uuid );
		if( index >= 0 ) {
			iter.value.splice( index, 1 );
			this.add( uuid, newIndex );
		} else {
			throw new Error( "entry not found at index" );
		}
	}

	/**
	 * returns list of items between to indexes
	 * @param {*} lowerLimit index that represents lower limit for the list
	 * @param {*} upperLimit index that represents upper limit for the list
	 * @param {boolean} descending return uuids in descending order
	 * @param{number} revision revision of the index
	 * @return {function} generator function for uuid
	 */
	findBetween( { lowerLimit = null, upperLimit = null, descending = false, revision = this.revision } = {} ) {
		this.checkRevision( revision );
		const lower = lowerLimit ? this.tree.ge( lowerLimit ) : this.tree.begin;
		const upper = upperLimit ? this.tree.le( upperLimit ) : this.tree.end;
		const endKey = descending ? lower.key : upper.key;
		const next = descending ? "prev" : "next";
		const iterator = descending ? upper : lower;
		let index = descending ? iterator.value.length - 1 : 0;
		let items = iterator.value;
		let finished = false;
		return function*() {
			while( !finished ) {
				if( index < items.length && index >= 0 ) {
					yield [ items[index], iterator.key ];
					if( descending ) {
						index--;
					} else {
						index++;
					}
				} else {
					if( iterator.key === endKey ) {
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

module.exports = Index;
