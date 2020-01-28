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
	const api = this;
	const { services: Services } = api.runtime;

	/**
	 * Implements legacy code testing whether some property per record is satisfying
	 * described operation or not.
	 *
	 * @alias this.runtime.services.OdemModelTesterNonIndexedComparison
	 */
	class OdemModelTesterNonIndexedComparison extends Services.OdemModelTester {
		/**
		 * @param {class<Model>} ModelClass class of associated model
		 * @param {string} operation name of operation to perform per record
		 * @param {string} propertyName name of property to test per record
		 * @param {string} value value to look for in named property
		 * @param {ModelType} typeHandler handler for defined type of property's values
		 * @param {object} propertyDefinition definition of property
		 */
		constructor( ModelClass, operation, propertyName, value, typeHandler, propertyDefinition ) {
			super();


			Object.defineProperties( this, {
				/**
				 * Exposes associated model's class.
				 *
				 * @name OdemModelTesterNonIndexedComparison#ModelClass
				 * @property {class<Model>}
				 * @readonly
				 */
				ModelClass: { value: ModelClass },

				/**
				 * Name of comparison operation to perform per record.
				 *
				 * @name OdemModelTesterNonIndexedComparison#operation
				 * @property {string}
				 * @readonly
				 */
				operation: { value: operation },

				/**
				 * Names property to test.
				 *
				 * @name OdemModelTesterNonIndexedComparison#propertyName
				 * @property {string}
				 * @readonly
				 */
				propertyName: { value: propertyName },

				/**
				 * Value to look for.
				 *
				 * @name OdemModelTesterNonIndexedComparison#value
				 * @property {*}
				 * @readonly
				 */
				value: { value: value },

				/**
				 * Handler for property's type of values.
				 *
				 * @name OdemModelTesterNonIndexedComparison#type
				 * @property {ModelType}
				 * @readonly
				 */
				type: { value: typeHandler },

				/**
				 * Definition of property in model's schema.
				 *
				 * @name OdemModelTesterNonIndexedComparison#definition
				 * @property {object}
				 * @readonly
				 */
				definition: { value: propertyDefinition },
			} );
		}

		/** @inheritDoc */
		static fromDescription( ModelClass, description, operation, { sortBy = null, sortAscendingly = true } = {} ) { // eslint-disable-line no-unused-vars
			const name = description.name || description.property;
			if ( !name ) {
				throw new TypeError( "missing name of property to test" );
			}

			const propDefinition = ModelClass.schema.props[name];
			const computedDefinition = ModelClass.schema.computed[name];

			if ( !propDefinition && !computedDefinition ) {
				throw new TypeError( `no such property: ${name}` );
			}

			const definition = propDefinition || computedDefinition;
			let type;

			type = definition.$type;
			if ( !type ) {
				type = Services.OdemModelType;
			}

			if ( typeof type.compare !== "function" ) {
				throw new TypeError( `invalid type ${definition.type} of property ${name}` );
			}

			return new this( ModelClass, operation, name, type.coerce( description.value, definition, ModelClass.prototype.$default ), type, definition );
		}

		/** @inheritDoc */
		createStream() {
			const { ModelClass, type, operation, propertyName, value, definition } = this;
			const { adapter } = ModelClass;
			const isComputed = !ModelClass.schema.props[propertyName];

			const source = ModelClass.uuidStream();
			const converter = new Transform( {
				objectMode: true,
				transform( uuid, _, done ) {
					const item = new ModelClass( uuid, { adapter } ); // eslint-disable-line new-cap

					item.load()
						.then( () => {
							const itemValue = type.coerce(
								isComputed ? item[propertyName] : item.$properties[propertyName],
								definition,
								ModelClass.prototype.$default
							);

							if ( type.compare( itemValue, value, operation ) ) {
								this.push( item );
							}

							done();
						} )
						.catch( done );
				}
			} );

			converter.on( "close", () => {
				source.unpipe( converter );
				source.pause();
				source.destroy();
			} );

			source.pipe( converter );

			return converter;
		}
	}

	return OdemModelTesterNonIndexedComparison;
};
