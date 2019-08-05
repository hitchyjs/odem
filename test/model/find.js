/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

/* eslint-disable max-nested-callbacks */

const { Model } = require( "../../" );

const PromiseUtil = require( "promise-essentials" );
const { describe, it, before, beforeEach, afterEach } = require( "mocha" );
require( "should" );



const NumRecords = 100;
const Integers = { from: -5000, to: 5000 };
const Numbers = { from: -5000000, to: 5000000 };
const TextSize = 20;
const Chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const Properties = [
	[ "fastInteger", "integers" ],
	[ "slowInteger", "integers" ],
	[ "fastNumber", "numbers" ],
	[ "slowNumber", "Numbers" ],
	[ "fastString", "texts" ],
	[ "slowString", "texts" ],
];



/**
 * Generates array of values using provided value generator.
 *
 * The resulting array is guaranteed to consist of different values, only.
 *
 * @param {function} generator generates next value to use
 * @returns {array} resulting set of data
 */
function fill( generator ) {
	const data = [];

	for ( let i = 0; i < NumRecords; i++ ) {
		const value = generator();
		if ( data.indexOf( value ) < 0 ) {
			data.push( value );
		} else {
			i--;
		}
	}

	return data;
}

/**
 * Detects if provided list of records is sorted.
 *
 * @param {Array} records records to be inspected
 * @param {boolean} up true if records are expected to be sorted in ascending order
 * @returns {boolean} true if records are sorted as expected
 */
function isSorted( records, up = true ) {
	let latest = NaN;

	for ( let i = 0, num = records.length; i < num; i++ ) {
		const value = records[i].index;

		if ( !isNaN( latest ) ) {
			if ( isNaN( value ) ) {
				throw new Error( "got NaN index" );
			}

			if ( !( up ? value > latest : value < latest ) ) {
				return false;
			}
		}

		latest = value;
	}

	return true;
}


/**
 * Detects if provided list of records is a straight sorted excerpt.
 *
 * @param {Array} records records to be inspected
 * @param {boolean} up true if records are expected to be sorted in ascending order
 * @returns {boolean} true if records are consecutive sorted excerpt as expected
 */
function isStraight( records, up = true ) {
	let latest = NaN;

	for ( let i = 0, num = records.length; i < num; i++ ) {
		const value = records[i].index;

		if ( !isNaN( latest ) ) {
			if ( isNaN( value ) ) {
				throw new Error( "got NaN index" );
			}

			if ( !( up ? value > latest : value < latest ) ) {
				return false;
			}
		}

		latest = value;
	}

	return true;
}

