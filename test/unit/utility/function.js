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


const { describe, it, before } = require( "mocha" );
const Should = require( "should" );

const { loadAllServices } = require( "../helper" );


describe( "Utility API for processing functions", function() {
	let OdemUtilityFunction;

	before( () => loadAllServices().then( s => { ( { OdemUtilityFunction } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemUtilityFunction );

		OdemUtilityFunction.should.have.property( "extractBody" ).which.is.a.Function().and.has.length( 1 );
	} );

	describe( "exports extractBody() which", function() {
		it( "requires provision of function", function() {
			( () => OdemUtilityFunction.extractBody() ).should.throw();
			( () => OdemUtilityFunction.extractBody( null ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( undefined ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( false ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( true ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( 0 ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( 1.5 ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( -3000000 ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( "" ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( "test" ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( [] ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( [() => {}] ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => OdemUtilityFunction.extractBody( {} ) ).should.throw();
			( () => OdemUtilityFunction.extractBody( { function: () => {} } ) ).should.throw(); // eslint-disable-line no-empty-function

			( () => OdemUtilityFunction.extractBody( function() {} ) ).should.not.throw(); // eslint-disable-line no-empty-function

			( () => OdemUtilityFunction.extractBody( () => {} ) ).should.not.throw(); // eslint-disable-line no-empty-function
		} );

		it( "returns information on provided function", function() {
			OdemUtilityFunction.extractBody( function() {} ).should.be.Object().which.has.ownProperty( "args" ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( function() {} ).should.be.Object().which.has.ownProperty( "body" ); // eslint-disable-line no-empty-function

			OdemUtilityFunction.extractBody( () => {} ).should.be.Object().which.has.ownProperty( "body" ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( () => {} ).should.be.Object().which.has.ownProperty( "args" ); // eslint-disable-line no-empty-function
		} );

		it( "returns sorted list of names of all arguments of provided function", function() {
			OdemUtilityFunction.extractBody( function() {} ).args.should.be.an.Array().which.has.length( 0 ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( function( a ) {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.containEql( "a" ).and.has.length( 1 );
			OdemUtilityFunction.extractBody( function( first, second ) {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.eql( [ "first", "second" ] ).and.has.length( 2 );

			OdemUtilityFunction.extractBody( () => {} ).args.should.be.an.Array().which.has.length( 0 ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( a => {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.containEql( "a" ).and.has.length( 1 );
			OdemUtilityFunction.extractBody( ( first, second ) => {} ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.eql( [ "first", "second" ] ).and.has.length( 2 );

			OdemUtilityFunction.extractBody( () => false ).args.should.be.an.Array().which.has.length( 0 ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( a => a ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.containEql( "a" ).and.has.length( 1 );
			OdemUtilityFunction.extractBody( ( first, second ) => 1 + 2 ).args // eslint-disable-line no-unused-vars, no-empty-function
				.should.be.an.Array().which.is.eql( [ "first", "second" ] ).and.has.length( 2 );
		} );

		it( "returns body of provided function", function() {
			OdemUtilityFunction.extractBody( function() {} ).body.should.be.a.String().which.is.equal( "" ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( function( a ) { return a + a; } ).body.should.be.a.String().which.is.equal( "return a + a;" );
			OdemUtilityFunction.extractBody( function( a ) {
				return a + a;
			} ).body.should.be.a.String().which.is.equal( "return a + a;" );
			OdemUtilityFunction.extractBody( function( a ) {
				const b = a * 2;
				return b + a;
			} ).body.should.be.a.String().which.is.equal( `const b = a * 2;
				return b + a;` );

			OdemUtilityFunction.extractBody( () => {} ).body.should.be.a.String().which.is.equal( "" ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( a => { return a + a; } ).body.should.be.a.String().which.is.equal( "return a + a;" );
			OdemUtilityFunction.extractBody( a => {
				return a + a;
			} ).body.should.be.a.String().which.is.equal( "return a + a;" );

			OdemUtilityFunction.extractBody( () => false ).body.should.be.a.String().which.is.equal( "return false;" ); // eslint-disable-line no-empty-function
			OdemUtilityFunction.extractBody( a => a ).body.should.be.a.String().which.is.equal( "return a;" );
			OdemUtilityFunction.extractBody( a => a + a ).body.should.be.a.String().which.is.equal( "return a + a;" );
		} );
	} );
} );
