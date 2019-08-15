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

const { describe, it } = require( "mocha" );
require( "should" );

const { Model } = require( "../../../" );


describe( "A model-related index", () => {
	it( "can be solely defined with index reducer which is exposed by resulting index handler", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {
					index: value => value.toLowerCase(),
				},
				b: {},
			},
		} );

		MyModel.schema.props.a.index.eq.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.eq.type.should.be.equal( "eq" );
		MyModel.schema.props.a.index.eq.reducer.should.be.Function();

		return MyModel.indexLoaded
			.then( () => {
				MyModel.getIndex( "a", "eq" ).should.have.property( "reducer" ).which.is.a.Function().which.has.length( 1 );
			} );
	} );

	it( "can be solely defined without index reducer causing resulting index handler not exposing reducer function", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {
					index: true,
				},
			},
		} );

		MyModel.schema.props.a.index.eq.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.eq.type.should.be.equal( "eq" );
		( MyModel.schema.props.a.index.eq.reducer == null ).should.be.true();

		return MyModel.indexLoaded
			.then( () => {
				( MyModel.getIndex( "a", "eq" ).reducer == null ).should.be.true();
			} );
	} );

	it( "can be solely defined as object with index reducer", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {
					index: {
						eq: value => value.toLowerCase(),
					},
				},
			},
		} );

		MyModel.schema.props.a.index.eq.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.eq.type.should.be.equal( "eq" );
		MyModel.schema.props.a.index.eq.reducer.should.be.Function();

		return MyModel.indexLoaded
			.then( () => {
				MyModel.getIndex( "a", "eq" ).should.have.property( "reducer" ).which.is.a.Function().which.has.length( 1 );
			} );
	} );

	it( "can be solely defined as object without index reducer", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {
					index: {
						eq: true
					},
				},
			},
		} );

		MyModel.schema.props.a.index.eq.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.eq.type.should.be.equal( "eq" );
		( MyModel.schema.props.a.index.eq.reducer == null ).should.be.true();

		return MyModel.indexLoaded
			.then( () => {
				( MyModel.getIndex( "a", "eq" ).reducer == null ).should.be.true();
			} );
	} );

	it( "can be combined in object-style definition with further indices", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {
					index: {
						eq: true,
						gt: true,
						lt: true,
					},
				},
			},
		} );

		MyModel.schema.props.a.index.eq.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.eq.type.should.be.equal( "eq" );
		( MyModel.schema.props.a.index.eq.reducer == null ).should.be.true();

		MyModel.schema.props.a.index.gt.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.gt.type.should.be.equal( "gt" );
		( MyModel.schema.props.a.index.gt.reducer == null ).should.be.true();

		MyModel.schema.props.a.index.lt.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.lt.type.should.be.equal( "lt" );
		( MyModel.schema.props.a.index.lt.reducer == null ).should.be.true();
	} );

	it( "property exposes reducer function for any index in a combined definition of indices that's got an index reducer there", () => {
		const MyModel = Model.define( "MyModel", {
			props: {
				a: {
					index: {
						eq: true,
						gt: value => value.toLowerCase(),
					},
				},
			},
		} );

		MyModel.schema.props.a.index.eq.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.eq.type.should.be.equal( "eq" );
		( MyModel.schema.props.a.index.eq.reducer == null ).should.be.true();

		MyModel.schema.props.a.index.gt.property.should.be.equal( "a" );
		MyModel.schema.props.a.index.gt.type.should.be.equal( "gt" );
		MyModel.schema.props.a.index.gt.reducer.should.be.Function();
	} );

	describe( "defined on a model", () => {
		describe( "using index reducer", () => {
			const NumRecords = 1000;
			const values = new Array( NumRecords ).fill( 0 ).map( ( _, i ) => i );

			let MyModel;

			it( "is accepted", () => {
				MyModel = Model.define( "MyModel", {
					props: {
						number: {
							type: "number",
							index: value => parseInt( value * 10 / NumRecords ),
						},
					},
				} );
			} );

			it( "is fed while successively populating model", () => {
				return MyModel.adapter.purge().then( () => {
					return Promise.all( values.map( i => {
						const item = new MyModel();

						item.number = i;

						return item.save();
					} ) );
				} )
					.then( () => {
						MyModel.getIndex( "number", "eq" ).tree.length.should.be.equal( 10 );
					} );
			} );

			it( "is recreated when defining another model for accessing existing data with same schema", () => {
				MyModel = Model.define( "MyModel", {
					props: {
						number: {
							type: "number",
							index: value => parseInt( value * 10 / NumRecords ),
						},
					},
				} );

				return MyModel.indexLoaded
					.then( () => {
						MyModel.getIndex( "number", "eq" ).tree.length.should.be.equal( 10 );
					} );
			} );

			it( "is recreated when defining another model for accessing existing data with similar schema, this time using different index reducer", () => {
				MyModel = Model.define( "MyModel", {
					props: {
						number: {
							type: "number",
							index: value => parseInt( value * 50 / NumRecords ),
						},
					},
				} );

				return MyModel.indexLoaded
					.then( () => {
						MyModel.getIndex( "number", "eq" ).tree.length.should.be.equal( 50 );
					} );
			} );

			it( "is recreated when defining model for accessing existing data with similar schema, this time omitting index reducer", () => {
				MyModel = Model.define( "MyModel", {
					props: {
						number: {
							type: "number",
							index: true,
						},
					},
				} );

				return MyModel.indexLoaded
					.then( () => {
						MyModel.getIndex( "number", "eq" ).tree.length.should.be.equal( NumRecords );
					} );
			} );

			it( "finds multiple records with property value reduced to same value as the one used for searching instead of single one matching exactly", () => {
				MyModel = Model.define( "MyModel", {
					props: {
						number: {
							type: "number",
							index: value => parseInt( value * 100 / NumRecords ),
						},
					},
				} );

				return MyModel.indexLoaded
					.then( () => MyModel.find( { eq: { name: "number", value: 305 } }, undefined, { loadRecords: true } ) )
					.then( list => {
						list.should.have.length( 10 );
						const numbers = list.map( record => record.number );
						numbers.sort( ( l, r ) => l - r );

						numbers.should.be.Array().which.is.deepEqual( [ 300, 301, 302, 303, 304, 305, 306, 307, 308, 309 ] );
					} );
			} );
		} );
	} );
} );
