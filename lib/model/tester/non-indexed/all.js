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

const { Transform } = require( "stream" );
const AbstractTester = require( "../base" );

/**
 * Implements code considering any record to be satisfy the test.
 */
class AllTester extends AbstractTester {
	/**
	 * @param {class<Model>} ModelClass class of associated model
	 */
	constructor( ModelClass ) {
		super();

		Object.defineProperties( this, {
			/**
			 * Exposes associated model's class.
			 *
			 * @name AllTester#ModelClass
			 * @property {class<Model>}
			 * @readonly
			 */
			ModelClass: { value: ModelClass },
		} );
	}

	/** @inheritDoc */
	static fromDescription( ModelClass, description, testType ) { // eslint-disable-line no-unused-vars
		return new this( ModelClass );
	}

	/** @inheritDoc */
	createStream() {
		const Model = this.ModelClass;
		const uuidStream = Model.uuidStream();

		const uuidToItem = new Transform( {
			objectMode: true,
			transform( uuid, _, done ) {
				this.push( new Model( uuid ) );
				done();
			}
		} );

		uuidToItem.on( "close", () => {
			uuidStream.unpipe( uuidToItem );
			uuidStream.pause();
			uuidStream.destroy();
		} );

		uuidStream.pipe( uuidToItem );

		return uuidToItem;
	}
}

module.exports = AllTester;