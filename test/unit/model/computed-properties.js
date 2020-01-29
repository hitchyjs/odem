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


const { describe, it, before, beforeEach } = require( "mocha" );
require( "should" );

const { fakeApi } = require( "../helper" );


describe( "A computed property", () => {
	let Model;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model } = s ); } ) );

	describe( "without index and while depending on an actual property", () => {
		let MyModel;

		beforeEach( () => {
			MyModel = Model.define( "MyModel", {
				props: {
					state: {},
				},
				computed: {
					spoolAction() {
						switch ( this.state ) {
							case "printing" :
								return "print";
							case "print-cancelling" :
								return "cancel";
							case "deleting" :
								return "delete";
							default :
								return null;
						}
					}
				},
			} );
		} );

		beforeEach( () => MyModel.adapter.purge() );

		it( "can be defined", () => {
			MyModel.prototype.should.be.instanceOf( Model );
		} );

		it( "can be read", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( items => {
					items[0].spoolAction.should.be.equal( "print" );
					items[1].spoolAction.should.be.equal( "cancel" );
					items[2].spoolAction.should.be.equal( "delete" );
					( items[3].spoolAction == null ).should.be.true();
					( items[4].spoolAction == null ).should.be.true();
					( items[5].spoolAction == null ).should.be.true();
					( items[6].spoolAction == null ).should.be.true();
				} );
		} );

		it( "can be listed", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( () => MyModel.list() )
				.then( items => {
					const values = items.map( item => item.spoolAction );
					const setValues = values.filter( i => i != null );
					const unsetValues = values.filter( i => i == null );

					setValues.sort( ( l, r ) => l.localeCompare( r ) );

					setValues.should.have.length( 3 );
					setValues.should.be.deepEqual( [ "cancel", "delete", "print" ] );
					unsetValues.should.have.length( 4 );
				} );
		} );

		it( "can be searched for notnull values", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( () => MyModel.find( { notnull: { name: "spoolAction" } } ) )
				.then( items => {
					const values = items.map( item => item.spoolAction );
					const setValues = values.filter( i => i != null );
					const unsetValues = values.filter( i => i == null );

					setValues.sort( ( l, r ) => l.localeCompare( r ) );

					setValues.should.have.length( 3 );
					setValues.should.be.deepEqual( [ "cancel", "delete", "print" ] );
					unsetValues.should.have.length( 0 );
				} );
		} );

		it( "can be searched for null values", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( () => MyModel.find( { null: { name: "spoolAction" } } ) )
				.then( items => {
					const values = items.map( item => item.spoolAction );
					const setValues = values.filter( i => i != null );
					const unsetValues = values.filter( i => i == null );

					setValues.sort( ( l, r ) => l.localeCompare( r ) );

					setValues.should.have.length( 0 );
					unsetValues.should.have.length( 4 );
				} );
		} );
	} );

	describe( "with index and while depending on an actual property", () => {
		let MyModel;

		beforeEach( () => {
			MyModel = Model.define( "MyModel", {
				props: {
					state: {},
				},
				computed: {
					spoolAction() {
						switch ( this.state ) {
							case "printing" :
								return "print";
							case "print-cancelling" :
								return "cancel";
							case "deleting" :
								return "delete";
							default :
								return null;
						}
					}
				},
				indices: {
					spoolAction: { propertyType: "string" },
				},
			} );
		} );

		beforeEach( () => MyModel.adapter.purge() );

		it( "can be defined", () => {
			MyModel.prototype.should.be.instanceOf( Model );
		} );

		it( "can be read", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( items => {
					items[0].spoolAction.should.be.equal( "print" );
					items[1].spoolAction.should.be.equal( "cancel" );
					items[2].spoolAction.should.be.equal( "delete" );
					( items[3].spoolAction == null ).should.be.true();
					( items[4].spoolAction == null ).should.be.true();
					( items[5].spoolAction == null ).should.be.true();
					( items[6].spoolAction == null ).should.be.true();
				} );
		} );

		it( "can be listed", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( () => MyModel.list() )
				.then( items => {
					const values = items.map( item => item.spoolAction );
					const setValues = values.filter( i => i != null );
					const unsetValues = values.filter( i => i == null );

					setValues.sort( ( l, r ) => l.localeCompare( r ) );

					setValues.should.have.length( 3 );
					setValues.should.be.deepEqual( [ "cancel", "delete", "print" ] );
					unsetValues.should.have.length( 4 );
				} );
		} );

		it( "can be searched for notnull values", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( () => MyModel.find( { notnull: { name: "spoolAction" } } ) )
				.then( items => {
					const values = items.map( item => item.spoolAction );
					const setValues = values.filter( i => i != null );
					const unsetValues = values.filter( i => i == null );

					setValues.sort( ( l, r ) => l.localeCompare( r ) );

					setValues.should.have.length( 3 );
					setValues.should.be.deepEqual( [ "cancel", "delete", "print" ] );
					unsetValues.should.have.length( 0 );
				} );
		} );

		it( "can be searched for null values", () => {
			return Promise.all( [
				"printing", "print-cancelling", "deleting", "something", "nothing", "", null
			].map( state => {
				const item = new MyModel();
				item.state = state;
				return item.save();
			} ) )
				.then( () => MyModel.find( { null: { name: "spoolAction" } } ) )
				.then( items => {
					const values = items.map( item => item.spoolAction );
					const setValues = values.filter( i => i != null );
					const unsetValues = values.filter( i => i == null );

					setValues.sort( ( l, r ) => l.localeCompare( r ) );

					setValues.should.have.length( 0 );
					unsetValues.should.have.length( 4 );
				} );
		} );
	} );
} );
