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


const PromiseUtils = require( "promise-essentials" );

const Types = require( "./type" );

const { defaultAdapter } = require( "../defaults" );

/**
 * @typedef {object} StaticModelContext
 * @property {string} name
 * @property {ModelSchema} schema
 * @property {Adapter} adapter
 * @property {function(string):string} keyToUuid
 */

/**
 * Implements "trait" injected into compiled models for managing collections of
 * instances per model.
 *
 * @note All methods of collection are designed to run in equivalent context of
 *       class derived from Model as returned by ModelCompiler(). Thus they are
 *       accessing several properties exposed by compiled model or instances of
 *       it.
 */
class Collection {
	/**
	 * Unconditionally lists existing items of model.
	 *
	 * @this {StaticModelContext}
	 * @param {int} offset number of items to skip
	 * @param {int} limit maximum number of items to retrieve
	 * @param {boolean} loadProperties set true to load properties per matching item prior to returning them
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @returns {Promise<Model[]>} promises fetched instances of model
	 */
	static list( offset = 0, limit = Infinity, loadProperties = false, metaCollector = null ) {
		const { adapter } = this;
		const numItems = limit < 1 ? Infinity : limit;
		const collected = numItems > 1000 ? [] : new Array( numItems );
		const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );
		let numSkipped = offset;
		let written = 0;
		let count = 0;

		return PromiseUtils.process( stream, dataKey => { // eslint-disable-line consistent-return
			count++;

			if ( numSkipped > 0 ) {
				numSkipped--;
			} else if ( written < numItems ) {
				const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

				if ( loadProperties ) {
					return item.load()
						.then( () => {
							collected[written++] = item;

							if ( !metaCollector && written >= numItems ) {
								stream.pause();
								stream.emit( "cancel" );
							}
						} );
				}

				collected[written++] = item;

				if ( !metaCollector && written >= numItems ) {
					stream.pause();
					stream.emit( "cancel" );
				}
			}
		} )
			.then( () => {
				collected.splice( written );

				if ( metaCollector ) {
					metaCollector.count = count;
				}

				return collected;
			} );
	}

	/**
	 * Searches collection of current model for items matching selected test
	 * on values of a given attribute of model.
	 *
	 * @this {StaticModelContext}
	 * @param {string} name name of model's attribute to inspect for finding matches
	 * @param {*} value value to compare each model's attribute with for finding matches
	 * @param {string} operation name of operation to perform to detect match
	 * @param {int} offset number of leading matches to skip
	 * @param {int} limit maximum number of matches to retrieve
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @returns {Promise<Model[]>} resulting matches
	 */
	static findByAttribute( name, value = null, operation = "eq", offset = 0, limit = Number( Infinity ), metaCollector = null ) {
		const definition = this.schema.attributes[name];
		if ( !definition ) {
			throw new TypeError( `no such attribute: ${name}` );
		}

		const type = Types.selectByName( definition.type );
		if ( !type ) {
			throw new TypeError( `invalid type ${definition.type} of attribute ${name}` );
		}

		const coercedValue = type.coerce( value, definition );
		const adapter = this.adapter || defaultAdapter;
		const path = `models/${this.name}/items`;
		const collected = limit > 1000 ? [] : new Array( limit );
		let numSkipped = offset;
		let written = 0;
		let count = 0;

		const stream = adapter.keyStream( { prefix: path } );

		return PromiseUtils.process( stream, dataKey => {
			const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

			return item.load()
				.then( () => {
					const itemValue = type.coerce( type.deserialize( item.properties[name] ), definition );

					if ( type.compare( itemValue, coercedValue, operation ) ) {
						count++;

						if ( numSkipped > 0 ) {
							numSkipped--;
						} else if ( written < limit ) {
							collected[written++] = item;

							if ( !metaCollector && written >= limit ) {
								stream.pause();
								stream.emit( "cancel" );
							}
						}
					}
				} );
		} )
			.then( () => {
				collected.splice( written );

				if ( metaCollector ) {
					metaCollector.count = count;
				}

				return collected;
			} );
	}

	/**
	 * Injects static methods of `Collection` into provided function or object.
	 *
	 * @param {object|function} fn "class" or object to inject `Collection` into
	 * @returns {object|function} provided function or object w/ methods injected
	 */
	static injectInto( fn ) {
		switch ( typeof fn ) {
			case "object" :
				if ( !fn ) {
					break;
				}

			// falls through
			case "function" : {
				const injector = {};
				const names = [
					"list",
					"findByAttribute",
				];

				for ( let i = 0, length = names.length; i < length; i++ ) {
					const name = names[i];

					injector[name] = { value: this[name] };
				}

				Object.defineProperties( fn, injector );

				return fn;
			}
		}

		throw new TypeError( "invalid target for injecting Collection trait into" );
	}
}

module.exports = Collection;
