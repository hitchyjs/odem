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

module.exports = function() {
	const api = this;
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
	 * Implements basic API of all model types.
	 *
	 * @alias this.runtime.servicers.OdemModelType
	 */
	class OdemModelType {
		// eslint-disable-next-line valid-jsdoc
		/**
		 * Fetches this type's name.
		 *
		 * @returns {string}
		 * @abstract
		 */
		static get typeName() {
			throw new Error( "must not use abstract model type" );
		}

		/**
		 * Lists valid aliases of current type handler.
		 *
		 * @note This list is used on commonly exposing all available types of
		 *       attributes by name. Aliases are ignored if there is an existing
		 *       type of same name.
		 *
		 * @returns {Array} list of aliases available for selecting this type, too
		 */
		static get aliases() {
			return [];
		}

		/**
		 * Detects if provided definition is suitable for current type of model
		 * attribute.
		 *
		 * @note Provided definition might be adjusted by method to fix recoverable
		 *       errors.
		 *
		 * @param {object} definition set of definition parameters for customizing some attribute's type
		 * @returns {Error[]} lists encountered errors, empty on success
		 */
		static checkDefinition( definition ) {
			if ( !definition || typeof definition !== "object" || Array.isArray( definition ) ) {
				return [new TypeError( "invalid definition" )];
			}

			return [];
		}

		/**
		 * Coerces provided value to match current type.
		 *
		 * @note This method gets re-compiled as part of compiling model definitions
		 *       and thus mustn't use any closure scope! In addition, only `return`-
		 *       statement must be last in code to support those optimizations of
		 *       model compiler.
		 *
		 * @param {*} value value to be coerced
		 * @param {object} requirements object used to customize type
		 * @param {*} defaultMarker value demanding to actually assign of defined default value
		 * @returns {*} optionally coerced value
		 * @abstract
		 */
		static coerce( value, requirements, defaultMarker ) { // eslint-disable-line no-unused-vars
			if ( value === defaultMarker && requirements ) {
				value = requirements.default; // eslint-disable-line no-param-reassign
			}

			return value;
		}

		/**
		 * Detects if provided value is valid according to this type obeying
		 * provided requirements.
		 *
		 * @note This method gets re-compiled as part of compiling model definitions
		 *       and thus mustn't use any closure scope! In addition, only `return`-
		 *       statement must be last in code to support those optimizations of
		 *       model compiler.
		 *
		 * @param {string} name of attribute (for use in error messages)
		 * @param {*} value value to be validated
		 * @param {object} requirements object used to customize type
		 * @param {Error[]} errors collects errors
		 * @returns {void}
		 * @abstract
		 */
		static isValid( name, value, requirements, errors ) { // eslint-disable-line no-unused-vars
			throw new Error( "must not use abstract model type" );
		}

		/* eslint-disable no-param-reassign */
		/**
		 * Serializes the value e.g. for storing in a persistent storage.
		 *
		 * @note This method gets re-compiled as part of compiling model definitions
		 *       and thus mustn't use any closure scope! In addition, only `return`-
		 *       statement must be last in code to support those optimizations of
		 *       model compiler.
		 *
		 * @param {*} value value to be serialized
		 * @param {*} adapter reference on adapter used for storing serialized value
		 * @returns {string} serialized value
		 */
		static serialize( value, adapter ) { // eslint-disable-line no-unused-vars
			if ( value == null ) {
				value = null;
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/**
		 * De-serializes value e.g. as read from a persistent storage.
		 *
		 * @note This method gets re-compiled as part of compiling model definitions
		 *       and thus mustn't use any closure scope! In addition, only `return`-
		 *       statement must be last in code to support those optimizations of
		 *       model compiler.
		 *
		 * @param {string} value value to be de-serialized
		 * @returns {*} de-serialized value
		 */
		static deserialize( value ) {
			return value;
		}

		/**
		 * Compares provided value with given reference according to selected
		 * comparison operation.
		 *
		 * @note This method gets re-compiled as part of compiling model definitions
		 *       and thus mustn't use any closure scope! In addition, only `return`-
		 *       statement must be last in code to support those optimizations of
		 *       model compiler. This method must be implemented synchronously and
		 *       should neither throw exceptions nor invoke functions for maximum
		 *       performance.
		 *
		 * @param {*} value value to be compared, has been deserialized and coerced before
		 * @param {*} reference value to compare `value` with, has been coerced before
		 * @param {string} operation name of comparing operation to use
		 * @returns {boolean} true if comparison was matched by provided values
		 */
		static compare( value, reference, operation ) {
			let result;

			switch ( operation ) {
				case "eq" :
					result = value === reference;
					break;

				case "neq" :
				case "noteq" :
					result = value !== reference;
					break;

				case "lt" :
					result = value != null && reference != null && ( value < reference );
					break;

				case "lte" :
					if ( value == null ) {
						result = reference == null;
					} else {
						result = reference != null && ( value <= reference );
					}
					break;

				case "gt" :
					result = value != null && reference != null && ( value > reference );
					break;

				case "gte" :
					if ( value == null ) {
						result = reference == null;
					} else {
						result = reference != null && ( value >= reference );
					}
					break;

				case "null" :
					result = value == null;
					break;

				case "notnull" :
					result = value != null;
					break;

				case "not" :
					result = !value;
					break;

				default :
					result = false;
					break;
			}

			return result;
		}

		/**
		 * Compares two provided values of current type describing result using
		 * integer.
		 *
		 * @param {*} left first of two values to compare with each other
		 * @param {*} right second of two values to compare with each other
		 * @returns {int} <0 if first value is less than second, >0 if first is greater than second, ==0 when both are equal
		 */
		static sort( left, right ) {
			return left == null ? 1 : right == null ? -1 : left - right;
		}

		/**
		 * Indicates if current type is sortable.
		 *
		 * @returns {boolean} true if type is sortable
		 */
		static get sortable() { return true; }

		/**
		 * Selects a type's implementation selected by its name.
		 *
		 * @param {string} name name or alias of type to select
		 * @returns {?OdemModelType} selected type's implementation, null on missing type
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
						const alias = mapNameToKey( aliases[j] );

						if ( !map.hasOwnProperty( alias ) ) {
							map[alias] = map[key];
						}
					}
				}
			}

			const key = mapNameToKey( name );
			if ( Object.prototype.hasOwnProperty.call( map, key ) ) {
				return Services[map[key]];
			}

			return null;

			/**
			 * Maps a type's name in quite arbitrary form to its related key used in
			 * collection's map for addressing either type's implementation.
			 *
			 * @param {string} name name or alias of type
			 * @returns {string} normalized key of type
			 */
			function mapNameToKey( name ) {
				if ( typeof name !== "string" ) {
					throw new TypeError( "invalid name of property type" );
				}

				return Services.OdemUtilityString.kebabToCamel( name.trim().toLocaleLowerCase() );
			}
		}
	}

	return OdemModelType;
};
