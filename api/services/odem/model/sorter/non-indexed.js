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

module.exports = function() {
	/**
	 * Implements stream sorting items without help of an index.
	 *
	 * @note This sorter is a transform stream that needs to load all provided items
	 *       first. Thus it might block in case of using it with a very large number
	 *       of items. Consider using index-based sorting whenever possible.
	 */
	class OdemModelSorterNonIndexed extends Transform {
		/**
		 * @param {class<Model>} ModelClass model of items to be sorted
		 * @param {string} propertyName name of property to sort by
		 * @param {boolean} ascending true for sorting in ascending order
		 */
		constructor( ModelClass, propertyName, ascending ) {
			super( {
				objectMode: true,
			} );


			const definition = ModelClass.schema.props[propertyName];
			if ( !definition ) {
				throw new TypeError( `no such property: ${propertyName}` );
			}

			const type = definition.$type;
			if ( !type || typeof type.compare !== "function" ) {
				throw new TypeError( `invalid type ${definition.type} of property ${propertyName}` );
			}


			Object.defineProperties( this, {
				/**
				 * Names property to sort by.
				 *
				 * @name OdemModelSorterNonIndexed#propertyName
				 * @property {string}
				 * @readonly
				 */
				propertyName: { value: propertyName },

				/**
				 * Indicates whether sorting in ascending order or not..
				 *
				 * @name OdemModelSorterNonIndexed#ascending
				 * @property {boolean}
				 * @readonly
				 */
				ascending: { value: Boolean( ascending ) },

				/**
				 * Exposes handler for property's type of values.
				 *
				 * @name OdemModelSorterNonIndexed#type
				 * @property {ModelType}
				 * @readonly
				 */
				type: { value: type },

				/**
				 * Exposes definition of property.
				 *
				 * @name OdemModelSorterNonIndexed#propertyDefinition
				 * @property {object}
				 * @readonly
				 */
				propertyDefinition: { value: definition },

				/**
				 * Collects items to be sorted eventually.
				 *
				 * @name OdemModelSorterNonIndexed#collector
				 * @property {Model[]}
				 * @readonly
				 */
				collector: { value: [] },
			} );
		}

		/** @inheritDoc */
		_transform( item, _, done ) {
			if ( item.$isMarkedLoaded ) {
				this.collector.push( item );
				done();
			} else {
				item.load()
					.then( () => {
						this.collector.push( item );
						done();
					} )
					.catch( done );
			}
		}

		/** @inheritDoc */
		_flush( done ) {
			const { propertyName, type, collector } = this;
			const numCollected = collector.length;

			if ( this.ascending ) {
				collector.sort( ( left, right ) => {
					const l = left.$properties[propertyName];
					const r = right.$properties[propertyName];

					return l == null ? 1 : r == null ? -1 : type.sort( l, r );
				} );
			} else {
				collector.sort( ( left, right ) => {
					const l = left.$properties[propertyName];
					const r = right.$properties[propertyName];

					return l == null ? 1 : r == null ? -1 : type.sort( r, l );
				} );
			}


			for ( let i = 0; i < numCollected; i++ ) {
				this.push( collector[i] );
			}

			done();
		}
	}

	return OdemModelSorterNonIndexed;
};
