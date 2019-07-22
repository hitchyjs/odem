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
const uuid = require( "../../lib/utility/uuid" );

const Index = require( "../../lib/index/index" );

suite( "Index", function() {
	const uuids = new Array( 6 );
	before( "generating uuids", function() {
		const Promises = new Array( 6 );
		for( let i = 0; i < 6; i++ ) {
			Promises[i] = uuid().then( uuid => {
				uuids[i] = uuid;
			} );
		}
		return Promise.all( Promises );
	} );

	test( "is exposed`", function() {
		Should( Index ).be.ok();
	} );

	test( "can be used to create instance", function() {
		( () => new Index() ).should.not.throw();
	} );

	test( "exposes instance methods", function() {
		const instance = new Index();
		instance.should.have.property( "add" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "find" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "delete" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "findBetween" ).which.is.a.Function().of.length( 0 );
	} );

	suite( "returns 0 or 1 when on invoking insert", function() {
		const instance = new Index();
		test( "0 if new index entry was added", () => {
			instance.add( 1, uuids[1] ).should.be.equal( 1 );
		} );

		test( "1 if existing index entry was modified", () => {
			instance.add( 1, uuids[2] ).should.be.equal( 0 );
		} );
	} );

	suite( "find", function() {
		const instance = new Index();
		before( "", function() {
			instance.add( 2, uuids[3] );
			instance.add( 2, uuids[4] );
		} );
		test( "returns generator on invoking " ,function f() {
			const gen = instance.find( 2 );
			gen.should.be.a.Function();
		} );
		test( "that returns values in ascending order", function() {
			const gen = instance.find( 2 );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[4] );
		} );

		test( "that can return values in descending order", function() {
			const gen = instance.find( 2, true );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[3] );
		} );
	} );

	suite( "findBetween", function() {
		const instance = new Index();
		before( "", function() {
			instance.add( 1, uuids[1] );
			instance.add( 2, uuids[2] );
			instance.add( 2, uuids[3] );
			instance.add( 4, uuids[4] );
			instance.add( 4, uuids[5] );
		} );
		test( "returns generator on invoking " ,function f() {
			const gen = instance.findBetween( { lowerLimit: 0, upperLimit: 6 } );
			gen.should.be.a.Function();
		} );
		test( "that returns values in ascending order", function() {
			const gen = instance.findBetween();
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[1] );
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[5] );
		} );
		test( "that returns values in a range", function() {
			const gen = instance.findBetween( { lowerLimit: 2, upperLimit: 6 } );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[5] );
		} );
		test( "that returns values in descending order", function() {
			const gen = instance.findBetween( { descending: true } );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[5] );
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[1] );
		} );
		test( "that returns values in a range in descending order", function() {
			const gen = instance.findBetween( { lowerLimit: 1, upperLimit: 3, descending: true } );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[1] );
		} );
	} );

	suite( "delete", function() {
		const instance = new Index();
		before( "", function() {
			instance.add( 1,uuids[1] );
			instance.add( 2,uuids[2] );
			instance.add( 2,uuids[3] );
			instance.add( 4,uuids[4] );
			instance.add( 4,uuids[5] );
		} );
		test( "returns 0 or 1 on invoke", function() {
			instance.delete( 4,uuids[5] ).should.be.equal( 1 );
			instance.delete( 4,uuids[5] ).should.be.equal( 0 );
			instance.delete( 5,uuids[5] ).should.be.equal( 0 );
		} );
		test( "deletes entry from index with multiple entrie", function() {
			instance.delete( 2, uuids[3] );
			const gen = instance.find( 2 )();
			gen.next().value[0].should.be.equal( uuids[2] );
			Should( gen.next().value ).be.undefined();
		} );
		test( "deletes index if value is empty", function() {
			instance.delete( 1, uuids[1] );
			const gen = instance.find( 1 )();
			Should( gen.next().value ).be.undefined();
		} );
	} );
} );
