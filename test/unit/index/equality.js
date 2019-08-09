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

const UUID = require( "../../../lib/utility/uuid" );
const EqualityIndex = require( "../../../lib/model/indexer/equality" );

describe( "EqualityIndex", () => {
	const uuids = new Array( 6 ).fill( null );

	before( () => Promise.all( uuids.map( ( _, i ) => UUID.create().then( _uuid => {
		uuids[i] = _uuid;
	} ) ) ) );

	it( "can be instantiated", () => {
		( () => new EqualityIndex( { revision: 0 } ) ).should.not.throw();
	} );

	it( "exposes instance methods", () => {
		const instance = new EqualityIndex( { revision: 0 } );

		instance.should.have.property( "find" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "findBetween" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "add" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "update" ).which.is.a.Function().of.length( 3 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "removeValue" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "clear" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "checkRevision" ).which.is.a.Function().of.length( 0 );
	} );

	describe( "exposes method find() which", () => {
		const instance = new EqualityIndex( { revision: 0 } );

		before( () => {
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 2 );
			instance.add( uuids[5], 4 );
		} );

		describe( "returns generator that", () => {
			it( "is a function", () => {
				const gen = instance.find( 2 );
				gen.should.be.a.Function();
			} );

			it( "doesn't yield any UUID when searching for untracked/unused value", () => {
				const gen = instance.find( 3 ); // only 2 and 4 have been tracked
				const iterator = gen();

				iterator.next().done.should.be.true();
			} );

			it( "yields UUIDs of items with property matching searched value in same order as injected before", () => {
				const gen = instance.find( 2 );
				const iterator = gen();

				iterator.next().value.should.be.equal( uuids[3] );
				iterator.next().value.should.be.equal( uuids[4] );
				iterator.next().done.should.be.true();
			} );
		} );
	} );

	describe( "exposes method add() which", () => {
		const instance = new EqualityIndex( { revision: 0 } );

		it( "adds given UUID to list attached to tree node matching given property value", () => {
			instance.tree.should.have.length( 0 );

			instance.add( uuids[1], 1 );

			instance.tree.should.have.length( 1 );

			instance.add( uuids[2], 2 );

			instance.tree.should.have.length( 2 );

			instance.add( uuids[3], 2 );

			instance.tree.should.have.length( 2 ); // adding for value 2 again didn't create new tree node

			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );

			instance.tree.should.have.length( 3 );

			instance.tree.find( 1 ).value.should.be.Array().which.is.deepEqual( [uuids[1]] );
			instance.tree.find( 2 ).value.should.be.Array().which.is.deepEqual( [uuids[2], uuids[3]] );
			instance.tree.find( 4 ).value.should.be.Array().which.is.deepEqual( [uuids[4], uuids[5]] );
		} );
	} );

	describe( "exposes method findBetween() which", () => {
		const instance = new EqualityIndex( { revision: 0 } );

		before( () => {
			instance.add( uuids[0], 1 );
			instance.add( uuids[1], 2 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 4 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 5 );
		} );

		describe( "returns generator that", () => {
			it( "is a function", () => {
				const gen = instance.findBetween( {
					lowerLimit: 0,
					upperLimit: 6
				} );

				gen.should.be.a.Function();
			} );

			it( "yields UUIDs sorted in ascending order according to values of covered property", () => {
				const iterator = instance.findBetween()();

				iterator.next().value.should.be.equal( uuids[0] );
				iterator.next().value.should.be.equal( uuids[1] );
				iterator.next().value.should.be.equal( uuids[2] );
				iterator.next().value.should.be.equal( uuids[3] );
				iterator.next().value.should.be.equal( uuids[4] );
				iterator.next().value.should.be.equal( uuids[5] );
				iterator.next().done.should.be.true();
			} );

			it( "yields UUIDs sorted in descending order according to values of covered property, but in 'ascending' order for items of same value", () => {
				const iterator = instance.findBetween( { descending: true } )();

				iterator.next().value.should.be.equal( uuids[5] );
				iterator.next().value.should.be.equal( uuids[3] );
				iterator.next().value.should.be.equal( uuids[4] );
				iterator.next().value.should.be.equal( uuids[1] );
				iterator.next().value.should.be.equal( uuids[2] );
				iterator.next().value.should.be.equal( uuids[0] );
				iterator.next().done.should.be.true();
			} );

			it( "limits yielded UUIDs to items with indexed property's value above some limit", () => {
				const iterator = instance.findBetween( {
					lowerLimit: 2,
				} )();

				iterator.next().value.should.be.equal( uuids[1] );
				iterator.next().value.should.be.equal( uuids[2] );
				iterator.next().value.should.be.equal( uuids[3] );
				iterator.next().value.should.be.equal( uuids[4] );
				iterator.next().value.should.be.equal( uuids[5] );
				iterator.next().done.should.be.true();
			} );

			it( "limits yielded UUIDs to items with indexed property's value below some limit", () => {
				const iterator = instance.findBetween( {
					upperLimit: 2,
				} )();

				iterator.next().value.should.be.equal( uuids[0] );
				iterator.next().value.should.be.equal( uuids[1] );
				iterator.next().value.should.be.equal( uuids[2] );
				iterator.next().done.should.be.true();
			} );

			it( "limits yielded UUIDs to items with indexed property's value between two limits", () => {
				const iterator = instance.findBetween( {
					lowerLimit: 2,
					upperLimit: 4
				} )();

				iterator.next().value.should.be.equal( uuids[1] );
				iterator.next().value.should.be.equal( uuids[2] );
				iterator.next().value.should.be.equal( uuids[3] );
				iterator.next().value.should.be.equal( uuids[4] );
				iterator.next().done.should.be.true();
			} );
		} );
	} );

	describe( "exposes method remove() which", () => {
		const instance = new EqualityIndex( { revision: 0 } );

		before( () => {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );
		} );

		it( "returns true when successfully removing provided UUID", () => {
			instance.remove( uuids[1] ).should.be.equal( true );
		} );

		it( "returns false when provided UUID wasn't found", () => {
			instance.remove( uuids[1] ).should.be.equal( false );
		} );

		it( "removes UUID from node referring to multiple items", () => {
			instance.tree.find( 2 ).value.should.be.Array().which.has.length( 2 );

			instance.remove( uuids[3] );

			instance.tree.find( 2 ).value.should.be.Array().which.has.length( 1 );
		} );
	} );

	describe( "exposes method removeValue() which", () => {
		const instance = new EqualityIndex( { revision: 0 } );

		before( () => {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );
		} );

		it( "returns false when trying to remove an existing UUID combined with wrong value", () => {
			instance.removeValue( uuids[1], 2 ).should.be.equal( false );
		} );

		it( "returns true when successfully removing provided UUID combined with proper value", () => {
			instance.removeValue( uuids[1], 1 ).should.be.equal( true );
		} );

		it( "returns false when provided UUID wasn't found", () => {
			instance.removeValue( uuids[1], 1 ).should.be.equal( false );
		} );

		it( "removes UUID from node referring to multiple items", () => {
			instance.tree.find( 2 ).value.should.be.Array().which.has.length( 2 );

			instance.removeValue( uuids[3], 2 );

			instance.tree.find( 2 ).value.should.be.Array().which.has.length( 1 );
		} );
	} );

	describe( "exposes method checkRevision() which", () => {
		let instanceWithRevision;

		before( () => {
			instanceWithRevision = new EqualityIndex( { revision: 10 } );
		} );

		it( "does not throw if checked revision is met by index", () => {
			Should( () => instanceWithRevision.checkRevision( 10 ) ).not.throw();
		} );

		it( "throws if checked revision is immediate predecessor/successor of revision of index", () => {
			Should( () => instanceWithRevision.checkRevision( 11 ) ).throw();
			Should( () => instanceWithRevision.checkRevision( 9 ) ).throw();
		} );

		it( "accepts new revision on demand", () => {
			Should( () => instanceWithRevision.checkRevision( 11, true ) ).not.throw();
			Should( () => instanceWithRevision.checkRevision( 11 ) ).not.throw();
		} );

		it( "accepts 'switching' to same revision as current one on demand", () => {
			instanceWithRevision.checkRevision( 11 );

			Should( () => instanceWithRevision.checkRevision( 11, true ) ).not.throw();
		} );

		it( "rejects non-integer revision for update", () => {
			Should( () => instanceWithRevision.checkRevision( null, true ) ).throw();
			Should( () => instanceWithRevision.checkRevision( "test", true ) ).throw();
			Should( () => instanceWithRevision.checkRevision( 11.1, true ) ).throw();
		} );

		it( "rejects new revision which isn't immediate successor to current one", () => {
			instanceWithRevision.checkRevision( 11 );

			Should( () => instanceWithRevision.checkRevision( 13, true ) ).throw();
			Should( () => instanceWithRevision.checkRevision( 10, true ) ).throw();
		} );
	} );

	describe( "exposes method clear() which", () => {
		const instance = new EqualityIndex( { revision: 0 } );
		const instanceWithAdvancedRevision = new EqualityIndex( { revision: 10 } );

		before( () => {
			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
			instance.add( uuids[3], 2 );
			instance.add( uuids[4], 4 );
			instance.add( uuids[5], 4 );

			instanceWithAdvancedRevision.add( uuids[1], 1 );
			instanceWithAdvancedRevision.add( uuids[2], 2 );
			instanceWithAdvancedRevision.add( uuids[3], 2 );
			instanceWithAdvancedRevision.add( uuids[4], 4 );
			instanceWithAdvancedRevision.add( uuids[5], 4 );
		} );

		it( "throws when invoked with improper revision to start with afterwards", () => {
			( () => instanceWithAdvancedRevision.clear( null ) ).should.throw( TypeError );
			( () => instanceWithAdvancedRevision.clear( "test" ) ).should.throw( TypeError );
			( () => instanceWithAdvancedRevision.clear( "" ) ).should.throw( TypeError );
			( () => instanceWithAdvancedRevision.clear( [] ) ).should.throw( TypeError );
			( () => instanceWithAdvancedRevision.clear( {} ) ).should.throw( TypeError );
		} );

		it( "succeeds when invoked with new revision to start with afterwards", () => {
			instanceWithAdvancedRevision.tree.should.have.length( 3 );
			Should( instanceWithAdvancedRevision.revision ).be.eql( 10 );

			( () => instanceWithAdvancedRevision.clear( 10 ) ).should.not.throw();

			instanceWithAdvancedRevision.tree.should.have.length( 0 );
			Should( instanceWithAdvancedRevision.revision ).be.eql( 10 );

			( () => instanceWithAdvancedRevision.clear( 12 ) ).should.not.throw();

			instanceWithAdvancedRevision.tree.should.have.length( 0 );
			Should( instanceWithAdvancedRevision.revision ).be.eql( 12 );
		} );

		it( "accepts to start over if 'earlier' revision", () => {
			Should( instanceWithAdvancedRevision.revision ).be.eql( 12 );

			( () => instanceWithAdvancedRevision.clear( 5 ) ).should.not.throw();

			Should( instanceWithAdvancedRevision.revision ).be.eql( 5 );
		} );

		it( "accepts to start over with current revision implicitly", () => {
			Should( instanceWithAdvancedRevision.revision ).be.eql( 5 );

			( () => instanceWithAdvancedRevision.clear() ).should.not.throw();

			Should( instanceWithAdvancedRevision.revision ).be.eql( 5 );
		} );
	} );

	describe( "exposes method update() which", () => {
		let instance;

		before( () => {
			instance = new EqualityIndex( { revision: 0 } );

			instance.add( uuids[1], 1 );
			instance.add( uuids[2], 2 );
		} );

		it( "throws if item's UUID is not found in index", () => {
			Should( () => instance.update( uuids[3], 2, 1 ) ).throw();
		} );

		it( "throws if item's UUID is found in context of currently mismatching property value", () => {
			Should( () => instance.update( uuids[2], 1, 2 ) ).throw();
		} );

		it( "updates index when invoked with valid current and future value", () => {
			let iterator = instance.find( 1 )();

			iterator.next().value.should.eql( uuids[1] );
			iterator.next().done.should.be.true();

			instance.update( uuids[2], 2, 1 );

			iterator = instance.find( 1 )();

			iterator.next().value.should.eql( uuids[1] );
			iterator.next().value.should.eql( uuids[2] );
			iterator.next().done.should.be.true();
		} );
	} );

	describe( "tracks items with indexed property currently unset, thus it", () => {
		let instance;

		beforeEach( () => {
			instance = new EqualityIndex( {
				revision: 0,
				compare: ( l, r ) => ( l === r ? 0 : l < r ? -1 : 1 ),
			} );
		} );

		it( "exposes a separate list of unset UUIDs named 'nullItems'", () => {
			instance.nullItems.should.be.an.Array().which.has.length( 0 );
		} );

		it( "populates the 'nullItems' list when adding UUID of item with property value 'null'", () => {
			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 0 );

			instance.add( uuids[0], null );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );
		} );

		it( "populates the 'nullItems' list when adding UUID of item with property value 'undefined'", () => {
			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 0 );

			instance.add( uuids[1], undefined );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );
		} );

		it( "does not populate the 'nullItems' list when adding UUID of item with falsy property value different from 'null' or 'undefined'", () => {
			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 0 );

			instance.add( uuids[1], false );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 1 );

			instance.add( uuids[1], "" );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 2 );

			instance.add( uuids[1], 0 );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 3 );
		} );

		it( "finds entry in nullIndex", () => {
			instance.add( uuids[0], null );

			const iterator = instance.find( null )();

			iterator.next().value.should.be.eql( uuids[0] );
			iterator.next().done.should.be.true();
		} );

		it( "moves UUID from 'nullItems' list to tree node when updating related value from null to non-null", () => {
			instance.add( uuids[0], null );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );

			instance.update( uuids[0], null, 1 );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 1 );
		} );

		it( "moves UUID from 'nullItems' list to tree node when updating related value from undefined to non-undefined", () => {
			instance.add( uuids[0], undefined );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );

			instance.update( uuids[0], undefined, 1 );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 1 );
		} );

		it( "doesn't distinguish between 'null' and 'undefined' as values", () => {
			instance.add( uuids[0], undefined );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );

			instance.update( uuids[0], undefined, null );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );

			instance.update( uuids[0], undefined, 1 );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 1 );
		} );

		it( "removes UUID with explicitly provided value null", () => {
			instance.add( uuids[0], null );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );

			instance.removeValue( uuids[0], null );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 0 );
		} );

		it( "removes entry without explicitly provided value null", () => {
			instance.add( uuids[0], null );

			instance.nullItems.should.have.length( 1 );
			instance.tree.should.have.length( 0 );

			instance.remove( uuids[0] );

			instance.nullItems.should.have.length( 0 );
			instance.tree.should.have.length( 0 );
		} );

		describe( "includes UUIDs tracked there on demand when using method findBetween() which", () => {
			beforeEach( () => {
				instance.add( uuids[0], 1 );
				instance.add( uuids[1], undefined );
				instance.add( uuids[2], 2 );
				instance.add( uuids[3], null );
				instance.add( uuids[4], 4 );
				instance.add( uuids[5], 5 );
			} );

			it( "doesn't yield 'nullItems' UUIDs at end when missing the explicit demand", () => {
				instance.nullItems.should.have.length( 2 );
				instance.tree.should.have.length( 4 );

				const iterator = instance.findBetween()();

				iterator.next().value.should.be.eql( uuids[0] );
				iterator.next().value.should.be.eql( uuids[2] );
				iterator.next().value.should.be.eql( uuids[4] );
				iterator.next().value.should.be.eql( uuids[5] );
				iterator.next().done.should.be.true();
			} );

			it( "yields 'nullItems' UUIDs at end when actually demanded", () => {
				instance.nullItems.should.have.length( 2 );
				instance.tree.should.have.length( 4 );

				const iterator = instance.findBetween( {
					appendNulItems: true,
				} )();

				iterator.next().value.should.be.eql( uuids[0] );
				iterator.next().value.should.be.eql( uuids[2] );
				iterator.next().value.should.be.eql( uuids[4] );
				iterator.next().value.should.be.eql( uuids[5] );
				iterator.next().value.should.be.eql( uuids[1] );
				iterator.next().value.should.be.eql( uuids[3] );
				iterator.next().done.should.be.true();
			} );

			it( "yields 'nullItems' UUIDs at end even when listing regular UUIDs in descending order of indexed property's values", () => {
				instance.nullItems.should.have.length( 2 );
				instance.tree.should.have.length( 4 );

				const iterator = instance.findBetween( {
					appendNulItems: true,
					descending: true,
				} )();

				iterator.next().value.should.be.eql( uuids[5] );
				iterator.next().value.should.be.eql( uuids[4] );
				iterator.next().value.should.be.eql( uuids[2] );
				iterator.next().value.should.be.eql( uuids[0] );
				iterator.next().value.should.be.eql( uuids[1] );
				iterator.next().value.should.be.eql( uuids[3] );
				iterator.next().done.should.be.true();
			} );
		} );
	} );
} );
