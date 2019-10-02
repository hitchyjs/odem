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
const NumberUtilities = require( "../../utility/number" );

/**
 * Implements scalar type `integer` for use with attributes of defined models.
 *
 * @name ModelTypeInteger
 * @extends ModelType
 */
class ModelTypeInteger extends ModelType {
	/** @inheritDoc */
	static get typeName() {
		return "integer";
	}

	/** @inheritDoc */
	static get aliases() {
		return ["int"];
	}

	/** @inheritDoc */
	static checkDefinition( definition ) {
		const errors = super.checkDefinition( definition );
		if ( !errors.length ) {
			if ( definition.min > definition.max ) {
				const min = definition.min;
				definition.min = definition.max;
				definition.max = min;
			}

			const { min, max, step } = definition;

			if ( min != null && ( typeof min === "object" || !NumberUtilities.ptnFloat.test( min ) ) ) {
				errors.push( new TypeError( "invalid requirement on minimum value" ) );
			}

			if ( max != null && ( typeof max === "object" || !NumberUtilities.ptnFloat.test( max ) ) ) {
				errors.push( new TypeError( "invalid requirement on maximum value" ) );
			}

			if ( step != null && ( !step || step < 0 || typeof step === "object" || !NumberUtilities.ptnFloat.test( step ) ) ) {
				errors.push( new TypeError( "invalid requirement on value stepping" ) );
			}
		}

		return errors;
	}

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static coerce( value, requirements, defaultMarker ) { // eslint-disable-line no-unused-vars
		if ( value === defaultMarker && requirements ) {
			value = requirements.default;
		}

		if ( value == null ) {
			value = null;
		} else {
			switch ( typeof value ) {
				case "string" :
					value = value.trim();

					if ( !value.length ) {
						value = null;
						break;
					}

					if ( !global.hitchyPtnFloat.test( value ) ) {
						value = NaN;
						break;
					}

				// falls through
				case "number" : {
					value = Math.round( parseFloat( value ) );

					const { step, min = 0 } = requirements;
					if ( step ) {
						value = Math.round( ( Math.round( ( value - min ) / step ) * step ) + min );
					}
					break;
				}

				default :
					value = NaN;
			}
		}

		return value;
	}
	/* eslint-enable no-param-reassign */

	/* eslint-disable no-param-reassign */
	/** @inheritDoc */
	static serialize( value, adapter ) { // eslint-disable-line no-unused-vars
		value = value == null ? null : parseInt( value );

		return value;
	}
	/* eslint-enable no-param-reassign */

	/** @inheritDoc */
	static isValid( name, value, requirements, errors ) {
		if ( requirements.required && ( value == null || isNaN( value ) ) ) {
			errors.push( new Error( `${name} is not a number` ) );
		}

		if ( value != null ) {
			const { min, max } = requirements;

			if ( !isNaN( min ) && ( isNaN( value ) || value < min ) ) {
				errors.push( new Error( `${name} is below required minimum` ) );
			}

			if ( !isNaN( max ) && ( isNaN( value ) || value > max ) ) {
				errors.push( new Error( `${name} is above required maximum` ) );
			}
		}
	}
}

module.exports = ModelTypeInteger;
