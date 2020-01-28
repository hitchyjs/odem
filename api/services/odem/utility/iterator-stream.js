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


const { Readable } = require( "stream" );


module.exports = function() {
	/**
	 * Implements readable stream fed from an iterator.
	 */
	class OdemUtilityIteratorStream extends Readable {
		/**
		 * @param {Iterator} iterator iterator generating data to be streamed
		 * @param {object} options options applied to underlying stream
		 */
		constructor( iterator, options = {} ) {
			if ( !iterator || typeof iterator !== "object" || typeof iterator.next !== "function" ) {
				throw new TypeError( "invalid iterator" );
			}

			const _options = Object.assign( {}, options, {
				objectMode: true,
			} );

			super( _options );

			if ( _options.feeder ) {
				if ( typeof _options.feeder !== "function" ) {
					throw new TypeError( "invalid feeder function" );
				}

				this._read = _options.feeder;
			}

			Object.defineProperties( this, {
				/**
				 * @name OdemUtilityIteratorStream#iterator
				 * @property {Iterator}
				 * @readonly
				 */
				iterator: { value: iterator },

				/**
				 * @name OdemUtilityIteratorStream#options
				 * @property {object}
				 * @readonly
				 */
				options: { value: _options },
			} );
		}

		/** @inheritDoc */
		_read() {
			let writable = true;
			let item = {};

			while ( writable && !item.done ) {
				item = this.iterator.next();

				writable = this.push( item.done ? null : item.value );
			}
		}
	}

	return OdemUtilityIteratorStream;
};
