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

const ModelType = require( "./base" );

/**
 * Implements scalar type `string` for use with attributes of defined models.
 *
 * @name ModelTypeString
 * @extends ModelType
 */
class ModelTypeUUID extends ModelType {
	/** @inheritDoc */
	static get typeName() {
		return "uuid";
	}

	/** @inheritDoc */
	static get aliases() {
		return [ "key", "foreign", "foreign key" ];
	}

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static coerce( value, requirements = {} ) { // eslint-disable-line no-unused-vars
		if ( value == null ) {
			value = null;
		} else {
			if ( !Buffer.isBuffer( value ) ) {
				if ( typeof value === "string" ) {
					value = value.trim();
				} else {
					value = String( value ).trim();
				}

				if ( /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test( value ) ) {
					value = Buffer.from( value.replace( /-/g, "" ), "hex" );
				} else {
					value = null;
				}
			}

			if ( value && value.length !== 16 ) {
				value = null;
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
		}
	}

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static serialize( value, adapter ) {
		if ( value == null ) {
			value = null;
		} else if ( !adapter.supportsBinary ) {
			value = value.toString( "hex" ).replace( /^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5" );
		}

		return value;
	}
	/* eslint-enable no-param-reassign */

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static deserialize( value ) {
		if ( value == null ) {
			value = null;
		} else if ( typeof value === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test( value ) ) {
			value = Buffer.from( value.replace( /-/g, "" ), "hex" );
		} else if ( !Buffer.isBuffer( value ) || value.length !== 16 ) {
			value = null;
		}

		return value;
	}
	/* eslint-enable no-param-reassign */

	/** @inheritDoc */
	static compare( value, reference, operation ) {
		let result;

		switch ( operation ) {
			case "eq" :
				if ( value == null ) {
					result = reference == null;
				} else {
					result = reference != null && value.equals( reference );
				}
				break;

			case "neq" :
			case "noteq" :
				if ( value == null ) {
					result = reference != null;
				} else {
					result = reference == null || !value.equals( reference );
				}
				break;

			case "lt" :
				if ( value == null || reference == null ) {
					result = false;
				} else {
					result = value.compare( reference ) < 0;
				}
				break;

			case "lte" :
				if ( value == null ) {
					result = reference == null;
				} else if ( reference == null ) {
					result = false;
				} else {
					result = value.compare( reference ) < 1;
				}
				break;

			case "gt" :
				if ( value == null || reference == null ) {
					result = false;
				} else {
					result = value.compare( reference ) > 0;
				}
				break;

			case "gte" :
				if ( value == null ) {
					result = reference == null;
				} else if ( reference == null ) {
					result = false;
				} else {
					result = value.compare( reference ) > -1;
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

	/** @inheritDoc */
	static sort( left, right ) {
		if ( left == null ) {
			return 1;
		}

		if ( right == null ) {
			return -1;
		}

		for ( let i = 0; i < 16; i++ ) {
			const diff = left[i] - right[i];

			if ( diff !== 0 ) {
				return diff;
			}
		}

		return 0;
	}
}

module.exports = ModelTypeUUID;
