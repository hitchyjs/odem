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


/**
 * Implements basic API of all model types.
 */
class ModelType {
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
	 * @returns {*} optionally coerced value
	 * @abstract
	 */
	static coerce( value, requirements = {} ) { // eslint-disable-line no-unused-vars
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

	/**
	 * Serializes the value e.g. for storing in a persistent storage.
	 *
	 * @note This method gets re-compiled as part of compiling model definitions
	 *       and thus mustn't use any closure scope! In addition, only `return`-
	 *       statement must be last in code to support those optimizations of
	 *       model compiler.
	 *
	 * @param {*} value value to be serialized
	 * @returns {string} serialized value
	 */
	static serialize( value ) {
		if ( value == null ) {
			value = null;
		}

		return value;
	}

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
	 * @param {*} value value to be compared, either provided value has been deserialized and coerced before
	 * @param {*} reference value to compare `value` with, either provided value has been coerced before
	 * @param {string} operation name of comparing operation to use
	 * @returns {boolean} true if comparison was matched by provided values
	 */
	static compare( value, reference, operation ) {
		let result;

		switch ( operation ) {
			case "eq" :
				result = value === reference;
				break;

			case "noteq" :
				result = value !== reference;
				break;

			case "lt" :
				result = value != null && reference != null && ( value < reference );
				break;

			case "lte" :
				result = value != null && reference != null && ( value <= reference );
				break;

			case "gt" :
				result = value != null && reference != null && ( value > reference );
				break;

			case "gte" :
				result = value != null && reference != null && ( value >= reference );
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
}

module.exports = ModelType;
