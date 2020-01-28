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

const { Readable } = require( "stream" );

module.exports = function() {
	const api = this; // eslint-disable-line consistent-this
	const { services: Services } = api.runtime;

	/**
	 * Implements code testing whether some property is equal given value.
	 *
	 * @alias this.runtime.services.OdemModelTesterIndexedBetween
	 */
	class OdemModelTesterIndexedBetween extends Services.OdemModelTester {
		/**
		 * @param {class<Model>} ModelClass class of associated model
		 * @param {iterator} index index handler provided by the ModelClass
		 * @param {string} upper upper limit to look for in named property
		 * @param {string} lower lower limit to look for in named property
		 * @param {boolean} fetchAscendingly set true to fetch UUIDs from index in ascending order
		 */
		constructor( ModelClass, index, upper, lower, fetchAscendingly ) {
			super();

			Object.defineProperties( this, {
				/**
				 * Exposes associated model's class.
				 *
				 * @name NonIndexedComparisonTester#ModelClass
				 * @property {class<Model>}
				 * @readonly
				 */
				ModelClass: { value: ModelClass },

				/**
				 * Index handler provided by the ModelClass
				 *
				 * @name OdemModelTesterIndexedBetween#index
				 * @property {EqualityIndex}
				 * @readonly
				 */
				index: { value: index },

				/**
				 * Upper limit for the tester
				 *
				 * @name OdemModelTesterIndexedBetween#value
				 * @property *
				 * @readonly
				 */
				upper: { value: upper },

				/**
				 * Lower limit for the tester
				 *
				 * @name OdemModelTesterIndexedBetween#value
				 * @property *
				 * @readonly
				 */
				lower: { value: lower },

				/**
				 * Indicates if UUIDs should be fetched from index in ascending
				 * order.
				 *
				 * @name OdemModelTesterIndexedBetween#fetchAscendingly
				 * @property {boolean}
				 * @readonly
				 */
				fetchAscendingly: { value: fetchAscendingly },
			} );
		}

		/** @inheritDoc */
		static fromDescription( ModelClass, description, testType = null, { sortBy = null, sortAscendingly = true } = {} ) { // eslint-disable-line no-unused-vars
			const name = description.name || description.property;
			if ( !name ) {
				throw new TypeError( "missing name of property to test" );
			}

			const { lower, upper } = description;
			if ( upper == null || lower == null ) {
				throw new TypeError( "missing one or both boundaries for testing values in between" );
			}

			const index = ModelClass.getIndex( name, "eq" );
			if ( index ) {
				if ( name === sortBy ) {
					return new this( ModelClass, index, upper, lower, sortAscendingly );
				}

				return new this( ModelClass, index, upper, lower, true );
			}

			throw new Error( "matching items between two limits not yet supported for non-indexed properties" );
		}

		/** @inheritDoc */
		createStream() {
			// FIXME teach findBetween to create stream to end iterating over output of some iterator
			const iterator = this.index.findBetween( {
				lowerLimit: this.lower,
				upperLimit: this.upper,
				descending: !this.fetchAscendingly,
			} )();

			const { ModelClass } = this;

			return new Readable( {
				objectMode: true,
				read() {
					let iter;
					do {
						iter = iterator.next();
						if ( iter.done ) {
							this.push( null );
							break;
						}
					} while ( this.push( new ModelClass( iter.value ) ) );
				}
			} );
		}
	}

	return OdemModelTesterIndexedBetween;
};
