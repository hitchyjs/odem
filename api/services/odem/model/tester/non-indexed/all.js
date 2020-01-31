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

const { Readable, Transform } = require( "stream" );

module.exports = function() {
	const api = this;
	const { services: Services } = api.runtime;
	const logDebug = api.log( "hitchy:odem:debug" );

	/**
	 * Implements code considering any record to be satisfy the test.
	 *
	 * @alias this.runtime.services.OdemModelTesterNonIndexedAll
	 */
	class OdemModelTesterNonIndexedAll extends Services.OdemModelTester {
		/**
		 * @param {class<Model>} ModelClass class of associated model
		 * @param {OdemModelIndexerEquality} index index to use for retrieving UUIDs
		 * @param {boolean} fetchAscendingly set true to fetch UUIDs from index in ascending order
		 */
		constructor( ModelClass, index = null, fetchAscendingly = true ) {
			super();

			Object.defineProperties( this, {
				/**
				 * Exposes associated model's class.
				 *
				 * @name OdemModelTesterNonIndexedAll#ModelClass
				 * @property {class<Model>}
				 * @readonly
				 */
				ModelClass: { value: ModelClass },

				/**
				 * Exposes optionally provided index instance.
				 *
				 * @name OdemModelTesterNonIndexedAll#index
				 * @property {OdemModelIndexerEquality}
				 * @readonly
				 */
				index: { value: index },

				/**
				 * Exposes information on whether fetching UUIDs from index in
				 * ascending order.
				 *
				 * @name OdemModelTesterNonIndexedAll#fetchAscendingly
				 * @property {boolean}
				 * @readonly
				 */
				fetchAscendingly: { value: fetchAscendingly },
			} );
		}

		/** @inheritDoc */
		static fromDescription( ModelClass, description, testType, { sortBy = null, sortAscendingly = true } = {} ) { // eslint-disable-line no-unused-vars
			if ( ModelClass.indices.length > 0 ) {
				const index = ModelClass.getIndex( sortBy, "eq" );
				if ( index ) {
					logDebug( "fetching all using properly sorted index %s of %s.%s", index.constructor.name, ModelClass.name, sortBy );

					return new this( ModelClass, index, sortAscendingly );
				}

				logDebug( "fetching all using first available index %s of %s.%s",
					ModelClass.indices[0].handler.constructor.name, ModelClass.name, ModelClass.indices[0].property );

				return new this( ModelClass, ModelClass.indices[0].handler, true );
			}

			return new this( ModelClass );
		}

		/** @inheritDoc */
		createStream() {
			const { ModelClass, index, fetchAscendingly } = this;

			if ( index ) {
				const iter = index.findBetween( {
					descending: !fetchAscendingly,
					appendNullItems: true,
				} )();

				return new Readable( {
					objectMode: true,
					read() {
						const { done, value: uuid } = iter.next();

						logDebug( "retrieving %s match %s", done ? "final" : "next", uuid ? uuid.toString( "hex" ) : "<unset>" );

						if ( done ) {
							this.push( null );
						} else {
							this.push( new ModelClass( uuid ) );
						}
					}
				} );
			}

			const uuidStream = ModelClass.uuidStream();

			const uuidToItem = new Transform( {
				objectMode: true,
				transform( uuid, _, done ) {
					this.push( new ModelClass( uuid ) );
					done();
				}
			} );

			uuidToItem.on( "close", () => {
				uuidStream.unpipe( uuidToItem );
				uuidStream.pause();
				uuidStream.destroy();
			} );

			uuidStream.pipe( uuidToItem );

			return uuidToItem;
		}
	}

	return OdemModelTesterNonIndexedAll;
};
