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

const AbstractTester = require( "../base" );

/**
 * Implements code testing whether some property is equal given value.
 */
class IndexedEqualityTester extends AbstractTester {
	/**
	 * @param {string} propertyName name of property to test per record
	 * @param {string} value value to look for in named property
	 */
	constructor( propertyName, value ) {
		super();

		Object.defineProperties( this, {
			/**
			 * Names property to test.
			 *
			 * @name IndexedEqualityTester#propertyName
			 * @property string
			 * @readonly
			 */
			propertyName: { value: propertyName },

			/**
			 * Value to look for.
			 *
			 * @name IndexedEqualityTester#value
			 * @property *
			 * @readonly
			 */
			value: { value: value },
		} );
	}

	/** @inheritDoc */
	createStream( ModelClass ) {
		const definition = ModelClass.schema.props[this.propertyName];
		if ( !definition ) {
			throw new Error( `missing property named ${this.propertyName} in model ${ModelClass.name}` );
		}

		const indices = ModelClass;
	}
}

module.exports = IndexedEqualityTester;
