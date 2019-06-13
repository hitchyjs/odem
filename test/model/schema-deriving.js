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
require( "should" );

const { Model } = require( "../../" );


suite( "Deriving a model", function() {
	let Root, Intermittent, Sub;

	suiteSetup( "defining models", () => {
		Root = Model.define( "root", {
			rootName: {},
			name: {},
		} );

		Intermittent = Model.define( "intermittent", {
			intermittentName: {},
			name: { type: "number" },
		}, Root );

		Sub = Model.define( "sub", {
			subName: {},
			name: { type: "integer" },
		}, Intermittent );
	} );

	test( "results in all defined models derive from Model", function() {
		Root.prototype.should.be.instanceOf( Model );
		Intermittent.prototype.should.be.instanceOf( Model );
		Sub.prototype.should.be.instanceOf( Model );
	} );

	test( "results in derived models derive from Root", function() {
		Root.prototype.should.not.be.instanceOf( Root );
		Intermittent.prototype.should.be.instanceOf( Root );
		Sub.prototype.should.be.instanceOf( Root );
	} );

	test( "results in deepest model derive from Intermittent", function() {
		Root.prototype.should.not.be.instanceOf( Intermittent );
		Intermittent.prototype.should.not.be.instanceOf( Intermittent );
		Sub.prototype.should.be.instanceOf( Intermittent );
	} );

	test( "results in instance of either model being instance of Model", function() {
		( new Root ).should.be.instanceOf( Model );
		( new Intermittent ).should.be.instanceOf( Model );
		( new Sub ).should.be.instanceOf( Model );
	} );

	test( "results in instance of either model being instance of Root", function() {
		( new Root ).should.be.instanceOf( Root );
		( new Intermittent ).should.be.instanceOf( Root );
		( new Sub ).should.be.instanceOf( Root );
	} );

	test( "results in instance of derived models being instance of Intermittent", function() {
		( new Root ).should.not.be.instanceOf( Intermittent );
		( new Intermittent ).should.be.instanceOf( Intermittent );
		( new Sub ).should.be.instanceOf( Intermittent );
	} );

	test( "results in instance of deepest model being instance of Sub, only", function() {
		( new Root ).should.not.be.instanceOf( Sub );
		( new Intermittent ).should.not.be.instanceOf( Sub );
		( new Sub ).should.be.instanceOf( Sub );
	} );

	test( "results in either model's class exposing its defined name", function() {
		Root.name.should.be.equal( "root" );
		Intermittent.name.should.be.equal( "intermittent" );
		Sub.name.should.be.equal( "sub" );
	} );

	test( "results in either model's class exposing reference on class it derives from", function() {
		Root.derivesFrom.should.be.equal( Model );
		Intermittent.derivesFrom.should.be.equal( Root );
		Sub.derivesFrom.should.be.equal( Intermittent );
	} );

	test( "results in a derived model's class exposing non-overloaded attributes of its base classes", function() {
		Root.schema.attributes.should.have.property( "rootName" );
		Root.schema.attributes.should.not.have.property( "intermittentName" );
		Root.schema.attributes.should.not.have.property( "subName" );

		Intermittent.schema.attributes.should.have.property( "rootName" );
		Intermittent.schema.attributes.should.have.property( "intermittentName" );
		Intermittent.schema.attributes.should.not.have.property( "subName" );

		Sub.schema.attributes.should.have.property( "rootName" );
		Sub.schema.attributes.should.have.property( "intermittentName" );
		Sub.schema.attributes.should.have.property( "subName" );
	} );

	test( "results in a derived model's class exposing attributes of its base classes overloaded", function() {
		Root.schema.attributes.should.have.property( "name" );
		Intermittent.schema.attributes.should.have.property( "name" );
		Sub.schema.attributes.should.have.property( "name" );

		Root.schema.attributes.name.type.should.be.equal( "string" );
		Intermittent.schema.attributes.name.type.should.be.equal( "number" );
		Sub.schema.attributes.name.type.should.be.equal( "integer" );
	} );
} );