describe( "Inspecting collection of a model's items", function() {
	this.timeout( 5000 );

	// prepare data for feeding model
	const recordDriver = new Array( NumRecords ).fill( 0 );
	const textDriver = new Array( TextSize ).fill( 0 );

	const indexes = recordDriver.map( ( _, index ) => index );
	const integers = fill( () => Integers.from + Math.round( Math.random() * ( Integers.to - Integers.from ) ) );
	const numbers = fill( () => Numbers.from + ( Math.random() * ( Numbers.to - Numbers.from ) ) );
	const texts = fill( () => textDriver.map( () => Chars[Math.floor( Math.random() * Chars.length )] ).join( "" ) );
	const data = { integers, numbers, texts };

	indexes.sort( () => Math.round( Math.random() * 11 ) - 5 );
	integers.sort( ( l, r ) => l - r );
	numbers.sort( ( l, r ) => l - r );
	texts.sort( ( l, r ) => l.localeCompare( r ) );


	let MyModel;


	before( "create model", () => {
		MyModel = Model.define( "MyModel", {
			props: {
				index: { type: "integer" },
				slowInteger: { type: "integer" },
				fastInteger: { type: "integer", index: "eq" },
				slowNumber: { type: "number" },
				fastNumber: { type: "number", index: "eq" },
				slowString: { type: "string" },
				fastString: { type: "string", index: "eq" },
			},
		} );

		return MyModel.indexLoaded;
	} );

	beforeEach( "purging existing data", () => MyModel.adapter.purge() );

	beforeEach( "creating test data", () => {
		return PromiseUtil.each( recordDriver, ( _, index ) => {
			const i = indexes[index];
			const item = new MyModel;

			item.index = i;
			item.slowInteger = integers[i];
			item.fastInteger = integers[i];
			item.slowNumber = numbers[i];
			item.fastNumber = numbers[i];
			item.slowString = texts[i];
			item.fastString = texts[i];

			return item.save();
		} );
	} );

	afterEach( () => MyModel.adapter.purge() );


	it( "lists all generated records in unsorted order by default", () => {
		return MyModel.list()
			.then( records => {
				records.should.be.Array().which.has.length( NumRecords );

				isSorted( records ).should.be.false();
				isSorted( records, false ).should.be.false();

				isStraight( records ).should.be.false();
				isStraight( records, false ).should.be.false();
			} );
	} );

	[ 1, 2, 5, 10, 20, 34 ].forEach( limit => {
		[ 0, 1, 2, 5, 10, 20, 34 ].forEach( offset => {
			it( `lists excerpt of ${limit} record(s) of generated records in UNSORTED order, skipping ${offset} record(s)`, () => {
				return MyModel.list( { offset, limit } )
					.then( records => {
						records.should.be.Array().which.has.length( limit );

						isSorted( records ).should.be.false();
						isSorted( records, false ).should.be.false();

						isStraight( records ).should.be.false();
						isStraight( records, false ).should.be.false();
					} );
			} );
		} );
	} );

	Properties.forEach( ( [propertyName] ) => {
		[ 0, 1, 2, 5, 10, 20, 34 ].forEach( limit => {
			let lastUpStart = -Infinity;
			const lastDownStart = Infinity;

			[ 0, 1, 2, 5, 10, 20, 34 ].forEach( offset => {
				[ true, false ].forEach( dir => {
					it( `skips ${offset} record(s), then lists ${limit || "all left"} record(s) SORTED by ${propertyName} in ${dir ? "ascending" : "descending"} order on demand`, () => {
						return MyModel.list( { offset, limit: limit || Infinity, sortBy: propertyName, sortAscendingly: dir } )
							.then( records => {
								records.should.be.Array().which.has.length( limit || ( NumRecords - offset ) );

								isSorted( records ).should.be[dir ? "true" : "false"]();
								isSorted( records, false ).should.be[dir ? "false" : "true"]();

								isStraight( records ).should.be[dir ? "true" : "false"]();
								isStraight( records, false ).should.be[dir ? "false" : "true"]();

								records[0].index.should.not.be.equal( lastUpStart );
								lastUpStart = records[0].index;
							} );
					} );
				} );
			} );
		} );
	} );

	Properties.forEach( ( [ propertyName, dataName ] ) => {
		it( `retrieves single match when searching records with ${propertyName} equal every value used on filling database`, () => {
			const values = data[dataName];

			return PromiseUtil( values, value => MyModel.find( { eq: { [propertyName]: value } } )
				.then( records => {
					records.should.be.Array().which.has.length( 1 );
				} ) );
		} );
	} );

	Properties.forEach( ( [ propertyName, dataName ] ) => {
		it( `retrieves all but one record when searching records with ${propertyName} unequal every value used on filling database`, () => {
			const values = data[dataName];

			return PromiseUtil( values, value => MyModel.find( { neq: { [propertyName]: value } } )
				.then( records => {
					records.should.be.Array().which.has.length( NumRecords - 1 );
				} ) );
		} );
	} );

	Properties.forEach( ( [ propertyName, dataName ] ) => {
		it( `retrieves multiple matches when searching records with ${propertyName} less than high values used on filling database`, () => {
			const values = data[dataName].slice( Math.floor( data[dataName].length / 2 ) );

			return PromiseUtil( values, value => MyModel.find( { lt: { [propertyName]: value } } )
				.then( records => {
					records.should.be.Array();
					records.length.should.be.greaterThan( 1 );
				} ) );
		} );
	} );

	Properties.forEach( ( [ propertyName, dataName ] ) => {
		it( `retrieves multiple matches when searching records with ${propertyName} greater than high values used on filling database`, () => {
			const values = data[dataName].slice( 0, Math.floor( data[dataName].length / 2 ) );

			return PromiseUtil( values, value => MyModel.find( { gt: { [propertyName]: value } } )
				.then( records => {
					records.should.be.Array();
					records.length.should.be.greaterThan( 1 );
				} ) );
		} );
	} );

	Properties.forEach( ( [ propertyName, dataName ] ) => {
		it( `retrieves multiple matches when searching records with ${propertyName} between two distant values used on filling database`, () => {
			const lowers = data[dataName].slice( 0, Math.floor( data[dataName].length / 3 ) );
			const uppers = data[dataName].slice( Math.floor( data[dataName].length / 3 ) );
			const values = lowers.map( ( lower, i ) => [ lower, uppers[i] ] );

			return PromiseUtil( values, ( [ lower, upper ] ) => MyModel.find( { between: { [propertyName]: [ lower, upper ] } } )
				.then( records => {
					records.should.be.Array();
					records.length.should.be.greaterThan( 1 );
				} ) );
		} );
	} );

	Properties.forEach( ( [ propertyName, dataName ] ) => {
		it( `retrieves multiple matches when searching records with ${propertyName} between two distant values used on filling database using different operation syntax`, () => { // eslint-disable-line max-len
			const lowers = data[dataName].slice( 0, Math.floor( data[dataName].length / 3 ) );
			const uppers = data[dataName].slice( Math.floor( data[dataName].length / 3 ) );
			const values = lowers.map( ( lower, i ) => [ lower, uppers[i] ] );

			return PromiseUtil( values, ( [ lower, upper ] ) => MyModel.find( { between: { [propertyName]: { min: lower, max: upper } } } )
				.then( records => {
					records.should.be.Array();
					records.length.should.be.greaterThan( 1 );
				} ) );
		} );
	} );
} );
