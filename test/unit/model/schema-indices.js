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
require( "should" );

const { fakeApi } = require( "../helper" );


describe( "Definition of a model's schema", () => {
	let Model, OdemModelType, OdemModelTypeInteger;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model, OdemModelType, OdemModelTypeInteger } = s ); } ) );

	it( "may include anything but an index", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: {} },
		} );

		MyModel.schema.indices.should.be.Object().which.is.empty();

		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.empty();
			} );
	} );

	it( "may have empty section of indices", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: {} },
			indices: {},
		} );


		MyModel.schema.indices.should.be.Object().which.is.empty();
		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.empty();
			} );
	} );

	it( "may declare a property's index locally", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: { index: true } },
		} );

		MyModel.schema.indices.should.be.Object().which.is.not.empty();
		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.not.empty();
			} );
	} );

	it( "may declare a property with its index declared in separate section", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: {} },
			indices: {
				someProp: true
			},
		} );

		MyModel.schema.indices.should.be.Object().which.is.not.empty();
		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.not.empty();
			} );
	} );

	it( "may declare computed property with related index declared in separate section", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: {} },
			computed: {
				derived() { return String( this.someProp ).toLowerCase(); },
			},
			indices: {
				derived: true
			},
		} );

		MyModel.schema.indices.derived.property.should.be.equal( "derived" );
		MyModel.schema.indices.derived.type.should.be.equal( "eq" );
		( MyModel.schema.indices.derived.reducer == null ).should.be.true();

		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.not.empty();
			} );
	} );

	it( "may declare computed property with its index declared in separate section using reducer", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: {} },
			computed: {
				derived() { return String( this.someProp ).toLowerCase(); },
			},
			indices: {
				derived( value ) { return value; },
			},
		} );

		MyModel.schema.indices.derived.property.should.be.equal( "derived" );
		MyModel.schema.indices.derived.type.should.be.equal( "eq" );
		( MyModel.schema.indices.derived.propertyType == null ).should.be.true();
		MyModel.schema.indices.derived.$type.should.be.equal( OdemModelType );
		MyModel.schema.indices.derived.reducer.should.be.Function();

		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.not.empty();
			} );
	} );

	it( "may declare computed property with its index declared in separate section selecting type of expected values", () => {
		const MyModel = Model.define( "MyModel", {
			props: { someProp: {} },
			computed: {
				derived() { return String( this.someProp ).toLowerCase(); },
			},
			indices: {
				derived: {
					propertyType: "integer",
				},
			},
		} );

		MyModel.schema.indices.derived.property.should.be.equal( "derived" );
		MyModel.schema.indices.derived.type.should.be.equal( "eq" );
		MyModel.schema.indices.derived.propertyType.should.be.equal( "integer" );
		MyModel.schema.indices.derived.$type.should.be.equal( OdemModelTypeInteger );
		( MyModel.schema.indices.derived.reducer == null ).should.be.true();

		return MyModel.indexLoaded
			.then( indices => {
				indices.should.be.Array().which.is.not.empty();
			} );
	} );

	it( "mustn't declare index of same type for property twice in local and separate definition", () => {
		( () => Model.define( "MyModel", {
			props: { someProp: { index: true } },
			indices: {
				someProp: true,
			},
		} ) ).should.throw();
	} );

	it( "mustn't declare index of same type for property twice in separate section using mixture of shortcut and different index names", () => {
		( () => Model.define( "MyModel", {
			props: { someProp: {} },
			indices: {
				someProp: true,
				namedIndex: { property: "someProp" },
			},
		} ) ).should.throw();
	} );

	it( "mustn't declare index of same type for property twice in separate section using two named index definitions", () => {
		( () => Model.define( "MyModel", {
			props: { someProp: {} },
			indices: {
				namedIndex: { property: "someProp" },
				anotherNamedIndex: { property: "someProp" },
			},
		} ) ).should.throw();
	} );
} );
