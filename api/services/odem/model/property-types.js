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
	const { services: Services } = api.runtime;

	const map = {
		boolean: "OdemModelTypeBoolean",
		date: "OdemModelTypeDate",
		integer: "OdemModelTypeInteger",
		number: "OdemModelTypeNumber",
		string: "OdemModelTypeString",
		uuid: "OdemModelTypeUuid",
	};

	let resolvedAliases = false;


	/**
	 * Provides static map of supported types of model attributes.
	 */
	class OdemModelPropertyTypes {
		/**
		 * Retrieves deeply frozen static map of supported types' keys into either
		 * type's implementation.
		 *
		 * @returns {object<string,ModelType>} maps keys related to a type's name or alias into either type's implementation
		 */
		static get map() {
			return map;
		}

		/**
		 * Selects a type's implementation selected by its name.
		 *
		 * @param {string} name name or alias of type to select
		 * @returns {?ModelType} selected type's implementation, null on missing type
		 */
		static selectByName( name ) {
			if ( !resolvedAliases ) {
				resolvedAliases = true;

				const names = Object.keys( map );
				const numNames = names.length;

				for ( let i = 0; i < numNames; i++ ) {
					const key = names[i];

					const type = Services[map[key]];
					const aliases = type.aliases;
					const numAliases = aliases.length;

					for ( let j = 0; j < numAliases; j++ ) {
						const alias = aliases[j];

						if ( !map.hasOwnProperty( alias ) ) {
							map[alias] = map[key];
						}
					}
				}
			}

			const key = this.mapNameToKey( name );
			if ( Object.prototype.hasOwnProperty.call( map, key ) ) {
				return Services[map[key]];
			}

			return null;
		}

		/**
		 * Maps a type's name in quite arbitrary form to its related key used in
		 * collection's map for addressing either type's implementation.
		 *
		 * @param {string} name name or alias of type
		 * @returns {string} normalized key of type
		 */
		static mapNameToKey( name ) {
			if ( typeof name !== "string" ) {
				throw new TypeError( "invalid name of property type" );
			}

			return Services.OdemUtilityString.kebabToCamel( name.trim().toLocaleLowerCase() ).toLocaleUpperCase();
		}

		/**
		 * Exposes abstract base type all retrievable types are derived from.
		 *
		 * @returns {class<ModelType>} class implementing abstract base type
		 */
		static get abstract() {
			return Services.OdemModelType;
		}
	}

	return OdemModelPropertyTypes;
};
