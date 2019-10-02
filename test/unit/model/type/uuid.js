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

const Helper = require( "../../helper" );

const AllTypes = require( "../../../../lib/model/type" );
const Adapter = require( "../../../../lib/adapter/base" );
const Base = require( "../../../../lib/model/type/base" );
const Type = require( "../../../../lib/model/type/uuid" );


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


suite( "Model Attribute Type `uuid`", function() {
	test( "is available", function() {
		Should.exist( Type );
	} );

	test( "is derived from ModelType base class", function() {
		Type.prototype.should.be.instanceOf( Base );
	} );

	test( "is exposing its name as uuid", function() {
		Type.should.have.property( "typeName" ).which.is.equal( "uuid" );
	} );

	test( "is exposing list of aliases to type name", function() {
		Type.should.have.property( "aliases" ).which.is.an.Array();
		Type.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	test( "is commonly exposed by its name", function() {
		AllTypes.selectByName( "uuid" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by all its aliases", function() {
		AllTypes.selectByName( "key" ).should.be.equal( Type );
		AllTypes.selectByName( "foreign" ).should.be.equal( Type );
		AllTypes.selectByName( "foreign key" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		AllTypes.selectByName( "KEY" ).should.be.equal( Type );
		AllTypes.selectByName( "FOREIGN" ).should.be.equal( Type );
		AllTypes.selectByName( "FOREIGN KEY" ).should.be.equal( Type );
	} );

	suite( "is exposing method `checkDefinition()` which", function() {
		const { checkDefinition } = Type;

		test( "is a function to be invoked w/ one argument", function() {
			checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		test( "doesn't throw exception", function() {
			( () => checkDefinition() ).should.not.throw();
			( () => checkDefinition( undefined ) ).should.not.throw();
			( () => checkDefinition( null ) ).should.not.throw();
			( () => checkDefinition( false ) ).should.not.throw();
			( () => checkDefinition( true ) ).should.not.throw();
			( () => checkDefinition( 0 ) ).should.not.throw();
			( () => checkDefinition( -1 ) ).should.not.throw();
			( () => checkDefinition( 4.5 ) ).should.not.throw();
			( () => checkDefinition( "" ) ).should.not.throw();
			( () => checkDefinition( "required: true" ) ).should.not.throw();
			( () => checkDefinition( [] ) ).should.not.throw();
			( () => checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => checkDefinition( {} ) ).should.not.throw();
			( () => checkDefinition( { required: true } ) ).should.not.throw();
		} );

		test( "returns array of encountered errors", function() {
			checkDefinition().should.be.Array();
			checkDefinition( undefined ).should.be.Array();
			checkDefinition( null ).should.be.Array();
			checkDefinition( false ).should.be.Array();
			checkDefinition( true ).should.be.Array();
			checkDefinition( 0 ).should.be.Array();
			checkDefinition( -1 ).should.be.Array();
			checkDefinition( 4.5 ).should.be.Array();
			checkDefinition( "" ).should.be.Array();
			checkDefinition( "required: true" ).should.be.Array();
			checkDefinition( [] ).should.be.Array();
			checkDefinition( ["required: true"] ).should.be.Array();
			checkDefinition( {} ).should.be.Array();
			checkDefinition( { required: true } ).should.be.Array();
		} );

		test( "lists error unless providing definition object in first argument", function() {
			checkDefinition().should.not.be.empty();
			checkDefinition( undefined ).should.not.be.empty();
			checkDefinition( null ).should.not.be.empty();
			checkDefinition( false ).should.not.be.empty();
			checkDefinition( true ).should.not.be.empty();
			checkDefinition( 0 ).should.not.be.empty();
			checkDefinition( -1 ).should.not.be.empty();
			checkDefinition( 4.5 ).should.not.be.empty();
			checkDefinition( "" ).should.not.be.empty();
			checkDefinition( "required: true" ).should.not.be.empty();
			checkDefinition( [] ).should.not.be.empty();
			checkDefinition( ["required: true"] ).should.not.be.empty();

			checkDefinition( {} ).should.be.empty();
			checkDefinition( { required: true } ).should.be.empty();
		} );

		test( "lists instances of Error on encountering errors in provided definition", function() {
			checkDefinition()[0].should.be.instanceOf( Error );
			checkDefinition( undefined )[0].should.be.instanceOf( Error );
			checkDefinition( null )[0].should.be.instanceOf( Error );
			checkDefinition( false )[0].should.be.instanceOf( Error );
			checkDefinition( true )[0].should.be.instanceOf( Error );
			checkDefinition( 0 )[0].should.be.instanceOf( Error );
			checkDefinition( -1 )[0].should.be.instanceOf( Error );
			checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			checkDefinition( "" )[0].should.be.instanceOf( Error );
			checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			checkDefinition( [] )[0].should.be.instanceOf( Error );
			checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );
	} );

	suite( "is exposing method `coerce()` which", function() {
		const { coerce } = Type;

		test( "is a function to be invoked w/ at least three arguments", function() {
			coerce.should.be.a.Function().which.has.length( 3 );
		} );

		test( "doesn't throw when invoked with two arguments, only", function() {
			( () => coerce( undefined, {} ) ).should.not.throw();
			( () => coerce( null, {} ) ).should.not.throw();
			( () => coerce( false, {} ) ).should.not.throw();
			( () => coerce( true, {} ) ).should.not.throw();
			( () => coerce( 0, {} ) ).should.not.throw();
			( () => coerce( -1, {} ) ).should.not.throw();
			( () => coerce( 4.5, {} ) ).should.not.throw();
			( () => coerce( "", {} ) ).should.not.throw();
			( () => coerce( "required: true", {} ) ).should.not.throw();
			( () => coerce( [], {} ) ).should.not.throw();
			( () => coerce( ["required: true"], {} ) ).should.not.throw();

			( () => coerce( {}, {} ) ).should.not.throw();
			( () => coerce( { required: true }, {} ) ).should.not.throw();
		} );

		test( "returns `null` unless providing instance of Buffer with 16 octets or properly formatted string providing UUID", function() {
			Should( coerce( undefined, {} ) ).be.null();
			Should( coerce( null, {} ) ).be.null();

			Should( coerce( false, {} ) ).be.null();
			Should( coerce( true, {} ) ).be.null();
			Should( coerce( 0, {} ) ).be.null();
			Should( coerce( -1, {} ) ).be.null();
			Should( coerce( 4.5, {} ) ).be.null();
			Should( coerce( "", {} ) ).be.null();
			Should( coerce( "required: true", {} ) ).be.null();
			Should( coerce( [], {} ) ).be.null();
			Should( coerce( ["required: true"], {} ) ).be.null();
			Should( coerce( {}, {} ) ).be.null();
			Should( coerce( { required: true }, {} ) ).be.null();

			Should( coerce( Buffer.alloc( 0 ), {} ) ).be.null();
			Should( coerce( Buffer.alloc( 15 ), {} ) ).be.null();
			Should( coerce( Buffer.alloc( 17 ), {} ) ).be.null();
			Should( coerce( Buffer.allocUnsafe( 0 ), {} ) ).be.null();
			Should( coerce( Buffer.allocUnsafe( 15 ), {} ) ).be.null();
			Should( coerce( Buffer.allocUnsafe( 17 ), {} ) ).be.null();

			coerce( Buffer.alloc( 16 ), {} ).should.be.instanceOf( Buffer );
			coerce( Buffer.allocUnsafe( 16 ), {} ).should.be.instanceOf( Buffer );

			coerce( "00000000-0000-0000-0000-000000000000", {} ).should.be.instanceOf( Buffer );
			coerce( "12345678-1234-1234-1234-123456789012", {} ).should.be.instanceOf( Buffer );

			Should( coerce( "00000000.0000.0000.0000.000000000000", {} ) ).be.null();
			Should( coerce( "12345678.1234.1234.1234.123456789012", {} ) ).be.null();
			Should( coerce( "00000000-0000-0000-0000000000000000", {} ) ).be.null();
			Should( coerce( "12345678-1234-1234-1234123456789012", {} ) ).be.null();
			Should( coerce( "00000000000000000000000000000000", {} ) ).be.null();
			Should( coerce( "12345678123412341234123456789012", {} ) ).be.null();
		} );

		test( "returns `null` on providing `undefined`", function() {
			Should( coerce( undefined, {} ) ).be.null();
		} );

		test( "returns `null` on providing `null`", function() {
			Should( coerce( null, {} ) ).be.null();
		} );

		test( "returns `null` on providing `false`", function() {
			Should( coerce( false, {} ) ).be.null();
		} );

		test( "returns 'null' on providing `true`", function() {
			Should( coerce( true ) ).be.null();
		} );

		test( "returns `null` on providing any integer", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					Should( coerce( i, {} ) ).be.null();
				}
			}
		} );

		test( "returns `null` on providing any number", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						Should( coerce( v, {} ) ).be.null();
					}
				}
			}
		} );

		test( "returns `null` on providing object", function() {
			Should( coerce( {}, {} ) ).be.null();
			Should( coerce( { someName: "someValue" }, {} ) ).be.null();
			Should( coerce( { toString: () => "me as a string" }, {} ) ).be.null();

			Should( coerce( new Date(), {} ) ).be.null();
			Should( coerce( new TypeError(), {} ) ).be.null();
			Should( coerce( new Promise( resolve => resolve() ), {} ) ).be.null();
		} );

		test( "returns `null` on providing array", function() {
			Should( coerce( [], {} ) ).be.null();
			Should( coerce( [1], {} ) ).be.null();
			Should( coerce( ["sole"], {} ) ).be.null();
			Should( coerce( [ true, false ], {} ) ).be.null();
		} );

		test( "returns `null` on providing function", function() {
			Should( coerce( () => {}, {} ) ).be.null(); // eslint-disable-line no-empty-function
			Should( coerce( () => 1 + 3, {} ) ).be.null();
			Should( coerce( function() {}, {} ) ).be.null(); // eslint-disable-line no-empty-function

			Should( coerce( Date.parse, {} ) ).be.null();
		} );

		test( "accepts definition in second argument", function() {
			( () => coerce( "string", { required: true } ) ).should.not.throw();
		} );

		test( "doesn't care for definition requiring value", function() {
			Should( coerce( undefined, { required: true } ) ).be.null();
			Should( coerce( null, { required: true } ) ).be.null();
		} );
	} );

	suite( "is exposing method `isValid()` which", function() {
		const { isValid } = Type;

		test( "is a function to be invoked w/ four argument", function() {
			isValid.should.be.a.Function().which.has.length( 4 );
		} );

		test( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => isValid( "name", null, { required: true } ) ).should.throw();


			( () => isValid( "name", null, { required: true }, undefined ) ).should.throw();
			( () => isValid( "name", null, { required: true }, null ) ).should.throw();
			( () => isValid( "name", null, { required: true }, false ) ).should.throw();
			( () => isValid( "name", null, { required: true }, true ) ).should.throw();
			( () => isValid( "name", null, { required: true }, 0 ) ).should.throw();
			( () => isValid( "name", null, { required: true }, -1 ) ).should.throw();
			( () => isValid( "name", null, { required: true }, 4.5 ) ).should.throw();
			( () => isValid( "name", null, { required: true }, "" ) ).should.throw();
			( () => isValid( "name", null, { required: true }, "required: true" ) ).should.throw();
			( () => isValid( "name", null, { required: true }, {} ) ).should.throw();
			( () => isValid( "name", null, { required: true }, { required: true } ) ).should.throw();

			( () => isValid( "name", null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( "name", null, { required: true }, ["required: true"] ) ).should.not.throw();
		} );

		test( "doesn't throw exception on providing invalid first argument", function() {
			ValidData.concat( ValidInput, InvalidInput ).forEach( data => {
				( () => isValid( data, null, { required: true }, [] ) ).should.not.throw();
			} );
		} );

		test( "does not return anything", function() {
			ValidData.concat( ValidInput, InvalidInput ).forEach( data => {
				Should( isValid( "name", data, {}, [] ) ).be.undefined();
			} );
		} );

		test( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( isValid( "name", null, {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		test( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		test( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );
	} );

	suite( "is exposing method `serialize()` which", function() {
		const { serialize } = Type;

		test( "is a function to be invoked w/ two arguments", function() {
			serialize.should.be.a.Function().which.has.length( 2 );
		} );

		test( "does not throw on serializing null", function() {
			( () => serialize() ).should.not.throw();
			( () => serialize( undefined ) ).should.not.throw();
			( () => serialize( null ) ).should.not.throw();
		} );

		test( "relies on something adapter-like provided in second argument when serializing non-null value", function() {
			Helper.allTypesOfDataButNullLike().forEach( data => {
				( () => serialize( data ) ).should.throw();
			} );
		} );

		test( "returns `null` on providing `null`", function() {
			Should( serialize( null ) ).be.null();
		} );

		test( "returns `null` on providing `undefined`", function() {
			Should( serialize( undefined ) ).be.null();
		} );

		test( "returns string representing octets of provided Buffer instance", function() {
			[
				[ Buffer.alloc( 16 ), "00000000-0000-0000-0000-000000000000" ],
				[ Buffer.from( "12345678901234567890123456789012", "hex" ), "12345678-9012-3456-7890-123456789012" ],
			]
				.forEach( ( [ input, expected ] ) => {
					serialize( input, new Adapter() ).should.be.equal( expected );
				} );
		} );

		test( "relies on prior coercion thus fails on providing numeric values and passes any other unsupported value as string", function() {
			Helper.allTypesOfDataButNullLike().filter( i => typeof i === "number" )
				.forEach( data => {
					( () => serialize( data, new Adapter() ) ).should.throw();
				} );

			Helper.allTypesOfDataButNullLike().filter( i => typeof i !== "number" )
				.forEach( data => {
					serialize( data, new Adapter() ).should.be.equal( String( data ) );
				} );
		} );
	} );

	suite( "is exposing method `deserialize()` which", function() {
		const { deserialize } = Type;

		test( "is a function to be invoked w/ one argument", function() {
			deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		test( "never throws exception", function() {
			( () => deserialize() ).should.not.throw();
			( () => deserialize( undefined ) ).should.not.throw();
			( () => deserialize( null ) ).should.not.throw();
			( () => deserialize( false ) ).should.not.throw();
			( () => deserialize( true ) ).should.not.throw();
			( () => deserialize( 0 ) ).should.not.throw();
			( () => deserialize( -1 ) ).should.not.throw();
			( () => deserialize( 4.5 ) ).should.not.throw();
			( () => deserialize( "" ) ).should.not.throw();
			( () => deserialize( "required: true" ) ).should.not.throw();
			( () => deserialize( {} ) ).should.not.throw();
			( () => deserialize( { required: true } ) ).should.not.throw();
			( () => deserialize( [] ) ).should.not.throw();
			( () => deserialize( ["required: true"] ) ).should.not.throw();
		} );

		test( "returns null value as null", function() {
			[
				null,
				undefined,
			]
				.forEach( value => {
					Should( deserialize( value ) ).be.null();
				} );
		} );

		test( "returns any unsupported value as null", function() {
			InvalidInput.forEach( value => {
				Should( deserialize( value ) ).be.null();
			} );
		} );

		test( "returns string properly describing UUID as instance of Buffer with represented 16 octets", function() {
			[
				[ Buffer.alloc( 16 ), "00000000-0000-0000-0000-000000000000" ],
				[ Buffer.from( "12345678901234567890123456789012", "hex" ), "12345678-9012-3456-7890-123456789012" ],
			]
				.forEach( ( [ expected, input ] ) => {
					deserialize( input ).should.be.instanceOf( Buffer );
					deserialize( input ).equals( expected ).should.be.true();
				} );
		} );
	} );

	suite( "is exposing method `compare()` which", function() {
		const { compare } = Type;

		test( "is a function to be invoked w/ three arguments", function() {
			compare.should.be.a.Function().which.has.length( 3 );
		} );

		test( "never throws exception", function() {
			( () => compare() ).should.not.throw();

			ValidData.forEach( one => {
				( () => compare( one ) ).should.not.throw();

				ValidData.forEach( two => {
					( () => compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		test( "always returns boolean", function() {
			ValidData.forEach( one => {
				ValidData.forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		test( "considers `null` and `null` as equal", function() {
			compare( null, null, "eq" ).should.be.true();

			compare( null, null, "noteq" ).should.be.false();
		} );

		test( "considers `null` and non-`null` as inequal", function() {
			ValidNonNullData.forEach( data => {
				compare( null, data, "eq" ).should.be.false();
				compare( data, null, "eq" ).should.be.false();

				compare( null, data, "noteq" ).should.be.true();
				compare( data, null, "noteq" ).should.be.true();
			} );
		} );

		test( "returns `true` on negating `null`", function() {
			compare( null, null, "not" ).should.be.true();
		} );

		test( "returns `false` on negating non-`null`-value", function() {
			ValidNonNullData.forEach( value => {
				compare( value, null, "not" ).should.be.false();
			} );
		} );

		test( "detects equal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						compare( one, two, "eq" ).should.be.true();
					} else {
						compare( one, two, "eq" ).should.be.false();
					}
				} );
			} );
		} );

		test( "detects inequal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						compare( one, two, "neq" ).should.be.false();
						compare( one, two, "noteq" ).should.be.false();
					} else {
						compare( one, two, "neq" ).should.be.true();
						compare( one, two, "noteq" ).should.be.true();
					}
				} );
			} );
		} );

		test( "compares order of two values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer > inner ) {
						compare( one, two, "gt" ).should.be.true( `failed on comparing #${outer} gt #${inner}` );
						compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						compare( one, two, "lte" ).should.be.false( `failed on comparing #${outer} lte #${inner}` );
					} else if ( outer < inner ) {
						compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						compare( one, two, "gte" ).should.be.false( `failed on comparing #${outer} gte #${inner}` );
						compare( one, two, "lt" ).should.be.true( `failed on comparing #${outer} lt #${inner}` );
						compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					} else {
						compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					}
				} );
			} );
		} );

		test( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			ValidNonNullData.forEach( data => {
				compare( data, null, "gt" ).should.be.false();
				compare( data, null, "gte" ).should.be.false();
				compare( data, null, "lt" ).should.be.false();
				compare( data, null, "lte" ).should.be.false();
			} );
		} );

		test( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			ValidNonNullData.forEach( data => {
				compare( null, data, "gt" ).should.be.false();
				compare( null, data, "gte" ).should.be.false();
				compare( null, data, "lt" ).should.be.false();
				compare( null, data, "lte" ).should.be.false();
			} );
		} );

		test( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			compare( null, null, "gt" ).should.be.false();
			compare( null, null, "lt" ).should.be.false();
		} );

		test( "returns `true` on comparing `null`-value w/ `null`-value accepting equality", function() {
			compare( null, null, "gte" ).should.be.true();
			compare( null, null, "lte" ).should.be.true();
		} );

		test( "supports unary operation testing for value being `null`", function() {
			compare( null, null, "null" ).should.be.true();

			ValidNonNullData.forEach( data => {
				compare( data, null, "null" ).should.be.false();
			} );
		} );

		test( "supports unary operation testing for value not being `null`", function() {
			compare( null, null, "notnull" ).should.be.false();

			ValidNonNullData.forEach( data => {
				compare( data, null, "notnull" ).should.be.true();
			} );
		} );
	} );
} );
