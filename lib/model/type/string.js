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


const ModelType = require( "./base" );

/**
 * Implements scalar type `string` for use with attributes of defined models.
 *
 * @name ModelTypeString
 * @extends ModelType
 */
class ModelTypeString extends ModelType {
	/** @inheritDoc */
	static get typeName() {
		return "string";
	}

	/** @inheritDoc */
	static get aliases() {
		return ["text"];
	}

	/** @inheritDoc */
	static checkDefinition( definition ) {
		const errors = super.checkDefinition( definition );
		if ( !errors.length ) {
			if ( definition.minLength > definition.maxLength ) {
				const minLength = definition.minLength;
				definition.minLength = definition.maxLength;
				definition.maxLength = minLength;
			}

			if ( definition.maxLength < 1 ) {
				errors.push( new TypeError( "invalid requirement on maximum length" ) );
			}

			if ( definition.minLength < 0 ) {
				errors.push( new TypeError( "invalid requirement on minimum length" ) );
			}

			if ( definition.upperCase && definition.lowerCase ) {
				errors.push( new TypeError( "ambiguous request for converting case" ) );
			}
		}

		return errors;
	}

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static coerce( value, requirements = {} ) {
		if ( value == null ) {
			value = null;
		} else {
			if ( typeof value !== "string" ) {
				value = String( value );
			}

			if ( requirements.trim ) {
				value = value.trim();
			}

			if ( requirements.reduceSpace ) {
				value = value.replace( /\s+/g, " " );
			}

			const { lowerCase, upperCase } = requirements;

			if ( upperCase ) {
				switch ( typeof upperCase ) {
					case "object" :
						if ( Array.isArray( upperCase ) ) {
							value = value.toLocaleUpperCase( upperCase );
						} else {
							value = value.toLocaleUpperCase();
						}
						break;

					case "string" :
						value = value.toLocaleUpperCase( upperCase );
						break;

					default :
						value = value.toLocaleUpperCase();
				}
			}

			if ( lowerCase ) {
				switch ( typeof lowerCase ) {
					case "object" :
						if ( Array.isArray( lowerCase ) ) {
							value = value.toLocaleLowerCase( lowerCase );
						} else {
							value = value.toLocaleLowerCase();
						}
						break;

					case "string" :
						value = value.toLocaleLowerCase( lowerCase );
						break;

					default :
						value = value.toLocaleLowerCase();
				}
			}
		}

		return value;
	}
	/* eslint-enable no-param-reassign */

	/** @inheritDoc */
	static isValid( name, value, requirements, errors ) {
		if ( value == null ) {
			if ( requirements.required ) {
				errors.push( new Error( `${name} is required, but missing` ) );
			}
		} else {
			const { minLength, maxLength, pattern } = requirements;

			if ( maxLength > -1 ) {
				if ( value.length > maxLength ) {
					errors.push( new Error( `${name} exceeds maximum length of ${maxLength} characters` ) );
				}
			}

			if ( minLength > -1 ) {
				if ( value.length < minLength ) {
					errors.push( new Error( `${name} must contain at least ${minLength} characters` ) );
				}
			}

			if ( pattern ) {
				const re = typeof pattern === "string" ? new RegExp( pattern ) : pattern;

				if ( !re.test( value ) ) {
					errors.push( new Error( `${name} does not match required pattern` ) );
				}
			}
		}
	}

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static serialize( value ) {
		value = value == null ? null : String( value );

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

			case "lt" :
				result = value != null && reference != null && value.localeCompare( reference ) < 0;
				break;

			case "lte" :
				result = value != null && reference != null && value.localeCompare( reference ) < 1;
				break;

			case "gt" :
				result = value != null && reference != null && value.localeCompare( reference ) > 0;
				break;

			case "gte" :
				result = value != null && reference != null && value.localeCompare( reference ) > -1;
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

	/** @inheritDoc */
	static sort( left, right ) {
		return left == null ? -1 : right == null ? 1 : String( left ).localeCompare( right );
	}
}

module.exports = ModelTypeString;
