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
const Type = require( "../../../lib/model/type/integer" );


suite( "Model Attribute Type `integer`", function() {
	test( "is available", function() {
		Should.exist( Type );
	} );

	test( "is derived from ModelType base class", function() {
		Type.prototype.should.be.instanceOf( Base );
	} );

	test( "is exposing its name as string", function() {
		Type.should.have.property( "typeName" ).which.is.equal( "integer" );
	} );

	test( "is exposing list of aliases to type name", function() {
		Type.should.have.property( "aliases" ).which.is.an.Array();
		Type.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	test( "is commonly exposed by its name", function() {
		AllTypes.selectByName( "integer" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by all its aliases", function() {
		AllTypes.selectByName( "int" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		AllTypes.selectByName( "INTEGER" ).should.be.equal( Type );
		AllTypes.selectByName( "INT" ).should.be.equal( Type );
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

		test( "validates optionally given limits on minimum or maximum value", function() {
			checkDefinition( { min: undefined } ).should.be.empty();
			checkDefinition( { min: null } ).should.be.empty();

			checkDefinition( { min: false } ).should.not.be.empty();
			checkDefinition( { min: true } ).should.not.be.empty();
			checkDefinition( { min: "" } ).should.not.be.empty();
			checkDefinition( { min: "invalid" } ).should.not.be.empty();
			checkDefinition( { min: {} } ).should.not.be.empty();
			checkDefinition( { min: { value: 4 } } ).should.not.be.empty();
			checkDefinition( { min: [] } ).should.not.be.empty();
			checkDefinition( { min: [4] } ).should.not.be.empty();

			checkDefinition( { min: -1 } ).should.be.empty();
			checkDefinition( { min: 0 } ).should.be.empty();

			checkDefinition( { max: undefined } ).should.be.empty();
			checkDefinition( { max: null } ).should.be.empty();

			checkDefinition( { max: false } ).should.not.be.empty();
			checkDefinition( { max: true } ).should.not.be.empty();
			checkDefinition( { max: "" } ).should.not.be.empty();
			checkDefinition( { max: "invalid" } ).should.not.be.empty();
			checkDefinition( { max: {} } ).should.not.be.empty();
			checkDefinition( { max: { value: 4 } } ).should.not.be.empty();
			checkDefinition( { max: [] } ).should.not.be.empty();
			checkDefinition( { max: [4] } ).should.not.be.empty();

			checkDefinition( { max: -1 } ).should.be.empty();
			checkDefinition( { max: 0 } ).should.be.empty();
			checkDefinition( { max: 1 } ).should.be.empty();
		} );

		test( "adjusts provided definition on fixing limits on value in wrong order", function() {
			const source = {
				min: 5,
				max: 0,
			};

			const definition = Object.assign( {}, source );

			definition.max.should.be.equal( source.max );
			definition.min.should.be.equal( source.min );

			checkDefinition( definition ).should.be.empty();

			definition.max.should.not.be.equal( source.max );
			definition.min.should.not.be.equal( source.min );
			definition.min.should.be.equal( source.max );
			definition.max.should.be.equal( source.min );
		} );

		test( "validates optionally given step value", function() {
			checkDefinition( { step: undefined } ).should.be.empty();
			checkDefinition( { step: null } ).should.be.empty();

			checkDefinition( { step: false } ).should.not.be.empty();
			checkDefinition( { step: true } ).should.not.be.empty();
			checkDefinition( { step: "" } ).should.not.be.empty();
			checkDefinition( { step: "invalid" } ).should.not.be.empty();
			checkDefinition( { step: {} } ).should.not.be.empty();
			checkDefinition( { step: { value: 4 } } ).should.not.be.empty();
			checkDefinition( { step: [] } ).should.not.be.empty();
			checkDefinition( { step: [4] } ).should.not.be.empty();
			checkDefinition( { step: 0 } ).should.not.be.empty();
			checkDefinition( { step: -1 } ).should.not.be.empty();

			checkDefinition( { step: 1 } ).should.be.empty();
			checkDefinition( { step: 1.5 } ).should.be.empty();
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

		test( "returns `null` on providing `undefined`", function() {
			Should( coerce() ).be.null();
			Should( coerce( undefined ) ).be.null();
		} );

		test( "returns `null` on providing `null`", function() {
			Should( coerce( null ) ).be.null();
		} );

		test( "returns `NaN` on providing `false`", function() {
			coerce( false ).should.be.NaN();
		} );

		test( "returns `NaN` on providing `true`", function() {
			coerce( true ).should.be.NaN();
		} );

		test( "returns null on providing empty string", function() {
			Should( coerce( "" ) ).be.null();
		} );

		test( "returns null on providing string consisting of whitespaces, only", function() {
			Should( coerce( " \r\t\n\f " ) ).be.null();
		} );

		test( "returns `NaN` on providing non-numeric string", function() {
			[
				"foo",
				"bar",
				"\x00\x1b\x01\x00",
			]
				.forEach( s => {
					coerce( s ).should.be.NaN();
				} );
		} );

		test( "returns `NaN` on providing partially numeric string", function() {
			[
				"4,5",
				"5 people",
				" 4 . 5 ",
				" 4 .\n5 ",
			]
				.forEach( s => {
					coerce( s ).should.be.NaN();
				} );
		} );

		test( "returns represented value on providing string containing integer optionally padded w/ whitespace", function() {
			[
				"42",
				" 42\n",
				"\t42\r",
				"-42",
				" -42\n",
				"\t-42\r",
				"+42",
				" +42\n",
				"\t+42\r",
			]
				.forEach( s => {
					const n = coerce( s );
					n.should.be.Number().which.is.not.NaN();
					Math.abs( n ).should.be.equal( 42 );
				} );
		} );

		test( "returns rounded value repesenting in provided numeric string optionally padded w/ whitespace", function() {
			[
				"42.6",
				"4.26e1",
				"4.26E1",
				" 42.6\n",
				" 4.26e1\n",
				" 4.26E1\n",
				"\t42.6\r",
				"\t4.26e1\r",
				"\t4.26E1\r",
				"-42.6",
				"-4.26e1",
				"-4.26E1",
				" -42.6\n",
				" -4.26e1\n",
				" -4.26E1\n",
				"\t-42.6\r",
				"\t-4.26e1\r",
				"\t-4.26E1\r",
				"+42.6",
				"+4.26e1",
				"+4.26E1",
				" +42.6\n",
				" +4.26e1\n",
				" +4.26E1\n",
				"\t+42.6\r",
				"\t+4.26e1\r",
				"\t+4.26E1\r",
			]
				.forEach( s => {
					const n = coerce( s );
					n.should.be.Number().which.is.not.NaN();
					Math.abs( n ).should.be.equal( 43 );
				} );
		} );

		test( "returns `NaN` on providing arrays", function() {
			[
				[],
				["    "],
				["foo"],
				["5"],
				[0],
				[ 4, 5, 6 ],
				[1e7],
			]
				.forEach( s => {
					coerce( s ).should.be.NaN();
				} );
		} );

		test( "returns `NaN` on providing objects", function() {
			[
				{},
				{ value: "    " },
				{ value: "foo" },
				{ value: "5" },
				{ value: 0 },
				{ value: 4, second: 5 },
				{ value: 1e7 },
				{ toString: () => "foo" },
				{ toString: () => "1" },
				{ toString: () => 1 },
			]
				.forEach( s => {
					coerce( s ).should.be.NaN();
				} );
		} );

		test( "returns `NaN` on providing functions", function() {
			[
				() => {}, // eslint-disable-line no-empty-function
				function() {}, // eslint-disable-line no-empty-function
				() => 1,
				function() { return 1; },
			]
				.forEach( s => {
					coerce( s ).should.be.NaN();
				} );
		} );

		test( "returns any provided integer as-is", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					coerce( i ).should.be.Number().which.is.equal( i );
				}
			}
		} );

		test( "returns any provided number rounded", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						coerce( v ).should.be.Number().which.is.equal( Math.round( v ) );
					}
				}
			}
		} );

		test( "accepts definition in second argument", function() {
			( () => coerce( "4", { required: true } ) ).should.not.throw();
		} );

		test( "doesn't care for definition requiring value", function() {
			Should( coerce( undefined, { required: true } ) ).be.null();
			Should( coerce( null, { required: true } ) ).be.null();
		} );

		test( "rounds value to nearest multitude of optionally defined step value", function() {
			coerce( 4, {} ).should.be.equal( 4 );
			coerce( 4, { step: 1 } ).should.be.equal( 4 );
			coerce( 4, { step: 2 } ).should.be.equal( 4 );

			coerce( 4, { step: 3 } ).should.be.equal( 3 );
			coerce( 5, { step: 3 } ).should.be.equal( 6 );
		} );

		test( "obeys step value starting from optionally defined minimum value", function() {
			coerce( 4, { step: 3 } ).should.be.equal( 3 );
			coerce( 4, { step: 3, min: 1 } ).should.be.equal( 4 );
			coerce( 4, { step: 3, min: 2 } ).should.be.equal( 5 );
			coerce( 4, { step: 3, min: -1 } ).should.be.equal( 5 );
		} );

		test( "obeys non-integer step values while assuring integer result", function() {
			coerce( 4, { step: 0.5 } ).should.be.equal( 4 );
			coerce( 5, { step: 0.5 } ).should.be.equal( 5 );

			coerce( 4, { step: 1.5 } ).should.be.equal( 5 ); // obeying step results in 4.5, but gets rounded to keep integer result
		} );

		test( "obeys step value after converting provided non-integer value to integer", function() {
			// in following test 4.3 gets rounded to 4 first, then bound to step value 0.5
			// (instead of binding to step value 0.5 first, resulting in 4.5 finally rounded to 5)
			coerce( 4.3, { step: 0.5 } ).should.be.equal( 4 );
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
			( () => isValid( undefined, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( false, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( true, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( 0, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( -1, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( 4.5, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( "required: true", null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( [], null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( ["required: true"], null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( {}, null, { required: true }, [] ) ).should.not.throw();
			( () => isValid( { required: true }, null, { required: true }, [] ) ).should.not.throw();
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

		test( "ignores demand for minimum value on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { min: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for minimum value on validating integer", function() {
			const collector = [];

			Should( isValid( "name", 0, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", 0, { min: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", 1, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", 4, { min: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", -3, { min: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", -4, { min: -3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", -3, { min: "-4" }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", -4, { min: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 4 );
		} );

		test( "obeys demand for minimum value on validating `NaN`", function() {
			const collector = [];

			Should( isValid( "name", NaN, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", NaN, { min: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", NaN, { min: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", NaN, { min: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( isValid( "name", NaN, { min: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );
		} );

		test( "ignores demand for maximum value on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { max: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for maximum value on validating integer", function() {
			const collector = [];

			Should( isValid( "name", 2, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", 101, { max: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", 1, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", 1, { max: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", -4, { max: -3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", -3, { max: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", -4, { max: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", -3, { max: "-4" }, collector ) ).be.undefined();
			collector.should.have.length( 4 );
		} );

		test( "obeys demand for maximum value on validating `NaN`", function() {
			const collector = [];

			Should( isValid( "name", NaN, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", NaN, { max: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", NaN, { max: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", NaN, { max: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( isValid( "name", NaN, { max: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );
		} );

		test( "ignores combined demands for minimum and maximum value on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { min: 0, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: 1, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: 1, max: 2 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: -2, max: -1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: -2, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: "-2", max: "1" }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys combined demands for minimum and maximum value on validating integer", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( isValid( "name", -100, definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( isValid( "name", -3, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", -2, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", 0, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", 3, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", 4, definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( isValid( "name", 100, definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
		} );

		test( "obeys combined demands for minimum and maximum value on validating `NaN`", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( isValid( "name", NaN, definition, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		test( "obeys `NaN` failing on either limit in a combined demand for minimum and maximum value", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( isValid( "name", -3, definition, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", 4, definition, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", NaN, definition, collector ) ).be.undefined();
			collector.should.have.length( 4 ); // got two more errors in collector for NaN failing on either limit
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

		test( "returns any provided integer as given", function() {
			[
				0,
				2,
				-2e7,
			]
				.forEach( value => {
					serialize( value ).should.be.equal( value );
				} );
		} );

		test( "relies on prior coercion to convert non-integers to integers, thus returning any other value as is, too", function() {
			[
				[ false, NaN ],
				[ true, NaN ],
				[ [], NaN ],
				[ [ 1, 2, 3 ], 1 ],
				[ {}, NaN ],
				[ { value: 1, flag: false }, NaN ],
				[ () => 1, NaN ],
				[ "", NaN ],
				[ "abc", NaN ],
				[ "\u00a0", NaN ],
				[ "\x00\x01\x02\x1b\x00", NaN ],
				[ 1.5, 1 ],
				[ -2.5e-2, -0 ],
			]
				.forEach( ( [ raw, serialized ] ) => {
					if ( isNaN( serialized ) ) {
						serialize( raw ).should.be.NaN();
					} else {
						serialize( raw ).should.be.equal( serialized );
					}
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

		test( "returns any provided as-is", function() {
			[
				null,
				undefined,
				"",
				" \r\t\n\f ",
				0,
				1,
				-20000000,
				1.5,
				-2.5e7,
				"0",
				"1",
				"-20000000",
				"1.5",
				"-2.5e7",
				"hello",
				"1 hours",
				"less than -20000000",
				false,
				true,
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
			compare( null, 0, "eq" ).should.be.false();
			compare( 0, null, "eq" ).should.be.false();

			compare( null, "", "noteq" ).should.be.true();
			compare( "", null, "noteq" ).should.be.true();
		} );

		test( "returns `true` on negating `null`", function() {
			compare( null, null, "not" ).should.be.true();
		} );

		test( "returns `true` on negating falsy coerced value", function() {
			compare( 0, null, "not" ).should.be.true();
			compare( -0, null, "not" ).should.be.true();
			compare( NaN, null, "not" ).should.be.true();
		} );

		test( "returns `false` on negating truthy coerced value", function() {
			compare( 1, null, "not" ).should.be.false();
			compare( -1, null, "not" ).should.be.false();
			compare( -200, null, "not" ).should.be.false();
			compare( -1e4, null, "not" ).should.be.false();
			compare( 12e16, null, "not" ).should.be.false();
		} );

		test( "detects two coerced equal values", function() {
			compare( 0, 0, "eq" ).should.be.true();
			compare( 10, 10, "eq" ).should.be.true();
			compare( -0, -0, "eq" ).should.be.true();

			compare( 0, 0, "noteq" ).should.be.false();
			compare( 10, 10, "noteq" ).should.be.false();
			compare( -0, -0, "noteq" ).should.be.false();
		} );

		test( "detects two coerced inequal values", function() {
			compare( 1, 0, "eq" ).should.be.false();
			compare( 10, 100, "eq" ).should.be.false();
			compare( 0, -200, "eq" ).should.be.false();

			compare( 1, 0, "noteq" ).should.be.true();
			compare( 10, 100, "noteq" ).should.be.true();
			compare( 0, -200, "noteq" ).should.be.true();
		} );

		test( "compares order of two coerced values", function() {
			compare( 5, -3, "gt" ).should.be.true();
			compare( 5, -3, "gte" ).should.be.true();
			compare( 5, 5, "gt" ).should.be.false();
			compare( 5, 5, "gte" ).should.be.true();

			compare( -3, 5, "lt" ).should.be.true();
			compare( -3, 5, "lte" ).should.be.true();
			compare( -3, -3, "lt" ).should.be.false();
			compare( -3, -3, "lte" ).should.be.true();
		} );

		test( "returns `false` on comparing non-`null` value w/ `null`-value", function() {
			compare( -3, null, "gt" ).should.be.false();
			compare( -3, null, "gte" ).should.be.false();
			compare( -3, null, "gt" ).should.be.false();
			compare( -3, null, "gte" ).should.be.false();
			compare( -3, null, "lt" ).should.be.false();
			compare( -3, null, "lte" ).should.be.false();
			compare( -3, null, "lt" ).should.be.false();
			compare( -3, null, "lte" ).should.be.false();
		} );

		test( "returns `false` on comparing `null` value w/ non-`null`-value", function() {
			compare( null, -3, "gt" ).should.be.false();
			compare( null, -3, "gte" ).should.be.false();
			compare( null, -3, "gt" ).should.be.false();
			compare( null, -3, "gte" ).should.be.false();
			compare( null, -3, "lt" ).should.be.false();
			compare( null, -3, "lte" ).should.be.false();
			compare( null, -3, "lt" ).should.be.false();
			compare( null, -3, "lte" ).should.be.false();
		} );

		test( "supports unary operation testing for value being `null`", function() {
			compare( null, null, "null" ).should.be.true();

			compare( 0, null, "null" ).should.be.false();
		} );

		test( "supports unary operation testing for value not being `null`", function() {
			compare( null, null, "notnull" ).should.be.false();

			compare( 0, null, "notnull" ).should.be.true();
		} );
	} );
} );
