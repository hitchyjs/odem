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

const Path = require( "path" );

const { describe, it, before, after } = require( "mocha" );
require( "should" );
const PromiseUtils = require( "promise-essentials" );

const { Model, FileAdapter } = require( "../../../" );


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

		MyModel.indices[0].should.be.Object().and.have.size( 4 );
		MyModel.indices[0].property.should.be.eql( "a" );
		MyModel.indices[0].type.should.be.eql( "eq" );
		MyModel.indices[0].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[0].handler.should.be.Object();
	} );

	it( "can be defined using single-item array listing sole operation", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: ["eq"] },
				b: {},
			},
		} );

		MyModel.indices[0].should.be.Object().and.have.size( 4 );
		MyModel.indices[0].property.should.be.eql( "a" );
		MyModel.indices[0].type.should.be.eql( "eq" );
		MyModel.indices[0].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[0].handler.should.be.Object();
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

	[ [true], 1, "arbitrary string" ].forEach( value => {
		it( `is rejecting index definition using ${Array.isArray( value ) ? "[true]" : String( value )} for index type`, () => {
			( () => Model.define( "MyModel", {
				props: {
					a: { index: value },
					b: {},
				},
			} ) ).should.throw( TypeError );
		} );
	} );

	it( "can be defined multiple times on same property using different types", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: [ "eq", "gt" ] },
				b: {},
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );

		MyModel.indices[0].should.be.Object().and.have.size( 4 );
		MyModel.indices[0].property.should.be.eql( "a" );
		MyModel.indices[0].type.should.be.eql( "eq" );
		MyModel.indices[0].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[0].handler.should.be.Object();

		MyModel.indices[1].should.be.Object().and.have.size( 4 );
		MyModel.indices[1].property.should.be.eql( "a" );
		MyModel.indices[1].type.should.be.eql( "gt" );
		MyModel.indices[1].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[1].handler.should.be.Object();
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
				b: { index: "gt" },
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );

		MyModel.indices[0].should.be.Object().and.have.size( 4 );
		MyModel.indices[0].property.should.be.eql( "a" );
		MyModel.indices[0].type.should.be.eql( "eq" );
		MyModel.indices[0].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[0].handler.should.be.Object();

		MyModel.indices[1].should.be.Object().and.have.size( 4 );
		MyModel.indices[1].property.should.be.eql( "b" );
		MyModel.indices[1].type.should.be.eql( "gt" );
		MyModel.indices[1].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[1].handler.should.be.Object();
	} );

	it( "can be defined multiple times on separate properties using same type for different properties", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: "eq" },
				b: { index: "eq" },
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );

		MyModel.indices[0].should.be.Object().and.have.size( 4 );
		MyModel.indices[0].property.should.be.eql( "a" );
		MyModel.indices[0].type.should.be.eql( "eq" );
		MyModel.indices[0].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[0].handler.should.be.Object();

		MyModel.indices[1].should.be.Object().and.have.size( 4 );
		MyModel.indices[1].property.should.be.eql( "b" );
		MyModel.indices[1].type.should.be.eql( "eq" );
		MyModel.indices[1].$type.should.be.a.Function().with.length( 0 );
		MyModel.indices[1].handler.should.be.Object();
	} );

	describe( "for computed properties", () => {
		let MyModel;
		let uuids;

		beforeEach( () => {
			MyModel = Model.define( "MyModel", {
				props: {
					offset: { type: "integer" },
					label: {},
				},
				computed: {
					fromOffset() { return 1000 + this.offset; },
					fromLabel() { return "Hello " + this.label; },
				},
				indices: {
					fromOffset: true,
					fromLabel: {
						propertyType: "string",
					},
				},
			} );
		} );

		beforeEach( () => {
			return MyModel.adapter.purge().then( () => {
				uuids = [];

				return PromiseUtils.each( [
					[ 10, "John" ],
					[ 20, "jane" ],
					[ 35, "JosePH" ],
					[ 100, "JILL" ],
				], ( [ o, l ] ) => {
					const item = new MyModel();

					item.offset = o;
					item.label = l;

					return item.save()
						.then( savedItem => uuids.push( savedItem.$uuid ) );
				} );
			} );
		} );

		it( "tracks computed integer values", () => {
			const tree = MyModel.getIndex( "fromOffset" ).tree;

			tree.keys.should.be.containDeep( [ 1010, 1020, 1035, 1100 ] );
		} );

		it( "tracks computed string values", () => {
			const tree = MyModel.getIndex( "fromLabel" ).tree;

			tree.keys.should.be.containDeep( [ "Hello John", "Hello jane", "Hello JosePH", "Hello JILL" ] );
		} );

		it( "tracks change of computed property on saving", () => {
			const offsetIndex = MyModel.getIndex( "fromOffset" );
			const labelIndex = MyModel.getIndex( "fromLabel" );

			return new MyModel( uuids[0] ).load()
				.then( item => {
					offsetIndex.tree.keys.should.be.containDeep( [ 1010, 1020, 1035, 1100 ] );
					labelIndex.tree.keys.should.be.containDeep( [ "Hello John", "Hello jane", "Hello JosePH", "Hello JILL" ] );

					item.offset = 15;
					item.label = "Jack";

					offsetIndex.tree.keys.should.be.containDeep( [ 1010, 1020, 1035, 1100 ] );
					labelIndex.tree.keys.should.be.containDeep( [ "Hello John", "Hello jane", "Hello JosePH", "Hello JILL" ] );

					return item.save();
				} )
				.then( () => {
					offsetIndex.tree.keys.should.be.containDeep( [ 1015, 1020, 1035, 1100 ] );
					labelIndex.tree.keys.should.be.containDeep( [ "Hello Jack", "Hello jane", "Hello JosePH", "Hello JILL" ] );
				} );
		} );

		it( "can be used for sorting", () => {
			return MyModel.list( { sortBy: "fromLabel" }, { loadRecords: false } )
				.then( items => {
					// assumption: listing/searching w/ index works w/o loading records
					items.some( i => i.label != null ).should.be.false();

					return MyModel.list( { sortBy: "fromLabel", sortAscendingly: false }, { loadRecords: false } );
				} )
				.then( items => {
					// assumption: listing/searching w/o index required records to be loaded for inspection
					items.some( i => i.label != null ).should.be.false();

					return MyModel.list( { sortBy: "fromOffset" }, { loadRecords: false } );
				} )
				.then( items => {
					// assumption: listing/searching w/o index required records to be loaded for inspection
					items.some( i => i.label != null ).should.be.false();

					return MyModel.list( { sortBy: "fromOffset", sortAscendingly: false }, { loadRecords: false } );
				} )
				.then( items => {
					// assumption: listing/searching w/o index required records to be loaded for inspection
					items.some( i => i.label != null ).should.be.false();

					return MyModel.list( { sortBy: "offset" }, { loadRecords: false } );
				} )
				.then( items => {
					// assumption: listing/searching w/o index required records to be loaded for inspection
					items.every( i => i.label != null ).should.be.true();

					return MyModel.list( { sortBy: "label" }, { loadRecords: false } );
				} )
				.then( items => {
					// assumption: listing/searching w/o index required records to be loaded for inspection
					items.every( i => i.label != null ).should.be.true();
				} );
		} );
	} );

	describe( "on a model using", function() {
		this.timeout( 120000 );

		const NumRecords = 1000;

		const fileAdapter = new FileAdapter( {
			dataSource: Path.resolve( __dirname, "../../../data" ),
		} );

		const Adapters = [
			[ "default (memory) adapter", undefined ],
			[ "FileAdapter", fileAdapter ],
		];

		const Values = [
			[ "integer", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => index ) ],
			[ "string", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => `prefix${index}suffix` ) ],
		];

		after( () => fileAdapter.purge() );

		Adapters.forEach( ( [ adapterLabel, adapter ] ) => {
			describe( adapterLabel, () => {
				[ 1, 2, 10, 100, 1000, 10000, 100000 ].forEach( numValues => {
					if ( numValues > NumRecords ) {
						return;
					}

					Values.forEach( ( [ valueType, valueGenerator ] ) => {
						const values = valueGenerator( numValues );

						describe( `having ${NumRecords} records with ${numValues} different value(s) on a property of type ${valueType}`, () => {
							let MyModel;

							before( () => {
								MyModel = Model.define( "MyModel", {
									props: {
										index: { type: valueType, index: "eq" },
										noIndex: { type: valueType },
										number: { type: "integer" },
									},
									computed: {
										derived() { return this.noIndex; }
									},
									indices: {
										derived: true,
									}
								}, undefined, adapter );

								Boolean( MyModel.indexPromise ).should.be.eql( false );
							} );

							after( () => MyModel.adapter.purge() );

							it( "has no entries in the beginning", () => {
								return MyModel.indexLoaded.then( () => {
									MyModel.indices[0].handler.tree.values.length.should.eql( 0 );

									MyModel.indices[0].handler.tree.values.reduce( ( accumulator, currentValue ) => {
										return accumulator + currentValue.length;
									}, 0 ).should.be.eql( 0 );
								} );
							} );

							it( `is updated while adding ${NumRecords} records`, () => {
								return new Promise( ( resolve, reject ) => {
									const create = index => {
										if ( index >= NumRecords ) {
											resolve();
										} else {
											const item = new MyModel();
											item.index = item.noIndex = values[index % numValues];
											item.number = index;
											item.save()
												.then( () => create( index + 1 ) )
												.catch( reject );
										}
									};

									create( 0 );
								} );
							} );

							describe( "has as many", () => {
								it( "nodes as different values used for property while adding records before", () => {
									MyModel.indices[0].handler.tree.values.length.should.eql( numValues );
								} );

								it( "values attached to all its nodes as records created before", () => {
									MyModel.indices[0].handler.tree.values.reduce( ( accumulator, currentValue ) => {
										return accumulator + currentValue.length;
									}, 0 ).should.be.eql( NumRecords );
								} );
							} );

							describe( "lists all matches when searching by property with index for", () => {
								it( `smallest used value ${values[0]}`, () => {
									return MyModel.findByAttribute( "index", values[0], "eq" )
										.then( items => {
											items.length.should.be.eql( NumRecords / numValues );
										} );
								} );

								it( `midrange value ${values[Math.floor( numValues / 2 )]}`, () => {
									return MyModel.findByAttribute( "index", values[Math.floor( numValues / 2 )], "eq" )
										.then( items => {
											items.length.should.be.eql( NumRecords / numValues );
										} );
								} );

								it( `biggest used value ${values[numValues - 1]}`, () => {
									return MyModel.findByAttribute( "index", values[numValues - 1], "eq" )
										.then( items => {
											items.length.should.be.eql( NumRecords / numValues );
										} );
								} );
							} );



							describe( "accessed via separate model relying on data existing in backend", () => {
								let NewModel;

								it( "is restored from existing data backend", () => {
									NewModel = Model.define( "MyModel", {
										props: {
											index: { type: valueType, index: "eq" },
											noIndex: { type: valueType },
											number: { type: "integer" },
										},
									}, undefined, adapter );

									return NewModel.indexLoaded;
								} );

								[ [ true, "and loading records" ], [ false, "without loading records" ] ].forEach( ( [ loadRecords, label ] ) => {
									describe( `lists all matches when searching by property ${label}`, () => {
										describe( "with index for", () => {
											it( `smallest used value ${values[0]}`, () => {
												return NewModel.findByAttribute( "index", values[0], "eq", undefined, { loadRecords } )
													.then( items => {
														items.length.should.be.eql( NumRecords / numValues );
													} );
											} );

											it( `mid-range value ${values[Math.floor( numValues / 2 )]}`, () => {
												return NewModel.findByAttribute( "index", values[Math.floor( numValues / 2 )], "eq", undefined, { loadRecords } )
													.then( items => {
														items.length.should.be.eql( NumRecords / numValues );
													} );
											} );

											it( `for biggest used value ${values[numValues - 1]}`, () => {
												return NewModel.findByAttribute( "index", values[numValues - 1], "eq", undefined, { loadRecords } )
													.then( items => {
														items.length.should.be.eql( NumRecords / numValues );
													} );
											} );
										} );

										describe( "without index for", () => {
											it( `smallest used value ${values[0]}`, () => {
												return NewModel.findByAttribute( "noIndex", values[0], "eq", undefined, { loadRecords } )
													.then( items => {
														items.length.should.be.eql( NumRecords / numValues );
													} );
											} );

											it( `mid-range value ${values[Math.floor( numValues / 2 )]}`, () => {
												return NewModel.findByAttribute( "noIndex", values[Math.floor( numValues / 2 )], "eq", undefined, { loadRecords } )
													.then( items => {
														items.length.should.be.eql( NumRecords / numValues );
													} );
											} );

											it( `biggest used value ${values[numValues - 1]}`, () => {
												return NewModel.findByAttribute( "noIndex", values[numValues - 1], "eq", undefined, { loadRecords } )
													.then( items => {
														items.length.should.be.eql( NumRecords / numValues );
													} );
											} );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );

		} );
	} );
} );
