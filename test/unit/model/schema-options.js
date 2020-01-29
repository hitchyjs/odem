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

const { describe, it, before, beforeEach, afterEach } = require( "mocha" );
require( "should" );

const { fakeApi } = require( "../helper" );


describe( "A model's schema may define", () => {
	let OdemModel;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModel } = s ); } ) );

	it( "a model that fails by default on assigning twice to property w/o saving intermittently", () => {
		const MyModel = OdemModel.define( "MyModel", {
			props: { someProp: {} },
		} );

		( () => {
			const item = new MyModel();
			item.someProp = "a";
			item.someProp = "b";
		} ).should.throw();
	} );

	describe( "option `onUnsaved` which", () => {
		let origHandler = null;
		let captured;

		beforeEach( () => {
			origHandler = console.error;
			console.error = ( ...args ) => {
				captured.push( args );
			};
			captured = [];
		} );

		afterEach( () => {
			console.error = origHandler;
		} );

		it( "might be set 'ignore' to prevent failure or log message on assigning twice to property w/o saving intermittently", () => {
			const MyModel = OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "ignore",
				},
			} );

			( () => {
				const item = new MyModel();
				item.someProp = "a";
				item.someProp = "b";
			} ).should.not.throw();

			captured.should.be.empty();
		} );

		it( "might be set 'IGNORE' to prevent failure or log message on assigning twice to property w/o saving intermittently", () => {
			const MyModel = OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "IGNORE",
				},
			} );

			( () => {
				const item = new MyModel();
				item.someProp = "a";
				item.someProp = "b";
			} ).should.not.throw();

			captured.should.be.empty();
		} );

		it( "might be set 'warn' to prevent failure, but log message on assigning twice to property w/o saving intermittently", () => {
			const MyModel = OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "warn",
				},
			} );

			( () => {
				const item = new MyModel();
				item.someProp = "a";
				item.someProp = "b";
			} ).should.not.throw();

			captured.should.not.be.empty();
		} );

		it( "might be set 'WARN' to prevent failure, but log message on assigning twice to property w/o saving intermittently", () => {
			const MyModel = OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "WARN",
				},
			} );

			( () => {
				const item = new MyModel();
				item.someProp = "a";
				item.someProp = "b";
			} ).should.not.throw();

			captured.should.not.be.empty();
		} );

		it( "might be set 'fail' to fail w/o logging on assigning twice to property w/o saving intermittently", () => {
			const MyModel = OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "fail",
				},
			} );

			( () => {
				const item = new MyModel();
				item.someProp = "a";
				item.someProp = "b";
			} ).should.throw();

			captured.should.be.empty();
		} );

		it( "might be set 'FAIL' to fail w/o logging on assigning twice to property w/o saving intermittently", () => {
			const MyModel = OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "FAIL",
				},
			} );

			( () => {
				const item = new MyModel();
				item.someProp = "a";
				item.someProp = "b";
			} ).should.throw();

			captured.should.be.empty();
		} );

		it( "causes Model.define() to throw when assigning unknown value", () => {
			( () => OdemModel.define( "MyModel", {
				props: { someProp: {} },
				options: {
					onUnsaved: "something",
				},
			} ) ).should.throw();
		} );
	} );
} );
