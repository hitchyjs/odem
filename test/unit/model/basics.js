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

const Crypto = require( "crypto" );

const { describe, it, before } = require( "mocha" );
require( "should" );

const { Model } = require( "../../.." );


describe( "Using Model", () => {
	describe( "supports extracting properties into regular object which", () => {
		let MyModel;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: {
					aString: {},
					aNumber: { type: "number" },
					anInteger: { type: "integer" },
					aBoolean: { type: "boolean" },
					aDate: { type: "date" },
					aUUID: { type: "uuid" },
				},
				computed: {
					aComputedString() { return this.aString ? "truthy" : "falsy"; },
					aComputedNumber() { return this.aNumber ? 1.5 : -0.5; },
					aComputedInteger() { return this.anInteger ? 1 : 0; },
					aComputedBoolean() { return this.aBoolean ? null : true; },
					aComputedDate() { return this.aDate ? new Date( "2040-12-31T23:59:59Z" ) : new Date( "1980-01-01T00:00:00Z" ); },
					aComputedUUID() { return this.aUUID ? Buffer.alloc( 16 ) : Buffer.from( new Array( 16 ).fill( 255 ) ); },

					"aTypedComputedString:string"() { return this.aString ? "truthy" : "falsy"; },
					"aTypedComputedNumber:number"() { return this.aNumber ? 1.5 : -0.5; },
					"aTypedComputedInteger:integer"() { return this.anInteger ? 1 : 0; },
					"aTypedComputedBoolean:boolean"() { return this.aBoolean ? null : true; },
					"aTypedComputedDate:date"() { return this.aDate ? new Date( "2040-12-31T23:59:59Z" ) : new Date( "1980-01-01T00:00:00Z" ); },
					"aTypedComputedUUID:uuid"() { return this.aUUID ? Buffer.alloc( 16 ) : Buffer.from( new Array( 16 ).fill( 255 ) ); },
				},
			} );
		} );

		it( "works without option", () => {
			const item = new MyModel();
			item.aString = "Hello";
			item.aNumber = 42;
			item.anInteger = -42;
			item.aBoolean = false;
			item.aDate = new Date();
			item.aUUID = Crypto.randomBytes( 16 );

			const data = item.toObject();

			data.should.be.Object().which.has.size( 19 ); // all properties and the item's `uuid`

			data.aString.should.be.equal( item.aString );
			data.aNumber.should.be.equal( item.aNumber );
			data.anInteger.should.be.equal( item.anInteger );
			data.aBoolean.should.be.equal( item.aBoolean );
			data.aDate.should.be.equal( item.aDate );
			data.aUUID.should.be.equal( item.aUUID );

			data.aComputedString.should.be.String().and.equal( "truthy" );
			data.aComputedNumber.should.be.Number().and.equal( 1.5 );
			data.aComputedInteger.should.be.Number().and.equal( 1 );
			data.aComputedBoolean.should.be.Boolean().and.true();
			data.aComputedDate.should.be.instanceOf( Date );
			data.aComputedDate.getTime().should.be.greaterThan( Date.now() );
			data.aComputedUUID.should.be.instanceOf( Buffer );
			data.aComputedUUID.toString( "hex" ).should.be.equal( "0".repeat( 32 ) );

			data.aTypedComputedString.should.be.String().and.equal( "truthy" );
			data.aTypedComputedNumber.should.be.Number().and.equal( 1.5 );
			data.aTypedComputedInteger.should.be.Number().and.equal( 1 );
			data.aTypedComputedBoolean.should.be.Boolean().and.true();
			data.aTypedComputedDate.should.be.instanceOf( Date );
			data.aTypedComputedDate.getTime().should.be.greaterThan( Date.now() );
			data.aTypedComputedUUID.should.be.instanceOf( Buffer );
			data.aTypedComputedUUID.toString( "hex" ).should.be.equal( "0".repeat( 32 ) );
		} );

		it( "does not export actual or computed properties with value `null`", () => {
			const item = new MyModel();
			item.aString = "Hello";
			item.aNumber = 42;
			item.anInteger = -42;
			item.aBoolean = true;
			item.aDate = null;
			item.aUUID = Crypto.randomBytes( 16 );

			const data = item.toObject();

			data.should.be.Object().which.has.size( 16 ); // all but `null` properties and the item's `uuid`

			data.aString.should.be.equal( item.aString );
			data.aNumber.should.be.equal( item.aNumber );
			data.anInteger.should.be.equal( item.anInteger );
			data.aBoolean.should.be.equal( item.aBoolean );
			( data.aDate === undefined ).should.be.true();
			data.aUUID.should.be.equal( item.aUUID );

			data.aComputedString.should.be.String().and.equal( "truthy" );
			data.aComputedNumber.should.be.Number().and.equal( 1.5 );
			data.aComputedInteger.should.be.Number().and.equal( 1 );
			( data.aComputedBoolean === undefined ).should.be.true();
			data.aComputedDate.should.be.instanceOf( Date );
			data.aComputedDate.getTime().should.be.lessThan( Date.now() );
			data.aComputedUUID.should.be.instanceOf( Buffer );
			data.aComputedUUID.toString( "hex" ).should.be.equal( "0".repeat( 32 ) );

			data.aTypedComputedString.should.be.String().and.equal( "truthy" );
			data.aTypedComputedNumber.should.be.Number().and.equal( 1.5 );
			data.aTypedComputedInteger.should.be.Number().and.equal( 1 );
			( data.aTypedComputedBoolean === undefined ).should.be.true();
			data.aTypedComputedDate.should.be.instanceOf( Date );
			data.aTypedComputedDate.getTime().should.be.lessThan( Date.now() );
			data.aTypedComputedUUID.should.be.instanceOf( Buffer );
			data.aTypedComputedUUID.toString( "hex" ).should.be.equal( "0".repeat( 32 ) );
		} );

		it( "omits export of computed properties on demand", () => {
			const item = new MyModel();
			item.aString = "Hello";
			item.aNumber = 42;
			item.anInteger = -42;
			item.aBoolean = false;
			item.aDate = new Date();
			item.aUUID = Crypto.randomBytes( 16 );

			const data = item.toObject( { omitComputed: true } );

			data.should.be.Object().which.has.size( 7 ); // all actual properties and the item's `uuid`

			data.aString.should.be.equal( item.aString );
			data.aNumber.should.be.equal( item.aNumber );
			data.anInteger.should.be.equal( item.anInteger );
			data.aBoolean.should.be.equal( item.aBoolean );
			data.aDate.should.be.equal( item.aDate );
			data.aUUID.should.be.equal( item.aUUID );
		} );

		it( "serialises all typed values on demand", () => {
			const item = new MyModel();
			item.aString = "Hello";
			item.aNumber = 42;
			item.anInteger = -42;
			item.aBoolean = false;
			item.aDate = new Date( "2020-01-04T04:30:00Z" );
			item.aUUID = Buffer.alloc( 16 );

			const data = item.toObject( { serialised: true } );

			data.should.be.Object().which.has.size( 19 ); // all properties and the item's `uuid`

			data.aString.should.be.equal( item.aString );
			data.aNumber.should.be.equal( item.aNumber );
			data.anInteger.should.be.equal( item.anInteger );
			data.aBoolean.should.be.Number().which.is.equal( 0 );
			data.aDate.should.be.String().which.is.equal( "2020-01-04T04:30:00Z" );
			data.aUUID.should.be.String().which.is.equal( "00000000-0000-0000-0000-000000000000" );

			data.aComputedString.should.be.String().and.equal( "truthy" );
			data.aComputedNumber.should.be.Number().and.equal( 1.5 );
			data.aComputedInteger.should.be.Number().and.equal( 1 );
			data.aComputedBoolean.should.be.Boolean().and.true();
			data.aComputedDate.should.be.instanceOf( Date );
			data.aComputedDate.getTime().should.be.greaterThan( Date.now() );
			data.aComputedUUID.should.be.instanceOf( Buffer );
			data.aComputedUUID.toString( "hex" ).should.be.equal( "0".repeat( 32 ) );

			data.aTypedComputedString.should.be.String().and.equal( "truthy" );
			data.aTypedComputedNumber.should.be.Number().and.equal( 1.5 );
			data.aTypedComputedInteger.should.be.Number().and.equal( 1 );
			data.aTypedComputedBoolean.should.be.Number().which.is.equal( 1 );
			data.aTypedComputedDate.should.be.String().which.is.equal( "2040-12-31T23:59:59Z" );
			data.aTypedComputedUUID.should.be.String().which.is.equal( "00000000-0000-0000-0000-000000000000" );
		} );
	} );
} );
