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
const Type = require( "../../../lib/model/type/date" );

const DateUtilities = require( "../../../lib/utility/date" );


suite( "Model Attribute Type `date`", function() {
	test( "is available", function() {
		Should.exist( Type );
	} );

	test( "is derived from ModelType base class", function() {
		Type.prototype.should.be.instanceOf( Base );
	} );

	test( "is exposing its name as string", function() {
		Type.should.have.property( "typeName" ).which.is.equal( "date" );
	} );

	test( "is exposing list of aliases to type name", function() {
		Type.should.have.property( "aliases" ).which.is.an.Array();
		Type.aliases.forEach( alias => alias.should.be.String().and.not.empty() );
	} );

	test( "is commonly exposed by its name", function() {
		AllTypes.selectByName( "date" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by all its aliases", function() {
		AllTypes.selectByName( "datetime" ).should.be.equal( Type );
		AllTypes.selectByName( "timestamp" ).should.be.equal( Type );
	} );

	test( "is commonly exposed by its name and all its aliases case-insensitively", function() {
		AllTypes.selectByName( "DATE" ).should.be.equal( Type );
		AllTypes.selectByName( "DATETIME" ).should.be.equal( Type );
		AllTypes.selectByName( "TIMESTAMP" ).should.be.equal( Type );
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

		test( "accepts definition of minimum timestamp using integer", function() {
			checkDefinition( { min: 0 } ).should.be.empty();
			checkDefinition( { min: 1 } ).should.be.empty();
			checkDefinition( { min: 1519549020000 } ).should.be.empty();
		} );

		test( "accepts definition of minimum timestamp using numeric string", function() {
			checkDefinition( { min: "0" } ).should.be.empty();
			checkDefinition( { min: "100" } ).should.be.empty();
			checkDefinition( { min: "1519549020000" } ).should.be.empty();
		} );

		test( "accepts definition of minimum timestamp using ISO-8601 date string", function() {
			checkDefinition( { min: "2017-02-25" } ).should.be.empty();
			checkDefinition( { min: "2017-02-25T08:57:00Z" } ).should.be.empty();
			checkDefinition( { min: "2017-02-25T08:57:00+01:00" } ).should.be.empty();
		} );

		test( "accepts definition of minimum timestamp using RFC2822 date string", function() {
			checkDefinition( { min: "Sun Feb 25 2018 08:57:00 GMT+0100" } ).should.be.empty();
		} );

		test( "rejects definition of minimum timestamp using empty string", function() {
			checkDefinition( { min: "" } ).should.not.be.empty();
		} );

		test( "rejects definition of minimum timestamp using string consisting of whitespaces, only", function() {
			checkDefinition( { min: " \r\t\n\f " } ).should.not.be.empty();
		} );

		test( "rejects definition of minimum timestamp using arbitrary string", function() {
			checkDefinition( { min: "25 2 2018" } ).should.not.be.empty();
			checkDefinition( { min: "foo bar" } ).should.not.be.empty();
		} );

		test( "rejects definition of minimum timestamp using boolean value", function() {
			checkDefinition( { min: false } ).should.not.be.empty();
			checkDefinition( { min: true } ).should.not.be.empty();
		} );

		test( "ignores definition of minimum timestamp using `null`", function() {
			checkDefinition( { min: null } ).should.be.empty();
		} );

		test( "ignores definition of minimum timestamp using `undefined`", function() {
			checkDefinition( { min: undefined } ).should.be.empty();
		} );

		test( "rejects definition of minimum timestamp using non-Date object", function() {
			[
				{},
				{ toString: "2015-02-25" },
				{ date: "2015-02-25" },
				[],
				["2015-02-25"],
			]
				.forEach( value => {
					checkDefinition( { min: value } ).should.not.be.empty();
				} );
		} );

		test( "accepts definition of minimum timestamp using Date object", function() {
			[
				new Date(),
				new Date( "2015-02-25" ),
				new Date( 1519549020000 ),
			]
				.forEach( value => {
					checkDefinition( { min: value } ).should.be.empty();
				} );
		} );

		test( "rejects definition of minimum timestamp using function", function() {
			[
				() => {}, // eslint-disable-line no-empty-function
				() => "2015-02-25",
				function() { return "2015-02-25"; },
			]
				.forEach( value => {
					checkDefinition( { min: value } ).should.not.be.empty();
				} );
		} );

		test( "always converts definition of minimum timestamp to instance of `Date`", function() {
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

					checkDefinition( definition );

					definition.min.should.be.Date();
				} );
		} );

		test( "accepts definition of maximum timestamp using integer", function() {
			checkDefinition( { max: 0 } ).should.be.empty();
			checkDefinition( { max: 1 } ).should.be.empty();
			checkDefinition( { max: 1519549020000 } ).should.be.empty();
		} );

		test( "accepts definition of maximum timestamp using numeric string", function() {
			checkDefinition( { max: "0" } ).should.be.empty();
			checkDefinition( { max: "1" } ).should.be.empty();
			checkDefinition( { max: "1519549020000" } ).should.be.empty();
		} );

		test( "accepts definition of maximum timestamp using ISO-8601 date string", function() {
			checkDefinition( { max: "2017-02-25" } ).should.be.empty();
			checkDefinition( { max: "2017-02-25T08:57:00Z" } ).should.be.empty();
			checkDefinition( { max: "2017-02-25T08:57:00+01:00" } ).should.be.empty();
		} );

		test( "accepts definition of maximum timestamp using RFC2822 date string", function() {
			checkDefinition( { max: "Sun Feb 25 2018 08:57:00 GMT+0100" } ).should.be.empty();
		} );

		test( "rejects definition of maximum timestamp using empty string", function() {
			checkDefinition( { max: "" } ).should.not.be.empty();
		} );

		test( "rejects definition of maximum timestamp using string consisting of whitespaces, only", function() {
			checkDefinition( { max: " \r\t\n\f " } ).should.not.be.empty();
		} );

		test( "rejects definition of maximum timestamp using arbitrary string", function() {
			checkDefinition( { max: "25 2 2018" } ).should.not.be.empty();
			checkDefinition( { max: "foo bar" } ).should.not.be.empty();
		} );

		test( "rejects definition of maximum timestamp using boolean value", function() {
			checkDefinition( { max: false } ).should.not.be.empty();
			checkDefinition( { max: true } ).should.not.be.empty();
		} );

		test( "ignores definition of maximum timestamp using `null`", function() {
			checkDefinition( { max: null } ).should.be.empty();
		} );

		test( "ignores definition of maximum timestamp using `undefined`", function() {
			checkDefinition( { max: undefined } ).should.be.empty();
		} );

		test( "rejects definition of maximum timestamp using non-Date object", function() {
			[
				{},
				{ toString: "2015-02-25" },
				{ date: "2015-02-25" },
				[],
				["2015-02-25"],
			]
				.forEach( value => {
					checkDefinition( { max: value } ).should.not.be.empty();
				} );
		} );

		test( "accepts definition of maximum timestamp using Date object", function() {
			[
				new Date(),
				new Date( "2015-02-25" ),
				new Date( 1519549020000 ),
			]
				.forEach( value => {
					checkDefinition( { max: value } ).should.be.empty();
				} );
		} );

		test( "rejects definition of maximum timestamp using function", function() {
			[
				() => {}, // eslint-disable-line no-empty-function
				() => "2015-02-25",
				function() { return "2015-02-25"; },
			]
				.forEach( value => {
					checkDefinition( { max: value } ).should.not.be.empty();
				} );
		} );

		test( "always converts definition of maximum timestamp to instance of `Date`", function() {
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

					checkDefinition( definition );

					definition.max.should.be.Date();
				} );
		} );

		test( "fixes definition providing limits on timestamp in wrong order", function() {
			const definition = {
				min: new Date( "2018-02-25T10:57:01Z" ),
				max: new Date( "2018-02-25T08:57:01Z" ),
			};

			definition.max.getTime().should.not.be.above( definition.min.getTime() );

			checkDefinition( definition );

			definition.max.getTime().should.be.above( definition.min.getTime() );
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

		test( "returns `null` on providing empty string", function() {
			Should( coerce( "" ) ).be.null();
		} );

		test( "returns `null` on providing string consisting of whitespace, only", function() {
			Should( coerce( " \r\t\n\f " ) ).be.null();
		} );

		test( "returns `NaN` on providing `false`", function() {
			coerce( false ).should.be.NaN();
		} );

		test( "returns 'NaN' on providing `true`", function() {
			coerce( true ).should.be.NaN();
		} );

		test( "considers any provided integer to be milliseconds since Unix Epoch returning according instance of Date", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 12; e++ ) {
				for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
					coerce( i ).should.be.Date();
					coerce( i ).getTime().should.be.Number().which.is.equal( i );
				}
			}
		} );

		test( "considers any provided number to be milliseconds since Unix Epoch ignoring any fractional digits", function() {
			this.timeout( 5000 );

			for ( let e = 1; e <= 8; e++ ) {
				for ( let de = -4; de < 12; de++ ) {
					for ( let i = -Math.pow( 10, e ); i <= Math.pow( 10, e ); i += Math.pow( 10, Math.max( 0, e - 2 ) ) ) {
						const v = i / Math.pow( 10, de );
						coerce( v ).should.be.Date();
						coerce( v ).getTime().should.be.Number().which.is.equal( Math.trunc( v ) );
					}
				}
			}
		} );

		test( "returns `NaN` on providing non-Date object", function() {
			coerce( {} ).should.be.NaN();
			coerce( { someName: "someValue" } ).should.be.NaN();
			coerce( { toString: () => "me as a string" } ).should.be.NaN();
			coerce( { toString: () => "2018-02-25" } ).should.be.NaN();
			coerce( { toString: () => "2018-02-25T08:57:00Z" } ).should.be.NaN();
			coerce( { toString: () => "14567892" } ).should.be.NaN();

			coerce( [] ).should.be.NaN();
			coerce( [1] ).should.be.NaN();
			coerce( ["sole"] ).should.be.NaN();
			coerce( [ true, false ] ).should.be.NaN();
			coerce( ["2018-02-25"] ).should.be.NaN();
			coerce( ["2018-02-25T08:57:00Z"] ).should.be.NaN();
			coerce( ["14567892"] ).should.be.NaN();
			coerce( [14567892] ).should.be.NaN();

			coerce( new TypeError() ).should.be.NaN();
			coerce( new Promise( resolve => resolve() ) ).should.be.NaN();
		} );

		test( "returns provided Date object as-is", function() {
			[
				new Date( "2018-02-25" ),
				new Date( "2018-02-25T08:57:00Z" ),
				new Date( 14567892 ),
			]
				.forEach( value => {
					coerce( value ).should.be.equal( value );
				} );
		} );

		test( "returns `NaN` on providing function", function() {
			coerce( () => {} ).should.be.NaN(); // eslint-disable-line no-empty-function
			coerce( () => 1 + 3 ).should.be.NaN();
			coerce( function() {} ).should.be.NaN(); // eslint-disable-line no-empty-function
			coerce( () => "2018-02-25" ).should.be.NaN();
			coerce( () => "2018-02-25T08:57:00Z" ).should.be.NaN();
			coerce( () => "14567892" ).should.be.NaN();
			coerce( () => 14567892 ).should.be.NaN();

			coerce( Date.parse ).should.be.NaN();
		} );

		test( "accepts definition in second argument", function() {
			( () => coerce( "string", { required: true } ) ).should.not.throw();
		} );

		test( "doesn't care for definition requiring value", function() {
			Should( coerce( undefined, { required: true } ) ).be.null();
			Should( coerce( null, { required: true } ) ).be.null();
		} );

		test( "keeps information on time of day by default", function() {
			coerce( "2018-02-25T08:57:01Z", {} ).getUTCHours().should.be.equal( 8 );
			coerce( "2018-02-25T08:57:01Z", {} ).getUTCMinutes().should.be.equal( 57 );
			coerce( "2018-02-25T08:57:01Z", {} ).getUTCSeconds().should.be.equal( 1 );
		} );

		test( "drops information on time of day on demand", function() {
			coerce( "2018-02-25T08:57:01Z", { time: true } ).getUTCHours().should.be.equal( 8 );
			coerce( "2018-02-25T08:57:01Z", { time: true } ).getUTCMinutes().should.be.equal( 57 );
			coerce( "2018-02-25T08:57:01Z", { time: true } ).getUTCSeconds().should.be.equal( 1 );

			coerce( "2018-02-25T08:57:01Z", { time: false } ).getUTCHours().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:01Z", { time: false } ).getUTCMinutes().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:01Z", { time: false } ).getUTCSeconds().should.be.equal( 0 );
		} );

		test( "rounds value to nearest multitude of optionally defined step value", function() {
			coerce( "2018-02-25T08:57:01Z", {} ).getUTCSeconds().should.be.equal( 1 );
			coerce( "2018-02-25T08:57:01Z", { step: 1 } ).getUTCSeconds().should.be.equal( 1 );
			coerce( "2018-02-25T08:57:01Z", { step: 1000 } ).getUTCSeconds().should.be.equal( 1 );

			coerce( "2018-02-25T08:57:01Z", { step: 10 * 1000 } ).getUTCSeconds().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:05Z", { step: 10 * 1000 } ).getUTCSeconds().should.be.equal( 10 );

			coerce( "2018-02-25T08:57:01Z", { step: 5 * 60 * 1000 } ).getUTCSeconds().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:01Z", { step: 5 * 60 * 1000 } ).getUTCMinutes().should.be.equal( 55 );

			coerce( "2018-02-25T08:57:01Z", { step: 12 * 60 * 60 * 1000 } ).getUTCMinutes().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:01Z", { step: 12 * 60 * 60 * 1000 } ).getUTCHours().should.be.equal( 12 );

			coerce( "2018-02-25T08:57:01Z", { step: 24 * 60 * 60 * 1000 } ).getUTCMinutes().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:01Z", { step: 24 * 60 * 60 * 1000 } ).getUTCHours().should.be.equal( 0 );
			coerce( "2018-02-25T08:57:01Z", { step: 24 * 60 * 60 * 1000 } ).getUTCDate().should.be.equal( 25 );
			coerce( "2018-02-25T12:00:00Z", { step: 24 * 60 * 60 * 1000 } ).getUTCDate().should.be.equal( 26 );
		} );

		test( "obeys step value starting from optionally defined minimum value", function() {
			coerce( "2018-02-25T08:57:05Z", { step: 10 * 1000 } ).getUTCSeconds().should.be.equal( 10 );
			coerce( "2018-02-25T08:57:05Z", { step: 10 * 1000, min: new Date( "2018-02-25T08:57:05Z" ) } ).getUTCSeconds().should.be.equal( 5 );
			coerce( "1970-01-01T00:00:05Z", { step: 10 * 1000, min: new Date( "1969-12-31T23:59:59" ) } ).getUTCSeconds().should.be.equal( 9 );
			coerce( "1970-01-01T00:00:02Z", { step: 10 * 1000, min: new Date( "1969-12-31T23:59:59" ) } ).getUTCSeconds().should.be.equal( 59 );
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
			( () => isValid( "", null, { required: true }, [] ) ).should.not.throw();
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

		test( "ignores demand for minimum time on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { min: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for minimum length on validating string", function() {
			const collector = [];

			Should( isValid( "name", new Date( "2018-02-24T08:57:01Z" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", new Date( "2018-02-25" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", new Date( "2018-02-25T08:57:01Z" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 2 );

			Should( isValid( "name", new Date( "2018-02-25T08:57:01+01:00" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );

			Should( isValid( "name", new Date( "2018-02-26T08:57:01Z" ), { min: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 3 );
		} );

		test( "ignores demand for maximum length on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { max: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { max: new Date( "2018-02-25" ) }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys demand for maximum length on validating string", function() {
			const collector = [];

			Should( isValid( "name", new Date( "2018-02-24T08:57:01Z" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", new Date( "2018-02-25" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", new Date( "2018-02-25T08:57:01Z" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", new Date( "2018-02-25T09:57:01+02:00" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", new Date( "2018-02-25T08:57:02Z" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", new Date( "2018-02-25T09:57:01+01:00" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 1 );

			Should( isValid( "name", new Date( "2018-02-25T09:57:02+01:00" ), { max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.have.length( 2 );
		} );

		test( "ignores combined demands for minimum and maximum length on validating `null`", function() {
			const collector = [];

			Should( isValid( "name", null, { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2018-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2018-02-25T08:57:02Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();

			Should( isValid( "name", null, { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2019-02-25T08:57:01Z" ) }, collector ) ).be.undefined();
			collector.should.be.empty();
		} );

		test( "obeys combined demands for minimum and maximum length on validating string", function() {
			const definition = { min: new Date( "2018-02-25T08:57:01Z" ), max: new Date( "2018-02-25T09:57:00Z" ) };
			const collector = [];

			Should( isValid( "name", new Date( "2018-02-25T08:57:00Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 1 );

			Should( isValid( "name", new Date( "2018-02-25T08:57:01+01:00" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", new Date( "2018-02-25T08:57:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", new Date( "2018-02-25T09:27:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", new Date( "2018-02-25T09:57:00Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 2 );

			Should( isValid( "name", new Date( "2018-02-25T09:57:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 3 );

			Should( isValid( "name", new Date( "2018-02-26T08:57:01Z" ), definition, collector ) ).be.undefined();
			collector.should.have.size( 4 );
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

		test( "returns any provided timestamp as string formatted in compliance with ISO-8601", function() {
			[
				new Date( "2018-02-25" ),
				new Date( "2018-02-25T08:57:01Z" ),
			]
				.forEach( string => {
					serialize( string ).should.be.String().and.match( DateUtilities.ptnISO8601 );
				} );
		} );

		test( "returns `null` on providing any other value", function() {
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
					Should( serialize( value ) ).be.null();
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
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "eq" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "eq" ).should.be.false();
			compare( null, NaN, "eq" ).should.be.false();
			compare( NaN, null, "eq" ).should.be.false();

			compare( null, new Date( "2018-02-25T08:57:01Z" ), "noteq" ).should.be.true();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "noteq" ).should.be.true();
			compare( null, NaN, "noteq" ).should.be.true();
			compare( NaN, null, "noteq" ).should.be.true();
		} );

		test( "returns `true` on negating `null`", function() {
			compare( null, null, "not" ).should.be.true();
		} );

		test( "returns `true` on negating falsy coerced value", function() {
			compare( NaN, null, "not" ).should.be.true();
		} );

		test( "returns `false` on negating truthy coerced value", function() {
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "not" ).should.be.false();
			compare( new Date( "2018-02-25" ), null, "not" ).should.be.false();
			compare( new Date( "1970-01-01T00:00:00Z" ), null, "not" ).should.be.false();
			compare( new Date( "1970-01-01T00:00:00" ), null, "not" ).should.be.false();
		} );

		test( "detects two coerced equal values", function() {
			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:01Z" ), "eq" ).should.be.true();

			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:01Z" ), "noteq" ).should.be.false();
		} );

		test( "detects two coerced inequal values", function() {
			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:00Z" ), "eq" ).should.be.false();

			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:00Z" ), "noteq" ).should.be.true();
		} );

		test( "compares order of two coerced values", function() {
			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:00Z" ), "gt" ).should.be.true();
			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:00Z" ), "gte" ).should.be.true();
			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:01Z" ), "gt" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), new Date( "2018-02-25T08:57:01Z" ), "gte" ).should.be.true();

			compare( new Date( "2018-02-25T08:57:00Z" ), new Date( "2018-02-25T08:57:01Z" ), "lt" ).should.be.true();
			compare( new Date( "2018-02-25T08:57:00Z" ), new Date( "2018-02-25T08:57:01Z" ), "lte" ).should.be.true();
			compare( new Date( "2018-02-25T08:57:00Z" ), new Date( "2018-02-25T08:57:00Z" ), "lt" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:00Z" ), new Date( "2018-02-25T08:57:00Z" ), "lte" ).should.be.true();
		} );

		test( "returns `false` on comparing non-`null` value w/ `null`-value", function() {
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "gt" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "gte" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "gt" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "gte" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "lt" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "lte" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "lt" ).should.be.false();
			compare( new Date( "2018-02-25T08:57:01Z" ), null, "lte" ).should.be.false();
		} );

		test( "returns `false` on comparing `null` value w/ non-`null`-value", function() {
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "gt" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "gte" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "gt" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "gte" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "lt" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "lte" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "lt" ).should.be.false();
			compare( null, new Date( "2018-02-25T08:57:01Z" ), "lte" ).should.be.false();
		} );

		test( "supports unary operation testing for value being `null`", function() {
			compare( null, null, "null" ).should.be.true();

			compare( new Date( "2018-02-25T08:57:01Z" ), null, "null" ).should.be.false();
			compare( NaN, null, "null" ).should.be.false();
		} );

		test( "supports unary operation testing for value not being `null`", function() {
			compare( null, null, "notnull" ).should.be.false();

			compare( new Date( "2018-02-25T08:57:01Z" ), null, "notnull" ).should.be.true();
			compare( NaN, null, "notnull" ).should.be.true();
		} );
	} );
} );
