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

const { Readable, Transform, PassThrough } = require( "stream" );

const { describe, it } = require( "mocha" );
require( "should" );


describe( "Stoppable Stream", function() {
	this.timeout( 10000 );

	it( "works", () => new Promise( ( resolve, reject ) => {
		let value = 0;

		const source = new Readable( {
			objectMode: true,
			read() {
				console.log( "emit", value );
				setTimeout( () => {
					this.push( value++ );
				}, 100 );
			},
		} );

		source.on( "close", () => {
			console.log( "source closed" );
			resolve();
		} );

		source.on( "end", () => {
			console.log( "source ended" );
		} );

		// ---------------------------------------------------------

		const converter = new Transform( {
			objectMode: true,
			transform( number, _, done ) {
				this.push( 10 - number );
				done();
			},
		} );

		converter.on( "error", error => {
			console.log( "converter error", error );
		} );

		converter.on( "close", () => {
			console.log( "converter close" );
			source.pause();
			source.destroy();
		} );

		source.pipe( converter );

		// ---------------------------------------------------------

		const passer = new PassThrough( { objectMode: true } );

		passer.on( "data", result => {
			if ( result === 0 ) {
				console.log( "closing" );
				passer.destroy();
			} else if ( result < -2 ) {
				reject( new Error( "still generating" ) );
			} else {
				console.log( "received", result );
			}
		} );

		passer.on( "close", () => { converter.destroy(); } );

		converter.pipe( passer );
	} ) );
} );
