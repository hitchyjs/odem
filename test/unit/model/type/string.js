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
const Base = require( "../../../../lib/model/type/base" );
const Type = require( "../../../../lib/model/type/string" );


suite( "Model Attribute Type `string`", function() {
	test( "is available", function() {
		Should.exist( Type );
	} );

	test( "is derived from ModelType base class", function() {
		Type.prototype.should.be.instanceOf( Base );
	} );

	test( "is exposing its name as string", function() {
		Type.should.have.property( "typeName" ).which.is.equal( "string" );
	} );

	test( "is exposing list of aliases to type name", function() {
		Type.should.have.property( "aliases" ).which.is.an.Array();
		Type.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	test( "is commonly exposed by its name", function() {
		AllTypes.selectByName( "string" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by all its aliases", function() {
		AllTypes.selectByName( "text" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		AllTypes.selectByName( "STRING" ).should.be.equal( Type );
		AllTypes.selectByName( "TEXT" ).should.be.equal( Type );
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

		test( "validates optionally given limits on minimum or maximum length", function() {
			checkDefinition( { minLength: -1 } ).should.not.be.empty();
			checkDefinition( { minLength: 0 } ).should.be.empty();

			checkDefinition( { maxLength: -1 } ).should.not.be.empty();
			checkDefinition( { maxLength: 0 } ).should.not.be.empty();
			checkDefinition( { maxLength: 1 } ).should.be.empty();
		} );

		test( "adjusts provided definition on fixing limits on length in wrong order", function() {
			const source = {
				minLength: 5,
				maxLength: 0,
			};

			const definition = Object.assign( {}, source );

			definition.maxLength.should.be.equal( source.maxLength );
			definition.minLength.should.be.equal( source.minLength );

			checkDefinition( definition ).should.be.empty();

			definition.maxLength.should.not.be.equal( source.maxLength );
			definition.minLength.should.not.be.equal( source.minLength );
			definition.minLength.should.be.equal( source.maxLength );
			definition.maxLength.should.be.equal( source.minLength );
		} );

		test( "rejects ambiguous definition on requesting conversion to lower and to upper case", function() {
			checkDefinition( { lowerCase: true } ).should.be.empty();
			checkDefinition( { upperCase: true } ).should.be.empty();
			checkDefinition( { lowerCase: true, upperCase: true } ).should.not.be.empty();
		} );
	} );

	suite( "is exposing method `coerce()` which", function() {
		const { coerce } = Type;

		test( "is a function to be invoked w/ at least one argument", function() {
			coerce.should.be.a.Function().which.has.length( 1 );
		} );

		test( "doesn't throw exception", function() {
			( () => coerce() ).should.not.throw();
			( () => coerce( undefined ) ).should.not.throw();
			( () => coerce( null ) ).should.not.throw();
			( () => coerce( false ) ).should.not.throw();
			( () => coerce( true ) ).should.not.throw();
			( () => coerce( 0 ) ).should.not.throw();
			( () => coerce( -1 ) ).should.not.throw();
			( () => coerce( 4.5 ) ).should.not.throw();
			( () => coerce( "" ) ).should.not.throw();
			( () => coerce( "required: true" ) ).should.not.throw();
			( () => coerce( [] ) ).should.not.throw();
			( () => coerce( ["required: true"] ) ).should.not.throw();

			( () => coerce( {} ) ).should.not.throw();
			( () => coerce( { required: true } ) ).should.not.throw();
		} );

		test( "always returns string unless providing `null` or `undefined`", function() {
			Should( coerce() ).not.be.String();
			Should( coerce( undefined ) ).not.be.String();
			Should( coerce( null ) ).not.be.String();

			coerce( false ).should.be.String();
			coerce( true ).should.be.String();
			coerce( 0 ).should.be.String();
			coerce( -1 ).should.be.String();
			coerce( 4.5 ).should.be.String();
			coerce( "" ).should.be.String();
			coerce( "required: true" ).should.be.String();
			coerce( [] ).should.be.String();
			coerce( ["required: true"] ).should.be.String();
			coerce( {} ).should.be.String();
			coerce( { required: true } ).should.be.String();
		} );

		test( "returns `null` on providing `undefined`", function() {
			Should( coerce() ).be.null();
			Should( coerce( undefined ) ).be.null();
		} );

		test( "returns `null` on providing `null`", function() {
			Should( coerce( null ) ).be.null();
		} );

		test( "returns 'false' on providing `false`", function() {
			coerce( false ).should.be.equal( "false" );
		} );

		test( "returns 'true' on providing `true`", function() {
			coerce( true ).should.be.equal( "true" );
		} );

		test( "returns string representation of any provided integer", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					coerce( i ).should.be.equal( String( i ) ).and.match( /^-?\d+$/ );
				}
			}
		} );

		test( "returns string representation of any provided number", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						coerce( v ).should.be.equal( String( v ) ).and.match( /^(?:-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?e-?\d+)$/ );
					}
				}
			}
		} );

		test( "returns string representation of a provided object", function() {
			coerce( {} ).should.be.String().which.is.equal( "[object Object]" );
			coerce( { someName: "someValue" } ).should.be.String().which.is.equal( "[object Object]" );
			coerce( { toString: () => "me as a string" } ).should.be.String().which.is.equal( "me as a string" );

			coerce( new Date() ).should.be.String();
			coerce( new TypeError() ).should.be.String();
			coerce( new Promise( resolve => resolve() ) ).should.be.String();
		} );

		test( "returns string containing string representations of all items in a provided array concatenated by comma", function() {
			coerce( [] ).should.be.String().which.is.empty();
			coerce( [1] ).should.be.String().which.is.equal( "1" );
			coerce( ["sole"] ).should.be.String().which.is.equal( "sole" );
			coerce( [ true, false ] ).should.be.String().which.is.equal( "true,false" );
		} );

		test( "returns code of a provided function - if available - as string", function() {
			coerce( () => {} ).should.be.String(); // eslint-disable-line no-empty-function
			coerce( () => 1 + 3 ).should.be.String().and.match( /1 \+ 3/ );
			coerce( function() {} ).should.be.String(); // eslint-disable-line no-empty-function

			coerce( Date.parse ).should.be.String().and.match( /native/ );
		} );

		test( "accepts definition in second argument", function() {
			( () => coerce( "string", { required: true } ) ).should.not.throw();
		} );

		test( "doesn't care for definition requiring value", function() {
			Should( coerce( undefined, { required: true } ) ).be.null();
			Should( coerce( null, { required: true } ) ).be.null();
		} );

		test( "trims resulting string on demand", function() {
			coerce( " some string ", {} ).should.be.equal( " some string " );
			coerce( " some string ", { trim: false } ).should.be.equal( " some string " );
			coerce( " some string ", { trim: true } ).should.be.equal( "some string" );
			coerce( " some string ", { trim: "somethingTruthy" } ).should.be.equal( "some string" );
		} );

		test( "reduces space in resulting string on demand", function() {
			coerce( " some string ", {} ).should.be.equal( " some string " );
			coerce( " some string ", { reduceSpace: false } ).should.be.equal( " some string " );
			coerce( " some string ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( " some string ", { reduceSpace: "somethingTruthy" } ).should.be.equal( " some string " );
			coerce( "      some string ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( " some string      ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( " some      string ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\tsome\tstring\t", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\t\tsome\t\tstring\t\t", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\t \tsome \t string\t \t ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\rsome\rstring\r", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\r\rsome\r\rstring\r\r", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\r \rsome \r string\r \r ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\nsome\nstring\n", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\n\nsome\n\nstring\n\n", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\n \nsome \n string\n \n ", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\r\nsome\r\nstring\r\n", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\r\n\r\nsome\r\n\r\nstring\r\n\r\n", { reduceSpace: true } ).should.be.equal( " some string " );
			coerce( "\r\n \r\nsome \r\n string\r\n \r\n ", { reduceSpace: true } ).should.be.equal( " some string " );
		} );

		test( "converts characters to upper case", function() {
			coerce( " some string ", {} ).should.be.equal( " some string " );
			coerce( " some string ", { upperCase: false } ).should.be.equal( " some string " );
			coerce( " some string ", { upperCase: true } ).should.be.equal( " SOME STRING " );
			coerce( " gemäß ", { upperCase: true } ).should.be.equal( " GEMÄSS " );
			coerce( " SOME STRING ", { upperCase: true } ).should.be.equal( " SOME STRING " );
			coerce( " GEMÄSS ", { upperCase: true } ).should.be.equal( " GEMÄSS " );
		} );

		test( "converts characters to upper case obeying single locale provided in definition", function() {
			coerce( " some string ", { upperCase: true } ).should.be.equal( " SOME STRING " );
			coerce( " SOME STRİNG ", { upperCase: true } ).should.be.equal( " SOME STRİNG " );

			/* not yet supported by NodeJS as of v8.x: */
			// coerce( " some string ", { upperCase: "tr" } ).should.be.equal( " SOME STRİNG " );
			coerce( " SOME STRİNG ", { upperCase: "tr" } ).should.be.equal( " SOME STRİNG " );
		} );

		it( "converts characters to lower case", function() {
			coerce( " SOME STRING ", {} ).should.be.equal( " SOME STRING " );
			coerce( " SOME STRING ", { lowerCase: false } ).should.be.equal( " SOME STRING " );
			coerce( " SOME STRING ", { lowerCase: true } ).should.be.equal( " some string " );
			coerce( " GEMÄß ", { lowerCase: true } ).should.be.equal( " gemäß " );
			if ( parseInt( process.version ) >= 12 ) {
				coerce( " GEMÄẞ ", { lowerCase: true } ).should.be.equal( " gemäß " ); // see https://github.com/nodejs/node/issues/25738
			}
			coerce( " some string ", { lowerCase: true } ).should.be.equal( " some string " );
			coerce( " gemäß ", { lowerCase: true } ).should.be.equal( " gemäß " );
		} );

		test( "converts characters to lower case obeying single locale provided in definition", function() {
			coerce( " SOME STRING ", { lowerCase: true } ).should.be.equal( " some string " );
			coerce( " some string ", { lowerCase: true } ).should.be.equal( " some string " );

			/* not yet supported by NodeJS as of v8.x: */
			// coerce( " SOME STRING ", { lowerCase: "tr" } ).should.be.equal( " some strıng " );
			coerce( " some strıng ", { lowerCase: "tr" } ).should.be.equal( " some strıng " );
		} );

		test( "support combinations of coercion modifiers", function() {
			coerce( "\rsome \r\n STRING    ", { lowerCase: true, trim: true, reduceSpace: true } ).should.be.equal( "some string" );
		} );
	} );

	suite( "is exposing method `isValid()` which", function() {
		const { isValid } = Type;

		test( "is a function to be invoked w/ four argument", function() {
			isValid.should.be.a.Function().which.has.length( 4 );
		} );

		test( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => isValid( "name", "", { minLength: 1 } ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, undefined ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, null ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, false ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, true ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, 0 ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, -1 ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, 4.5 ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, "" ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, "required: true" ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, {} ) ).should.throw();
			( () => isValid( "name", "", { minLength: 1 }, { required: true } ) ).should.throw();

			( () => isValid( "name", "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( "name", "", { minLength: 1 }, ["required: true"] ) ).should.not.throw();
		} );

		test( "doesn't throw exception on providing invalid first argument", function() {
			( () => isValid( undefined, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( null, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( false, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( true, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( 0, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( -1, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( 4.5, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( "", "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( "required: true", "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( [], "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( ["required: true"], "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( {}, "", { minLength: 1 }, [] ) ).should.not.throw();
			( () => isValid( { required: true }, "", { minLength: 1 }, [] ) ).should.not.throw();
		} );

		test( "does not return anything", function() {
			Should( isValid( "name", undefined, {}, [] ) ).be.undefined();
			Should( isValid( "name", null, {}, [] ) ).be.undefined();
			Should( isValid( "name", false, {}, [] ) ).be.undefined();
			Should( isValid( "name", true, {}, [] ) ).be.undefined();
			Should( isValid( "name", 0, {}, [] ) ).be.undefined();
			Should( isValid( "name", -1, {}, [] ) ).be.undefined();
			Should( isValid( "name", 4.5, {}, [] ) ).be.undefined();
			Should( isValid( "name", "", {}, [] ) ).be.undefined();
			Should( isValid( "name", "value", {}, [] ) ).be.undefined();
			Should( isValid( "name", [], {}, [] ) ).be.undefined();
			Should( isValid( "name", ["value"], {}, [] ) ).be.undefined();
			Should( isValid( "name", {}, {}, [] ) ).be.undefined();
			Should( isValid( "name", { value: "value" }, {}, [] ) ).be.undefined();
		} );

		test( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( isValid( "name", "", {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( isValid( "name", "", { minLength: 1 }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		test( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( isValid( "name", "", { minLength: 1 }, collector ) ).be.undefined();

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

		test( "ignores demand for minimum length on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { minLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { minLength: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for minimum length on validating string", function() {
			const collector = [];

			Should( isValid( "name", "", { minLength: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "", { minLength: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", "a", { minLength: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", "a", { minLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", "abc", { minLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );
		} );

		test( "ignores demand for maximum length on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { maxLength: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for maximum length on validating string", function() {
			const collector = [];

			Should( isValid( "name", "", { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", "", { maxLength: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", "a", { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", "ab", { maxLength: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "a", { maxLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "abc", { maxLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "abcd", { maxLength: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );
		} );

		test( "ignores combined demands for minimum and maximum length on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { minLength: 0, maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { minLength: 1, maxLength: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { minLength: 1, maxLength: 2 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys combined demands for minimum and maximum length on validating string", function() {
			const definition = { minLength: 2, maxLength: 3 };
			const collector = [];

			Should( isValid( "name", "", definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( isValid( "name", "a", definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", "ab", definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", "abc", definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", "abcd", definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( isValid( "name", "abcde", definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
		} );

		test( "ignores demand for matching some pattern on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for matching some pattern on validating string", function() {
			const collector = [];

			Should( isValid( "name", "", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "ab", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "babb", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", "bba", { pattern: /ab+/i }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", "", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", "ab", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", "babb", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", "bba", { pattern: new RegExp( "ab+", "i" ) }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( isValid( "name", "", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );

			Should( isValid( "name", "ab", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );

			Should( isValid( "name", "babb", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );

			Should( isValid( "name", "bba", { pattern: "ab+" }, collector ) ).be.undefined();
			collector.should.have.length( 6 );
		} );
	} );

	suite( "is exposing method `serialize()` which", function() {
		const { serialize } = Type;

		test( "is a function to be invoked w/ two arguments", function() {
			serialize.should.be.a.Function().which.has.length( 2 );
		} );

		test( "never throws exception", function() {
			( () => serialize() ).should.not.throw();
			( () => serialize( undefined ) ).should.not.throw();
			( () => serialize( null ) ).should.not.throw();
			( () => serialize( false ) ).should.not.throw();
			( () => serialize( true ) ).should.not.throw();
			( () => serialize( 0 ) ).should.not.throw();
			( () => serialize( -1 ) ).should.not.throw();
			( () => serialize( 4.5 ) ).should.not.throw();
			( () => serialize( "" ) ).should.not.throw();
			( () => serialize( "required: true" ) ).should.not.throw();
			( () => serialize( {} ) ).should.not.throw();
			( () => serialize( { required: true } ) ).should.not.throw();
			( () => serialize( [] ) ).should.not.throw();
			( () => serialize( ["required: true"] ) ).should.not.throw();
		} );

		test( "returns `null` on providing `null`", function() {
			Should( serialize( null ) ).be.null();
		} );

		test( "returns `null` on providing `undefined`", function() {
			Should( serialize( undefined ) ).be.null();
		} );

		test( "returns any provided string as given", function() {
			[
				"",
				"abc",
				"\u00a0",
				"\x00\x01\x02\x1b\x00",
			]
				.forEach( string => {
					serialize( string ).should.be.equal( string );
				} );
		} );

		test( "relies on prior coercion to convert non-strings to strings, thus returning any other value as is, too", function() {
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
					serialize( raw ).should.be.equal( serialized );
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

		test( "returns any provided value as-is", function() {
			[
				null,
				undefined,
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
			]
				.forEach( value => {
					Should( deserialize( value ) ).be.equal( value );
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

			Helper.allTypesOfData().forEach( one => {
				( () => compare( one ) ).should.not.throw();

				Helper.allTypesOfData().forEach( two => {
					( () => compare( one, two ) ).should.not.throw();

					Helper.allTypesOfData().forEach( three => {
						( () => compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		test( "always returns boolean", function() {
			Helper.allTypesOfData().forEach( one => {
				Helper.allTypesOfData().forEach( two => {
					Helper.allTypesOfData().forEach( three => {
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
			compare( null, "", "eq" ).should.be.false();
			compare( "", null, "eq" ).should.be.false();

			compare( null, "", "noteq" ).should.be.true();
			compare( "", null, "noteq" ).should.be.true();
		} );

		test( "returns `true` on negating `null`", function() {
			compare( null, null, "not" ).should.be.true();
		} );

		test( "returns `true` on negating falsy coerced value", function() {
			compare( "", null, "not" ).should.be.true();
		} );

		test( "returns `false` on negating truthy coerced value", function() {
			compare( "0", null, "not" ).should.be.false();
			compare( "1", null, "not" ).should.be.false();
			compare( "a", null, "not" ).should.be.false();
			compare( "true", null, "not" ).should.be.false();
			compare( "false", null, "not" ).should.be.false();
		} );

		test( "detects two coerced equal values", function() {
			compare( "", "", "eq" ).should.be.true();
			compare( "foo", "foo", "eq" ).should.be.true();

			compare( "", "", "noteq" ).should.be.false();
			compare( "foo", "foo", "noteq" ).should.be.false();
		} );

		test( "detects two coerced inequal values", function() {
			compare( "", "0", "eq" ).should.be.false();
			compare( "foo", "bar", "eq" ).should.be.false();

			compare( "", "0", "noteq" ).should.be.true();
			compare( "foo", "bar", "noteq" ).should.be.true();
		} );

		test( "compares order of two coerced values", function() {
			compare( "john", "jane", "gt" ).should.be.true();
			compare( "john", "jane", "gte" ).should.be.true();
			compare( "john", "john", "gt" ).should.be.false();
			compare( "john", "john", "gte" ).should.be.true();

			compare( "jane", "john", "lt" ).should.be.true();
			compare( "jane", "john", "lte" ).should.be.true();
			compare( "jane", "jane", "lt" ).should.be.false();
			compare( "jane", "jane", "lte" ).should.be.true();
		} );

		test( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			compare( "john", null, "gt" ).should.be.false();
			compare( "john", null, "gte" ).should.be.false();
			compare( "john", null, "lt" ).should.be.false();
			compare( "john", null, "lte" ).should.be.false();
		} );

		test( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			compare( null, "john", "gt" ).should.be.false();
			compare( null, "john", "gte" ).should.be.false();
			compare( null, "john", "lt" ).should.be.false();
			compare( null, "john", "lte" ).should.be.false();
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

			compare( "", null, "null" ).should.be.false();
		} );

		test( "supports unary operation testing for value not being `null`", function() {
			compare( null, null, "notnull" ).should.be.false();

			compare( "", null, "notnull" ).should.be.true();
		} );
	} );
} );
