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

const AllTypes = require( "../../../lib/model/type" );
const Base = require( "../../../lib/model/type/base" );
const Type = require( "../../../lib/model/type/boolean" );


suite( "Model Attribute Type `boolean`", function() {
	test( "is available", function() {
		Should.exist( Type );
	} );

	test( "is derived from ModelType base class", function() {
		Type.prototype.should.be.instanceOf( Base );
	} );

	test( "is exposing its name as string", function() {
		Type.should.have.property( "typeName" ).which.is.equal( "boolean" );
	} );

	test( "is exposing list of aliases to type name", function() {
		Type.should.have.property( "aliases" ).which.is.an.Array();
		Type.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	test( "is commonly exposed by its name", function() {
		AllTypes.selectByName( "boolean" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by all its aliases", function() {
		AllTypes.selectByName( "bool" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		AllTypes.selectByName( "BOOLEAN" ).should.be.equal( Type );
		AllTypes.selectByName( "BOOL" ).should.be.equal( Type );
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

		test( "always returns boolean unless providing `null` or `undefined`", function() {
			Should( coerce() ).not.be.Boolean();
			Should( coerce( undefined ) ).not.be.Boolean();
			Should( coerce( null ) ).not.be.Boolean();

			coerce( false ).should.be.Boolean();
			coerce( true ).should.be.Boolean();
			coerce( 0 ).should.be.Boolean();
			coerce( -1 ).should.be.Boolean();
			coerce( 4.5 ).should.be.Boolean();
			coerce( "" ).should.be.Boolean();
			coerce( "required: true" ).should.be.Boolean();
			coerce( [] ).should.be.Boolean();
			coerce( ["required: true"] ).should.be.Boolean();
			coerce( {} ).should.be.Boolean();
			coerce( { required: true } ).should.be.Boolean();
		} );

		test( "returns `null` on providing `undefined`", function() {
			Should( coerce() ).be.null();
			Should( coerce( undefined ) ).be.null();
		} );

		test( "returns `null` on providing `null`", function() {
			Should( coerce( null ) ).be.null();
		} );

		test( "returns `false` on providing `false`", function() {
			coerce( false ).should.be.equal( false );
		} );

		test( "returns `true` on providing `true`", function() {
			coerce( true ).should.be.equal( true );
		} );

		test( "returns boolean matching truthiness of any provided integer", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					coerce( i ).should.be.equal( Boolean( i ) );
				}
			}
		} );

		test( "returns boolean matching truthiness of any provided number", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						coerce( v ).should.be.equal( Boolean( v ) );
					}
				}
			}
		} );

		test( "always returns `true` on a provided object of any size or type", function() {
			coerce( {} ).should.be.Boolean().which.is.true();
			coerce( { someName: "someValue" } ).should.be.Boolean().which.is.true();
			coerce( { toString: () => "me as a string" } ).should.be.Boolean().which.is.true();
			coerce( { toString: () => "" } ).should.be.Boolean().which.is.true();
			coerce( String( { toString: () => "" } ) ).should.be.Boolean().which.is.false();

			coerce( new Date() ).should.be.Boolean();
			coerce( new TypeError() ).should.be.Boolean();
			coerce( new Promise( resolve => resolve() ) ).should.be.Boolean();
		} );

		test( "always returns `true` on a provided array of any length", function() {
			coerce( [] ).should.be.Boolean().which.is.true();
			coerce( ["someValue"] ).should.be.Boolean().which.is.true();
			coerce( [""] ).should.be.Boolean().which.is.true();
		} );

		test( "always returns `true` on any provided function", function() {
			coerce( () => {} ).should.be.Boolean().which.is.true(); // eslint-disable-line no-empty-function
			coerce( () => 1 + 3 ).should.be.Boolean().which.is.true();
			coerce( function() {} ).should.be.Boolean().which.is.true(); // eslint-disable-line no-empty-function

			coerce( Date.parse ).should.be.Boolean().which.is.true();
		} );

		test( "accepts definition in second argument", function() {
			( () => coerce( "boolean", { required: true } ) ).should.not.throw();
		} );

		test( "doesn't care for definition requiring boolean value", function() {
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
			( () => isValid( undefined, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( null, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( false, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( true, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( 0, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( -1, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( 4.5, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( "", "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( "required: true", "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( [], "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( ["required: true"], "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( {}, "", { required: true }, [] ) ).should.not.throw();
			( () => isValid( { required: true }, "", { required: true }, [] ) ).should.not.throw();
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

		test( "considers empty string as valid boolean value satisfying `required` value in definition", function() {
			const collector = [];

			Should( isValid( "name", "", {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", "", { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", "", { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", "", { required: true }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );
	} );

	suite( "is exposing method `serialize()` which", function() {
		const { serialize } = Type;

		test( "is a function to be invoked w/ one argument", function() {
			serialize.should.be.a.Function().which.has.length( 1 );
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

		test( "converts `false` to shortest falsy integer `0`", function() {
			serialize( false ).should.be.Number().which.is.equal( 0 );
		} );

		test( "converts `true` to shortest truthy integer `1`", function() {
			serialize( true ).should.be.Number().which.is.equal( 1 );
		} );

		test( "returns `0` or `1` depending on truthiness of any other value", function() {
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
					serialize( value ).should.be.Number().which.is.equal( value ? 1 : 0 );
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

		test( "returns `null` on providing `null`", function() {
			Should( deserialize( null ) ).be.null();
		} );

		test( "returns `null` on providing `undefined`", function() {
			Should( deserialize( undefined ) ).be.null();
		} );

		test( "returns `true` on certain strings expressing truthy value", function() {
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
					deserialize( string ).should.be.Boolean().which.is.true();
					deserialize( string.toUpperCase() ).should.be.Boolean().which.is.true();
				} );
		} );

		test( "returns `false` on certain strings expressing falsy value", function() {
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
					deserialize( string ).should.be.Boolean().which.is.false();
					deserialize( string.toUpperCase() ).should.be.Boolean().which.is.false();
				} );
		} );

		test( "converts any other falsy non-boolean value (except `null` and `undefined`) to `false`", function() {
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
					deserialize( value ).should.be.Boolean().which.is.false();
				} );
		} );

		test( "converts any other truthy non-boolean value to `true`", function() {
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
					deserialize( value ).should.be.Boolean().which.is.true();
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
			compare( null, 0, "eq" ).should.be.false();
			compare( 0, null, "eq" ).should.be.false();

			compare( null, "", "noteq" ).should.be.true();
			compare( "", null, "noteq" ).should.be.true();
		} );

		test( "returns `true` on negating `null`", function() {
			compare( null, null, "not" ).should.be.true();
		} );

		test( "returns `true` on negating falsy coerced value", function() {
			compare( false, null, "not" ).should.be.true();
		} );

		test( "returns `false` on negating truthy coerced value", function() {
			compare( true, null, "not" ).should.be.false();
		} );

		test( "detects two coerced equal values", function() {
			compare( true, true, "eq" ).should.be.true();
			compare( false, false, "eq" ).should.be.true();

			compare( true, true, "noteq" ).should.be.false();
			compare( false, false, "noteq" ).should.be.false();
		} );

		test( "detects two coerced inequal values", function() {
			compare( true, false, "eq" ).should.be.false();
			compare( false, true, "eq" ).should.be.false();

			compare( true, false, "noteq" ).should.be.true();
			compare( false, true, "noteq" ).should.be.true();
		} );

		test( "does not support comparing order of two coerced (boolean) values", function() {
			compare( true, false, "gt" ).should.be.false();
			compare( true, false, "gte" ).should.be.false();
			compare( true, true, "gt" ).should.be.false();
			compare( true, true, "gte" ).should.be.false();

			compare( false, true, "lt" ).should.be.false();
			compare( false, true, "lte" ).should.be.false();
			compare( false, false, "lt" ).should.be.false();
			compare( false, false, "lte" ).should.be.false();
		} );

		test( "returns `false` on comparing non-`null` value w/ `null`-value", function() {
			compare( true, null, "gt" ).should.be.false();
			compare( true, null, "gte" ).should.be.false();
			compare( true, null, "gt" ).should.be.false();
			compare( true, null, "gte" ).should.be.false();
			compare( true, null, "lt" ).should.be.false();
			compare( true, null, "lte" ).should.be.false();
			compare( true, null, "lt" ).should.be.false();
			compare( true, null, "lte" ).should.be.false();
		} );

		test( "returns `false` on comparing `null` value w/ non-`null`-value", function() {
			compare( null, true, "gt" ).should.be.false();
			compare( null, true, "gte" ).should.be.false();
			compare( null, true, "gt" ).should.be.false();
			compare( null, true, "gte" ).should.be.false();
			compare( null, true, "lt" ).should.be.false();
			compare( null, true, "lte" ).should.be.false();
			compare( null, true, "lt" ).should.be.false();
			compare( null, true, "lte" ).should.be.false();
		} );

		test( "supports unary operation testing for value being `null`", function() {
			compare( null, null, "null" ).should.be.true();

			compare( false, null, "null" ).should.be.false();
		} );

		test( "supports unary operation testing for value not being `null`", function() {
			compare( null, null, "notnull" ).should.be.false();

			compare( false, null, "notnull" ).should.be.true();
		} );
	} );
} );
