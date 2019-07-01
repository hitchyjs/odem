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


const Path = require( "path" );

const { suite, test } = require( "mocha" );
const Should = require( "should" );

const PromiseUtil = require( "promise-essentials" );
const { RmDir, MkDir } = require( "file-essentials" );

const Collection = require( "../../lib/model/collection" );
const { Model, MemoryAdapter, FileAdapter } = require( "../../" );


suite( "Model Collections API", function() {
	test( "is available", function() {
		Should.exist( Collection );
	} );

	suite( "has a static method `injectInto()` which", function() {
		test( "is a function", function() {
			Collection.injectInto.should.be.a.Function();
		} );
	} );

	suite( "has a static method `findByAttribute()` which", function() {
		test( "is a function", function() {
			Collection.findByAttribute.should.be.a.Function();
		} );
	} );

	suite( "is injected into compiled model relying on MemoryAdapter which", function() {
		let adapter;
		let Person;

		setup( function() {
			adapter = new MemoryAdapter();

			Person = Model.define( "people", {
				name: { type: "string" },
				age: { type: "int" },
			}, null, adapter );

			return PromiseUtil.each( [
				{ name: "Jane Doe", age: 42 },
				{ name: "John Doe", age: 23 },
				{ name: "Foo Bar", age: 65 },
			], ( { name, age } ) => {
				const item = new Person();
				item.name = name;
				item.age = age;

				return item.save();
			} );
		} );

		test( "is exposing same function `findByAttribute()`", function() {
			Person.should.have.property( "findByAttribute" ).which.is.a.Function().and.is.equal( Collection.findByAttribute );
		} );

		test( "supports finding instances of model by attribute", function() {
			return Person.findByAttribute( "name", "John Doe" )
				.then( matches => {
					matches.should.be.an.Array().which.has.length( 1 );

					matches[0].should.be.instanceOf( Person );
					matches[0].should.have.property( "age" ).which.is.equal( 23 );
				} );
		} );
	} );

	suite( "is injected into compiled model relying on FileAdapter which", function() {
		let adapter;
		let Person;

		suiteSetup( function() {
			return MkDir( Path.resolve( __dirname, ".." ), "data" );
		} );

		setup( function() {
			return RmDir( "../data", { subsOnly: true } )
				.then( () => {
					adapter = new FileAdapter( { dataSource: "../data" } );

					Person = Model.define( "people", {
						name: { type: "string" },
						age: { type: "int" },
					}, null, adapter );

					return PromiseUtil.each( [
						{ name: "Jane Doe", age: 42 },
						{ name: "John Doe", age: 23 },
						{ name: "Foo Bar", age: 65 },
					], ( { name, age } ) => {
						const item = new Person();
						item.name = name;
						item.age = age;

						return item.save();
					} );
				} );
		} );

		test( "is exposing same function `findByAttribute()`", function() {
			Person.should.have.property( "findByAttribute" ).which.is.a.Function().and.is.equal( Collection.findByAttribute );
		} );

		test( "supports finding instances of model by attribute", function() {
			return Person.findByAttribute( "name", "John Doe" )
				.then( matches => {
					matches.should.be.an.Array().which.has.length( 1 );

					matches[0].should.be.instanceOf( Person );
					matches[0].should.have.property( "age" ).which.is.equal( 23 );
				} );
		} );
	} );
} );
