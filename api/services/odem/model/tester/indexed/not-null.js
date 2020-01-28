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
	const api = this;
	const { services: Services } = api.runtime;

	/**
	 * Implements code testing whether some property is equal given value.
	 *
	 * @alias this.runtime.services.OdemModelTesterIndexedNotNull
	 */
	class OdemModelTesterIndexedNotNull extends Services.OdemModelTester {
		/**
		 * @param {class<Model>} ModelClass class of associated model
		 * @param {iterator} handler index handler provided by the ModelClass
		 * @param {string} value value to look for in named property
		 */
		constructor( ModelClass, handler, value ) {
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
				 * @name OdemModelTesterIndexedNotNull#handler
				 * @property iterator
				 * @readonly
				 */
				handler: { value: handler },

				/**
				 * Value to look for.
				 *
				 * @name OdemModelTesterIndexedNotNull#value
				 * @property *
				 * @readonly
				 */
				value: { value: value },
			} );
		}

		/** @inheritDoc */
		static fromDescription( ModelClass, description, testType = null ) {
			const name = description.name || description.property;
			if ( !name ) {
				throw new TypeError( "missing name of property to test" );
			}

			const handler = ModelClass.getIndex( name, "eq" );

			if ( handler ) {
				return new this( ModelClass, handler, description.value );
			}

			return Services.OdemModelTesterNonIndexedComparison.fromDescription( ModelClass, description, testType );
		}

		/** @inheritDoc */
		createStream() {
			// FIXME teach findBetween to create stream to end iterating over output of some iterator
			const iterator = this.handler.findBetween()();
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

	return OdemModelTesterIndexedNotNull;
};
