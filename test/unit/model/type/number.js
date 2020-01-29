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

describe( "Model property type `number`", function() {
	let OdemModelPropertyTypes, OdemModelType, OdemModelTypeNumber;

	before( () => Helper.fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModelPropertyTypes, OdemModelType, OdemModelTypeNumber } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemModelTypeNumber );
	} );

	it( "is derived from ModelType base class", function() {
		OdemModelTypeNumber.prototype.should.be.instanceOf( OdemModelType );
	} );

	it( "is exposing its name as string", function() {
		OdemModelTypeNumber.should.have.property( "typeName" ).which.is.equal( "number" );
	} );

	it( "is exposing list of aliases to type name", function() {
		OdemModelTypeNumber.should.have.property( "aliases" ).which.is.an.Array();
		OdemModelTypeNumber.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	it( "is commonly exposed by its name", function() {
		OdemModelPropertyTypes.selectByName( "number" ).should.be.equal( OdemModelTypeNumber );
	} );

	it( "is commonly exposed by all its aliases", function() {
		OdemModelPropertyTypes.selectByName( "float" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "real" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "double" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "decimal" ).should.be.equal( OdemModelTypeNumber );
	} );

	it( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		OdemModelPropertyTypes.selectByName( "NUMBER" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "FLOAT" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "REAL" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "DOUBLE" ).should.be.equal( OdemModelTypeNumber );
		OdemModelPropertyTypes.selectByName( "DECIMAL" ).should.be.equal( OdemModelTypeNumber );
	} );

	it( "advertises values of type to be sortable", function() {
		OdemModelTypeNumber.sortable.should.be.true();
	} );

	describe( "is exposing method `checkDefinition()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeNumber.checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeNumber.checkDefinition() ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( undefined ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( null ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( false ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( true ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( 0 ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( -1 ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( "" ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => OdemModelTypeNumber.checkDefinition( {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.checkDefinition( { required: true } ) ).should.not.throw();
		} );

		it( "returns array of encountered errors", function() {
			OdemModelTypeNumber.checkDefinition().should.be.Array();
			OdemModelTypeNumber.checkDefinition( undefined ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( null ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( false ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( true ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( 0 ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( -1 ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( 4.5 ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( "" ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( "required: true" ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( [] ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( ["required: true"] ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( {} ).should.be.Array();
			OdemModelTypeNumber.checkDefinition( { required: true } ).should.be.Array();
		} );

		it( "lists error unless providing definition object in first argument", function() {
			OdemModelTypeNumber.checkDefinition().should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( undefined ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( null ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( false ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( true ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( 0 ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( -1 ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( 4.5 ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( "" ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( "required: true" ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( [] ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( ["required: true"] ).should.not.be.empty();

			OdemModelTypeNumber.checkDefinition( {} ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { required: true } ).should.be.empty();
		} );

		it( "lists instances of Error on encountering errors in provided definition", function() {
			OdemModelTypeNumber.checkDefinition()[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( undefined )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( null )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( false )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( true )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( 0 )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( -1 )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( "" )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( [] )[0].should.be.instanceOf( Error );
			OdemModelTypeNumber.checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );

		it( "validates optionally given limits on minimum or maximum value", function() {
			OdemModelTypeNumber.checkDefinition( { min: undefined } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: null } ).should.be.empty();

			OdemModelTypeNumber.checkDefinition( { min: false } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: true } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: "" } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: "invalid" } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: {} } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: [] } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: [4] } ).should.not.be.empty();

			OdemModelTypeNumber.checkDefinition( { min: -1 } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { min: 0 } ).should.be.empty();

			OdemModelTypeNumber.checkDefinition( { max: undefined } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: null } ).should.be.empty();

			OdemModelTypeNumber.checkDefinition( { max: false } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: true } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: "" } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: "invalid" } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: {} } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: [] } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: [4] } ).should.not.be.empty();

			OdemModelTypeNumber.checkDefinition( { max: -1 } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: 0 } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { max: 1 } ).should.be.empty();
		} );

		it( "adjusts provided definition on fixing limits on value in wrong order", function() {
			const source = {
				min: 5,
				max: 0,
			};

			const definition = Object.assign( {}, source );

			definition.max.should.be.equal( source.max );
			definition.min.should.be.equal( source.min );

			OdemModelTypeNumber.checkDefinition( definition ).should.be.empty();

			definition.max.should.not.be.equal( source.max );
			definition.min.should.not.be.equal( source.min );
			definition.min.should.be.equal( source.max );
			definition.max.should.be.equal( source.min );
		} );

		it( "validates optionally given step value", function() {
			OdemModelTypeNumber.checkDefinition( { step: undefined } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: null } ).should.be.empty();

			OdemModelTypeNumber.checkDefinition( { step: false } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: true } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: "" } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: "invalid" } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: {} } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: [] } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: [4] } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: 0 } ).should.not.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: -1 } ).should.not.be.empty();

			OdemModelTypeNumber.checkDefinition( { step: 1 } ).should.be.empty();
			OdemModelTypeNumber.checkDefinition( { step: 1.5 } ).should.be.empty();
		} );
	} );

	describe( "is exposing method `coerce()` which", function() {
		it( "is a function to be invoked w/ at least three arguments", function() {
			OdemModelTypeNumber.coerce.should.be.a.Function().which.has.length( 3 );
		} );

		it( "doesn't throw when invoked with two arguments, only", function() {
			( () => OdemModelTypeNumber.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeNumber.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeNumber.coerce( undefined, {} ) ).be.null();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeNumber.coerce( null, {} ) ).be.null();
		} );

		it( "returns `NaN` on providing `false`", function() {
			OdemModelTypeNumber.coerce( false, {} ).should.be.NaN();
		} );

		it( "returns `NaN` on providing `true`", function() {
			OdemModelTypeNumber.coerce( true, {} ).should.be.NaN();
		} );

		it( "returns `null` on providing empty string", function() {
			Should( OdemModelTypeNumber.coerce( "", {} ) ).be.null();
		} );

		it( "returns `null` on providing string consisting of whitespaces, only", function() {
			Should( OdemModelTypeNumber.coerce( " \r\t\n\f ", {} ) ).be.null();
		} );

		it( "returns `NaN` on providing non-numeric string", function() {
			[
				"foo",
				"bar",
				"\x00\x1b\x01\x00",
			]
				.forEach( s => {
					OdemModelTypeNumber.coerce( s, {} ).should.be.NaN();
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
					OdemModelTypeNumber.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns represented value on providing numeric string optionally padded w/ whitespace", function() {
			[
				"42",
				"42.0",
				"4.2e1",
				"4.2E1",
				" 42\n",
				" 42.0\n",
				" 4.2e1\n",
				" 4.2E1\n",
				"\t42\r",
				"\t42.0\r",
				"\t4.2e1\r",
				"\t4.2E1\r",
				"-42",
				"-42.0",
				"-4.2e1",
				"-4.2E1",
				" -42\n",
				" -42.0\n",
				" -4.2e1\n",
				" -4.2E1\n",
				"\t-42\r",
				"\t-42.0\r",
				"\t-4.2e1\r",
				"\t-4.2E1\r",
				"+42",
				"+42.0",
				"+4.2e1",
				"+4.2E1",
				" +42\n",
				" +42.0\n",
				" +4.2e1\n",
				" +4.2E1\n",
				"\t+42\r",
				"\t+42.0\r",
				"\t+4.2e1\r",
				"\t+4.2E1\r",
			]
				.forEach( s => {
					const n = OdemModelTypeNumber.coerce( s, {} );
					n.should.be.Number().which.is.not.NaN();
					Math.abs( n ).should.be.equal( 42 );
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
					OdemModelTypeNumber.coerce( s, {} ).should.be.NaN();
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
					OdemModelTypeNumber.coerce( s, {} ).should.be.NaN();
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
					OdemModelTypeNumber.coerce( s, {} ).should.be.NaN();
				} );
		} );

		it( "returns any provided integer as-is", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 16; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					OdemModelTypeNumber.coerce( i, {} ).should.be.Number().which.is.equal( i );
				}
			}
		} );

		it( "returns any provided number as-is", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -8; de < 16; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						OdemModelTypeNumber.coerce( v, {} ).should.be.Number().which.is.equal( v );
					}
				}
			}
		} );

		it( "accepts definition in second argument", function() {
			( () => OdemModelTypeNumber.coerce( "4", { required: true } ) ).should.not.throw();
		} );

		it( "doesn't care for definition requiring value", function() {
			Should( OdemModelTypeNumber.coerce( undefined, { required: true } ) ).be.null();
			Should( OdemModelTypeNumber.coerce( null, { required: true } ) ).be.null();
		} );

		it( "rounds value to nearest multitude of optionally defined step value", function() {
			OdemModelTypeNumber.coerce( 4, {} ).should.be.equal( 4 );
			OdemModelTypeNumber.coerce( 4, { step: 1 } ).should.be.equal( 4 );
			OdemModelTypeNumber.coerce( 4, { step: 2 } ).should.be.equal( 4 );

			OdemModelTypeNumber.coerce( 4, { step: 3 } ).should.be.equal( 3 );
			OdemModelTypeNumber.coerce( 5, { step: 3 } ).should.be.equal( 6 );
		} );

		it( "obeys step value starting from optionally defined minimum value", function() {
			OdemModelTypeNumber.coerce( 4, { step: 3 } ).should.be.equal( 3 );
			OdemModelTypeNumber.coerce( 4, { step: 3, min: 1 } ).should.be.equal( 4 );
			OdemModelTypeNumber.coerce( 4, { step: 3, min: 2 } ).should.be.equal( 5 );
			OdemModelTypeNumber.coerce( 4, { step: 3, min: -1 } ).should.be.equal( 5 );
		} );

		it( "obeys non-integer step values", function() {
			OdemModelTypeNumber.coerce( 4, { step: 0.5 } ).should.be.equal( 4 );
			OdemModelTypeNumber.coerce( 5, { step: 0.5 } ).should.be.equal( 5 );

			OdemModelTypeNumber.coerce( 4, { step: 1.5 } ).should.be.equal( 4.5 );
			OdemModelTypeNumber.coerce( 4.3, { step: 0.5 } ).should.be.equal( 4.5 );
		} );
	} );

	describe( "is exposing method `isValid()` which", function() {
		it( "is a function to be invoked w/ four argument", function() {
			OdemModelTypeNumber.isValid.should.be.a.Function().which.has.length( 4 );
		} );

		it( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => OdemModelTypeNumber.isValid( "name", null, { required: true } ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, undefined ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, null ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, false ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, true ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, 0 ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, -1 ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, 4.5 ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, "" ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, "required: true" ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, {} ) ).should.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, { required: true } ) ).should.throw();

			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( "name", null, { required: true }, ["required: true"] ) ).should.not.throw();
		} );

		it( "doesn't throw exception on providing invalid first argument", function() {
			( () => OdemModelTypeNumber.isValid( undefined, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( false, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( true, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( 0, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( -1, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( 4.5, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( "required: true", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( [], null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( ["required: true"], null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( {}, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.isValid( { required: true }, null, { required: true }, [] ) ).should.not.throw();
		} );

		it( "does not return anything", function() {
			Should( OdemModelTypeNumber.isValid( "name", undefined, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", null, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", false, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", true, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", 0, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", -1, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", 4.5, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", "", {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", "value", {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", [], {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", ["value"], {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", {}, {}, [] ) ).be.undefined();
			Should( OdemModelTypeNumber.isValid( "name", { value: "value" }, {}, [] ) ).be.undefined();
		} );

		it( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeNumber.isValid( "name", "", {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( OdemModelTypeNumber.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		it( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeNumber.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		it( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "ignores demand for minimum value on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", null, { min: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { min: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for minimum value on validating number", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", 0, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeNumber.isValid( "name", 0, { min: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 1, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 4, { min: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", -3, { min: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", -4, { min: -3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeNumber.isValid( "name", -3, { min: "-4" }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeNumber.isValid( "name", -4, { min: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 4 );
		} );

		it( "obeys demand for minimum value on validating `NaN`", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", NaN, { min: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { min: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { min: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { min: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { min: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );
		} );

		it( "ignores demand for maximum value on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", null, { max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { max: 100 }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for maximum value on validating number", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", 2, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeNumber.isValid( "name", 101, { max: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 1, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 1, { max: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", -4, { max: -3 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", -3, { max: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeNumber.isValid( "name", -4, { max: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeNumber.isValid( "name", -3, { max: "-4" }, collector ) ).be.undefined();
			collector.should.have.length( 4 );
		} );

		it( "obeys demand for maximum value on validating `NaN`", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", NaN, { max: 1 }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { max: 100 }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { max: 3 }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { max: -4 }, collector ) ).be.undefined();
			collector.should.have.length( 4 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, { max: "-3" }, collector ) ).be.undefined();
			collector.should.have.length( 5 );
		} );

		it( "ignores combined demands for minimum and maximum value on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", null, { min: 0, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { min: 1, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { min: 1, max: 2 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { min: -2, max: -1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { min: -2, max: 1 }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeNumber.isValid( "name", null, { min: "-2", max: "1" }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys combined demands for minimum and maximum value on validating number", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", -100, definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( OdemModelTypeNumber.isValid( "name", -3, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeNumber.isValid( "name", -2, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 0, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 3, definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeNumber.isValid( "name", 4, definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( OdemModelTypeNumber.isValid( "name", 100, definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
		} );

		it( "obeys combined demands for minimum and maximum value on validating `NaN`", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", NaN, definition, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "obeys `NaN` failing on either limit in a combined demand for minimum and maximum value", function() {
			const definition = { min: -2, max: 3 };
			const collector = [];

			Should( OdemModelTypeNumber.isValid( "name", -3, definition, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeNumber.isValid( "name", 4, definition, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeNumber.isValid( "name", NaN, definition, collector ) ).be.undefined();
			collector.should.have.length( 4 ); // got two more errors in collector for NaN failing on either limit
		} );
	} );

	describe( "is exposing method `serialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeNumber.serialize.should.be.a.Function().which.has.length( 2 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeNumber.serialize() ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( null ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( false ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( true ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( "" ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.serialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeNumber.serialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeNumber.serialize( undefined ) ).be.null();
		} );

		it( "returns any provided number as given", function() {
			[
				0,
				1.5,
				-2.5e7,
			]
				.forEach( value => {
					OdemModelTypeNumber.serialize( value ).should.be.equal( value );
				} );
		} );

		it( "relies on prior coercion to convert non-numbers to numbers, thus returning any other value as is, too", function() {
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
			]
				.forEach( ( [ raw, serialized ] ) => {
					if ( isNaN( serialized ) ) {
						OdemModelTypeNumber.serialize( raw ).should.be.NaN();
					} else {
						OdemModelTypeNumber.serialize( raw ).should.be.equal( serialized );
					}
				} );
		} );
	} );

	describe( "is exposing method `deserialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeNumber.deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeNumber.deserialize() ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( null ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( false ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( true ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( "" ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( {} ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( [] ) ).should.not.throw();
			( () => OdemModelTypeNumber.deserialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns any value as-is", function() {
			[
				null,
				undefined,
				"",
				" \r\t\n\f ",
				0,
				1.5,
				-2.5e7,
				"0",
				"1.5",
				"-2.5e7",
				"hello",
				"1.5 hours",
				"up to -2.5e7",
				false,
				true,
				[],
				[ 1, 2, 3 ],
				{},
				{ value: 1, flag: false },
				() => 1,
			]
				.forEach( value => {
					Should( OdemModelTypeNumber.deserialize( value ) ).be.equal( value );
				} );
		} );
	} );

	describe( "is exposing method `compare()` which", function() {
		it( "is a function to be invoked w/ three arguments", function() {
			OdemModelTypeNumber.compare.should.be.a.Function().which.has.length( 3 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeNumber.compare() ).should.not.throw();

			Helper.allTypesOfData().forEach( one => {
				( () => OdemModelTypeNumber.compare( one ) ).should.not.throw();

				Helper.allTypesOfData().forEach( two => {
					( () => OdemModelTypeNumber.compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => OdemModelTypeNumber.compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		it( "always returns boolean", function() {
			Helper.allTypesOfData().forEach( one => {
				Helper.allTypesOfData().forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						OdemModelTypeNumber.compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		it( "considers `null` and `null` as equal", function() {
			OdemModelTypeNumber.compare( null, null, "eq" ).should.be.true();

			OdemModelTypeNumber.compare( null, null, "noteq" ).should.be.false();
		} );

		it( "considers `null` and non-`null` as inequal", function() {
			OdemModelTypeNumber.compare( null, 0, "eq" ).should.be.false();
			OdemModelTypeNumber.compare( 0, null, "eq" ).should.be.false();

			OdemModelTypeNumber.compare( null, "", "noteq" ).should.be.true();
			OdemModelTypeNumber.compare( "", null, "noteq" ).should.be.true();
		} );

		it( "returns `true` on negating `null`", function() {
			OdemModelTypeNumber.compare( null, null, "not" ).should.be.true();
		} );

		it( "returns `true` on negating falsy coerced value", function() {
			OdemModelTypeNumber.compare( 0.0, null, "not" ).should.be.true();
			OdemModelTypeNumber.compare( -0.0, null, "not" ).should.be.true();
			OdemModelTypeNumber.compare( NaN, null, "not" ).should.be.true();
		} );

		it( "returns `false` on negating truthy coerced value", function() {
			OdemModelTypeNumber.compare( 0.1, null, "not" ).should.be.false();
			OdemModelTypeNumber.compare( 1.0, null, "not" ).should.be.false();
			OdemModelTypeNumber.compare( -200, null, "not" ).should.be.false();
			OdemModelTypeNumber.compare( -1e-4, null, "not" ).should.be.false();
			OdemModelTypeNumber.compare( 12e16, null, "not" ).should.be.false();
		} );

		it( "detects two coerced equal values", function() {
			OdemModelTypeNumber.compare( 0, 0, "eq" ).should.be.true();
			OdemModelTypeNumber.compare( 10, 1e1, "eq" ).should.be.true();
			OdemModelTypeNumber.compare( -0.1, -1e-1, "eq" ).should.be.true();

			OdemModelTypeNumber.compare( 0, 0, "noteq" ).should.be.false();
			OdemModelTypeNumber.compare( 10, 1e1, "noteq" ).should.be.false();
			OdemModelTypeNumber.compare( -0.1, -1e-1, "noteq" ).should.be.false();
		} );

		it( "detects two coerced inequal values", function() {
			OdemModelTypeNumber.compare( 1, 0, "eq" ).should.be.false();
			OdemModelTypeNumber.compare( 10, 1e2, "eq" ).should.be.false();
			OdemModelTypeNumber.compare( -0.1, -2e-1, "eq" ).should.be.false();

			OdemModelTypeNumber.compare( 1, 0, "noteq" ).should.be.true();
			OdemModelTypeNumber.compare( 10, 1e2, "noteq" ).should.be.true();
			OdemModelTypeNumber.compare( -0.1, -2e-1, "noteq" ).should.be.true();
		} );

		it( "compares order of two coerced values", function() {
			OdemModelTypeNumber.compare( 5, -3.4, "gt" ).should.be.true();
			OdemModelTypeNumber.compare( 5, -3.4, "gte" ).should.be.true();
			OdemModelTypeNumber.compare( 5, 5, "gt" ).should.be.false();
			OdemModelTypeNumber.compare( 5, 5, "gte" ).should.be.true();

			OdemModelTypeNumber.compare( -3.4, 5, "lt" ).should.be.true();
			OdemModelTypeNumber.compare( -3.4, 5, "lte" ).should.be.true();
			OdemModelTypeNumber.compare( -3.4, -3.4, "lt" ).should.be.false();
			OdemModelTypeNumber.compare( -3.4, -3.4, "lte" ).should.be.true();
		} );

		it( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			OdemModelTypeNumber.compare( -3.5, null, "gt" ).should.be.false();
			OdemModelTypeNumber.compare( -3.5, null, "gte" ).should.be.false();
			OdemModelTypeNumber.compare( -3.5, null, "lt" ).should.be.false();
			OdemModelTypeNumber.compare( -3.5, null, "lte" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			OdemModelTypeNumber.compare( null, 3.5, "gt" ).should.be.false();
			OdemModelTypeNumber.compare( null, 3.5, "gte" ).should.be.false();
			OdemModelTypeNumber.compare( null, 3.5, "lt" ).should.be.false();
			OdemModelTypeNumber.compare( null, 3.5, "lte" ).should.be.false();
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			OdemModelTypeNumber.compare( null, null, "gt" ).should.be.false();
			OdemModelTypeNumber.compare( null, null, "lt" ).should.be.false();
		} );

		it( "returns `true` on comparing `null`-value w/ `null`-value accepting equality", function() {
			OdemModelTypeNumber.compare( null, null, "gte" ).should.be.true();
			OdemModelTypeNumber.compare( null, null, "lte" ).should.be.true();
		} );

		it( "supports unary operation testing for value being `null`", function() {
			OdemModelTypeNumber.compare( null, null, "null" ).should.be.true();

			OdemModelTypeNumber.compare( 0, null, "null" ).should.be.false();
		} );

		it( "supports unary operation testing for value not being `null`", function() {
			OdemModelTypeNumber.compare( null, null, "notnull" ).should.be.false();

			OdemModelTypeNumber.compare( 0, null, "notnull" ).should.be.true();
		} );
	} );
} );
