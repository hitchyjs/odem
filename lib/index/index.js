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
	 */
	constructor( compare ) {
		this.tree = RBTree( compare );
	}

	/**
	 * adds item to key in the index
 	 * @param{*} index key that item should be indexed for
	 * @param{uuid} item item that should be added to the index
	 * @returns{boolean|number} true if new entry for index was created
	 */
	add( index, item ) {
		const entry = this.tree.find( index );
		if( entry.valid ) {
			entry.value.push( item );
			return 0;
		}
		this.tree = this.tree.insert( index, [item] );
		return 1;

	}

	/**
	 * returns list of items
	 * @param {*} index key that is used as index
	 * @param {boolean} descending return uuids in descending order
	 * @return {[uuid]} list of uuid
	 */
	find( index, descending ) {
		const iterator = this.tree.find( index );
		if( iterator.valid ) {
			const items = iterator.value;
			let i = descending ? items.length - 1 : 0;
			return function*() {
				while( i < items.length && i >= 0 ) {
					yield [ items[i], iterator.key ];
					if( descending )i--; else i++;
				}
			};
		}
		// eslint-disable-next-line no-empty-function
		return function*() {};
	}

	/**
	 * deletes an item form the index
	 * @param {*} index index to delete item from
	 * @param {uuid} uuid uuid of the item to remove from index
	 * @return {boolean|number} true if deleted, false if not in index;
	 */
	delete( index, uuid ) {
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
	 * returns list of items between to indexes
	 * @param {*} lowerLimit index that represents lower limit for the list
	 * @param {*} upperLimit index that represents upper limit for the list
	 * @param {boolean} descending return uuids in descending order
	 * @return {function} generator function for uuid
	 */
	findBetween( { lowerLimit = null, upperLimit = null, descending = false } = {} ) {
		const lower = lowerLimit ? this.tree.ge( lowerLimit ) : this.tree.begin;
		const upper = upperLimit ? this.tree.le( upperLimit ) : this.tree.end;
		const endKey = descending ? lower.key : upper.key;
		const next = descending ? "prev" : "next";
		let finished = false;
		const iterator = descending ? upper : lower;
		let index = descending ? iterator.value.length - 1 : 0;
		let items = iterator.value;
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
