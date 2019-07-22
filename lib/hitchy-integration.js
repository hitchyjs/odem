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

const { Model } = require( "./model" );
const { Adapter } = require( "./adapter" );
const { String: { autoKebabToPascal } } = require( "./utility" );


/**
 * Processes discovered definitions of models.
 *
 * @param {object} models reference on models' definitions to be replaced with actual implementations of either model
 * @param {Adapter} adapter provides default adapter to use for either defined model
 * @return {object} provided object with contained definitions replaced with according implementations
 */
function processDiscoveredModelDefinitions( models, adapter ) {
	if ( !models || typeof models !== "object" ) {
		throw new TypeError( "missing or invalid map of model definitions" );
	}

	if ( !adapter || !( adapter instanceof Adapter ) ) {
		throw new TypeError( "missing or invalid adapter" );
	}


	// prepare data to detect either models' weight on being dependent of other models
	const tree = {};

	for ( let names = Object.keys( models ), i = 0, numNames = names.length; i < numNames; i++ ) {
		const name = names[i];
		const definition = models[name] || {};

		const modelName = autoKebabToPascal( definition.$name || name );
		const parentName = definition.hasOwnProperty( "$parent" ) ? autoKebabToPascal( definition.$parent ) : null;

		tree[modelName] = {
			weight: 0,
			raw: name,
			parent: parentName,
		};
	}


	// traverse either model's sequence of parent models increasing weight on
	// either encountered dependency for defining some model
	const modelNames = Object.keys( tree );
	const numModels = modelNames.length;

	for ( let i = 0; i < numModels; i++ ) {
		const name = modelNames[i];
		let node = tree[name];

		for ( let parentName = node.parent; parentName; parentName = node.parent ) {
			node = tree[parentName];
			if ( node ) {
				node.weight++;
			} else {
				break;
			}
		}
	}


	// sort names of models according to found dependency weights per model
	modelNames.sort( ( l, r ) => tree[r].weight - tree[l].weight );


	// eventually process definitions model by model in a dependency-based order
	for ( let i = 0; i < numModels; i++ ) {
		const name = modelNames[i];
		const { raw, parent } = tree[name];
		const definition = models[raw] || {};
		let schema = {};

		if ( parent && !tree.hasOwnProperty( parent ) ) {
			throw new TypeError( `invalid reference on parent model ${parent} in context of model ${raw}` );
		}

		if ( definition.hasOwnProperty( "attributes" ) || definition.hasOwnProperty( "computeds" ) ) {
			// support old style of providing attributes, computeds etc. in separate sections of definition
			mergeAttributes( schema, definition.attributes || {} );
			mergeComputeds( schema, definition.computeds || {} );
			mergeHooks( schema, definition.hooks || {} );
		} else {
			schema = definition;
		}

		models[raw] = Model.define( name, schema, parent ? models[tree[parent].raw] : null, adapter );
	}


	return models;
}

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


module.exports = {
	processDiscoveredModelDefinitions,
};
