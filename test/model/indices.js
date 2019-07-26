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

/* eslint-disable max-nested-callbacks */


const { describe, it, before } = require( "mocha" );
const PromiseUtil = require( "promise-essentials" );
const uuid = require( "../../lib/utility/uuid" );
const process = require( "process" );
require( "should" );

const { Model } = require( "../../" );


describe( "A model-related index", () => {
	it( "can be omitted", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {},
				b: {},
			},
		} );

		MyModel.indices.should.be.Array().which.is.empty();
	} );

	it( "can be defined on a single property of model", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: "eq" },
				b: {},
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 1 );
	} );

	it( "is described by its property's name and selected operation", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: "eq" },
				b: {},
			},
		} );

		MyModel.indices[0].should.be.Object().which.is.deepEqual( { property: "a", type: "eq" } );
	} );

	it( "can be defined using single-item array listing sole operation", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: ["eq"] },
				b: {},
			},
		} );

		MyModel.indices[0].should.be.Object().which.is.deepEqual( { property: "a", type: "eq" } );
	} );

	[ [], null, undefined, 0, "", false ].forEach( value => {
		it( `is ignoring index definitions using ${value === "" ? "empty string" : Array.isArray( value ) ? "[]" : String( value )} for index type`, () => {
			const MyModel = Model.define( "MyModel", {
				props: {
					a: { index: value },
					b: {},
				},
			} );

			MyModel.indices.should.be.Array().which.is.empty();
		} );
	} );

	[ [true], 1, true, "arbitrary string" ].forEach( value => {
		it( `is rejecting index definition using ${Array.isArray( value ) ? "[true]" : String( value )} for index type`, () => {
			( () => Model.define( "MyModel", {
				props: {
					a: { index: value },
					b: {},
				},
			} ) ).should.throw( TypeError );
		} );
	} );

	it( "can be defined multiple times on same property", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: [ "eq", "neq" ] },
				b: {},
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );
		MyModel.indices[0].should.be.Object().which.is.deepEqual( { property: "a", type: "eq" } );
		MyModel.indices[1].should.be.Object().which.is.deepEqual( { property: "a", type: "neq" } );
	} );

	it( "rejects definition of multiple indices per property using same type of index", () => {
		( () => Model.define( "MyModel", {
			props: {
				a: { index: [ "eq", "eq" ] },
				b: {},
			},
		} ) ).should.throw( TypeError );
	} );

	it( "can be defined multiple times on separate properties", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: "eq" },
				b: { index: "neq" },
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );
		MyModel.indices[0].should.be.Object().which.is.deepEqual( { property: "a", type: "eq" } );
		MyModel.indices[1].should.be.Object().which.is.deepEqual( { property: "b", type: "neq" } );
	} );

	it( "can be defined multiple times on separate properties using same type for different properties", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: "eq" },
				b: { index: "eq" },
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );
		MyModel.indices[0].should.be.Object().which.is.deepEqual( { property: "a", type: "eq" } );
		MyModel.indices[1].should.be.Object().which.is.deepEqual( { property: "b", type: "eq" } );
	} );

	describe( "can be index a properties using type eq", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				index: { index: "eq", type: "integer" },
				noIndex: { type: "integer" },
				num: { type: "integer" },
				value: {},
			},
		} );
		[ 1, 2, 10, 100, 1000 ].forEach( mod => {
			describe( `using ${mod} different values for the index`, () => {
				const entries = new Array( 1000 );
				before( "", () => {
					for( let i = 0; i < 1000; i++ ) {
						Promises[i] = uuid().then( value => {
							entries[i] = {
								index: i % mod,
								number: i,
								value,
							};
						} );
					}
					return Promise.all( Promises );
				} );
				after( "clear", () => {
					MyModel.adapter.purge();
					MyModel.indices.forEach( index => index.handler.reOrg() );
				} );

				it( "filling the index", () => {
					return PromiseUtil.each( entries,
						( { index, number, value, } ) => {
							const item = new MyModel();
							item.index = index;
							item.noIndex = index;
							item.number = number;
							item.value = value;
							return item.save();
						} ).then( () => {
						MyModel.indices[0].handler.tree.values.length.should.eql( mod );
					} );

				} );

				describe( "list entries using index", () => {
					let memoryBefore;
					before( "saving memoryUsage", () => {
						memoryBefore = process.memoryUsage();
					} );
					after( "logging memoryUsage", () => {
						const memoryAfter = process.memoryUsage();
						console.log( {
							rss: memoryAfter.rss - memoryBefore.rss,
							heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
							heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
							external: memoryAfter.external - memoryBefore.external,
						} );
					} );
					it( "works", () => {
						// eslint-disable-next-line max-nested-callbacks
						return PromiseUtil.each( [ 0, Math.floor( mod / 2 ), mod - 1 ], value => {
							return MyModel.findByAttribute( "index", value, "eq" ).then( items => {
								items.length.should.be.eql( 1000 / mod );
							} );
						} );
					} );
				} );

				describe( "filling index from memory", () => {
					const NewModel = Model.define( "MyModel", {
						props: {
							index: { index: "eq", type: "integer" },
							noIndex: { type: "integer" },
							num: { type: "integer" },
							value: {},
						},
					} );
					let memoryBefore;
					before( "saving memoryUsage", () => {
						memoryBefore = process.memoryUsage();
					} );
					after( "logging memoryUsage", () => {
						const memoryAfter = process.memoryUsage();
						console.log( {
							rss: memoryAfter.rss - memoryBefore.rss,
							heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
							heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
							external: memoryAfter.external - memoryBefore.external,
						} );
					} );
					it( "works", () => {
						// eslint-disable-next-line max-nested-callbacks
						return PromiseUtil.each( [ 0, Math.floor( mod / 2 ), mod - 1 ], value => {
							return NewModel.findByAttribute( "index", value, "eq" ).then( items => {
								items.length.should.be.eql( 1000 / mod );
							} );
						} );
					} );
				} );

				describe( "list entries not using index", () => {
					let memoryBefore;
					before( "saving memoryUsage", () => {
						memoryBefore = process.memoryUsage();
					} );
					after( "logging memoryUsage", () => {
						const memoryAfter = process.memoryUsage();
						console.log( {
							rss: memoryAfter.rss - memoryBefore.rss,
							heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
							heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
							external: memoryAfter.external - memoryBefore.external,
						} );
					} );
					it( "works", () => {
						// eslint-disable-next-line max-nested-callbacks
						return PromiseUtil.each( [ 0, Math.floor( mod / 2 ), mod - 1 ], value => {
							return MyModel.findByAttribute( "noIndex", value, "eq" ).then( items => {
								items.length.should.be.eql( 1000 / mod );
							} );
						} );
					} );
				} );
			} );
		} );

		MyModel.indices.should.be.Array().which.has.length( 1 );
		MyModel.adapter.should.be.ok();

		const Promises = [];
		Promises.push( MyModel.indexLoaded.then( indices => indices[0].handler.should.be.ok() ) );
		Promises.push( MyModel.indexLoaded.then( indices => indices[0].handler.should.be.ok() ) );
		return Promise.all( Promises );
	} );
} );
