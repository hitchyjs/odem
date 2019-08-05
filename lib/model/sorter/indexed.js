/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

const { Transform } = require( "stream" );

/**
 * Implements stream sorting items with the help of an index.
 */
class IndexedSorter extends Transform {
	/**
	 * @param {EqualityIndex} index index of values to use
	 * @param {boolean} ascending true for sorting in ascending order
	 */
	constructor( index, ascending ) {
		super( {
			objectMode: true,
		} );


		const generator = index.findBetween( { descending: !ascending } );
		const iterator = generator();


		Object.defineProperties( this, {
			/**
			 * Generates UUIDs covered by index in desired sorting order.
			 *
			 * @name IndexedSorter#sortedUuids
			 * @property {Generator}
			 * @readonly
			 */
			sortedUUIDs: { value: iterator },

			/**
			 * Indicates whether sorting in ascending order or not.
			 *
			 * @name NonIndexedSorter#ascending
			 * @property {boolean}
			 * @readonly
			 */
			ascending: { value: Boolean( ascending ) },

			/**
			 * Collects items that couldn't be sorted yet.
			 *
			 * @name NonIndexedSorter#collector
			 * @property {Model[]}
			 * @readonly
			 */
			collector: { value: [] },
		} );


		this.nextAssumed = iterator.next();
	}

	/** @inheritDoc */
	_transform( item, _, done ) {
		const { done: doneBefore, value: nextUUID } = this.nextAssumed;

		if ( doneBefore ) {
			// met end of sorting property's index before
			// -> property is undefined/null for any further item
			//    -> just pass ...
			this.push( item );
		} else if ( item.$uuid === nextUUID ) {
			// got item which is next in desired sorting
			// -> don't collect, but pass instantly
			this.push( item );

			// prepare to find next assumed record
			const collecteds = this.collector;
			let doneNow = false;
			let foundAgain = true;

			while ( !doneNow && foundAgain ) {
				const iter = this.nextAssumed = this.sortedUUIDs.next();

				doneNow = iter.done;
				if ( !doneNow ) {
					const numCollected = collecteds.length;

					foundAgain = false;

					for ( let i = 0; i < numCollected; i++ ) {
						const collected = collecteds[i];

						if ( collected.$uuid.equals( iter.value ) ) {
							// collected next item in sorting index before
							// -> push instantly
							this.push( collected );

							collecteds.splice( i, 1 );
							foundAgain = true;
							break;
						}
					}
				}
			}

			if ( doneNow ) {
				// met end of index covering actual values of sorting property
				// -> flush all previously collected items for they won't be
				//    sorted any better
				const numCollected = collecteds.length;
				for ( let i = 0; i < numCollected; i++ ) {
					this.push( collecteds[i] );
				}

				this.collector.splice( 0 );
			}
		} else {
			// need to collect this item to be sorted later
			this.collector.push( item );
		}

		done();
	}

	/** @inheritDoc */
	_flush( done ) {
		const collected = this.collector;
		let numCollected = collected.length;

		if ( numCollected > 0 ) {
			// there are some items left collected for being sorted right now
			// -> push every matching item encountered while consuming rest of sorting index
			for ( const uuid of this.sortedUUIDs ) {
				for ( let i = 0; i < numCollected; i++ ) {
					const item = collected[i];

					if ( item.$uuid.equals( uuid ) ) {
						this.push( item );

						collected.splice( i, 1 );
						numCollected--;
						break;
					}
				}
			}
		}

		done();
	}
}

module.exports = IndexedSorter;
