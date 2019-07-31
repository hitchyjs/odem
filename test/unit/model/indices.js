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

		MyModel.indices[0].should.be.Object().which.is.deepEqual( {
			property: "a",
			type: "eq"
		} );
	} );

	it( "can be defined using single-item array listing sole operation", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: ["eq"] },
				b: {},
			},
		} );

		MyModel.indices[0].should.be.Object().which.is.deepEqual( {
			property: "a",
			type: "eq"
		} );
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
		MyModel.indices[0].should.be.Object().which.is.deepEqual( {
			property: "a",
			type: "eq"
		} );
		MyModel.indices[1].should.be.Object().which.is.deepEqual( {
			property: "a",
			type: "neq"
		} );
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
		MyModel.indices[0].should.be.Object().which.is.deepEqual( {
			property: "a",
			type: "eq"
		} );
		MyModel.indices[1].should.be.Object().which.is.deepEqual( {
			property: "b",
			type: "neq"
		} );
	} );

	it( "can be defined multiple times on separate properties using same type for different properties", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: { index: "eq" },
				b: { index: "eq" },
			},
		} );

		MyModel.indices.should.be.Array().which.has.length( 2 );
		MyModel.indices[0].should.be.Object().which.is.deepEqual( {
			property: "a",
			type: "eq"
		} );
		MyModel.indices[1].should.be.Object().which.is.deepEqual( {
			property: "b",
			type: "eq"
		} );
	} );

	describe( "on a model using", function() {
		this.timeout( 120000 );

		const NumRecords = 1000;

		const Adapters = [
			[ "default (memory) adapter", undefined ],
			[ "FileAdapter", new FileAdapter( {
				dataSource: Path.resolve( __dirname, "../../data" ),
			} ) ],
		];

		const Values = [
			[ "integer", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => index ) ],
			[ "string", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => `prefix${index}suffix` ) ],
		];

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
								}, undefined, adapter );

								Boolean( MyModel.indexPromise ).should.be.eql( false );
							} );

							after( () => MyModel.adapter.purge() );


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
