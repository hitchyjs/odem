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


describe( "Deriving a model", () => {
	let Root, Intermittent, Sub;
	let OdemModel;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModel } = s ); } ) );

	before( "defining models", () => {
		Root = OdemModel.define( "root", {
			props: {
				rootName: {},
				name: {},
			},
			computed: {
				rootConverted() { return `root: ${this.rootName}`; },
				converted() { return `root: ${this.rootName}`; },
			},
			methods: {
				rootProcessed() { return `root processed: ${this.rootName}`; },
				processed() { return `root processed: ${this.rootName}`; },
			},
		} );

		Intermittent = OdemModel.define( "intermittent", {
			props: {
				intermittentName: {},
				name: { type: "number" },
			},
			computed: {
				intermittentConverted() { return `intermittent: ${this.rootName}`; },
				converted() { return `intermittent: ${this.intermittentName}`; },
			},
			methods: {
				intermittentProcessed() { return `intermittent processed: ${this.rootName}`; },
				processed() { return `intermittent processed: ${this.rootName}`; },
			},
		}, Root );

		Sub = OdemModel.define( "sub", {
			props: {
				subName: {},
				name: { type: "integer" },
			},
			computed: {
				subConverted() { return `sub: ${this.rootName}`; },
				converted() { return `sub: ${this.subName}`; },
			},
			methods: {
				subProcessed() { return `sub processed: ${this.rootName}`; },
				processed() { return `sub processed: ${this.subName}`; },
			},
		}, Intermittent );
	} );

	it( "results in all defined models derive from Model", () => {
		Root.prototype.should.be.instanceOf( OdemModel );
		Intermittent.prototype.should.be.instanceOf( OdemModel );
		Sub.prototype.should.be.instanceOf( OdemModel );
	} );

	it( "results in derived models derive from Root", () => {
		Root.prototype.should.not.be.instanceOf( Root );
		Intermittent.prototype.should.be.instanceOf( Root );
		Sub.prototype.should.be.instanceOf( Root );
	} );

	it( "results in deepest model derive from Intermittent", () => {
		Root.prototype.should.not.be.instanceOf( Intermittent );
		Intermittent.prototype.should.not.be.instanceOf( Intermittent );
		Sub.prototype.should.be.instanceOf( Intermittent );
	} );

	it( "results in instance of either model being instance of Model", () => {
		( new Root ).should.be.instanceOf( OdemModel );
		( new Intermittent ).should.be.instanceOf( OdemModel );
		( new Sub ).should.be.instanceOf( OdemModel );
	} );

	it( "results in instance of either model being instance of Root", () => {
		( new Root ).should.be.instanceOf( Root );
		( new Intermittent ).should.be.instanceOf( Root );
		( new Sub ).should.be.instanceOf( Root );
	} );

	it( "results in instance of derived models being instance of Intermittent", () => {
		( new Root ).should.not.be.instanceOf( Intermittent );
		( new Intermittent ).should.be.instanceOf( Intermittent );
		( new Sub ).should.be.instanceOf( Intermittent );
	} );

	it( "results in instance of deepest model being instance of Sub, only", () => {
		( new Root ).should.not.be.instanceOf( Sub );
		( new Intermittent ).should.not.be.instanceOf( Sub );
		( new Sub ).should.be.instanceOf( Sub );
	} );

	it( "results in either model's class exposing its defined name", () => {
		Root.name.should.be.equal( "root" );
		Intermittent.name.should.be.equal( "intermittent" );
		Sub.name.should.be.equal( "sub" );
	} );

	it( "results in either model's class exposing reference on class it derives from", () => {
		Root.derivesFrom.should.be.equal( OdemModel );
		Intermittent.derivesFrom.should.be.equal( Root );
		Sub.derivesFrom.should.be.equal( Intermittent );
	} );

	it( "results in schema of a derived model exposing non-overloaded properties of its base classes", () => {
		Root.schema.props.should.have.property( "rootName" );
		Root.schema.props.should.not.have.property( "intermittentName" );
		Root.schema.props.should.not.have.property( "subName" );

		Intermittent.schema.props.should.have.property( "rootName" );
		Intermittent.schema.props.should.have.property( "intermittentName" );
		Intermittent.schema.props.should.not.have.property( "subName" );

		Sub.schema.props.should.have.property( "rootName" );
		Sub.schema.props.should.have.property( "intermittentName" );
		Sub.schema.props.should.have.property( "subName" );
	} );

	it( "results in schema of a derived model exposing properties of its base classes overloaded", () => {
		Root.schema.props.should.have.property( "name" );
		Intermittent.schema.props.should.have.property( "name" );
		Sub.schema.props.should.have.property( "name" );

		Root.schema.props.name.type.should.be.equal( "string" );
		Intermittent.schema.props.name.type.should.be.equal( "number" );
		Sub.schema.props.name.type.should.be.equal( "integer" );
	} );

	it( "results in schema of a derived model exposing non-overloaded properties of its base classes", () => {
		Root.schema.props.should.have.property( "rootName" );
		Root.schema.props.should.not.have.property( "intermittentName" );
		Root.schema.props.should.not.have.property( "subName" );

		Intermittent.schema.props.should.have.property( "rootName" );
		Intermittent.schema.props.should.have.property( "intermittentName" );
		Intermittent.schema.props.should.not.have.property( "subName" );

		Sub.schema.props.should.have.property( "rootName" );
		Sub.schema.props.should.have.property( "intermittentName" );
		Sub.schema.props.should.have.property( "subName" );
	} );

	it( "results in schema of a derived model exposing properties of its base classes overloaded", () => {
		Root.schema.props.should.have.property( "name" );
		Intermittent.schema.props.should.have.property( "name" );
		Sub.schema.props.should.have.property( "name" );

		Root.schema.props.name.type.should.be.equal( "string" );
		Intermittent.schema.props.name.type.should.be.equal( "number" );
		Sub.schema.props.name.type.should.be.equal( "integer" );
	} );

	it( "results in derived model's instances exposing own properties and all non-overloaded properties of derived models", () => {
		( new Root ).should.have.property( "rootName" );
		( new Root ).should.have.property( "name" );
		( new Root ).should.not.have.property( "intermittentName" );
		( new Root ).should.not.have.property( "subName" );

		( new Intermittent ).should.have.property( "rootName" );
		( new Intermittent ).should.have.property( "name" );
		( new Intermittent ).should.have.property( "intermittentName" );
		( new Intermittent ).should.not.have.property( "subName" );

		( new Sub ).should.have.property( "rootName" );
		( new Sub ).should.have.property( "name" );
		( new Sub ).should.have.property( "intermittentName" );
		( new Sub ).should.have.property( "subName" );
	} );

	it( "results in derived model's instances exposing own computed properties and all non-overloaded computed properties of derived models", () => {
		( new Root ).should.have.property( "rootConverted" );
		( new Root ).should.have.property( "converted" );
		( new Root ).should.not.have.property( "intermittentConverted" );
		( new Root ).should.not.have.property( "subConverted" );

		( new Intermittent ).should.have.property( "rootConverted" );
		( new Intermittent ).should.have.property( "converted" );
		( new Intermittent ).should.have.property( "intermittentConverted" );
		( new Intermittent ).should.not.have.property( "subConverted" );

		( new Sub ).should.have.property( "rootConverted" );
		( new Sub ).should.have.property( "converted" );
		( new Sub ).should.have.property( "intermittentConverted" );
		( new Sub ).should.have.property( "subConverted" );
	} );

	it( "re-defines overloaded properties in prototype of deriving model", () => {
		Object.getOwnPropertyNames( Root.prototype ).should.containEql( "name" );
		Object.getOwnPropertyNames( Intermittent.prototype ).should.containEql( "name" );
		Object.getOwnPropertyNames( Sub.prototype ).should.containEql( "name" );
	} );

	it( "doesn't re-define non-overloaded properties in prototype of deriving model but relies on prototype chain", () => {
		Object.getOwnPropertyNames( Root.prototype ).should.containEql( "rootName" );
		Object.getOwnPropertyNames( Intermittent.prototype ).should.not.containEql( "rootName" );
		Object.getOwnPropertyNames( Sub.prototype ).should.not.containEql( "rootName" );
	} );
} );
