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

const { describe, it, before } = require( "mocha" );
require( "should" );

const { loadAllServices } = require( "./helper" );


describe( "Integration with hitchy", () => {
	let OdemConverter, OdemAdapterMemory, OdemModel;

	before( () => loadAllServices().then( s => { ( { OdemConverter, OdemAdapterMemory, OdemModel } = s ); } ) );

	describe( "relies on exposed function OdemConverter.processModelDefinitions() which", () => {
		it( "is a function", () => {
			OdemConverter.processModelDefinitions.should.be.Function();
		} );

		it( "takes three arguments", () => {
			OdemConverter.processModelDefinitions.should.have.length( 2 );
		} );

		it( "requires three arguments", () => {
			( () => OdemConverter.processModelDefinitions() ).should.throw();
			( () => OdemConverter.processModelDefinitions( {} ) ).should.throw();
			( () => OdemConverter.processModelDefinitions( {}, new OdemAdapterMemory() ) ).should.not.throw();
		} );

		it( "returns provided set of models", () => {
			const models = {};

			OdemConverter.processModelDefinitions( models, new OdemAdapterMemory() ).should.be.equal( models );
		} );

		it( "replaces existing models in provided set of model definitions with either model's implementation", () => {
			const models = {
				SomeModel: { props: { a: {} } },
			};

			const defined = OdemConverter.processModelDefinitions( Object.assign( {}, models ), new OdemAdapterMemory() );

			defined.should.be.Object().which.has.property( "SomeModel" ).which.has.property( "prototype" ).which.is.instanceof( OdemModel );
		} );
	} );

	describe( "processes set of model definitions that", () => {
		it( "is empty", () => {
			( () => OdemConverter.processModelDefinitions( {}, new OdemAdapterMemory() ) ).should.not.throw();
		} );

		it( "defines single model `sole` with single string property named `sole`", () => {
			const models = OdemConverter.processModelDefinitions( {
				sole: { props: { sole: {} } },
			}, new OdemAdapterMemory() );

			models.should.have.property( "sole" );
			models.sole.should.have.property( "prototype" ).which.is.instanceof( OdemModel );

			const sole = new models.sole(); // eslint-disable-line new-cap

			sole.sole = "test";
			sole.$properties.should.have.property( "sole" ).which.is.equal( "test" );
		} );
	} );
} );
