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


const { Readable } = require( "stream" );

const { suite, test } = require( "mocha" );
const Should = require( "should" );

const IteratorStream = require( "../../lib/utility/iterator-stream" );


suite( "IteratorStream", function() {
	test( "is exposed", function() {
		Should.exist( IteratorStream );
	} );

	test( "requires iterator on construction", function() {
		( () => new IteratorStream() ).should.throw();

		( () => new IteratorStream( ""[Symbol.iterator]() ) ).should.not.throw();
		( () => new IteratorStream( new Map()[Symbol.iterator]() ) ).should.not.throw();
	} );

	test( "inherits from `Readable`", function() {
		new IteratorStream( ""[Symbol.iterator]() ).should.be.instanceOf( Readable );
	} );

	test( "provides iterated entries one by one", function() {
		return new Promise( resolve => {
			const stream = new IteratorStream( "Hello World!"[Symbol.iterator]() );

			const exposed = [];

			stream.on( "end", () => {
				exposed.should.have.length( 12 );
				exposed.join( "" ).should.be.equal( "Hello World!" );
				resolve();
			} );

			stream.on( "data", chunk => {
				exposed.push( chunk );
			} );
		} );
	} );

	test( "accepts custom feeder for processing iterated values before pushing into stream", function() {
		return new Promise( resolve => {
			const stream = new IteratorStream( new Map( [
				[ "name", "John" ],
				[ "surname", "Doe" ],
				[ "age", 42 ],
			] )[Symbol.iterator](), {
				feeder: function() {
					const item = this.iterator.next();
					if ( item.done ) {
						this.push( null );
					} else {
						this.push( `${item.value[0]}: ${item.value[1]}` );
					}
				},
			} );

			const exposed = [];

			stream.on( "end", () => {
				exposed.should.have.length( 3 );
				exposed[0].should.be.equal( "name: John" );
				exposed[1].should.be.equal( "surname: Doe" );
				exposed[2].should.be.equal( "age: 42" );
				resolve();
			} );

			stream.on( "data", chunk => {
				exposed.push( chunk );
			} );
		} );
	} );
} );
