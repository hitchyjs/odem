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
	new Date( "1970-01-01T00:00:00" ),
	new Date( "1999-12-31T23:59:59Z" ),
	new Date( "2000-09-06T16:30:00+02:00" ),
	new Date(),
	new Date( "2030-12-31" ),
];

const ValidData = ValidNonNullData.concat( [ null, undefined ] );

const ValidNonNullInput = ValidNonNullData.concat( [
	0,
	1519549020000,
	0,
	-6,
	6,
	3.5,
	-12.4356,
	"0",
	"1519549020000",
	"2017-02-25",
	"2017-02-25T08:57:00Z",
	"2017-02-25T08:57:00+01:00",
	"Sun Feb 25 2018 08:57:00 GMT+0100",
] );

const ValidInput = ValidNonNullInput.concat( [ null, undefined ] );



describe( "Model property type `date`", function() {
	let OdemModelType, OdemModelTypeDate, OdemUtilityDate;

	before( () => Helper.fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModelType, OdemModelTypeDate, OdemUtilityDate } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemModelTypeDate );
	} );

	it( "is derived from ModelType base class", function() {
		OdemModelTypeDate.prototype.should.be.instanceOf( OdemModelType );
	} );

	it( "is exposing its name as string", function() {
		OdemModelTypeDate.should.have.property( "typeName" ).which.is.equal( "date" );
	} );

	it( "is exposing list of aliases to type name", function() {
		OdemModelTypeDate.should.have.property( "aliases" ).which.is.an.Array();
		OdemModelTypeDate.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	it( "is commonly exposed by its name", function() {
		OdemModelType.selectByName( "date" ).should.be.equal( OdemModelTypeDate );
	} );

	it( "is commonly exposed by all its aliases", function() {
		OdemModelType.selectByName( "datetime" ).should.be.equal( OdemModelTypeDate );
		OdemModelType.selectByName( "timestamp" ).should.be.equal( OdemModelTypeDate );
	} );

	it( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		OdemModelType.selectByName( "DATE" ).should.be.equal( OdemModelTypeDate );
		OdemModelType.selectByName( "DATETIME" ).should.be.equal( OdemModelTypeDate );
		OdemModelType.selectByName( "TIMESTAMP" ).should.be.equal( OdemModelTypeDate );
	} );

	it( "advertises values of type to be sortable", function() {
		OdemModelTypeDate.sortable.should.be.true();
	} );

	describe( "is exposing method `checkDefinition()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeDate.checkDefinition.should.be.a.Function().which.has.length( 1 );
		} );

		it( "doesn't throw exception", function() {
			( () => OdemModelTypeDate.checkDefinition() ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( undefined ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( null ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( false ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( true ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( 0 ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( -1 ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( "" ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( [] ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( ["required: true"] ) ).should.not.throw();

			( () => OdemModelTypeDate.checkDefinition( {} ) ).should.not.throw();
			( () => OdemModelTypeDate.checkDefinition( { required: true } ) ).should.not.throw();
		} );

		it( "returns array of encountered errors", function() {
			OdemModelTypeDate.checkDefinition().should.be.Array();
			OdemModelTypeDate.checkDefinition( undefined ).should.be.Array();
			OdemModelTypeDate.checkDefinition( null ).should.be.Array();
			OdemModelTypeDate.checkDefinition( false ).should.be.Array();
			OdemModelTypeDate.checkDefinition( true ).should.be.Array();
			OdemModelTypeDate.checkDefinition( 0 ).should.be.Array();
			OdemModelTypeDate.checkDefinition( -1 ).should.be.Array();
			OdemModelTypeDate.checkDefinition( 4.5 ).should.be.Array();
			OdemModelTypeDate.checkDefinition( "" ).should.be.Array();
			OdemModelTypeDate.checkDefinition( "required: true" ).should.be.Array();
			OdemModelTypeDate.checkDefinition( [] ).should.be.Array();
			OdemModelTypeDate.checkDefinition( ["required: true"] ).should.be.Array();
			OdemModelTypeDate.checkDefinition( {} ).should.be.Array();
			OdemModelTypeDate.checkDefinition( { required: true } ).should.be.Array();
		} );

		it( "lists error unless providing definition object in first argument", function() {
			OdemModelTypeDate.checkDefinition().should.not.be.empty();
			OdemModelTypeDate.checkDefinition( undefined ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( null ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( false ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( true ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( 0 ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( -1 ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( 4.5 ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( "" ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( "required: true" ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( [] ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( ["required: true"] ).should.not.be.empty();

			OdemModelTypeDate.checkDefinition( {} ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { required: true } ).should.be.empty();
		} );

		it( "lists instances of Error on encountering errors in provided definition", function() {
			OdemModelTypeDate.checkDefinition()[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( undefined )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( null )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( false )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( true )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( 0 )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( -1 )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( 4.5 )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( "" )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( "required: true" )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( [] )[0].should.be.instanceOf( Error );
			OdemModelTypeDate.checkDefinition( ["required: true"] )[0].should.be.instanceOf( Error );
		} );

		it( "accepts definition of minimum timestamp using integer", function() {
			OdemModelTypeDate.checkDefinition( { min: 0 } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { min: 1 } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { min: 1519549020000 } ).should.be.empty();
		} );

		it( "accepts definition of minimum timestamp using numeric string", function() {
			OdemModelTypeDate.checkDefinition( { min: "0" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { min: "100" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { min: "1519549020000" } ).should.be.empty();
		} );

		it( "accepts definition of minimum timestamp using ISO-8601 date string", function() {
			OdemModelTypeDate.checkDefinition( { min: "2017-02-25" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { min: "2017-02-25T08:57:00Z" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { min: "2017-02-25T08:57:00+01:00" } ).should.be.empty();
		} );

		it( "accepts definition of minimum timestamp using RFC2822 date string", function() {
			OdemModelTypeDate.checkDefinition( { min: "Sun Feb 25 2018 08:57:00 GMT+0100" } ).should.be.empty();
		} );

		it( "rejects definition of minimum timestamp using empty string", function() {
			OdemModelTypeDate.checkDefinition( { min: "" } ).should.not.be.empty();
		} );

		it( "rejects definition of minimum timestamp using string consisting of whitespaces, only", function() {
			OdemModelTypeDate.checkDefinition( { min: " \r\t\n\f " } ).should.not.be.empty();
		} );

		it( "rejects definition of minimum timestamp using arbitrary string", function() {
			OdemModelTypeDate.checkDefinition( { min: "25 2 2018" } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { min: "foo bar" } ).should.not.be.empty();
		} );

		it( "rejects definition of minimum timestamp using boolean value", function() {
			OdemModelTypeDate.checkDefinition( { min: false } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { min: true } ).should.not.be.empty();
		} );

		it( "ignores definition of minimum timestamp using `null`", function() {
			OdemModelTypeDate.checkDefinition( { min: null } ).should.be.empty();
		} );

		it( "ignores definition of minimum timestamp using `undefined`", function() {
			OdemModelTypeDate.checkDefinition( { min: undefined } ).should.be.empty();
		} );

		it( "rejects definition of minimum timestamp using non-Date object", function() {
			[
				{},
				{ toString: "2015-02-25" },
				{ date: "2015-02-25" },
				[],
				["2015-02-25"],
			]
				.forEach( value => {
					OdemModelTypeDate.checkDefinition( { min: value } ).should.not.be.empty();
				} );
		} );

		it( "accepts definition of minimum timestamp using Date object", function() {
			[
				new Date(),
				new Date( "2015-02-25" ),
				new Date( 1519549020000 ),
			]
				.forEach( value => {
					OdemModelTypeDate.checkDefinition( { min: value } ).should.be.empty();
				} );
		} );

		it( "rejects definition of minimum timestamp using function", function() {
			[
				() => {}, // eslint-disable-line no-empty-function
				() => "2015-02-25",
				function() { return "2015-02-25"; },
			]
				.forEach( value => {
					OdemModelTypeDate.checkDefinition( { min: value } ).should.not.be.empty();
				} );
		} );

		it( "always converts definition of minimum timestamp to instance of `Date`", function() {
			[
				0,
				1519549020000,
				"0",
				"1519549020000",
				"2017-02-25",
				"2017-02-25T08:57:00Z",
				"2017-02-25T08:57:00+01:00",
				"Sun Feb 25 2018 08:57:00 GMT+0100",
			]
				.forEach( value => {
					const definition = { min: value };

					definition.min.should.not.be.Date();

					OdemModelTypeDate.checkDefinition( definition );

					definition.min.should.be.Date();
				} );
		} );

		it( "accepts definition of maximum timestamp using integer", function() {
			OdemModelTypeDate.checkDefinition( { max: 0 } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { max: 1 } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { max: 1519549020000 } ).should.be.empty();
		} );

		it( "accepts definition of maximum timestamp using numeric string", function() {
			OdemModelTypeDate.checkDefinition( { max: "0" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { max: "1" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { max: "1519549020000" } ).should.be.empty();
		} );

		it( "accepts definition of maximum timestamp using ISO-8601 date string", function() {
			OdemModelTypeDate.checkDefinition( { max: "2017-02-25" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { max: "2017-02-25T08:57:00Z" } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { max: "2017-02-25T08:57:00+01:00" } ).should.be.empty();
		} );

		it( "accepts definition of maximum timestamp using RFC2822 date string", function() {
			OdemModelTypeDate.checkDefinition( { max: "Sun Feb 25 2018 08:57:00 GMT+0100" } ).should.be.empty();
		} );

		it( "rejects definition of maximum timestamp using empty string", function() {
			OdemModelTypeDate.checkDefinition( { max: "" } ).should.not.be.empty();
		} );

		it( "rejects definition of maximum timestamp using string consisting of whitespaces, only", function() {
			OdemModelTypeDate.checkDefinition( { max: " \r\t\n\f " } ).should.not.be.empty();
		} );

		it( "rejects definition of maximum timestamp using arbitrary string", function() {
			OdemModelTypeDate.checkDefinition( { max: "25 2 2018" } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { max: "foo bar" } ).should.not.be.empty();
		} );

		it( "rejects definition of maximum timestamp using boolean value", function() {
			OdemModelTypeDate.checkDefinition( { max: false } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { max: true } ).should.not.be.empty();
		} );

		it( "ignores definition of maximum timestamp using `null`", function() {
			OdemModelTypeDate.checkDefinition( { max: null } ).should.be.empty();
		} );

		it( "ignores definition of maximum timestamp using `undefined`", function() {
			OdemModelTypeDate.checkDefinition( { max: undefined } ).should.be.empty();
		} );

		it( "rejects definition of maximum timestamp using non-Date object", function() {
			[
				{},
				{ toString: "2015-02-25" },
				{ date: "2015-02-25" },
				[],
				["2015-02-25"],
			]
				.forEach( value => {
					OdemModelTypeDate.checkDefinition( { max: value } ).should.not.be.empty();
				} );
		} );

		it( "accepts definition of maximum timestamp using Date object", function() {
			[
				new Date(),
				new Date( "2015-02-25" ),
				new Date( 1519549020000 ),
			]
				.forEach( value => {
					OdemModelTypeDate.checkDefinition( { max: value } ).should.be.empty();
				} );
		} );

		it( "rejects definition of maximum timestamp using function", function() {
			[
				() => {}, // eslint-disable-line no-empty-function
				() => "2015-02-25",
				function() { return "2015-02-25"; },
			]
				.forEach( value => {
					OdemModelTypeDate.checkDefinition( { max: value } ).should.not.be.empty();
				} );
		} );

		it( "always converts definition of maximum timestamp to instance of `Date`", function() {
			[
				0,
				1519549020000,
				"0",
				"1519549020000",
				"2017-02-25",
				"2017-02-25T08:57:00Z",
				"2017-02-25T08:57:00+01:00",
				"Sun Feb 25 2018 08:57:00 GMT+0100",
			]
				.forEach( value => {
					const definition = { max: value };

					definition.max.should.not.be.Date();

					OdemModelTypeDate.checkDefinition( definition );

					definition.max.should.be.Date();
				} );
		} );

		it( "fixes definition providing limits on timestamp in wrong order", function() {
			const definition = {
				min: new Date( "2018-02-25T10:57:01Z" ),
				max: new Date( "2018-02-25T08:57:01Z" ),
			};

			definition.max.getTime().should.not.be.above( definition.min.getTime() );

			OdemModelTypeDate.checkDefinition( definition );

			definition.max.getTime().should.be.above( definition.min.getTime() );
		} );

		it( "validates optionally given step value", function() {
			OdemModelTypeDate.checkDefinition( { step: undefined } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { step: null } ).should.be.empty();

			OdemModelTypeDate.checkDefinition( { step: false } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: true } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: "" } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: "invalid" } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: {} } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: { value: 4 } } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: [] } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: [4] } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: 0 } ).should.not.be.empty();
			OdemModelTypeDate.checkDefinition( { step: -1 } ).should.not.be.empty();

			OdemModelTypeDate.checkDefinition( { step: 1 } ).should.be.empty();
			OdemModelTypeDate.checkDefinition( { step: 1.5 } ).should.be.empty();
		} );
	} );

	describe( "is exposing method `coerce()` which", function() {
		it( "is a function to be invoked w/ at least three arguments", function() {
			OdemModelTypeDate.coerce.should.be.a.Function().which.has.length( 3 );
		} );

		it( "doesn't throw when invoked with two arguments, only", function() {
			( () => OdemModelTypeDate.coerce( undefined, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( null, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( false, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( true, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( 0, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( -1, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( 4.5, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( "", {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( "required: true", {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( [], {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( ["required: true"], {} ) ).should.not.throw();

			( () => OdemModelTypeDate.coerce( {}, {} ) ).should.not.throw();
			( () => OdemModelTypeDate.coerce( { required: true }, {} ) ).should.not.throw();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeDate.coerce( undefined, {} ) ).be.null();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeDate.coerce( null, {} ) ).be.null();
		} );

		it( "returns `null` on providing empty string", function() {
			Should( OdemModelTypeDate.coerce( "", {} ) ).be.null();
		} );

		it( "returns `null` on providing string consisting of whitespace, only", function() {
			Should( OdemModelTypeDate.coerce( " \r\t\n\f ", {} ) ).be.null();
		} );

		it( "returns `NaN` on providing `false`", function() {
			OdemModelTypeDate.coerce( false, {} ).should.be.NaN();
		} );

		it( "returns 'NaN' on providing `true`", function() {
			OdemModelTypeDate.coerce( true, {} ).should.be.NaN();
		} );

		it( "considers any provided integer to be milliseconds since Unix Epoch returning according instance of Date", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 12; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					OdemModelTypeDate.coerce( i, {} ).should.be.Date();
					OdemModelTypeDate.coerce( i, {} ).getTime().should.be.Number().which.is.equal( i );
				}
			}
		} );

		it( "considers any provided number to be milliseconds since Unix Epoch ignoring any fractional digits", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -4; de < 12; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						OdemModelTypeDate.coerce( v, {} ).should.be.Date();
						OdemModelTypeDate.coerce( v, {} ).getTime().should.be.Number().which.is.equal( Math.trunc( v ) );
					}
				}
			}
		} );

		it( "returns `NaN` on providing non-Date object", function() {
			OdemModelTypeDate.coerce( {}, {} ).should.be.NaN();
			OdemModelTypeDate.coerce( { someName: "someValue" }, {} ).should.be.NaN();
			OdemModelTypeDate.coerce( { toString: () => "me as a string" }, {} ).should.be.NaN();
			OdemModelTypeDate.coerce( { toString: () => "2018-02-25" }, {} ).should.be.NaN();
			OdemModelTypeDate.coerce( { toString: () => "2018-02-25T08:57:00Z" }, {} ).should.be.NaN();
			OdemModelTypeDate.coerce( { toString: () => "14567892" }, {} ).should.be.NaN();

			OdemModelTypeDate.coerce( [], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( [1], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( ["sole"], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( [ true, false ], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( ["2018-02-25"], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( ["2018-02-25T08:57:00Z"], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( ["14567892"], {} ).should.be.NaN();
			OdemModelTypeDate.coerce( [14567892], {} ).should.be.NaN();

			OdemModelTypeDate.coerce( new TypeError(), {} ).should.be.NaN();
			OdemModelTypeDate.coerce( new Promise( resolve => resolve() ), {} ).should.be.NaN();
		} );

		it( "returns provided Date object as-is", function() {
			[
				new Date( "2018-02-25" ),
				new Date( "2018-02-25T08:57:00Z" ),
				new Date( 14567892 ),
			]
				.forEach( value => {
					OdemModelTypeDate.coerce( value, {} ).should.be.equal( value );
				} );
		} );

		it( "returns `NaN` on providing function", function() {
			OdemModelTypeDate.coerce( () => {}, {} ).should.be.NaN(); // eslint-disable-line no-empty-function
			OdemModelTypeDate.coerce( () => 1 + 3, {} ).should.be.NaN();
			OdemModelTypeDate.coerce( function() {}, {} ).should.be.NaN(); // eslint-disable-line no-empty-function
			OdemModelTypeDate.coerce( () => "2018-02-25", {} ).should.be.NaN();
			OdemModelTypeDate.coerce( () => "2018-02-25T08:57:00Z", {} ).should.be.NaN();
			OdemModelTypeDate.coerce( () => "14567892", {} ).should.be.NaN();
			OdemModelTypeDate.coerce( () => 14567892, {} ).should.be.NaN();

			OdemModelTypeDate.coerce( Date.parse, {} ).should.be.NaN();
		} );

		it( "accepts definition in second argument", function() {
			( () => OdemModelTypeDate.coerce( "string", { required: true } ) ).should.not.throw();
		} );

		it( "doesn't care for definition requiring value", function() {
			Should( OdemModelTypeDate.coerce( undefined, { required: true } ) ).be.null();
			Should( OdemModelTypeDate.coerce( null, { required: true } ) ).be.null();
		} );

		it( "keeps information on time of day by default", function() {
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", {} ).getUTCHours().should.be.equal( 8 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", {} ).getUTCMinutes().should.be.equal( 57 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", {} ).getUTCSeconds().should.be.equal( 1 );
		} );

		it( "drops information on time of day on demand", function() {
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { time: true } ).getUTCHours().should.be.equal( 8 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { time: true } ).getUTCMinutes().should.be.equal( 57 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { time: true } ).getUTCSeconds().should.be.equal( 1 );

			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { time: false } ).getUTCHours().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { time: false } ).getUTCMinutes().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { time: false } ).getUTCSeconds().should.be.equal( 0 );
		} );

		it( "rounds value to nearest multitude of optionally defined step value", function() {
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", {} ).getUTCSeconds().should.be.equal( 1 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 1 } ).getUTCSeconds().should.be.equal( 1 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 1000 } ).getUTCSeconds().should.be.equal( 1 );

			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 10 * 1000 } ).getUTCSeconds().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:05Z", { step: 10 * 1000 } ).getUTCSeconds().should.be.equal( 10 );

			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 5 * 60 * 1000 } ).getUTCSeconds().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 5 * 60 * 1000 } ).getUTCMinutes().should.be.equal( 55 );

			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 12 * 60 * 60 * 1000 } ).getUTCMinutes().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 12 * 60 * 60 * 1000 } ).getUTCHours().should.be.equal( 12 );

			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 24 * 60 * 60 * 1000 } ).getUTCMinutes().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 24 * 60 * 60 * 1000 } ).getUTCHours().should.be.equal( 0 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:01Z", { step: 24 * 60 * 60 * 1000 } ).getUTCDate().should.be.equal( 25 );
			OdemModelTypeDate.coerce( "2018-02-25T12:00:00Z", { step: 24 * 60 * 60 * 1000 } ).getUTCDate().should.be.equal( 26 );
		} );

		it( "obeys step value starting from optionally defined minimum value", function() {
			OdemModelTypeDate.coerce( "2018-02-25T08:57:05Z", { step: 10 * 1000 } ).getUTCSeconds().should.be.equal( 10 );
			OdemModelTypeDate.coerce( "2018-02-25T08:57:05Z", { step: 10 * 1000, min: new Date( "2018-02-25T08:57:05Z" ) } ).getUTCSeconds().should.be.equal( 5 );
			OdemModelTypeDate.coerce( "1970-01-01T00:00:05Z", { step: 10 * 1000, min: new Date( "1969-12-31T23:59:59" ) } ).getUTCSeconds().should.be.equal( 9 );
			OdemModelTypeDate.coerce( "1970-01-01T00:00:02Z", { step: 10 * 1000, min: new Date( "1969-12-31T23:59:59" ) } ).getUTCSeconds().should.be.equal( 59 );
		} );
	} );

	describe( "is exposing method `isValid()` which", function() {
		it( "is a function to be invoked w/ four argument", function() {
			OdemModelTypeDate.isValid.should.be.a.Function().which.has.length( 4 );
		} );

		it( "requires provision of array for collecting errors in fourth argument", function() {
			// (providing valid data in first three arguments describing invalid case)

			( () => OdemModelTypeDate.isValid( "name", null, { required: true } ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, undefined ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, null ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, false ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, true ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, 0 ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, -1 ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, 4.5 ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, "" ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, "required: true" ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, {} ) ).should.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, { required: true } ) ).should.throw();

			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( "name", null, { required: true }, ["required: true"] ) ).should.not.throw();
		} );

		it( "doesn't throw exception on providing invalid first argument", function() {
			( () => OdemModelTypeDate.isValid( undefined, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( null, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( false, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( true, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( 0, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( -1, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( 4.5, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( "", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( "required: true", null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( [], null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( ["required: true"], null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( {}, null, { required: true }, [] ) ).should.not.throw();
			( () => OdemModelTypeDate.isValid( { required: true }, null, { required: true }, [] ) ).should.not.throw();
		} );

		it( "does not return anything", function() {
			Should( OdemModelTypeDate.isValid( "name", undefined, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", null, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", false, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", true, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", 0, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", -1, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", 4.5, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", "", {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", "value", {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", [], {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", ["value"], {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", {}, {}, [] ) ).be.undefined();
			Should( OdemModelTypeDate.isValid( "name", { value: "value" }, {}, [] ) ).be.undefined();
		} );

		it( "appends validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeDate.isValid( "name", null, {}, collector ) ).be.undefined();

			collector.should.have.length( 2 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();

			Should( OdemModelTypeDate.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[0].should.be.String().which.is.equal( "something existing" );
			Should( collector[1] ).be.null();
		} );

		it( "appends instances of `Error` on validation issues to array provided in fourth argument", function() {
			const collector = [ "something existing", null ];

			Should( OdemModelTypeDate.isValid( "name", null, { required: true }, collector ) ).be.undefined();

			collector.should.have.length( 3 );
			collector[2].should.be.instanceOf( Error );
		} );

		it( "considers `null` as valid unless `required` is set in definition", function() {
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", null, {}, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { required: false }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { required: "" }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { required: true }, collector ) ).be.undefined();
			collector.should.not.be.empty();
		} );

		it( "ignores demand for minimum time on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", null, { min: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { min: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for minimum length on validating string", function() {
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-24T08:57:01Z" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:01Z" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:01+01:00" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-26T08:57:01Z" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );
		} );

		it( "ignores demand for maximum length on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", null, { max: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { max: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys demand for maximum length on validating string", function() {
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-24T08:57:01Z" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:01Z" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T09:57:01+02:00" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:02Z" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T09:57:01+01:00" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T09:57:02+01:00" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 2 );
		} );

		it( "ignores combined demands for minimum and maximum length on validating `null`", function() {
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", null, { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2018-02-25T08:57:02Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( OdemModelTypeDate.isValid( "name", null, { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2019-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		it( "obeys combined demands for minimum and maximum length on validating string", function() {
			const definition = { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2018-02-25T09:57:00Z" ) };
			const collector = [];

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:00Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:01+01:00" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T08:57:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T09:27:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T09:57:00Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-25T09:57:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( OdemModelTypeDate.isValid( "name", new Date( "2018-02-26T08:57:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
		} );
	} );

	describe( "is exposing method `serialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeDate.serialize.should.be.a.Function().which.has.length( 2 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeDate.serialize() ).should.not.throw();
			( () => OdemModelTypeDate.serialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( null ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( false ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( true ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( "" ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( {} ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( [] ) ).should.not.throw();
			( () => OdemModelTypeDate.serialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns `null` on providing `null`", function() {
			Should( OdemModelTypeDate.serialize( null ) ).be.null();
		} );

		it( "returns `null` on providing `undefined`", function() {
			Should( OdemModelTypeDate.serialize( undefined ) ).be.null();
		} );

		it( "returns any provided timestamp as string formatted in compliance with ISO-8601", function() {
			[
				new Date( "2018-02-25" ),
				new Date( "2018-02-25T08:57:01Z" ),
			]
				.forEach( string => {
					OdemModelTypeDate.serialize( string ).should.be.String().and.match( OdemUtilityDate.ptnISO8601 );
				} );
		} );

		it( "returns `null` on providing any other value", function() {
			[
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
				"abc",
				"\u00a0",
				"\x00\x01\x02\x1b\x00",
			]
				.forEach( value => {
					Should( OdemModelTypeDate.serialize( value ) ).be.null();
				} );
		} );
	} );

	describe( "is exposing method `deserialize()` which", function() {
		it( "is a function to be invoked w/ one argument", function() {
			OdemModelTypeDate.deserialize.should.be.a.Function().which.has.length( 1 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeDate.deserialize() ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( undefined ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( null ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( false ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( true ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( 0 ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( -1 ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( 4.5 ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( "" ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( "required: true" ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( {} ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( { required: true } ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( [] ) ).should.not.throw();
			( () => OdemModelTypeDate.deserialize( ["required: true"] ) ).should.not.throw();
		} );

		it( "returns Date instances assuming some provided number to be seconds since Unix Epoch", function() {
			ValidInput
				.filter( value => typeof value === "number" )
				.forEach( value => {
					const deserialized = OdemModelTypeDate.deserialize( value );

					deserialized.should.be.instanceOf( Date );
					deserialized.getTime().should.be.equal( parseInt( value * 1000 ) );
				} );
		} );

		it( "returns Date instances assuming some provided string is a formatted date/time information", function() {
			ValidInput
				.filter( value => typeof value === "string" )
				.forEach( value => {
					const deserialized = OdemModelTypeDate.deserialize( value );

					deserialized.should.be.instanceOf( Date );
					if ( isNaN( deserialized ) ) {
						isNaN( new Date( value ) ).should.be.true();
					} else {
						deserialized.getTime().should.be.equal( new Date( value ).getTime() );
					}
				} );
		} );

		it( "returns `null` when providing null-ish input", function() {
			ValidInput
				.filter( value => value == null )
				.forEach( value => {
					( OdemModelTypeDate.deserialize( value ) === null ).should.be.true();
				} );
		} );
	} );

	describe( "is exposing method `compare()` which", function() {
		it( "is a function to be invoked w/ three arguments", function() {
			OdemModelTypeDate.compare.should.be.a.Function().which.has.length( 3 );
		} );

		it( "never throws exception", function() {
			( () => OdemModelTypeDate.compare() ).should.not.throw();

			ValidData.forEach( one => {
				( () => OdemModelTypeDate.compare( one ) ).should.not.throw();

				ValidData.forEach( two => {
					( () => OdemModelTypeDate.compare( one, two ) ).should.not.throw();

					Helper.allComparisonOperations().forEach( three => {
						( () => OdemModelTypeDate.compare( one, two, three ) ).should.not.throw();
					} );
				} );
			} );
		} );

		it( "always returns boolean", function() {
			ValidData.forEach( one => {
				ValidData.forEach( two => {
					Helper.allComparisonOperations().forEach( three => {
						OdemModelTypeDate.compare( one, two, three ).should.be.Boolean();
					} );
				} );
			} );
		} );

		it( "considers `null` and `null` as equal", function() {
			OdemModelTypeDate.compare( null, null, "eq" ).should.be.true();

			OdemModelTypeDate.compare( null, null, "noteq" ).should.be.false();
		} );

		it( "considers `null` and non-`null` as inequal", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeDate.compare( null, data, "eq" ).should.be.false();
				OdemModelTypeDate.compare( data, null, "eq" ).should.be.false();

				OdemModelTypeDate.compare( null, data, "noteq" ).should.be.true();
				OdemModelTypeDate.compare( data, null, "noteq" ).should.be.true();
			} );
		} );

		it( "returns `true` on negating `null`", function() {
			OdemModelTypeDate.compare( null, null, "not" ).should.be.true();
		} );

		it( "returns `false` on negating truthy coerced value", function() {
			ValidNonNullData.forEach( value => {
				OdemModelTypeDate.compare( value, null, "not" ).should.be.false();
			} );
		} );

		it( "detects two coerced equal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						OdemModelTypeDate.compare( one, two, "eq" ).should.be.true( `failed on comparing #${outer} eq #${inner}` );
					} else {
						OdemModelTypeDate.compare( one, two, "eq" ).should.be.false( `failed on comparing #${outer} eq #${inner}` );
					}
				} );
			} );
		} );

		it( "detects two coerced inequal values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer === inner ) {
						OdemModelTypeDate.compare( one, two, "neq" ).should.be.false( `failed on comparing #${outer} neq #${inner}` );
						OdemModelTypeDate.compare( one, two, "noteq" ).should.be.false( `failed on comparing #${outer} noteq #${inner}` );
					} else {
						OdemModelTypeDate.compare( one, two, "neq" ).should.be.true( `failed on comparing #${outer} neq #${inner}` );
						OdemModelTypeDate.compare( one, two, "noteq" ).should.be.true( `failed on comparing #${outer} noteq #${inner}` );
					}
				} );
			} );
		} );

		it( "compares order of two coerced values", function() {
			ValidNonNullData.forEach( ( one, outer ) => {
				ValidNonNullData.forEach( ( two, inner ) => {
					if ( outer > inner ) {
						OdemModelTypeDate.compare( one, two, "gt" ).should.be.true( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeDate.compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeDate.compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeDate.compare( one, two, "lte" ).should.be.false( `failed on comparing #${outer} lte #${inner}` );
					} else if ( outer < inner ) {
						OdemModelTypeDate.compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeDate.compare( one, two, "gte" ).should.be.false( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeDate.compare( one, two, "lt" ).should.be.true( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeDate.compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					} else {
						OdemModelTypeDate.compare( one, two, "gt" ).should.be.false( `failed on comparing #${outer} gt #${inner}` );
						OdemModelTypeDate.compare( one, two, "gte" ).should.be.true( `failed on comparing #${outer} gte #${inner}` );
						OdemModelTypeDate.compare( one, two, "lt" ).should.be.false( `failed on comparing #${outer} lt #${inner}` );
						OdemModelTypeDate.compare( one, two, "lte" ).should.be.true( `failed on comparing #${outer} lte #${inner}` );
					}
				} );
			} );
		} );

		it( "returns `false` on comparing non-`null`-value w/ `null`-value", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeDate.compare( data, null, "gt" ).should.be.false();
				OdemModelTypeDate.compare( data, null, "gte" ).should.be.false();
				OdemModelTypeDate.compare( data, null, "lt" ).should.be.false();
				OdemModelTypeDate.compare( data, null, "lte" ).should.be.false();
			} );
		} );

		it( "returns `false` on comparing `null`-value w/ non-`null`-value", function() {
			ValidNonNullData.forEach( data => {
				OdemModelTypeDate.compare( null, data, "gt" ).should.be.false();
				OdemModelTypeDate.compare( null, data, "gte" ).should.be.false();
				OdemModelTypeDate.compare( null, data, "lt" ).should.be.false();
				OdemModelTypeDate.compare( null, data, "lte" ).should.be.false();
			} );
		} );

		it( "returns `false` on comparing `null`-value w/ `null`-value w/o accepting equality", function() {
			OdemModelTypeDate.compare( null, null, "gt" ).should.be.false();
			OdemModelTypeDate.compare( null, null, "lt" ).should.be.false();
		} );

		it( "returns `true` on comparing `null`-value w/ `null`-value accepting equality", function() {
			OdemModelTypeDate.compare( null, null, "gte" ).should.be.true();
			OdemModelTypeDate.compare( null, null, "lte" ).should.be.true();
		} );

		it( "supports unary operation testing for value being `null`", function() {
			OdemModelTypeDate.compare( null, null, "null" ).should.be.true();

			ValidNonNullData.forEach( data => {
				OdemModelTypeDate.compare( data, null, "null" ).should.be.false();
			} );
		} );

		it( "supports unary operation testing for value not being `null`", function() {
			OdemModelTypeDate.compare( null, null, "notnull" ).should.be.false();

			ValidNonNullData.forEach( data => {
				OdemModelTypeDate.compare( data, null, "notnull" ).should.be.true();
			} );
		} );
	} );
} );
