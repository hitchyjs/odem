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

"use strict";

const ModelType = require( "./base" );

/**
 * Implements scalar type `integer` for use with attributes of defined models.
 *
 * @name ModelTypeInteger
 * @extends ModelType
 */
class ModelTypeInteger extends ModelType {
	/** @inheritDoc */
	static get name() {
		return "integer";
	}

	/** @inheritDoc */
	static coerce( value, requirements = {} ) { // eslint-disable-line no-unused-vars
		if ( value === null || value === undefined ) {
			value = null;
		} else {
			value = parseInt( value );
		}

		return value;
	}

	/** @inheritDoc */
	static isValid( name, value, requirements, errors ) {
		if ( requirements.required && ( value === null || isNaN( value ) ) ) {
			errors.push( new Error( `${name} is not a number` ) );
		}

		if ( value !== null ) {
			const { min, max } = requirements;

			if ( !isNaN( min ) && ( isNaN( value ) || value < min ) ) {
				errors.push( new Error( `${name} is below required minimum` ) );
			}

			if ( !isNaN( max ) && ( isNaN( value ) || value > max ) ) {
				errors.push( new Error( `${name} is above required maximum` ) );
			}
		}
	}

	/** @inheritDoc */
	static deserialize( value ) {
		if ( value === null || value === undefined || value === "null" ) {
			value = null;
		} else {
			value = parseInt( value );
			if ( isNaN( value ) ) {
				value = null;
			}
		}

		return value;
	}

	/** @inheritDoc */
	static get aliases() {
		return ["int"];
	}
}

module.exports = ModelTypeInteger;
