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

module.exports = function() {
	const api = this; // eslint-disable-line consistent-this

	/**
	 * Discovers simplified definitions of models and compiles them into usable
	 * model classes.
	 */
	class OdemConverter {
		/**
		 * Processes discovered definitions of models.
		 *
		 * @param {object<string,object>} models raw definitions of models to be converted
		 * @param {Adapter} adapter provides default adapter to use for either defined model
		 * @return {object} provided object with contained definitions replaced with according implementations
		 */
		static processModelDefinitions( models, adapter ) {
			const { services: Services } = api.runtime;

			if ( !models || typeof models !== "object" ) {
				throw new TypeError( "missing or invalid map of model definitions" );
			}

			if ( !adapter || !( adapter instanceof Services.OdemAdapter ) ) {
				throw new TypeError( "missing or invalid adapter" );
			}


			// prepare data to detect either models' weight on being dependent of other models
			const tree = {};
			const { OdemUtilityString } = Services;

			for ( let names = Object.keys( models ), i = 0, numNames = names.length; i < numNames; i++ ) {
				const name = names[i];
				const definition = models[name] || {};

				const modelName = OdemUtilityString.autoKebabToPascal( definition.name || name );
				const parentName = Object.prototype.hasOwnProperty.call( definition, "parent" ) ?
					OdemUtilityString.autoKebabToPascal( definition.parent ) : null;

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

				if ( parent && !tree.hasOwnProperty( parent ) ) { // eslint-disable-line no-prototype-builtins
					throw new TypeError( `invalid reference on parent model ${parent} in context of model ${raw}` );
				}

				try {
					models[raw] = Services.OdemModel.define( name, definition, parent ? models[tree[parent].raw] : null, adapter );
				} catch ( error ) {
					throw new TypeError( `definition of model ${name} failed: ${error.message}` );
				}
			}


			return models;
		}
	}

	return OdemConverter;
};
