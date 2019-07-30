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


const { suite, test } = require( "mocha" );
const Should = require( "should" );

const FN = require( "../../lib/utility/function" );


suite( "Utility API for processing functions", function() {
	test( "is available", function() {
		Should.exist( FN );

		FN.should.have.property( "extractBody" ).which.is.a.Function().and.has.length( 1 );
	} );

	suite( "exports extractBody() which", function() {
		test( "requires provision of function", function() {
			( () => FN.extractBody() ).should.throw();
			( () => FN.extractBody( null ) ).should.throw();
			( () => FN.extractBody( undefined ) ).should.throw();
			( () => FN.extractBody( false ) ).should.throw();
			( () => FN.extractBody( true ) ).should.throw();
			( () => FN.extractBody( 0 ) ).should.throw();
			( () => FN.extractBody( 1.5 ) ).should.throw();
			( () => FN.extractBody( -3000000 ) ).should.throw();
			( () => FN.extractBody( "" ) ).should.throw();
			( () => FN.extractBody( "test" ) ).should.throw();
			( () => FN.extractBody( [] ) ).should.throw();
			( () => FN.extractBody( [() => {}] ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => FN.extractBody( {} ) ).should.throw();
			( () => FN.extractBody( { function: () => {} } ) ).should.throw(); // eslint-disable-line no-empty-function

			( () => FN.extractBody( function() {} ) ).should.not.throw(); // eslint-disable-line no-empty-function

			( () => FN.extractBody( () => {} ) ).should.not.throw(); // eslint-disable-line no-empty-function
		} );

		test( "returns information on provided function", function() {
			FN.extractBody( function() {} ).should.be.Object().which.has.ownProperty( "args" ); // eslint-disable-line no-empty-function
			FN.extractBody( function() {} ).should.be.Object().which.has.ownProperty( "body" ); // eslint-disable-line no-empty-function

			FN.extractBody( () => {} ).should.be.Object().which.has.ownProperty( "body" ); // eslint-disable-line no-empty-function
			FN.extractBody( () => {} ).should.be.Object().which.has.ownProperty( "args" ); // eslint-disable-line no-empty-function
		} );

		test( "returns sorted list of names of all arguments of provided function", function() {
			FN.extractBody( function() {} ).args.should.be.an.Array().which.has.length( 0 ); // eslint-disable-line no-empty-function
			FN.extractBody( function( a ) {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.containEql( "a" ).and.has.length( 1 );
			FN.extractBody( function( first, second ) {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.eql( [ "first", "second" ] ).and.has.length( 2 );

			FN.extractBody( () => {} ).args.should.be.an.Array().which.has.length( 0 ); // eslint-disable-line no-empty-function
			FN.extractBody( a => {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.containEql( "a" ).and.has.length( 1 );
			FN.extractBody( ( first, second ) => {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.eql( [ "first", "second" ] ).and.has.length( 2 );

			FN.extractBody( () => false ).args.should.be.an.Array().which.has.length( 0 ); // eslint-disable-line no-empty-function
			FN.extractBody( a => a ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.containEql( "a" ).and.has.length( 1 );
			FN.extractBody( ( first, second ) => 1 + 2 ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.eql( [ "first", "second" ] ).and.has.length( 2 );
		} );

		test( "returns body of provided function", function() {
			FN.extractBody( function() {} ).body.should.be.a.String().which.is.equal( "" ); // eslint-disable-line no-empty-function
			FN.extractBody( function( a ) { return a + a; } ).body.should.be.a.String().which.is.equal( "return a + a;" );
			FN.extractBody( function( a ) {
				return a + a;
			} ).body.should.be.a.String().which.is.equal( "return a + a;" );
			FN.extractBody( function( a ) {
				const b = a * 2;
				return b + a;
			} ).body.should.be.a.String().which.is.equal( `const b = a * 2;
				return b + a;` );

			FN.extractBody( () => {} ).body.should.be.a.String().which.is.equal( "" ); // eslint-disable-line no-empty-function
			FN.extractBody( a => { return a + a; } ).body.should.be.a.String().which.is.equal( "return a + a;" );
			FN.extractBody( a => {
				return a + a;
			} ).body.should.be.a.String().which.is.equal( "return a + a;" );

			FN.extractBody( () => false ).body.should.be.a.String().which.is.equal( "return false;" ); // eslint-disable-line no-empty-function
			FN.extractBody( a => a ).body.should.be.a.String().which.is.equal( "return a;" );
			FN.extractBody( a => a + a ).body.should.be.a.String().which.is.equal( "return a + a;" );
		} );
	} );
} );
