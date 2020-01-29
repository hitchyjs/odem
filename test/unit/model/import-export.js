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

const { describe, it, before } = require( "mocha" );
require( "should" );

const { fakeApi } = require( "../helper" );

/**
 * Defines model used in multiple tests.
 *
 * @param {class<Model>} Model base class of all models to use
 * @returns {class<Model>} defined model's class
 */
function defineModel( Model ) {
	return Model.define( "MyModel", {
		props: {
			aString: { default: "hello" },
			aNumber: { type: "number", default: 1.23 },
			anInteger: { type: "integer", default: 100 },
			aBoolean: { type: "boolean", default: "false" },
			aDate: { type: "date", default: "2019-06-30" },
			aUUID: { type: "uuid", default: "12345678-1234-1234-1234-123456789abc" },
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
}

describe( "Exporting values of a model's instance", () => {
	let Model;
	let MyModel;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model } = s ); } ) );

	before( () => {
		MyModel = defineModel( Model );
	} );

	it( "creates regular object containing UUID and all properties", () => {
		const item = new MyModel();
		const exported = item.toObject();

		exported.should.be.Object().which.has.size( 19 );

		exported.should.have.property( "uuid" );

		exported.should.have.property( "aString" ).which.equals( "hello" );
		exported.should.have.property( "aNumber" ).which.equals( 1.23 );
		exported.should.have.property( "anInteger" ).which.equals( 100 );
		exported.should.have.property( "aBoolean" ).which.equals( false );
		exported.should.have.property( "aDate" ).which.is.instanceOf( Date );
		exported.aDate.toISOString().should.equal( "2019-06-30T00:00:00.000Z" );
		exported.should.have.property( "aUUID" ).which.instanceOf( Buffer );
		exported.aUUID.equals( Buffer.from( "12345678123412341234123456789abc", "hex" ) ).should.be.true();

		exported.should.have.property( "aComputedString" ).which.equals( "truthy" );
		exported.should.have.property( "aComputedNumber" ).which.equals( 1.5 );
		exported.should.have.property( "aComputedInteger" ).which.equals( 1 );
		exported.should.have.property( "aComputedBoolean" ).which.equals( true );
		exported.should.have.property( "aComputedDate" ).which.is.instanceOf( Date );
		exported.aComputedDate.toISOString().should.equal( "2040-12-31T23:59:59.000Z" );
		exported.should.have.property( "aComputedUUID" ).which.is.instanceOf( Buffer );
		exported.aComputedUUID.equals( Buffer.from( "00000000000000000000000000000000", "hex" ) ).should.be.true();

		exported.should.have.property( "aTypedComputedString" ).which.equals( "truthy" );
		exported.should.have.property( "aTypedComputedNumber" ).which.equals( 1.5 );
		exported.should.have.property( "aTypedComputedInteger" ).which.equals( 1 );
		exported.should.have.property( "aTypedComputedBoolean" ).which.equals( true );
		exported.should.have.property( "aTypedComputedDate" ).which.is.instanceOf( Date );
		exported.aTypedComputedDate.toISOString().should.equal( "2040-12-31T23:59:59.000Z" );
		exported.should.have.property( "aTypedComputedUUID" ).which.is.instanceOf( Buffer );
		exported.aTypedComputedUUID.equals( Buffer.from( "00000000000000000000000000000000", "hex" ) ).should.be.true();
	} );

	it( "creates regular object containing UUID and all properties with all values serialised according to either property's type on demand", () => {
		const item = new MyModel();
		const exported = item.toObject( { serialised: true } );

		exported.should.be.Object().which.has.size( 19 );

		exported.should.have.property( "uuid" );

		exported.should.have.property( "aString" ).which.equals( "hello" );
		exported.should.have.property( "aNumber" ).which.equals( 1.23 );
		exported.should.have.property( "anInteger" ).which.equals( 100 );
		exported.should.have.property( "aBoolean" ).which.equals( 0 );
		exported.should.have.property( "aDate" ).which.equals( "2019-06-30T00:00:00.000Z" );
		exported.should.have.property( "aUUID" ).which.equals( "12345678-1234-1234-1234-123456789abc" );

		// untyped computed properties aren't serialised due to lack of type information
		exported.should.have.property( "aComputedString" ).which.equals( "truthy" );
		exported.should.have.property( "aComputedNumber" ).which.equals( 1.5 );
		exported.should.have.property( "aComputedInteger" ).which.equals( 1 );
		exported.should.have.property( "aComputedBoolean" ).which.equals( true );
		exported.should.have.property( "aComputedDate" ).which.is.instanceOf( Date );
		exported.aComputedDate.toISOString().should.equal( "2040-12-31T23:59:59.000Z" );
		exported.should.have.property( "aComputedUUID" ).which.is.instanceOf( Buffer );
		exported.aComputedUUID.equals( Buffer.from( "00000000000000000000000000000000", "hex" ) ).should.be.true();

		// typed computed properties are serialised properly
		exported.should.have.property( "aTypedComputedString" ).which.equals( "truthy" );
		exported.should.have.property( "aTypedComputedNumber" ).which.equals( 1.5 );
		exported.should.have.property( "aTypedComputedInteger" ).which.equals( 1 );
		exported.should.have.property( "aTypedComputedBoolean" ).which.equals( 1 );
		exported.should.have.property( "aTypedComputedDate" ).which.equals( "2040-12-31T23:59:59.000Z" );
		exported.should.have.property( "aTypedComputedUUID" ).which.equals( "00000000-0000-0000-0000-000000000000" );
	} );

	it( "creates regular object containing UUID and all properties but the computed ones on demand", () => {
		const item = new MyModel();
		let exported = item.toObject( { omitComputed: true } );

		exported.should.be.Object().which.has.size( 7 );
		exported.should.have.properties( "uuid", "aString", "aNumber", "anInteger", "aBoolean", "aDate", "aUUID" );

		exported = item.toObject( { serialised: true, omitComputed: true } );

		exported.should.be.Object().which.has.size( 7 );
		exported.should.have.properties( "uuid", "aString", "aNumber", "anInteger", "aBoolean", "aDate", "aUUID" );
	} );
} );

