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


const Adapters = require( "./lib/adapter" );
const Models = require( "./lib/model" );
const Utilities = require( "./lib/utility" );

const { Model } = Models;
const { Adapter, MemoryAdapter } = Adapters;

const { String: { kebabToPascal } } = Utilities;


module.exports = Object.assign( {},
	Models,
	Adapters,
	Utilities,
	{
		defaults: require( "./lib/defaults" )
	}, {
		onExposed( /* options */ ) {
			const { log, runtime: { models, config } } = this;
			const Log = log( "odem" );

			// choose configured default adapter for storing model instances
			let adapter = ( config.database || {} ).default;
			if ( adapter ) {
				if ( !( adapter instanceof Adapter ) ) {
					Log( "invalid adapter:", adapter );
					return;
				}
			} else {
				adapter = new MemoryAdapter();
			}

			// compile exposed definitions of models into model classes
			const modelNames = Object.keys( models );

			for ( let i = 0, numNames = modelNames.length; i < numNames; i++ ) {
				const name = modelNames[i];
				const definition = models[name] || {};

				const modelName = definition.$name || kebabToPascal( name.toLocaleLowerCase() );

				const schema = {};

				mergeAttributes( schema, definition.attributes || {} );
				mergeComputeds( schema, definition.computeds || {} );
				mergeHooks( schema, definition.hooks || {} );

				models[name] = Model.define( modelName, schema, null, adapter );
			}
		}
	}
);

/**
 * Merges separately defined map of static attributes into single schema
 * matching expectations of hitchy-odem.
 *
 * @param {object} target resulting schema for use with hitchy-odem
 * @param {object<string,function>} source maps names of attributes into either one's definition of type and validation requirements
 * @returns {void}
 */
function mergeAttributes( target, source ) {
	const propNames = Object.keys( source );

	for ( let i = 0, numNames = propNames.length; i < numNames; i++ ) {
		const name = propNames[i];
		const attribute = source[name];

		switch ( typeof attribute ) {
			case "object" :
				if ( attribute ) {
					break;
				}

			// falls through
			default :
				throw new TypeError( `invalid definition of attribute named "${name}": must be object` );
		}

		target[name] = attribute;
	}
}

/**
 * Merges separately defined map of computed attributes into single schema
 * matching expectations of hitchy-odem.
 *
 * @param {object} target resulting schema for use with hitchy-odem
 * @param {object<string,function>} source maps names of computed attributes into the related computing function
 * @returns {void}
 */
function mergeComputeds( target, source ) {
	const propNames = Object.keys( source );

	for ( let i = 0, numNames = propNames.length; i < numNames; i++ ) {
		const name = propNames[i];
		const computer = source[name];

		switch ( typeof computer ) {
			case "function" :
				break;

			default :
				throw new TypeError( `invalid definition of computed attribute named "${name}": must be a function` );
		}

		target[name] = computer;
	}
}

/**
 * Merges separately defined map of lifecycle hooks into single schema matching
 * expectations of hitchy-odem.
 *
 * @param {object} target resulting schema for use with hitchy-odem
 * @param {object<string,(function|function[])>} source maps names of lifecycle hooks into the related callback or list of callbacks
 * @returns {void}
 */
function mergeHooks( target, source ) {
	const propNames = Object.keys( source );

	for ( let i = 0, numNames = propNames.length; i < numNames; i++ ) {
		const name = propNames[i];
		let hook = source[name];

		if ( typeof hook === "function" ) {
			hook = [hook];
		}

		if ( !Array.isArray( hook ) ) {
			throw new TypeError( `invalid definition of hook named "${name}": must be a function or list of functions` );
		}

		for ( let hi = 0, numHooks = hook.length; hi < numHooks; hi++ ) {
			if ( typeof hook[hi] !== "function" ) {
				throw new TypeError( `invalid definition of hook named "${name}": not a function at index #${hi}` );
			}
		}

		target[name] = hook;
	}
}
