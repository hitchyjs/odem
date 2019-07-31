/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

const { describe, it } = require( "mocha" );
require( "should" );

const { Model, MemoryAdapter } = require( "../../" );
const { processDiscoveredModelDefinitions } = require( "../../lib/hitchy-integration" );


describe( "Integration with hitchy", () => {
	describe( "relies on exposed function processDiscoveredModelDefinitions() which", () => {
		it( "is a function", () => {
			processDiscoveredModelDefinitions.should.be.Function();
		} );

		it( "takes two arguments", () => {
			processDiscoveredModelDefinitions.should.have.length( 2 );
		} );

		it( "requires two arguments", () => {
			( () => processDiscoveredModelDefinitions() ).should.throw();
			( () => processDiscoveredModelDefinitions( {} ) ).should.throw();
			( () => processDiscoveredModelDefinitions( {}, new MemoryAdapter() ) ).should.not.throw();
		} );

		it( "returns provided set of models", () => {
			const models = {};

			processDiscoveredModelDefinitions( models, new MemoryAdapter() ).should.be.equal( models );
		} );

		it( "replaces existing models in provided set of model definitions with either model's implementation", () => {
			const models = {
				SomeModel: { props: { a: {} } },
			};

			const defined = processDiscoveredModelDefinitions( Object.assign( {}, models ), new MemoryAdapter() );

			defined.should.be.Object().which.has.property( "SomeModel" ).which.has.property( "prototype" ).which.is.instanceof( Model );
		} );
	} );

	describe( "processes set of model definitions that", () => {
		it( "is empty", () => {
			( () => processDiscoveredModelDefinitions( {}, new MemoryAdapter() ) ).should.not.throw();
		} );

		it( "defines single model `sole` with single string attribute named `sole`", () => {
			const models = processDiscoveredModelDefinitions( {
				sole: { props: { sole: {} } },
			}, new MemoryAdapter() );

			models.should.have.property( "sole" );
			models.sole.should.have.property( "prototype" ).which.is.instanceof( Model );

			const sole = new models.sole(); // eslint-disable-line new-cap

			sole.sole = "test";
			sole.$properties.should.have.property( "sole" ).which.is.equal( "test" );
		} );
	} );
} );