describe( "Importing values into a model's instance", () => {
	let Model;
	let MyModel;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model } = s ); } ) );

	before( () => {
		MyModel = defineModel( Model );
	} );

	it( "works on an existing instance", () => {
		const item = new MyModel();

		item.fromObject( {} ).should.be.equal( item );

		item.aString.should.equal( "hello" );
		item.aNumber.should.equal( 1.23 );
		item.anInteger.should.equal( 100 );
		item.aBoolean.should.equal( false );
		item.aDate.toISOString().should.equal( "2019-06-30T00:00:00.000Z" );
		item.aUUID.toString( "hex" ).should.equal( "12345678123412341234123456789abc" );
	} );

	it( "works on model creating new instance", () => {
		const item = MyModel.fromObject( {} );

		item.should.be.instanceOf( MyModel );

		item.aString.should.equal( "hello" );
		item.aNumber.should.equal( 1.23 );
		item.anInteger.should.equal( 100 );
		item.aBoolean.should.equal( false );
		item.aDate.toISOString().should.equal( "2019-06-30T00:00:00.000Z" );
		item.aUUID.toString( "hex" ).should.equal( "12345678123412341234123456789abc" );
	} );

	it( "results in instance adopting values of matching properties in provided in object", () => {
		const input = {
			aString: "world",
			aNumber: 0.546,
			anInteger: 555,
			aBoolean: "set",
			aDate: "2018-01-01T12:00:30Z",
			aUUID: "43214321-4321-4321-4321-432143214321",
		};

		let item = new MyModel();

		item.fromObject( input ).should.be.equal( item );

		item.aString.should.equal( "world" );
		item.aNumber.should.equal( 0.546 );
		item.anInteger.should.equal( 555 );
		item.aBoolean.should.equal( true );
		item.aDate.toISOString().should.equal( "2018-01-01T12:00:30.000Z" );
		item.aUUID.toString( "hex" ).should.equal( "43214321432143214321432143214321" );

		item = MyModel.fromObject( input );

		item.should.be.instanceOf( MyModel );

		item.aString.should.equal( "world" );
		item.aNumber.should.equal( 0.546 );
		item.anInteger.should.equal( 555 );
		item.aBoolean.should.equal( true );
		item.aDate.toISOString().should.equal( "2018-01-01T12:00:30.000Z" );
		item.aUUID.toString( "hex" ).should.equal( "43214321432143214321432143214321" );
	} );

	it( "adopts values of computed properties", () => {
		const AnotherModel = Model.define( "AnotherModel", {
			props: {
				actual: {},
			},
			computed: {
				processed( value ) {
					if ( value !== undefined ) {
						this.actual = "processed:" + value;
						return undefined;
					}

					return "fetched:" + this.actual;
				},
			},
		} );

		let item = new AnotherModel();

		item.fromObject( {
			processed: "bar",
		} ).should.be.equal( item );

		item.actual.should.equal( "processed:bar" );
		item.processed.should.equal( "fetched:processed:bar" );

		item = AnotherModel.fromObject( {
			processed: "bar",
		} );

		item.should.be.instanceOf( AnotherModel );

		item.actual.should.equal( "processed:bar" );
		item.processed.should.equal( "fetched:processed:bar" );
	} );

	it( "adopts values of actual properties before values of computed properties", () => {
		const AnotherModel = Model.define( "AnotherModel", {
			props: {
				actual: {},
			},
			computed: {
				processed( value ) {
					if ( value !== undefined ) {
						this.actual = "processed:" + value;
						return undefined;
					}

					return "fetched:" + this.actual;
				},
			},
		} );

		let item = new AnotherModel();

		item.fromObject( {
			processed: "bar",
			actual: "foo",
		} ).should.be.equal( item );

		item.actual.should.equal( "processed:bar" );
		item.processed.should.equal( "fetched:processed:bar" );

		item = AnotherModel.fromObject( {
			processed: "bar",
			actual: "foo",
		} );

		item.should.be.instanceOf( AnotherModel );

		item.actual.should.equal( "processed:bar" );
		item.processed.should.equal( "fetched:processed:bar" );
	} );

	it( "ignores computed properties on demand", () => {
		const AnotherModel = Model.define( "AnotherModel", {
			props: {
				actual: {},
			},
			computed: {
				processed( value ) {
					if ( value !== undefined ) {
						this.actual = "processed:" + value;
						return undefined;
					}

					return "fetched:" + this.actual;
				},
			},
		} );

		let item = new AnotherModel();

		item.fromObject( {
			processed: "bar",
			actual: "foo",
		}, { omitComputed: true } ).should.be.equal( item );

		item.actual.should.equal( "foo" );
		item.processed.should.equal( "fetched:foo" );

		item = AnotherModel.fromObject( {
			processed: "bar",
			actual: "foo",
		}, { omitComputed: true } );

		item.should.be.instanceOf( AnotherModel );

		item.actual.should.equal( "foo" );
		item.processed.should.equal( "fetched:foo" );
	} );
} );
