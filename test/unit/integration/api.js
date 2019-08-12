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

const Path = require( "path" );

const { describe, it, before, after } = require( "mocha" );
const { start, stop, query: { get: GET } } = require( "hitchy-server-dev-tools" );

require( "should" );
require( "should-http" );


describe( "When integrating with Hitchy a controller", () => {
	let server;

	before( "starting hitchy server", () => {
		return start( {
			extensionFolder: Path.resolve( __dirname, "../../.." ),
			testProjectFolder: Path.resolve( __dirname, "../../project" ),
			options: {
				// debug: true,
			},
		} )
			.then( instance => {
				server = instance;
			} );
	} );

	after( "stopping hitchy server", () => stop( server ) );


	it( "can access implicitly discovered models", () => {
		return GET( "/models" )
			.then( res => {
				res.should.have.status( 200 ).and.be.json();
				res.data.should.be.an.Array().which.is.deepEqual( ["BasicData"] );
			} );
	} );

	it( "can access abstract model as a service component", () => {
		return GET( "/modelClass" )
			.then( res => {
				res.should.have.status( 200 ).and.be.json();
				res.data.should.be.true();
			} );
	} );

	it( "can access instance of implicitly discovered model which is having access on Hitchy's API", () => {
		return GET( "/modelImplicitInstance" )
			.then( res => {
				res.should.have.status( 200 ).and.be.json();
				res.data.should.be.Object().which.has.property( "someString" ).which.is.equal( "BasicData" );
			} );
	} );

	it( "can define new model using Model service exposed by hitchy-plugin-odem and access instance of it which is having access on Hitchy's API", () => {
		return GET( "/modelExplicitInstance" )
			.then( res => {
				res.should.have.status( 200 ).and.be.json();
				res.data.should.be.Object().which.has.property( "someString" ).which.is.equal( "BasicData" );
			} );
	} );

	it( "can define new model using Model exported by hitchy-plugin-odem and access instance of it which is having access on Hitchy's API", () => {
		return GET( "/modelExplicitInstance" )
			.then( res => {
				res.should.have.status( 200 ).and.be.json();
				res.data.should.be.Object().which.has.property( "someString" ).which.is.equal( "BasicData" );
			} );
	} );
} );
