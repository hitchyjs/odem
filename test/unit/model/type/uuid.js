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

const Helper = require( "../../helper" );


const ValidNonNullData = [
	Buffer.alloc( 16 ),
	Buffer.from( "12345678901234567890123456789012", "hex" ),
	Buffer.from( "12345678901234567890123456789013", "hex" ),
	Buffer.from( "fedcba9876543210fedcba9876543210", "hex" ),
];

const ValidData = ValidNonNullData.concat( [ null, undefined ] );

const ValidNonNullInput = ValidNonNullData.concat( [
	"00000000-0000-0000-0000-000000000000",
	"12345678-9012-3456-7890-123456789012",
	"12345678-9012-3456-7890-123456789013",
	"fedcba98-7654-3210-fedc-ba9876543210",
] );

const ValidInput = ValidNonNullInput.concat( [ null, undefined ] );

const InvalidInput = [
	"",
	" \r\t\n\f ",
	"abc",
	"null",
	"\u00a0",
	"\x00\x01\x02\x1b\x00",
	false,
	true,
	0,
	1.5,
	-2.5e7,
	[],
	[ 1, 2, 3 ],
	{},
	{ value: 1, flag: false },
	() => 1,
];


describe( "Model Attribute Type `uuid`", function() {
	let OdemAdapter, OdemModelPropertyTypes, OdemModelType, OdemModelTypeUuid;

	before( () => Helper.fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemAdapter, OdemModelPropertyTypes, OdemModelType, OdemModelTypeUuid } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemModelTypeUuid );
	} );

	it( "is derived from ModelType base class", function() {
		OdemModelTypeUuid.prototype.should.be.instanceOf( OdemModelType );
	} );

	it( "is exposing its name as uuid", function() {
		OdemModelTypeUuid.should.have.property( "typeName" ).which.is.equal( "uuid" );
	} );

	it( "is exposing list of aliases to type name", function() {
		OdemModelTypeUuid.should.have.property( "aliases" ).which.is.an.Array();
		OdemModelTypeUuid.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	it( "is commonly exposed by its name", function() {
		OdemModelPropertyTypes.selectByName( "uuid" ).should.be.equal( OdemModelTypeUuid );
	} );

	it( "is commonly exposed by all its aliases", function() {
		OdemModelPropertyTypes.selectByName( "key" ).should.be.equal( OdemModelTypeUuid );
		OdemModelPropertyTypes.selectByName( "foreign" ).should.be.equal( OdemModelTypeUuid );
		OdemModelPropertyTypes.selectByName( "foreign key" ).should.be.equal( OdemModelTypeUuid );
	} );

	it( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		OdemModelPropertyTypes.selectByName( "KEY" ).should.be.equal( OdemModelTypeUuid );
		OdemModelPropertyTypes.selectByName( "FOREIGN" ).should.be.equal( OdemModelTypeUuid );
		OdemModelPropertyTypes.selectByName( "FOREIGN KEY" ).should.be.equal( OdemModelTypeUuid );
	} );

	describe( "is exposing method `checkDefinition()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeUuid.checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeUuid.checkDefinition() ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( undefined ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( null ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( false ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( true ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( 0 ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( -1 ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( "" ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( [] ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => OdemModelTypeUuid.checkDefinition( {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.checkDefinition( { required: true } ) ).should.not.throw();
		} );

		it( "returns array of encountered errors", function() {
			OdemModelTypeUuid.checkDefinition().should.be.Array();
			OdemModelTypeUuid.checkDefinition( undefined ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( null ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( false ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( true ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( 0 ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( -1 ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( 4.5 ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( "" ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( "required: true" ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( [] ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( ["required: true"] ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( {} ).should.be.Array();
			OdemModelTypeUuid.checkDefinition( { required: true } ).should.be.Array();
		} );

		it( "lists error unless providing definition object in first argument", function() {
			OdemModelTypeUuid.checkDefinition().should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( undefined ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( null ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( false ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( true ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( 0 ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( -1 ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( 4.5 ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( "" ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( "required: true" ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( [] ).should.not.be.empty();
			OdemModelTypeUuid.checkDefinition( ["required: true"] ).should.not.be.empty();

			OdemModelTypeUuid.checkDefinition( {} ).should.be.empty();
			OdemModelTypeUuid.checkDefinition( { required: true } ).should.be.empty();
		} );

		it( "lists instances of Error on encountering errors in provided definition", function() {
			OdemModelTypeUuid.checkDefinition()[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( undefined )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( null )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( false )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( true )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( 0 )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( -1 )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( "" )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( [] )[0].should.be.instanceOf( Error );
			OdemModelTypeUuid.checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );
	} );

	describe( "is exposing method `coerce()` which", function() {
		it( "is a function to be invoked w/ at least three arguments", function() {
			OdemModelTypeUuid.coerce.should.be.a.Function().which.has.length( 3 );
		} );

		it( "doesn't throw when invoked with two arguments, only", function() {
			( () => OdemModelTypeUuid.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeUuid.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "returns `null` unless providing instance of Buffer with 16 octets or properly formatted string providing UUID", function() {
			Should( OdemModelTypeUuid.coerce( undefined, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( null, {} ) ).be.null();

			Should( OdemModelTypeUuid.coerce( false, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( true, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( 0, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( -1, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( 4.5, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "required: true", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( [], {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( ["required: true"], {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( {}, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( { required: true }, {} ) ).be.null();

			Should( OdemModelTypeUuid.coerce( Buffer.alloc( 0 ), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( Buffer.alloc( 15 ), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( Buffer.alloc( 17 ), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( Buffer.allocUnsafe( 0 ), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( Buffer.allocUnsafe( 15 ), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( Buffer.allocUnsafe( 17 ), {} ) ).be.null();

			OdemModelTypeUuid.coerce( Buffer.alloc( 16 ), {} ).should.be.instanceOf( Buffer );
			OdemModelTypeUuid.coerce( Buffer.allocUnsafe( 16 ), {} ).should.be.instanceOf( Buffer );

			OdemModelTypeUuid.coerce( "00000000-0000-0000-0000-000000000000", {} ).should.be.instanceOf( Buffer );
			OdemModelTypeUuid.coerce( "12345678-1234-1234-1234-123456789012", {} ).should.be.instanceOf( Buffer );

			Should( OdemModelTypeUuid.coerce( "00000000.0000.0000.0000.000000000000", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "12345678.1234.1234.1234.123456789012", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "00000000-0000-0000-0000000000000000", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "12345678-1234-1234-1234123456789012", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "00000000000000000000000000000000", {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( "12345678123412341234123456789012", {} ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeUuid.coerce( undefined, {} ) ).be.null();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeUuid.coerce( null, {} ) ).be.null();
		} );

		it( "returns `null` on providing `false`", function() {
			Should( OdemModelTypeUuid.coerce( false, {} ) ).be.null();
		} );

		it( "returns 'null' on providing `true`", function() {
			Should( OdemModelTypeUuid.coerce( true ) ).be.null();
		} );

		it( "returns `null` on providing any integer", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					Should( OdemModelTypeUuid.coerce( i, {} ) ).be.null();
				}
			}
		} );

		it( "returns `null` on providing any number", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						Should( OdemModelTypeUuid.coerce( v, {} ) ).be.null();
					}
				}
			}
		} );

		it( "returns `null` on providing object", function() {
			Should( OdemModelTypeUuid.coerce( {}, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( { someName: "someValue" }, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( { toString: () => "me as a string" }, {} ) ).be.null();

			Should( OdemModelTypeUuid.coerce( new Date(), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( new TypeError(), {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( new Promise( resolve => resolve() ), {} ) ).be.null();
		} );

		it( "returns `null` on providing array", function() {
			Should( OdemModelTypeUuid.coerce( [], {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( [1], {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( ["sole"], {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( [ true, false ], {} ) ).be.null();
		} );

		it( "returns `null` on providing function", function() {
			Should( OdemModelTypeUuid.coerce( () => {}, {} ) ).be.null(); // eslint-disable-line no-empty-function
			Should( OdemModelTypeUuid.coerce( () => 1 + 3, {} ) ).be.null();
			Should( OdemModelTypeUuid.coerce( function() {}, {} ) ).be.null(); // eslint-disable-line no-empty-function

			Should( OdemModelTypeUuid.coerce( Date.parse, {} ) ).be.null();
		} );

		it( "accepts definition in second argument", function() {
			( () => OdemModelTypeUuid.coerce( "string", { required: true } ) ).should.not.throw();
		} );

		it( "doesn't care for definition requiring value", function() {
			Should( OdemModelTypeUuid.coerce( undefined, { required: true } ) ).be.null();
			Should( OdemModelTypeUuid.coerce( null, { required: true } ) ).be.null();
		} );
	} );

	describe( "is exposing method `isValid()` which", function() {
		it( "is a function to be invoked w/ four argument", function() {
			OdemModelTypeUuid.isValid.should.be.a.Function().which.has.length( 4 );
		} );

		it( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => OdemModelTypeUuid.isValid( "name", null, { required: true } ) ).should.throw();

			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, undefined ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, null ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, false ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, true ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, 0 ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, -1 ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, 4.5 ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, "" ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, "required: true" ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, {} ) ).should.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, { required: true } ) ).should.throw();

			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeUuid.isValid( "name", null, { required: true }, ["required: true"] ) ).should.not.throw();
		} );

		it( "doesn't throw exception on providing invalid first argument", function() {
			ValidData.concat( ValidInput, InvalidInput ).forEach( data => {
				( () => OdemModelTypeUuid.isValid( data, null, { required: true }, [] ) ).should.not.throw();
			} );
		} );

		it( "does not return anything", function() {
			ValidData.concat( ValidInput, InvalidInput ).forEach( data => {
				Should( OdemModelTypeUuid.isValid( "name", data, {}, [] ) ).be.undefined();
			} );
		} );

		it( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeUuid.isValid( "name", null, {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( OdemModelTypeUuid.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		it( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeUuid.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		it( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( OdemModelTypeUuid.isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeUuid.isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeUuid.isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeUuid.isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );
	} );

	describe( "is exposing method `serialize()` which", function() {
		it( "is a function to be invoked w/ two arguments", function() {
			OdemModelTypeUuid.serialize.should.be.a.Function().which.has.length( 2 );
		} );

		it( "does not throw on serializing null", function() {
			( () => OdemModelTypeUuid.serialize() ).should.not.throw();
			( () => OdemModelTypeUuid.serialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeUuid.serialize( null ) ).should.not.throw();
		} );

		it( "relies on something adapter-like provided in second argument when serializing non-null value", function() {
			Helper.allTypesOfDataButNullLike().forEach( data => {
				( () => OdemModelTypeUuid.serialize( data ) ).should.throw();
			} );
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeUuid.serialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeUuid.serialize( undefined ) ).be.null();
		} );

		it( "returns string representing octets of provided Buffer instance", function() {
			[
				[ Buffer.alloc( 16 ), "00000000-0000-0000-0000-000000000000" ],
				[ Buffer.from( "12345678901234567890123456789012", "hex" ), "12345678-9012-3456-7890-123456789012" ],
			]
				.forEach( ( [ input, expected ] ) => {
					OdemModelTypeUuid.serialize( input, new OdemAdapter() ).should.be.equal( expected );
				} );
		} );

		it( "relies on prior coercion thus fails on providing numeric values and passes any other unsupported value as string", function() {
			Helper.allTypesOfDataButNullLike().filter( i => typeof i === "number" )
				.forEach( data => {
					( () => OdemModelTypeUuid.serialize( data, new OdemAdapter() ) ).should.throw();
				} );

			Helper.allTypesOfDataButNullLike().filter( i => typeof i !== "number" )
				.forEach( data => {
					OdemModelTypeUuid.serialize( data, new OdemAdapter() ).should.be.equal( String( data ) );
				} );
		} );
	} );

	describe( "is exposing method `deserialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeUuid.deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeUuid.deserialize() ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( null ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( false ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( true ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( "" ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( {} ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( [] ) ).should.not.throw();
			( () => OdemModelTypeUuid.deserialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns null value as null", function() {
			[
				null,
				undefined,
			]
				.forEach( value => {
					Should( OdemModelTypeUuid.deserialize( value ) ).be.null();
				} );
		} );

		it( "returns any unsupported value as null", function() {
			InvalidInput.forEach( value => {
				Should( OdemModelTypeUuid.deserialize( value ) ).be.null();
			} );
		} );

		it( "returns string properly describing UUID as instance of Buffer with represented 16 octets", function() {
			[
				[ Buffer.alloc( 16 ), "00000000-0000-0000-0000-000000000000" ],
				[ Buffer.from( "12345678901234567890123456789012", "hex" ), "12345678-9012-3456-7890-123456789012" ],
			]
				.forEach( ( [ expected, input ] ) => {
					OdemModelTypeUuid.deserialize( input ).should.be.instanceOf( Buffer );
					OdemModelTypeUuid.deserialize( input ).equals( expected ).should.be.true();
				} );
		} );
	} );

	describe( "is exposing method `compare()` which", function() {
		it( "is a function to be invoked w/ three arguments", function() {
			OdemModelTypeUuid.compare.should.be.a.Function().which.has.length( 3 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeUuid.compare() ).should.not.throw();

			ValidData.forEach( one => {
				( () => OdemModelTypeUuid.compare( one ) ).should.not.throw();

				ValidData.forEach( two => {
					( () => OdemModelTypeUuid.compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => OdemModelTypeUuid.compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		it( "always returns boolean", function() {
			ValidData.forEach( one => {
				ValidData.forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						OdemModelTypeUuid.compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		it( "considers `null` and `null` as equal", function() {
			OdemModelTypeUuid.compare( null, null, "eq" ).should.be.true();

			OdemModelTypeUuid.compare( null, null, "noteq" ).should.be.false();
		} );

		it( "considers `null` and non-`null` as inequal", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeUuid.compare( null, data, "eq" ).should.be.false();
				OdemModelTypeUuid.compare( data, null, "eq" ).should.be.false();

				OdemModelTypeUuid.compare( null, data, "noteq" ).should.be.true();
				OdemModelTypeUuid.compare( data, null, "noteq" ).should.be.true();
			} );
		} );

		it( "returns `true` on negating `null`", function() {
			OdemModelTypeUuid.compare( null, null, "not" ).should.be.true();
		} );

		it( "returns `false` on negating non-`null`-value", function() {
			ValidNonNullData.forEach( value => {
				OdemModelTypeUuid.compare( value, null, "not" ).should.be.false();
			} );
		} );

		it( "detects equal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						OdemModelTypeUuid.compare( one, two, "eq" ).should.be.true();
					} else {
						OdemModelTypeUuid.compare( one, two, "eq" ).should.be.false();
					}
				} );
			} );
		} );

		it( "detects inequal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						OdemModelTypeUuid.compare( one, two, "neq" ).should.be.false();
						OdemModelTypeUuid.compare( one, two, "noteq" ).should.be.false();
					} else {
						OdemModelTypeUuid.compare( one, two, "neq" ).should.be.true();
						OdemModelTypeUuid.compare( one, two, "noteq" ).should.be.true();
					}
				} );
			} );
		} );

		it( "compares order of two values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer > inner ) {
						OdemModelTypeUuid.compare( one, two, "gt" ).should.be.true( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeUuid.compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeUuid.compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeUuid.compare( one, two, "lte" ).should.be.false( `failed on comparing #${outer} lte #${inner}` );
					} else if ( outer < inner ) {
						OdemModelTypeUuid.compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeUuid.compare( one, two, "gte" ).should.be.false( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeUuid.compare( one, two, "lt" ).should.be.true( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeUuid.compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					} else {
						OdemModelTypeUuid.compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeUuid.compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeUuid.compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeUuid.compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					}
				} );
			} );
		} );

		it( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeUuid.compare( data, null, "gt" ).should.be.false();
				OdemModelTypeUuid.compare( data, null, "gte" ).should.be.false();
				OdemModelTypeUuid.compare( data, null, "lt" ).should.be.false();
				OdemModelTypeUuid.compare( data, null, "lte" ).should.be.false();
			} );
		} );

		it( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeUuid.compare( null, data, "gt" ).should.be.false();
				OdemModelTypeUuid.compare( null, data, "gte" ).should.be.false();
				OdemModelTypeUuid.compare( null, data, "lt" ).should.be.false();
				OdemModelTypeUuid.compare( null, data, "lte" ).should.be.false();
			} );
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			OdemModelTypeUuid.compare( null, null, "gt" ).should.be.false();
			OdemModelTypeUuid.compare( null, null, "lt" ).should.be.false();
		} );

		it( "returns `true` on comparing `null`-value w/ `null`-value accepting equality", function() {
			OdemModelTypeUuid.compare( null, null, "gte" ).should.be.true();
			OdemModelTypeUuid.compare( null, null, "lte" ).should.be.true();
		} );

		it( "supports unary operation testing for value being `null`", function() {
			OdemModelTypeUuid.compare( null, null, "null" ).should.be.true();

			ValidNonNullData.forEach( data => {
				OdemModelTypeUuid.compare( data, null, "null" ).should.be.false();
			} );
		} );

		it( "supports unary operation testing for value not being `null`", function() {
			OdemModelTypeUuid.compare( null, null, "notnull" ).should.be.false();

			ValidNonNullData.forEach( data => {
				OdemModelTypeUuid.compare( data, null, "notnull" ).should.be.true();
			} );
		} );
	} );
} );
