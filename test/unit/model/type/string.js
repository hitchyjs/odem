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
	"",
	"\x09",
	"   \r\n   \t   ",
	" this\tis\nsome text  ",
	"a",
	"this is some text",
	"this is some very huge text ".repeat( 10000 ),
];

const ValidData = ValidNonNullData.concat( [ null, undefined ] );

const ValidNonNullInput = ValidNonNullData.concat( [
	false,
	true,
	{},
	{ some: "value", and: 5 },
	[],
	[ 1, 2, 3 ],
	() => {}, // eslint-disable-line no-empty-function
	() => 1,
	0,
	-6,
	6,
	3.5,
	-12.4356,
	-Infinity,
	Infinity,
] );

const ValidInput = ValidNonNullInput.concat( [ null, undefined ] );


describe( "Model property type `string`", function() {
	let OdemModelType, OdemModelTypeString;

	before( () => Helper.fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModelType, OdemModelTypeString } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemModelTypeString );
	} );

	it( "is derived from ModelType base class", function() {
		OdemModelTypeString.prototype.should.be.instanceOf( OdemModelType );
	} );

	it( "is exposing its name as string", function() {
		OdemModelTypeString.should.have.property( "typeName" ).which.is.equal( "string" );
	} );

	it( "is exposing list of aliases to type name", function() {
		OdemModelTypeString.should.have.property( "aliases" ).which.is.an.Array();
		OdemModelTypeString.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	it( "is commonly exposed by its name", function() {
		OdemModelType.selectByName( "string" ).should.be.equal( OdemModelTypeString );
	} );

	it( "is commonly exposed by all its aliases", function() {
		OdemModelType.selectByName( "text" ).should.be.equal( OdemModelTypeString );
	} );

	it( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		OdemModelType.selectByName( "STRING" ).should.be.equal( OdemModelTypeString );
		OdemModelType.selectByName( "TEXT" ).should.be.equal( OdemModelTypeString );
	} );

	it( "advertises values of type to be sortable", function() {
		OdemModelTypeString.sortable.should.be.true();
	} );

	describe( "is exposing method `checkDefinition()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeString.checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeString.checkDefinition() ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( undefined ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( null ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( false ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( true ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( 0 ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( -1 ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( "" ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( [] ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => OdemModelTypeString.checkDefinition( {} ) ).should.not.throw();
			( () => OdemModelTypeString.checkDefinition( { required: true } ) ).should.not.throw();
		} );

		it( "returns array of encountered errors", function() {
			OdemModelTypeString.checkDefinition().should.be.Array();
			OdemModelTypeString.checkDefinition( undefined ).should.be.Array();
			OdemModelTypeString.checkDefinition( null ).should.be.Array();
			OdemModelTypeString.checkDefinition( false ).should.be.Array();
			OdemModelTypeString.checkDefinition( true ).should.be.Array();
			OdemModelTypeString.checkDefinition( 0 ).should.be.Array();
			OdemModelTypeString.checkDefinition( -1 ).should.be.Array();
			OdemModelTypeString.checkDefinition( 4.5 ).should.be.Array();
			OdemModelTypeString.checkDefinition( "" ).should.be.Array();
			OdemModelTypeString.checkDefinition( "required: true" ).should.be.Array();
			OdemModelTypeString.checkDefinition( [] ).should.be.Array();
			OdemModelTypeString.checkDefinition( ["required: true"] ).should.be.Array();
			OdemModelTypeString.checkDefinition( {} ).should.be.Array();
			OdemModelTypeString.checkDefinition( { required: true } ).should.be.Array();
		} );

		it( "lists error unless providing definition object in first argument", function() {
			OdemModelTypeString.checkDefinition().should.not.be.empty();
			OdemModelTypeString.checkDefinition( undefined ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( null ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( false ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( true ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( 0 ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( -1 ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( 4.5 ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( "" ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( "required: true" ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( [] ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( ["required: true"] ).should.not.be.empty();

			OdemModelTypeString.checkDefinition( {} ).should.be.empty();
			OdemModelTypeString.checkDefinition( { required: true } ).should.be.empty();
		} );

		it( "lists instances of Error on encountering errors in provided definition", function() {
			OdemModelTypeString.checkDefinition()[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( undefined )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( null )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( false )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( true )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( 0 )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( -1 )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( "" )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( [] )[0].should.be.instanceOf( Error );
			OdemModelTypeString.checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );

		it( "validates optionally given limits on minimum or maximum length", function() {
			OdemModelTypeString.checkDefinition( { minLength: -1 } ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( { minLength: 0 } ).should.be.empty();

			OdemModelTypeString.checkDefinition( { maxLength: -1 } ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( { maxLength: 0 } ).should.not.be.empty();
			OdemModelTypeString.checkDefinition( { maxLength: 1 } ).should.be.empty();
		} );

		it( "adjusts provided definition on fixing limits on length in wrong order", function() {
			const source = {
				minLength: 5,
				maxLength: 0,
			};

			const definition = Object.assign( {}, source );

			definition.maxLength.should.be.equal( source.maxLength );
			definition.minLength.should.be.equal( source.minLength );

			OdemModelTypeString.checkDefinition( definition ).should.be.empty();

			definition.maxLength.should.not.be.equal( source.maxLength );
			definition.minLength.should.not.be.equal( source.minLength );
			definition.minLength.should.be.equal( source.maxLength );
			definition.maxLength.should.be.equal( source.minLength );
		} );

		it( "rejects ambiguous definition on requesting conversion to lower and to upper case", function() {
			OdemModelTypeString.checkDefinition( { lowerCase: true } ).should.be.empty();
			OdemModelTypeString.checkDefinition( { upperCase: true } ).should.be.empty();
			OdemModelTypeString.checkDefinition( { lowerCase: true, upperCase: true } ).should.not.be.empty();
		} );
	} );

	describe( "is exposing method `coerce()` which", function() {
		it( "is a function to be invoked w/ at least three arguments", function() {
			OdemModelTypeString.coerce.should.be.a.Function().which.has.length( 3 );
		} );

		it( "doesn't throw when invoked with two arguments, only", function() {
			( () => OdemModelTypeString.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeString.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeString.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeString.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeString.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "always returns string unless providing `null` or `undefined`", function() {
			Should( OdemModelTypeString.coerce( undefined, {} ) ).not.be.String();
			Should( OdemModelTypeString.coerce( null, {} ) ).not.be.String();

			OdemModelTypeString.coerce( false, {} ).should.be.String();
			OdemModelTypeString.coerce( true, {} ).should.be.String();
			OdemModelTypeString.coerce( 0, {} ).should.be.String();
			OdemModelTypeString.coerce( -1, {} ).should.be.String();
			OdemModelTypeString.coerce( 4.5, {} ).should.be.String();
			OdemModelTypeString.coerce( "", {} ).should.be.String();
			OdemModelTypeString.coerce( "required: true", {} ).should.be.String();
			OdemModelTypeString.coerce( [], {} ).should.be.String();
			OdemModelTypeString.coerce( ["required: true"], {} ).should.be.String();
			OdemModelTypeString.coerce( {}, {} ).should.be.String();
			OdemModelTypeString.coerce( { required: true }, {} ).should.be.String();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeString.coerce( undefined, {} ) ).be.null();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeString.coerce( null, {} ) ).be.null();
		} );

		it( "returns 'false' on providing `false`", function() {
			OdemModelTypeString.coerce( false, {} ).should.be.equal( "false" );
		} );

		it( "returns 'true' on providing `true`", function() {
			OdemModelTypeString.coerce( true, {} ).should.be.equal( "true" );
		} );

		it( "returns string representation of any provided integer", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					OdemModelTypeString.coerce( i, {} ).should.be.equal( String( i ) ).and.match( /^-?\d+$/ );
				}
			}
		} );

		it( "returns string representation of any provided number", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						OdemModelTypeString.coerce( v, {} ).should.be.equal( String( v ) ).and.match( /^(?:-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?e-?\d+)$/ );
					}
				}
			}
		} );

		it( "returns string representation of a provided object", function() {
			OdemModelTypeString.coerce( {}, {} ).should.be.String().which.is.equal( "[object Object]" );
			OdemModelTypeString.coerce( { someName: "someValue" }, {} ).should.be.String().which.is.equal( "[object Object]" );
			OdemModelTypeString.coerce( { toString: () => "me as a string" }, {} ).should.be.String().which.is.equal( "me as a string" );

			OdemModelTypeString.coerce( new Date(), {} ).should.be.String();
			OdemModelTypeString.coerce( new TypeError(), {} ).should.be.String();
			OdemModelTypeString.coerce( new Promise( resolve => resolve() ), {} ).should.be.String();
		} );

		it( "returns string containing string representations of all items in a provided array concatenated by comma", function() {
			OdemModelTypeString.coerce( [], {} ).should.be.String().which.is.empty();
			OdemModelTypeString.coerce( [1], {} ).should.be.String().which.is.equal( "1" );
			OdemModelTypeString.coerce( ["sole"], {} ).should.be.String().which.is.equal( "sole" );
			OdemModelTypeString.coerce( [ true, false ], {} ).should.be.String().which.is.equal( "true,false" );
		} );

		it( "returns code of a provided function - if available - as string", function() {
			OdemModelTypeString.coerce( () => {}, {} ).should.be.String(); // eslint-disable-line no-empty-function
			OdemModelTypeString.coerce( () => 1 + 3, {} ).should.be.String().and.match( /1 \+ 3/ );
			OdemModelTypeString.coerce( function() {}, {} ).should.be.String(); // eslint-disable-line no-empty-function

			OdemModelTypeString.coerce( Date.parse, {} ).should.be.String().and.match( /native/ );
		} );

		it( "accepts definition in second argument", function() {
			( () => OdemModelTypeString.coerce( "string", { required: true } ) ).should.not.throw();
		} );

		it( "doesn't care for definition requiring value", function() {
			Should( OdemModelTypeString.coerce( undefined, { required: true } ) ).be.null();
			Should( OdemModelTypeString.coerce( null, { required: true } ) ).be.null();
		} );

		it( "trims resulting string on demand", function() {
			OdemModelTypeString.coerce( " some string ", {} ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { trim: false } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { trim: true } ).should.be.equal( "some string" );
			OdemModelTypeString.coerce( " some string ", { trim: "somethingTruthy" } ).should.be.equal( "some string" );
		} );

		it( "reduces space in resulting string on demand", function() {
			OdemModelTypeString.coerce( " some string ", {} ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { reduceSpace: false } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { reduceSpace: "somethingTruthy" } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "      some string ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string      ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some      string ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\tsome\tstring\t", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\t\tsome\t\tstring\t\t", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\t \tsome \t string\t \t ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\rsome\rstring\r", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\r\rsome\r\rstring\r\r", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\r \rsome \r string\r \r ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\nsome\nstring\n", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\n\nsome\n\nstring\n\n", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\n \nsome \n string\n \n ", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\r\nsome\r\nstring\r\n", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\r\n\r\nsome\r\n\r\nstring\r\n\r\n", { reduceSpace: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( "\r\n \r\nsome \r\n string\r\n \r\n ", { reduceSpace: true } ).should.be.equal( " some string " );
		} );

		it( "converts characters to upper case", function() {
			OdemModelTypeString.coerce( " some string ", {} ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { upperCase: false } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { upperCase: true } ).should.be.equal( " SOME STRING " );
			OdemModelTypeString.coerce( " gemäß ", { upperCase: true } ).should.be.equal( " GEMÄSS " );
			OdemModelTypeString.coerce( " SOME STRING ", { upperCase: true } ).should.be.equal( " SOME STRING " );
			OdemModelTypeString.coerce( " GEMÄSS ", { upperCase: true } ).should.be.equal( " GEMÄSS " );
		} );

		it( "converts characters to upper case obeying single locale provided in definition", function() {
			OdemModelTypeString.coerce( " some string ", { upperCase: true } ).should.be.equal( " SOME STRING " );
			OdemModelTypeString.coerce( " SOME STRİNG ", { upperCase: true } ).should.be.equal( " SOME STRİNG " );

			/* not yet supported by NodeJS as of v8.x: */
			// OdemModelTypeString.coerce( " some string ", { upperCase: "tr" } ).should.be.equal( " SOME STRİNG " );
			OdemModelTypeString.coerce( " SOME STRİNG ", { upperCase: "tr" } ).should.be.equal( " SOME STRİNG " );
		} );

		it( "converts characters to lower case", function() {
			OdemModelTypeString.coerce( " SOME STRING ", {} ).should.be.equal( " SOME STRING " );
			OdemModelTypeString.coerce( " SOME STRING ", { lowerCase: false } ).should.be.equal( " SOME STRING " );
			OdemModelTypeString.coerce( " SOME STRING ", { lowerCase: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " GEMÄß ", { lowerCase: true } ).should.be.equal( " gemäß " );
			if ( parseInt( process.version ) >= 12 ) {
				OdemModelTypeString.coerce( " GEMÄẞ ", { lowerCase: true } ).should.be.equal( " gemäß " ); // see https://github.com/nodejs/node/issues/25738
			}
			OdemModelTypeString.coerce( " some string ", { lowerCase: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " gemäß ", { lowerCase: true } ).should.be.equal( " gemäß " );
		} );

		it( "converts characters to lower case obeying single locale provided in definition", function() {
			OdemModelTypeString.coerce( " SOME STRING ", { lowerCase: true } ).should.be.equal( " some string " );
			OdemModelTypeString.coerce( " some string ", { lowerCase: true } ).should.be.equal( " some string " );

			/* not yet supported by NodeJS as of v8.x: */
			// coerce( " SOME STRING ", { lowerCase: "tr" } ).should.be.equal( " some strıng " );
			OdemModelTypeString.coerce( " some strıng ", { lowerCase: "tr" } ).should.be.equal( " some strıng " );
		} );

		it( "support combinations of coercion modifiers", function() {
			OdemModelTypeString.coerce( "\rsome \r\n STRING    ", { lowerCase: true, trim: true, reduceSpace: true } ).should.be.equal( "some string" );
		} );
	} );

	describe( "is exposing method `isValid()` which", function() {
		it( "is a function to be invoked w/ four argument", function() {
			OdemModelTypeString.isValid.should.be.a.Function().which.has.length( 4 );
		} );

		it( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 } ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, undefined ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, null ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, false ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, true ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, 0 ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, -1 ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, 4.5 ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, "" ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, "required: true" ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, {} ) ).should.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, { required: true } ) ).should.throw();

			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( "name", "", { minLength: 1 }, ["required: true"] ) ).should.not.throw();
		} );

		it( "doesn't throw exception on providing invalid first argument", function() {
			( () => OdemModelTypeString.isValid( undefined, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( null, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( false, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( true, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( 0, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( -1, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( 4.5, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( "", "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( "required: true", "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( [], "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( ["required: true"], "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( {}, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => OdemModelTypeString.isValid( { required: true }, "", { minLength: 1 }, [] ) ).should.not.throw();
		} );

		it( "does not return anything", function() {
			Should( OdemModelTypeString.isValid( "name", undefined, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", null, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", false, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", true, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", 0, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", -1, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", 4.5, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", "", {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", "value", {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", [], {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", ["value"], {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", {}, {}, [] ) ).be.undefined();
			Should( OdemModelTypeString.isValid( "name", { value: "value" }, {}, [] ) ).be.undefined();
		} );

		it( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeString.isValid( "name", "", {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( OdemModelTypeString.isValid( "name", "", { minLength: 1 }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		it( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeString.isValid( "name", "", { minLength: 1 }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		it( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "ignores demand for minimum length on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", null, { minLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { minLength: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for minimum length on validating string", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", "", { minLength: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "", { minLength: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeString.isValid( "name", "a", { minLength: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeString.isValid( "name", "a", { minLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeString.isValid( "name", "abc", { minLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );
		} );

		it( "ignores demand for maximum length on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", null, { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { maxLength: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for maximum length on validating string", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", "", { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", "", { maxLength: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", "a", { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", "ab", { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "a", { maxLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "abc", { maxLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "abcd", { maxLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );
		} );

		it( "ignores combined demands for minimum and maximum length on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", null, { minLength: 0, maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { minLength: 1, maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { minLength: 1, maxLength: 2 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys combined demands for minimum and maximum length on validating string", function() {
			const definition = { minLength: 2, maxLength: 3 };
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", "", definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( OdemModelTypeString.isValid( "name", "a", definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeString.isValid( "name", "ab", definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeString.isValid( "name", "abc", definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeString.isValid( "name", "abcd", definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( OdemModelTypeString.isValid( "name", "abcde", definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
		} );

		it( "ignores demand for matching some pattern on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", null, { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeString.isValid( "name", null, { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for matching some pattern on validating string", function() {
			const collector = [];

			Should( OdemModelTypeString.isValid( "name", "", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "ab", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "babb", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeString.isValid( "name", "bba", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeString.isValid( "name", "", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeString.isValid( "name", "ab", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeString.isValid( "name", "babb", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeString.isValid( "name", "bba", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( OdemModelTypeString.isValid( "name", "", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );

			Should( OdemModelTypeString.isValid( "name", "ab", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );

			Should( OdemModelTypeString.isValid( "name", "babb", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );

			Should( OdemModelTypeString.isValid( "name", "bba", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 6 );
		} );
	} );

	describe( "is exposing method `serialize()` which", function() {
		it( "is a function to be invoked w/ two arguments", function() {
			OdemModelTypeString.serialize.should.be.a.Function().which.has.length( 2 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeString.serialize() ).should.not.throw();
			( () => OdemModelTypeString.serialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( null ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( false ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( true ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( "" ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( {} ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( [] ) ).should.not.throw();
			( () => OdemModelTypeString.serialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeString.serialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeString.serialize( undefined ) ).be.null();
		} );

		it( "returns any provided string as given", function() {
			[
				"",
				"abc",
				"\u00a0",
				"\x00\x01\x02\x1b\x00",
			]
				.forEach( string => {
					OdemModelTypeString.serialize( string ).should.be.equal( string );
				} );
		} );

		it( "relies on prior coercion to convert non-strings to strings, thus returning any other value as is, too", function() {
			[
				[ false, "false" ],
				[ true, "true" ],
				[ 0, "0" ],
				[ 1.5, "1.5" ],
				[ -2.5e7, "-25000000" ],
				[ [], "" ],
				[ [ 1, 2, 3 ], "1,2,3" ],
				[ {}, "[object Object]" ],
				[ { value: 1, flag: false }, "[object Object]" ],
				[ () => 1, "() => 1" ],
			]
				.forEach( ( [ raw, serialized ] ) => {
					OdemModelTypeString.serialize( raw ).should.be.equal( serialized );
				} );
		} );
	} );

	describe( "is exposing method `deserialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeString.deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeString.deserialize() ).should.not.throw();
			( () => OdemModelTypeString.deserialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( null ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( false ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( true ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( "" ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( {} ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( [] ) ).should.not.throw();
			( () => OdemModelTypeString.deserialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns any provided value as-is", function() {
			ValidInput
				.forEach( value => {
					Should( OdemModelTypeString.deserialize( value ) ).be.equal( value );
				} );
		} );
	} );

	describe( "is exposing method `compare()` which", function() {
		it( "is a function to be invoked w/ three arguments", function() {
			OdemModelTypeString.compare.should.be.a.Function().which.has.length( 3 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeString.compare() ).should.not.throw();

			ValidData.forEach( one => {
				( () => OdemModelTypeString.compare( one ) ).should.not.throw();

				ValidData.forEach( two => {
					( () => OdemModelTypeString.compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => OdemModelTypeString.compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		it( "always returns boolean", function() {
			ValidData.forEach( one => {
				ValidData.forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						OdemModelTypeString.compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		it( "considers `null` and `null` as equal", function() {
			OdemModelTypeString.compare( null, null, "eq" ).should.be.true();

			OdemModelTypeString.compare( null, null, "noteq" ).should.be.false();
		} );

		it( "considers `null` and non-`null` as inequal", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeString.compare( null, data, "eq" ).should.be.false();
				OdemModelTypeString.compare( data, null, "eq" ).should.be.false();

				OdemModelTypeString.compare( null, data, "noteq" ).should.be.true();
				OdemModelTypeString.compare( data, null, "noteq" ).should.be.true();
			} );
		} );

		it( "returns `true` on negating `null`", function() {
			OdemModelTypeString.compare( null, null, "not" ).should.be.true();
		} );

		it( "returns `true` on negating falsy coerced value", function() {
			OdemModelTypeString.compare( "", null, "not" ).should.be.true();
		} );

		it( "returns `false` on negating truthy coerced value", function() {
			ValidNonNullData.filter( i => i ).forEach( value => {
				OdemModelTypeString.compare( value, null, "not" ).should.be.false();
			} );
		} );

		it( "detects two coerced equal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						OdemModelTypeString.compare( one, two, "eq" ).should.be.true( `failed on comparing #${outer} eq #${inner}` );
					} else {
						OdemModelTypeString.compare( one, two, "eq" ).should.be.false( `failed on comparing #${outer} eq #${inner}` );
					}
				} );
			} );
		} );

		it( "detects two coerced inequal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						OdemModelTypeString.compare( one, two, "neq" ).should.be.false( `failed on comparing #${outer} neq #${inner}` );
						OdemModelTypeString.compare( one, two, "noteq" ).should.be.false( `failed on comparing #${outer} noteq #${inner}` );
					} else {
						OdemModelTypeString.compare( one, two, "neq" ).should.be.true( `failed on comparing #${outer} neq #${inner}` );
						OdemModelTypeString.compare( one, two, "noteq" ).should.be.true( `failed on comparing #${outer} noteq #${inner}` );
					}
				} );
			} );
		} );

		it( "compares order of two coerced values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer > inner ) {
						OdemModelTypeString.compare( one, two, "gt" ).should.be.true( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeString.compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeString.compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeString.compare( one, two, "lte" ).should.be.false( `failed on comparing #${outer} lte #${inner}` );
					} else if ( outer < inner ) {
						OdemModelTypeString.compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeString.compare( one, two, "gte" ).should.be.false( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeString.compare( one, two, "lt" ).should.be.true( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeString.compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					} else {
						OdemModelTypeString.compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeString.compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeString.compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeString.compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					}
				} );
			} );
		} );

		it( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeString.compare( data, null, "gt" ).should.be.false();
				OdemModelTypeString.compare( data, null, "gte" ).should.be.false();
				OdemModelTypeString.compare( data, null, "lt" ).should.be.false();
				OdemModelTypeString.compare( data, null, "lte" ).should.be.false();
			} );
		} );

		it( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeString.compare( null, data, "gt" ).should.be.false();
				OdemModelTypeString.compare( null, data, "gte" ).should.be.false();
				OdemModelTypeString.compare( null, data, "lt" ).should.be.false();
				OdemModelTypeString.compare( null, data, "lte" ).should.be.false();
			} );
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			OdemModelTypeString.compare( null, null, "gt" ).should.be.false();
			OdemModelTypeString.compare( null, null, "lt" ).should.be.false();
		} );

		it( "returns `true` on comparing `null`-value w/ `null`-value accepting equality", function() {
			OdemModelTypeString.compare( null, null, "gte" ).should.be.true();
			OdemModelTypeString.compare( null, null, "lte" ).should.be.true();
		} );

		it( "supports unary operation testing for value being `null`", function() {
			OdemModelTypeString.compare( null, null, "null" ).should.be.true();

			ValidNonNullData.forEach( data => {
				OdemModelTypeString.compare( data, null, "null" ).should.be.false();
			} );
		} );

		it( "supports unary operation testing for value not being `null`", function() {
			OdemModelTypeString.compare( null, null, "notnull" ).should.be.false();

			ValidNonNullData.forEach( data => {
				OdemModelTypeString.compare( data, null, "notnull" ).should.be.true();
			} );
		} );
	} );
} );
