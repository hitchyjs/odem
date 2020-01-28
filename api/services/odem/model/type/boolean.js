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

	/**
	 * Implements scalar type `boolean` for use with attributes of defined models.
	 *
	 * @name OdemModelTypeBoolean
	 * @extends ModelType
	 */
	class OdemModelTypeBoolean extends Services.OdemModelType {
		/** @inheritDoc */
		static get typeName() {
			return "boolean";
		}

		/** @inheritDoc */
		static get aliases() {
			return ["bool"];
		}

		/* eslint-disable no-param-reassign */
		/** @inheritDoc */
		static coerce( value, requirements, defaultMarker ) { // eslint-disable-line no-unused-vars
			if ( value === defaultMarker && requirements ) {
				value = requirements.default;
			}

			if ( value == null ) {
				value = null;
			} else if ( /^\s*(t(?:rue)?|y(?:es)?|set|on)\s*$/i.test( value ) ) {
				value = true;
			} else if ( /^\s*(0|f(?:alse)?|no?|unset|off)\s*$/i.test( value ) ) {
				value = false;
			} else {
				value = Boolean( value );
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/** @inheritDoc */
		static isValid( name, value, requirements, errors ) {
			if ( value == null ) {
				if ( requirements.required ) {
					errors.push( new Error( `${name} must be boolean value` ) );
				}
			} else {
				const { isSet } = requirements;

				if ( isSet && !value ) {
					errors.push( new Error( `${name} must be set` ) );
				}
			}
		}

		/* eslint-disable no-param-reassign */
		/** @inheritDoc */
		static serialize( value, adapter ) { // eslint-disable-line no-unused-vars
			if ( value === "null" || value == null ) {
				value = null;
			} else {
				value = value ? 1 : 0;
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/* eslint-disable no-param-reassign */
		/** @inheritDoc */
		static deserialize( value ) {
			if ( value === "null" || value == null ) {
				value = null;
			} else if ( typeof value === "string" ) {
				value = value.trim();

				if ( global.hitchyPtnTrue.test( value ) ) {
					value = true;
				} else if ( global.hitchyPtnFalse.test( value ) ) {
					value = false;
				} else if ( global.hitchyPtnFloat.test( value ) ) {
					value = Boolean( parseFloat( value ) );
				} else {
					value = Boolean( value );
				}
			} else {
				value = Boolean( value );
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/** @inheritDoc */
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

				case "null" :
					result = value == null;
					break;

				case "notnull" :
					result = value != null;
					break;

				case "not" :
					result = !value;
					break;

				case "gte" :
				case "lte" :
					result = ( value == null && reference == null ) || value === reference;
					break;

				default :
					result = false;
					break;
			}

			return result;
		}

		/** @inheritDoc */
		static sort( left, right ) {
			return left == null ? 1 : right == null ? -1 : left === right ? 0 : left ? -1 : 1;
		}
	}

	return OdemModelTypeBoolean;
};
