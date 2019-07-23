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


const { describe, it, beforeEach } = require( "mocha" );
require( "should" );

const PromiseUtil = require( "promise-essentials" );

const { Model, MemoryAdapter } = require( "../../" );


describe( "Model API regarding a model's collection of items", () => {
	describe( "has a static method `findByAttribute()` which", () => {
		it( "is a function", () => {
			Model.findByAttribute.should.be.a.Function();
		} );

		describe( "supports finding instances of model by attribute which", () => {
			let adapter;
			let Person;

			beforeEach( function() {
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

			it( "is having value equivalent to some provided one", () => {
				return Person.findByAttribute( "name", "John Doe" )
					.then( matches => {
						matches.should.be.an.Array().which.has.length( 1 );

						matches[0].should.be.instanceOf( Person );
						matches[0].should.have.property( "age" ).which.is.equal( 23 );
					} );
			} );
		} );
	} );
} );
