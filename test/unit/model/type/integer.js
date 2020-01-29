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

describe( "Model property type `integer`", function() {
	let OdemModelPropertyTypes, OdemModelType, OdemModelTypeInteger;

	before( () => Helper.fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModelPropertyTypes, OdemModelType, OdemModelTypeInteger } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemModelTypeInteger );
	} );

	it( "is derived from ModelType base class", function() {
		OdemModelTypeInteger.prototype.should.be.instanceOf( OdemModelType );
	} );

	it( "is exposing its name as string", function() {
		OdemModelTypeInteger.should.have.property( "typeName" ).which.is.equal( "integer" );
	} );

	it( "is exposing list of aliases to type name", function() {
		OdemModelTypeInteger.should.have.property( "aliases" ).which.is.an.Array();
		OdemModelTypeInteger.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	it( "is commonly exposed by its name", function() {
		OdemModelPropertyTypes.selectByName( "integer" ).should.be.equal( OdemModelTypeInteger );
	} );

	it( "is commonly exposed by all its aliases", function() {
		OdemModelPropertyTypes.selectByName( "int" ).should.be.equal( OdemModelTypeInteger );
	} );

	it( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		OdemModelPropertyTypes.selectByName( "INTEGER" ).should.be.equal( OdemModelTypeInteger );
		OdemModelPropertyTypes.selectByName( "INT" ).should.be.equal( OdemModelTypeInteger );
	} );

	it( "advertises values of type to be sortable", function() {
		OdemModelTypeInteger.sortable.should.be.true();
	} );

	describe( "is exposing method `checkDefinition()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeInteger.checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeInteger.checkDefinition() ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( undefined ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( null ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( false ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( true ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( 0 ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( -1 ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( "" ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => OdemModelTypeInteger.checkDefinition( {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.checkDefinition( { required: true } ) ).should.not.throw();
		} );

		it( "returns array of encountered errors", function() {
			OdemModelTypeInteger.checkDefinition().should.be.Array();
			OdemModelTypeInteger.checkDefinition( undefined ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( null ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( false ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( true ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( 0 ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( -1 ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( 4.5 ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( "" ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( "required: true" ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( [] ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( ["required: true"] ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( {} ).should.be.Array();
			OdemModelTypeInteger.checkDefinition( { required: true } ).should.be.Array();
		} );

		it( "lists error unless providing definition object in first argument", function() {
			OdemModelTypeInteger.checkDefinition().should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( undefined ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( null ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( false ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( true ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( 0 ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( -1 ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( 4.5 ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( "" ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( "required: true" ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( [] ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( ["required: true"] ).should.not.be.empty();

			OdemModelTypeInteger.checkDefinition( {} ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { required: true } ).should.be.empty();
		} );

		it( "lists instances of Error on encountering errors in provided definition", function() {
			OdemModelTypeInteger.checkDefinition()[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( undefined )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( null )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( false )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( true )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( 0 )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( -1 )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( "" )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( [] )[0].should.be.instanceOf( Error );
			OdemModelTypeInteger.checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );

		it( "validates optionally given limits on minimum or maximum value", function() {
			OdemModelTypeInteger.checkDefinition( { min: undefined } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: null } ).should.be.empty();

			OdemModelTypeInteger.checkDefinition( { min: false } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: true } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: "" } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: "invalid" } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: {} } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: [] } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: [4] } ).should.not.be.empty();

			OdemModelTypeInteger.checkDefinition( { min: -1 } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { min: 0 } ).should.be.empty();

			OdemModelTypeInteger.checkDefinition( { max: undefined } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: null } ).should.be.empty();

			OdemModelTypeInteger.checkDefinition( { max: false } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: true } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: "" } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: "invalid" } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: {} } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: [] } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: [4] } ).should.not.be.empty();

			OdemModelTypeInteger.checkDefinition( { max: -1 } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: 0 } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { max: 1 } ).should.be.empty();
		} );

		it( "adjusts provided definition on fixing limits on value in wrong order", function() {
			const source = {
				min: 5,
				max: 0,
			};

			const definition = Object.assign( {}, source );

			definition.max.should.be.equal( source.max );
			definition.min.should.be.equal( source.min );

			OdemModelTypeInteger.checkDefinition( definition ).should.be.empty();

			definition.max.should.not.be.equal( source.max );
			definition.min.should.not.be.equal( source.min );
			definition.min.should.be.equal( source.max );
			definition.max.should.be.equal( source.min );
		} );

		it( "validates optionally given step value", function() {
			OdemModelTypeInteger.checkDefinition( { step: undefined } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: null } ).should.be.empty();

			OdemModelTypeInteger.checkDefinition( { step: false } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: true } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: "" } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: "invalid" } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: {} } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: [] } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: [4] } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: 0 } ).should.not.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: -1 } ).should.not.be.empty();

			OdemModelTypeInteger.checkDefinition( { step: 1 } ).should.be.empty();
			OdemModelTypeInteger.checkDefinition( { step: 1.5 } ).should.be.empty();
		} );
	} );

	describe( "is exposing method `coerce()` which", function() {
		it( "is a function to be invoked w/ at least three arguments", function() {
			OdemModelTypeInteger.coerce.should.be.a.Function().which.has.length( 3 );
		} );

		it( "doesn't throw when invoked with two arguments, only", function() {
			( () => OdemModelTypeInteger.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeInteger.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeInteger.coerce( undefined, {} ) ).be.null();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeInteger.coerce( null, {} ) ).be.null();
		} );

		it( "returns `NaN` on providing `false`", function() {
			OdemModelTypeInteger.coerce( false, {} ).should.be.NaN();
		} );

		it( "returns `NaN` on providing `true`", function() {
			OdemModelTypeInteger.coerce( true, {} ).should.be.NaN();
		} );

		it( "returns null on providing empty string", function() {
			Should( OdemModelTypeInteger.coerce( "", {} ) ).be.null();
		} );

		it( "returns null on providing string consisting of whitespaces, only", function() {
			Should( OdemModelTypeInteger.coerce( " \r\t\n\f ", {} ) ).be.null();
		} );

		it( "returns `NaN` on providing non-numeric string", function() {
			[
				"foo",
				"bar",
				"\x00\x1b\x01\x00",
			]
				.forEach( s => {
					OdemModelTypeInteger.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns `NaN` on providing partially numeric string", function() {
			[
				"4,5",
				"5 people",
				" 4 . 5 ",
				" 4 .\n5 ",
			]
				.forEach( s => {
					OdemModelTypeInteger.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns represented value on providing string containing integer optionally padded w/ whitespace", function() {
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
					const n = OdemModelTypeInteger.coerce( s, {} );
					n.should.be.Number().which.is.not.NaN();
					Math.abs( n ).should.be.equal( 42 );
				} );
		} );

		it( "returns rounded value repesenting in provided numeric string optionally padded w/ whitespace", function() {
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
					const n = OdemModelTypeInteger.coerce( s, {} );
					n.should.be.Number().which.is.not.NaN();
					Math.abs( n ).should.be.equal( 43 );
				} );
		} );

		it( "returns `NaN` on providing arrays", function() {
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
					OdemModelTypeInteger.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns `NaN` on providing objects", function() {
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
					OdemModelTypeInteger.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns `NaN` on providing functions", function() {
			[
				() => {}, // eslint-disable-line no-empty-function
				function() {}, // eslint-disable-line no-empty-function
				() => 1,
				function() { return 1; },
			]
				.forEach( s => {
					OdemModelTypeInteger.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns any provided integer as-is", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					OdemModelTypeInteger.coerce( i, {} ).should.be.Number().which.is.equal( i );
				}
			}
		} );

		it( "returns any provided number rounded", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						OdemModelTypeInteger.coerce( v, {} ).should.be.Number().which.is.equal( Math.round( v ) );
					}
				}
			}
		} );

		it( "accepts definition in second argument", function() {
			( () => OdemModelTypeInteger.coerce( "4", { required: true } ) ).should.not.throw();
		} );

		it( "doesn't care for definition requiring value", function() {
			Should( OdemModelTypeInteger.coerce( undefined, { required: true } ) ).be.null();
			Should( OdemModelTypeInteger.coerce( null, { required: true } ) ).be.null();
		} );

		it( "rounds value to nearest multitude of optionally defined step value", function() {
			OdemModelTypeInteger.coerce( 4, {} ).should.be.equal( 4 );
			OdemModelTypeInteger.coerce( 4, { step: 1 } ).should.be.equal( 4 );
			OdemModelTypeInteger.coerce( 4, { step: 2 } ).should.be.equal( 4 );

			OdemModelTypeInteger.coerce( 4, { step: 3 } ).should.be.equal( 3 );
			OdemModelTypeInteger.coerce( 5, { step: 3 } ).should.be.equal( 6 );
		} );

		it( "obeys step value starting from optionally defined minimum value", function() {
			OdemModelTypeInteger.coerce( 4, { step: 3 } ).should.be.equal( 3 );
			OdemModelTypeInteger.coerce( 4, { step: 3, min: 1 } ).should.be.equal( 4 );
			OdemModelTypeInteger.coerce( 4, { step: 3, min: 2 } ).should.be.equal( 5 );
			OdemModelTypeInteger.coerce( 4, { step: 3, min: -1 } ).should.be.equal( 5 );
		} );

		it( "obeys non-integer step values while assuring integer result", function() {
			OdemModelTypeInteger.coerce( 4, { step: 0.5 } ).should.be.equal( 4 );
			OdemModelTypeInteger.coerce( 5, { step: 0.5 } ).should.be.equal( 5 );

			OdemModelTypeInteger.coerce( 4, { step: 1.5 } ).should.be.equal( 5 ); // obeying step results in 4.5, but gets rounded to keep integer result
		} );

		it( "obeys step value after converting provided non-integer value to integer", function() {
			// in following test 4.3 gets rounded to 4 first, then bound to step value 0.5
			// (instead of binding to step value 0.5 first, resulting in 4.5 finally rounded to 5)
			OdemModelTypeInteger.coerce( 4.3, { step: 0.5 } ).should.be.equal( 4 );
		} );
	} );

	describe( "is exposing method `isValid()` which", function() {
		it( "is a function to be invoked w/ four argument", function() {
			OdemModelTypeInteger.isValid.should.be.a.Function().which.has.length( 4 );
		} );

		it( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => OdemModelTypeInteger.isValid( "name", null, { required: true } ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, undefined ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, null ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, false ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, true ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, 0 ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, -1 ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, 4.5 ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, "" ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, "required: true" ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, {} ) ).should.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, { required: true } ) ).should.throw();

			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( "name", null, { required: true }, ["required: true"] ) ).should.not.throw();
		} );

		it( "doesn't throw exception on providing invalid first argument", function() {
			( () => OdemModelTypeInteger.isValid( undefined, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( false, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( true, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( 0, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( -1, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( 4.5, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( "required: true", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( [], null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( ["required: true"], null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( {}, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.isValid( { required: true }, null, { required: true }, [] ) ).should.not.throw();
		} );

		it( "does not return anything", function() {
			Should( OdemModelTypeInteger.isValid( "name", undefined, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", null, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", false, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", true, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", 0, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", -1, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", 4.5, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", "", {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", "value", {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", [], {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", ["value"], {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", {}, {}, [] ) ).be.undefined();
			Should( OdemModelTypeInteger.isValid( "name", { value: "value" }, {}, [] ) ).be.undefined();
		} );

		it( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeInteger.isValid( "name", "", {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( OdemModelTypeInteger.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		it( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeInteger.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		it( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "ignores demand for minimum value on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", null, { min: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { min: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for minimum value on validating integer", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", 0, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeInteger.isValid( "name", 0, { min: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 1, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 4, { min: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", -3, { min: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", -4, { min: -3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeInteger.isValid( "name", -3, { min: "-4" }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeInteger.isValid( "name", -4, { min: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 4 );
		} );

		it( "obeys demand for minimum value on validating `NaN`", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", NaN, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { min: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { min: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { min: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { min: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );
		} );

		it( "ignores demand for maximum value on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", null, { max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { max: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for maximum value on validating integer", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", 2, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeInteger.isValid( "name", 101, { max: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 1, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 1, { max: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", -4, { max: -3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", -3, { max: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeInteger.isValid( "name", -4, { max: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeInteger.isValid( "name", -3, { max: "-4" }, collector ) ).be.undefined();
			collector.should.have.length( 4 );
		} );

		it( "obeys demand for maximum value on validating `NaN`", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", NaN, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { max: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { max: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { max: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, { max: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );
		} );

		it( "ignores combined demands for minimum and maximum value on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", null, { min: 0, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { min: 1, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { min: 1, max: 2 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { min: -2, max: -1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { min: -2, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeInteger.isValid( "name", null, { min: "-2", max: "1" }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys combined demands for minimum and maximum value on validating integer", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", -100, definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( OdemModelTypeInteger.isValid( "name", -3, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeInteger.isValid( "name", -2, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 0, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 3, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeInteger.isValid( "name", 4, definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( OdemModelTypeInteger.isValid( "name", 100, definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
		} );

		it( "obeys combined demands for minimum and maximum value on validating `NaN`", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", NaN, definition, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "obeys `NaN` failing on either limit in a combined demand for minimum and maximum value", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( OdemModelTypeInteger.isValid( "name", -3, definition, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeInteger.isValid( "name", 4, definition, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeInteger.isValid( "name", NaN, definition, collector ) ).be.undefined();
			collector.should.have.length( 4 ); // got two more errors in collector for NaN failing on either limit
		} );
	} );

	describe( "is exposing method `serialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeInteger.serialize.should.be.a.Function().which.has.length( 2 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeInteger.serialize() ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( null ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( false ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( true ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( "" ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.serialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeInteger.serialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeInteger.serialize( undefined ) ).be.null();
		} );

		it( "returns any provided integer as given", function() {
			[
				0,
				2,
				-2e7,
			]
				.forEach( value => {
					OdemModelTypeInteger.serialize( value ).should.be.equal( value );
				} );
		} );

		it( "relies on prior coercion to convert non-integers to integers, thus returning any other value as is, too", function() {
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
						OdemModelTypeInteger.serialize( raw ).should.be.NaN();
					} else {
						OdemModelTypeInteger.serialize( raw ).should.be.equal( serialized );
					}
				} );
		} );
	} );

	describe( "is exposing method `deserialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeInteger.deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeInteger.deserialize() ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( null ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( false ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( true ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( "" ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( {} ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( [] ) ).should.not.throw();
			( () => OdemModelTypeInteger.deserialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns any provided as-is", function() {
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
					Should( OdemModelTypeInteger.deserialize( value ) ).be.equal( value );
				} );
		} );
	} );

	describe( "is exposing method `compare()` which", function() {
		it( "is a function to be invoked w/ three arguments", function() {
			OdemModelTypeInteger.compare.should.be.a.Function().which.has.length( 3 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeInteger.compare() ).should.not.throw();

			Helper.allTypesOfData().forEach( one => {
				( () => OdemModelTypeInteger.compare( one ) ).should.not.throw();

				Helper.allTypesOfData().forEach( two => {
					( () => OdemModelTypeInteger.compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => OdemModelTypeInteger.compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		it( "always returns boolean", function() {
			Helper.allTypesOfData().forEach( one => {
				Helper.allTypesOfData().forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						OdemModelTypeInteger.compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		it( "considers `null` and `null` as equal", function() {
			OdemModelTypeInteger.compare( null, null, "eq" ).should.be.true();

			OdemModelTypeInteger.compare( null, null, "noteq" ).should.be.false();
		} );

		it( "considers `null` and non-`null` as inequal", function() {
			OdemModelTypeInteger.compare( null, 0, "eq" ).should.be.false();
			OdemModelTypeInteger.compare( 0, null, "eq" ).should.be.false();

			OdemModelTypeInteger.compare( null, "", "noteq" ).should.be.true();
			OdemModelTypeInteger.compare( "", null, "noteq" ).should.be.true();
		} );

		it( "returns `true` on negating `null`", function() {
			OdemModelTypeInteger.compare( null, null, "not" ).should.be.true();
		} );

		it( "returns `true` on negating falsy coerced value", function() {
			OdemModelTypeInteger.compare( 0, null, "not" ).should.be.true();
			OdemModelTypeInteger.compare( -0, null, "not" ).should.be.true();
			OdemModelTypeInteger.compare( NaN, null, "not" ).should.be.true();
		} );

		it( "returns `false` on negating truthy coerced value", function() {
			OdemModelTypeInteger.compare( 1, null, "not" ).should.be.false();
			OdemModelTypeInteger.compare( -1, null, "not" ).should.be.false();
			OdemModelTypeInteger.compare( -200, null, "not" ).should.be.false();
			OdemModelTypeInteger.compare( -1e4, null, "not" ).should.be.false();
			OdemModelTypeInteger.compare( 12e16, null, "not" ).should.be.false();
		} );

		it( "detects two coerced equal values", function() {
			OdemModelTypeInteger.compare( 0, 0, "eq" ).should.be.true();
			OdemModelTypeInteger.compare( 10, 10, "eq" ).should.be.true();
			OdemModelTypeInteger.compare( -0, -0, "eq" ).should.be.true();

			OdemModelTypeInteger.compare( 0, 0, "noteq" ).should.be.false();
			OdemModelTypeInteger.compare( 10, 10, "noteq" ).should.be.false();
			OdemModelTypeInteger.compare( -0, -0, "noteq" ).should.be.false();
		} );

		it( "detects two coerced inequal values", function() {
			OdemModelTypeInteger.compare( 1, 0, "eq" ).should.be.false();
			OdemModelTypeInteger.compare( 10, 100, "eq" ).should.be.false();
			OdemModelTypeInteger.compare( 0, -200, "eq" ).should.be.false();

			OdemModelTypeInteger.compare( 1, 0, "noteq" ).should.be.true();
			OdemModelTypeInteger.compare( 10, 100, "noteq" ).should.be.true();
			OdemModelTypeInteger.compare( 0, -200, "noteq" ).should.be.true();
		} );

		it( "compares order of two coerced values", function() {
			OdemModelTypeInteger.compare( 5, -3, "gt" ).should.be.true();
			OdemModelTypeInteger.compare( 5, -3, "gte" ).should.be.true();
			OdemModelTypeInteger.compare( 5, 5, "gt" ).should.be.false();
			OdemModelTypeInteger.compare( 5, 5, "gte" ).should.be.true();

			OdemModelTypeInteger.compare( -3, 5, "lt" ).should.be.true();
			OdemModelTypeInteger.compare( -3, 5, "lte" ).should.be.true();
			OdemModelTypeInteger.compare( -3, -3, "lt" ).should.be.false();
			OdemModelTypeInteger.compare( -3, -3, "lte" ).should.be.true();
		} );

		it( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			OdemModelTypeInteger.compare( -3, null, "gt" ).should.be.false();
			OdemModelTypeInteger.compare( -3, null, "gte" ).should.be.false();
			OdemModelTypeInteger.compare( -3, null, "lt" ).should.be.false();
			OdemModelTypeInteger.compare( -3, null, "lte" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			OdemModelTypeInteger.compare( null, -3, "gt" ).should.be.false();
			OdemModelTypeInteger.compare( null, -3, "gte" ).should.be.false();
			OdemModelTypeInteger.compare( null, -3, "lt" ).should.be.false();
			OdemModelTypeInteger.compare( null, -3, "lte" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			OdemModelTypeInteger.compare( null, null, "gt" ).should.be.false();
			OdemModelTypeInteger.compare( null, null, "lt" ).should.be.false();
		} );

		it( "returns `true` on comparing `null`-value w/ `null`-value accepting equality", function() {
			OdemModelTypeInteger.compare( null, null, "gte" ).should.be.true();
			OdemModelTypeInteger.compare( null, null, "lte" ).should.be.true();
		} );

		it( "supports unary operation testing for value being `null`", function() {
			OdemModelTypeInteger.compare( null, null, "null" ).should.be.true();

			OdemModelTypeInteger.compare( 0, null, "null" ).should.be.false();
		} );

		it( "supports unary operation testing for value not being `null`", function() {
			OdemModelTypeInteger.compare( null, null, "notnull" ).should.be.false();

			OdemModelTypeInteger.compare( 0, null, "notnull" ).should.be.true();
		} );
	} );
} );
