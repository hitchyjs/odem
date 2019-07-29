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
const uuid = require( "../../lib/utility/uuid" );

const Index = require( "../../lib/index/index" );

describe( "Index", function() {
	const uuids = new Array( 6 );

	before( "generating uuids", function() {
		const Promises = new Array( 6 );
		for( let i = 0; i < 6; i++ ) {
			Promises[i] = uuid().then( _uuid => {
				uuids[i] = _uuid;
			} );
		}

		return Promise.all( Promises );
	} );

	it( "is exposed`", function() {
		Should( Index ).be.ok();
	} );

	it( "can be used to create instance", function() {
		( () => new Index( { revision: 0 } ) ).should.not.throw();
	} );

	it( "exposes instance methods", function() {
		const instance = new Index( { revision: 0 } );
		instance.should.have.property( "add" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "find" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "findBetween" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "checkRevision" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "reOrg" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "updateIndex" ).which.is.a.Function().of.length( 3 );
	} );

	describe( "returns 0 or 1 when on invoking insert", function() {
		const instance = new Index( { revision: 0 } );
		it( "1 if new index entry was added", () => {
			instance.add( uuids[1], 1 ).should.be.equal( 1 );
		} );

		it( "1 if existing index entry was modified", () => {
			instance.add( uuids[2],1 ).should.be.equal( 1 );
		} );

		it( "0 if existing index entry allready contained the value", () => {
			instance.add( uuids[2],1 ).should.be.equal( 0 );
		} );
	} );

	describe( "find", function() {
		const instance = new Index( { revision: 0 } );
		before( "", function() {
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 2 );
		} );
		it( "returns generator on invoking " ,function f() {
			const gen = instance.find( 2 );
			gen.should.be.a.Function();
		} );
		it( "that returns values in ascending order", function() {
			const gen = instance.find( 2 );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[4] );
		} );

		it( "that can return values in descending order", function() {
			const gen = instance.find( 2, true );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[3] );
		} );
	} );

	describe( "findBetween", function() {
		const instance = new Index( { revision: 0 } );
		before( "", function() {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );
		} );
		it( "returns generator on invoking " ,function f() {
			const gen = instance.findBetween( { lowerLimit: 0, upperLimit: 6 } );
			gen.should.be.a.Function();
		} );
		it( "that returns values in ascending order", function() {
			const gen = instance.findBetween();
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[1] );
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[5] );
		} );
		it( "that returns values in a range", function() {
			const gen = instance.findBetween( { lowerLimit: 2, upperLimit: 6 } );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[5] );
		} );
		it( "that returns values in descending order", function() {
			const gen = instance.findBetween( { descending: true } );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[5] );
			generator.next().value[0].should.be.equal( uuids[4] );
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[1] );
		} );
		it( "that returns values in a range in descending order", function() {
			const gen = instance.findBetween( { lowerLimit: 1, upperLimit: 3, descending: true } );
			const generator = gen();
			generator.next().value[0].should.be.equal( uuids[3] );
			generator.next().value[0].should.be.equal( uuids[2] );
			generator.next().value[0].should.be.equal( uuids[1] );
		} );
	} );

	describe( "remove", function() {
		const instance = new Index( { revision: 0 } );
		before( "", function() {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );
		} );
		it( "returns 0 or 1 on invoke", function() {
			instance.remove( uuids[5], 4 ).should.be.equal( 1 );
			instance.remove( uuids[5], 4 ).should.be.equal( 0 );
			instance.remove( uuids[5], 5 ).should.be.equal( 0 );
		} );
		it( "removes entry from index with multiple entries", function() {
			instance.remove( uuids[3], 2 );
			const gen = instance.find( 2 )();
			gen.next().value[0].should.be.equal( uuids[2] );
			Should( gen.next().value ).be.undefined();
		} );
		it( "removes index if value is empty", function() {
			instance.remove( uuids[1],1 );
			const gen = instance.find( 1 )();
			Should( gen.next().value ).be.undefined();
		} );
	} );

	describe( "checkRevision", function() {
		describe( "Index can be constructed with revision", function() {
			const instanceWithRevision = new Index( { revision: 10 } );
			Should( instanceWithRevision.revision ).be.equal( 10 );
			it( "does not throw if right revision is used", function() {
				instanceWithRevision.checkRevision( 10 );
				Should( () => instanceWithRevision.checkRevision() ).not.throw();
			} );
			it( "does throw if wrong revision is used", function() {
				Should( () => instanceWithRevision.checkRevision( 11 ) ).throw();
				Should( () => instanceWithRevision.checkRevision( 9 ) ).throw();
			} );
			it( "can be used to update revision", function() {
				Should( instanceWithRevision.checkRevision( 11, true ) ).not.throw();
				Should( instanceWithRevision.checkRevision( 11 ) ).not.throw();
			} );
			it( "does throw if update value is not exactly 1 bigger ", function() {
				Should( () => instanceWithRevision.checkRevision( 11.2, true ) ).not.throw();
				Should( () => instanceWithRevision.checkRevision( 13 ) ).throw();
			} );
		} );
	} );

	describe( "reOrg", function() {
		const instance = new Index( { revision: 0 } );
		const instanceWithRevision = new Index( { revision: 10 } );
		before( "filling instances with values", function() {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );

			instanceWithRevision.add( uuids[1], 1 );
			instanceWithRevision.add( uuids[2], 2 );
			instanceWithRevision.add( uuids[3], 2 );
			instanceWithRevision.add( uuids[4], 4 );
			instanceWithRevision.add( uuids[5], 4 );
		} );

		it( "with revision", function() {
			[].concat( ...instanceWithRevision.tree.values ).length.should.be.equal( 5 );
			Should( instanceWithRevision.revision ).be.eql( 10 );
			instanceWithRevision.reOrg( instanceWithRevision.revision );
			instanceWithRevision.tree.values.length.should.be.equal( 0 );
			Should( instanceWithRevision.revision ).be.eql( 10 );
			instanceWithRevision.reOrg( 12 );
			instanceWithRevision.tree.values.length.should.be.equal( 0 );
			Should( instanceWithRevision.revision ).be.eql( 12 );
		} );
	} );

	describe( "update", function() {
		const instance = new Index( { revision: 0 } );
		before( "", function() {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
		} );
		it( "should throw error if item is not in index",function() {
			Should( () => instance.updateIndex( uuids[2], 1, 1 ) ).throw();
		} );
		it( "updates index if oldIndex and newIndex are valid", function() {
			instance.updateIndex( uuids[2], 2, 1 );
			const gen = instance.find( 1 )();
			Should( gen.next().value[0] ).eql( uuids[1] );
			Should( gen.next().value[0] ).eql( uuids[2] );
		} );
	} );
} );
