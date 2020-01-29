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

describe( "Model property type `boolean`", function() {
	let OdemModelType, OdemModelTypeBoolean;

	before( () => Helper.fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModelType, OdemModelTypeBoolean } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemModelTypeBoolean );
	} );

	it( "is derived from ModelType base class", function() {
		OdemModelTypeBoolean.prototype.should.be.instanceOf( OdemModelType );
	} );

	it( "is exposing its name as string", function() {
		OdemModelTypeBoolean.should.have.property( "typeName" ).which.is.equal( "boolean" );
	} );

	it( "is exposing list of aliases to type name", function() {
		OdemModelTypeBoolean.should.have.property( "aliases" ).which.is.an.Array();
		OdemModelTypeBoolean.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	it( "is commonly exposed by its name", function() {
		OdemModelType.selectByName( "boolean" ).should.be.equal( OdemModelTypeBoolean );
	} );

	it( "is commonly exposed by all its aliases", function() {
		OdemModelType.selectByName( "bool" ).should.be.equal( OdemModelTypeBoolean );
	} );

	it( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		OdemModelType.selectByName( "BOOLEAN" ).should.be.equal( OdemModelTypeBoolean );
		OdemModelType.selectByName( "BOOL" ).should.be.equal( OdemModelTypeBoolean );
	} );

	it( "advertises values of type to be sortable", function() {
		OdemModelTypeBoolean.sortable.should.be.true();
	} );

	describe( "is exposing method `checkDefinition()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeBoolean.checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeBoolean.checkDefinition() ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( undefined ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( null ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( false ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( true ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( 0 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( -1 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( "" ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => OdemModelTypeBoolean.checkDefinition( {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.checkDefinition( { required: true } ) ).should.not.throw();
		} );

		it( "returns array of encountered errors", function() {
			OdemModelTypeBoolean.checkDefinition().should.be.Array();
			OdemModelTypeBoolean.checkDefinition( undefined ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( null ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( false ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( true ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( 0 ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( -1 ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( 4.5 ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( "" ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( "required: true" ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( [] ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( ["required: true"] ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( {} ).should.be.Array();
			OdemModelTypeBoolean.checkDefinition( { required: true } ).should.be.Array();
		} );

		it( "lists error unless providing definition object in first argument", function() {
			OdemModelTypeBoolean.checkDefinition().should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( undefined ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( null ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( false ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( true ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( 0 ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( -1 ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( 4.5 ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( "" ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( "required: true" ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( [] ).should.not.be.empty();
			OdemModelTypeBoolean.checkDefinition( ["required: true"] ).should.not.be.empty();

			OdemModelTypeBoolean.checkDefinition( {} ).should.be.empty();
			OdemModelTypeBoolean.checkDefinition( { required: true } ).should.be.empty();
		} );

		it( "lists instances of Error on encountering errors in provided definition", function() {
			OdemModelTypeBoolean.checkDefinition()[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( undefined )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( null )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( false )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( true )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( 0 )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( -1 )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( "" )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( [] )[0].should.be.instanceOf( Error );
			OdemModelTypeBoolean.checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );
	} );

	describe( "is exposing method `coerce()` which", function() {
		it( "is a function to be invoked w/ at least three arguments", function() {
			OdemModelTypeBoolean.coerce.should.be.a.Function().which.has.length( 3 );
		} );

		it( "doesn't throw when invoked with two arguments, only", function() {
			( () => OdemModelTypeBoolean.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeBoolean.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "always returns boolean unless providing `null` or `undefined`", function() {
			Should( OdemModelTypeBoolean.coerce( undefined, {} ) ).not.be.Boolean();
			Should( OdemModelTypeBoolean.coerce( null, {} ) ).not.be.Boolean();

			OdemModelTypeBoolean.coerce( false, {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( true, {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( 0, {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( -1, {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( 4.5, {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( "", {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( "required: true", {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( [], {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( ["required: true"], {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( {}, {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( { required: true }, {} ).should.be.Boolean();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeBoolean.coerce( undefined, {} ) ).be.null();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeBoolean.coerce( null, {} ) ).be.null();
		} );

		it( "returns `false` on providing `false`", function() {
			OdemModelTypeBoolean.coerce( false, {} ).should.be.equal( false );
		} );

		it( "returns `true` on providing `true`", function() {
			OdemModelTypeBoolean.coerce( true, {} ).should.be.equal( true );
		} );

		it( "returns boolean matching truthiness of any provided integer", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					OdemModelTypeBoolean.coerce( i, {} ).should.be.equal( Boolean( i ) );
				}
			}
		} );

		it( "returns boolean matching truthiness of any provided number", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						OdemModelTypeBoolean.coerce( v, {} ).should.be.equal( Boolean( v ) );
					}
				}
			}
		} );

		it( "always returns `true` on a provided object of any size or type", function() {
			OdemModelTypeBoolean.coerce( {}, {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( { someName: "someValue" }, {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( { toString: () => "me as a string" }, {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( { toString: () => "" }, {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( String( { toString: () => "" } ), {} ).should.be.Boolean().which.is.false();

			OdemModelTypeBoolean.coerce( new Date(), {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( new TypeError(), {} ).should.be.Boolean();
			OdemModelTypeBoolean.coerce( new Promise( resolve => resolve() ), {} ).should.be.Boolean();
		} );

		it( "always returns `true` on a provided array of any length", function() {
			OdemModelTypeBoolean.coerce( [], {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( ["someValue"], {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( [""], {} ).should.be.Boolean().which.is.true();
		} );

		it( "always returns `true` on any provided function", function() {
			OdemModelTypeBoolean.coerce( () => {}, {} ).should.be.Boolean().which.is.true(); // eslint-disable-line no-empty-function
			OdemModelTypeBoolean.coerce( () => 1 + 3, {} ).should.be.Boolean().which.is.true();
			OdemModelTypeBoolean.coerce( function() {}, {} ).should.be.Boolean().which.is.true(); // eslint-disable-line no-empty-function

			OdemModelTypeBoolean.coerce( Date.parse, {} ).should.be.Boolean().which.is.true();
		} );

		it( "accepts definition in second argument", function() {
			( () => OdemModelTypeBoolean.coerce( "boolean", { required: true } ) ).should.not.throw();
		} );

		it( "doesn't care for definition requiring boolean value", function() {
			Should( OdemModelTypeBoolean.coerce( undefined, { required: true } ) ).be.null();
			Should( OdemModelTypeBoolean.coerce( null, { required: true } ) ).be.null();
		} );
	} );

	describe( "is exposing method `isValid()` which", function() {
		it( "is a function to be invoked w/ four argument", function() {
			OdemModelTypeBoolean.isValid.should.be.a.Function().which.has.length( 4 );
		} );

		it( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true } ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, undefined ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, null ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, false ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, true ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, 0 ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, -1 ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, 4.5 ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, "" ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, "required: true" ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, {} ) ).should.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, { required: true } ) ).should.throw();

			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( "name", null, { required: true }, ["required: true"] ) ).should.not.throw();
		} );

		it( "doesn't throw exception on providing invalid first argument", function() {
			( () => OdemModelTypeBoolean.isValid( undefined, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( null, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( false, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( true, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( 0, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( -1, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( 4.5, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( "", "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( "required: true", "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( [], "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( ["required: true"], "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( {}, "", { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.isValid( { required: true }, "", { required: true }, [] ) ).should.not.throw();
		} );

		it( "does not return anything", function() {
			Should( OdemModelTypeBoolean.isValid( "name", undefined, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", null, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", false, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", true, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", 0, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", -1, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", 4.5, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", "", {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", "value", {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", [], {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", ["value"], {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", {}, {}, [] ) ).be.undefined();
			Should( OdemModelTypeBoolean.isValid( "name", { value: "value" }, {}, [] ) ).be.undefined();
		} );

		it( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeBoolean.isValid( "name", null, {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( OdemModelTypeBoolean.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		it( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeBoolean.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		it( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( OdemModelTypeBoolean.isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeBoolean.isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeBoolean.isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeBoolean.isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "considers empty string as valid boolean value satisfying `required` value in definition", function() {
			const collector = [];

			Should( OdemModelTypeBoolean.isValid( "name", "", {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeBoolean.isValid( "name", "", { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeBoolean.isValid( "name", "", { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeBoolean.isValid( "name", "", { required: true }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );
	} );

	describe( "is exposing method `serialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeBoolean.serialize.should.be.a.Function().which.has.length( 2 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeBoolean.serialize() ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( null ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( false ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( true ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( "" ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.serialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeBoolean.serialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeBoolean.serialize( undefined ) ).be.null();
		} );

		it( "converts `false` to shortest falsy integer `0`", function() {
			OdemModelTypeBoolean.serialize( false ).should.be.Number().which.is.equal( 0 );
		} );

		it( "converts `true` to shortest truthy integer `1`", function() {
			OdemModelTypeBoolean.serialize( true ).should.be.Number().which.is.equal( 1 );
		} );

		it( "returns `0` or `1` depending on truthiness of any other value", function() {
			[
				0,
				1.5,
				-2.5e7,
				[],
				[ 1, 2, 3 ],
				{},
				{ value: 1, flag: false },
				() => 1,
				"",
				"test",
			]
				.forEach( value => {
					OdemModelTypeBoolean.serialize( value ).should.be.Number().which.is.equal( value ? 1 : 0 );
				} );
		} );
	} );

	describe( "is exposing method `deserialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeBoolean.deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeBoolean.deserialize() ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( null ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( false ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( true ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( "" ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( {} ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( [] ) ).should.not.throw();
			( () => OdemModelTypeBoolean.deserialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeBoolean.deserialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeBoolean.deserialize( undefined ) ).be.null();
		} );

		it( "returns `true` on certain strings expressing truthy value", function() {
			[
				"on",
				"y",
				"yes",
				"j",
				"ja",
				"set",
				"hi",
				"high",
				"t",
				"true",
				"x",
			]
				.forEach( string => {
					OdemModelTypeBoolean.deserialize( string ).should.be.Boolean().which.is.true();
					OdemModelTypeBoolean.deserialize( string.toUpperCase() ).should.be.Boolean().which.is.true();
				} );
		} );

		it( "returns `false` on certain strings expressing falsy value", function() {
			[
				"off",
				"n",
				"no",
				"nein",
				"clr",
				"clear",
				"lo",
				"low",
				"f",
				"false",
				"-",
				"",
				" ",
				"       ",
			]
				.forEach( string => {
					OdemModelTypeBoolean.deserialize( string ).should.be.Boolean().which.is.false();
					OdemModelTypeBoolean.deserialize( string.toUpperCase() ).should.be.Boolean().which.is.false();
				} );
		} );

		it( "converts any other falsy non-boolean value (except `null` and `undefined`) to `false`", function() {
			[
				"",
				NaN,
				"0",
				"0.0",
				"-0e1",
				"-0e+1",
				"-0e-1",
			]
				.forEach( value => {
					OdemModelTypeBoolean.deserialize( value ).should.be.Boolean().which.is.false();
				} );
		} );

		it( "converts any other truthy non-boolean value to `true`", function() {
			[
				"abc",
				[],
				["abc"],
				[""],
				[0],
				[false],
				{},
				{ value: false },
				{ value: "" },
				{ value: null },
				{ value: 0 },
				() => 0,
				() => false,
				() => null,
				() => "",
				1.5,
				-2.5e7,
				"1.5",
				"-2.5e7",
			]
				.forEach( value => {
					OdemModelTypeBoolean.deserialize( value ).should.be.Boolean().which.is.true();
				} );
		} );
	} );

	describe( "is exposing method `compare()` which", function() {
		it( "is a function to be invoked w/ three arguments", function() {
			OdemModelTypeBoolean.compare.should.be.a.Function().which.has.length( 3 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeBoolean.compare() ).should.not.throw();

			Helper.allTypesOfData().forEach( one => {
				( () => OdemModelTypeBoolean.compare( one ) ).should.not.throw();

				Helper.allTypesOfData().forEach( two => {
					( () => OdemModelTypeBoolean.compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => OdemModelTypeBoolean.compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		it( "always returns boolean", function() {
			Helper.allTypesOfData().forEach( one => {
				Helper.allTypesOfData().forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						OdemModelTypeBoolean.compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		it( "considers `null` and `null` as equal", function() {
			OdemModelTypeBoolean.compare( null, null, "eq" ).should.be.true();

			OdemModelTypeBoolean.compare( null, null, "noteq" ).should.be.false();
		} );

		it( "considers `null` and non-`null` as inequal", function() {
			OdemModelTypeBoolean.compare( null, 0, "eq" ).should.be.false();
			OdemModelTypeBoolean.compare( 0, null, "eq" ).should.be.false();

			OdemModelTypeBoolean.compare( null, "", "noteq" ).should.be.true();
			OdemModelTypeBoolean.compare( "", null, "noteq" ).should.be.true();
		} );

		it( "returns `true` on negating `null`", function() {
			OdemModelTypeBoolean.compare( null, null, "not" ).should.be.true();
		} );

		it( "returns `true` on negating falsy coerced value", function() {
			OdemModelTypeBoolean.compare( false, null, "not" ).should.be.true();
		} );

		it( "returns `false` on negating truthy coerced value", function() {
			OdemModelTypeBoolean.compare( true, null, "not" ).should.be.false();
		} );

		it( "detects two coerced equal values", function() {
			OdemModelTypeBoolean.compare( true, true, "eq" ).should.be.true();
			OdemModelTypeBoolean.compare( false, false, "eq" ).should.be.true();

			OdemModelTypeBoolean.compare( true, true, "noteq" ).should.be.false();
			OdemModelTypeBoolean.compare( false, false, "noteq" ).should.be.false();
		} );

		it( "detects two coerced inequal values", function() {
			OdemModelTypeBoolean.compare( true, false, "eq" ).should.be.false();
			OdemModelTypeBoolean.compare( false, true, "eq" ).should.be.false();

			OdemModelTypeBoolean.compare( true, false, "noteq" ).should.be.true();
			OdemModelTypeBoolean.compare( false, true, "noteq" ).should.be.true();
		} );

		it( "does not support comparing order of two coerced (boolean) values", function() {
			OdemModelTypeBoolean.compare( true, false, "gt" ).should.be.false();
			OdemModelTypeBoolean.compare( true, true, "gt" ).should.be.false();

			OdemModelTypeBoolean.compare( false, true, "lt" ).should.be.false();
			OdemModelTypeBoolean.compare( false, false, "lt" ).should.be.false();
		} );

		it( "does obey equality when accepted on comparing order of two coerced (boolean) values", function() {
			OdemModelTypeBoolean.compare( true, false, "gte" ).should.be.false();
			OdemModelTypeBoolean.compare( true, true, "gte" ).should.be.true();

			OdemModelTypeBoolean.compare( false, true, "lte" ).should.be.false();
			OdemModelTypeBoolean.compare( false, false, "lte" ).should.be.true();
		} );

		it( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			OdemModelTypeBoolean.compare( true, null, "gt" ).should.be.false();
			OdemModelTypeBoolean.compare( true, null, "gte" ).should.be.false();
			OdemModelTypeBoolean.compare( false, null, "lt" ).should.be.false();
			OdemModelTypeBoolean.compare( false, null, "lte" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			OdemModelTypeBoolean.compare( null, true, "gt" ).should.be.false();
			OdemModelTypeBoolean.compare( null, true, "gte" ).should.be.false();
			OdemModelTypeBoolean.compare( null, false, "lt" ).should.be.false();
			OdemModelTypeBoolean.compare( null, false, "lte" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			OdemModelTypeBoolean.compare( null, null, "gt" ).should.be.false();
			OdemModelTypeBoolean.compare( null, null, "lt" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value accepting equality", function() {
			OdemModelTypeBoolean.compare( null, null, "gte" ).should.be.true();
			OdemModelTypeBoolean.compare( null, null, "lte" ).should.be.true();
		} );

		it( "supports unary operation testing for value being `null`", function() {
			OdemModelTypeBoolean.compare( null, null, "null" ).should.be.true();

			OdemModelTypeBoolean.compare( false, null, "null" ).should.be.false();
		} );

		it( "supports unary operation testing for value not being `null`", function() {
			OdemModelTypeBoolean.compare( null, null, "notnull" ).should.be.false();

			OdemModelTypeBoolean.compare( false, null, "notnull" ).should.be.true();
		} );
	} );
} );
