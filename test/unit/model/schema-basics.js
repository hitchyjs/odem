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


describe( "Models API", () => {
	const MostSimpleDefinition = { props: { label: {} } };
	let OdemModel, OdemModelType;
	let CustomBaseClass;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemModel, OdemModelType } = s ); } ) );

	before( () => {
		CustomBaseClass = class CustomBaseClassImpl extends OdemModel {};
	} );

	describe( "exposes method for defining custom models which", () => {
		it( "is a function", () => {
			OdemModel.define.should.be.Function();
		} );

		it( "expects two parameters", () => {
			OdemModel.define.should.have.length( 2 );

			( () => OdemModel.define() ).should.throw( TypeError );
			( () => OdemModel.define( "valid" ) ).should.throw( TypeError );

			( () => OdemModel.define( "valid", MostSimpleDefinition ) ).should.not.throw();
		} );

		it( "requires valid provision of new model's name", () => {
			( () => OdemModel.define( null, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( undefined, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( true, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( false, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( 1, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( 0.234, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( {}, MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( [], MostSimpleDefinition ) ).should.throw( TypeError );
			( () => OdemModel.define( () => {}, MostSimpleDefinition ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => OdemModel.define( "", MostSimpleDefinition ) ).should.throw( TypeError );

			( () => OdemModel.define( "sOmeThingVeRyaRBiTrarY", MostSimpleDefinition ) ).should.not.throw();
		} );

		it( "exposes resulting model's name as provided", () => {
			const model = OdemModel.define( "sOmeThingVeRyaRBiTrarY", MostSimpleDefinition );

			model.name.should.equal( "sOmeThingVeRyaRBiTrarY" );
		} );

		it( "rejects empty schema definition", () => {
			( () => OdemModel.define( "Item", {} ) ).should.throw( TypeError );
		} );

		it( "rejects schema definition omitting section for defining properties", () => {
			( () => OdemModel.define( "Item", { methods: { fn: () => 0 } } ) ).should.throw( TypeError );

			( () => OdemModel.define( "Item", { methods: { fn: () => 0 }, props: { label: {} } } ) ).should.not.throw();
		} );

		it( "rejects schema definition including empty section for defining properties", () => {
			( () => OdemModel.define( "Item", { props: {} } ) ).should.throw( TypeError );

			( () => OdemModel.define( "Item", { props: { label: {} } } ) ).should.not.throw();
		} );

		it( "rejects schema definition including definition of property using wrong type of information", () => {
			( () => OdemModel.define( "Item", { props: { label: null } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: false } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: true } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: 1 } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: "" } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: "string" } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: () => {} } } ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => OdemModel.define( "Item", { props: { label: [] } } ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: ["string"] } } ) ).should.throw( TypeError );

			( () => OdemModel.define( "Item", { props: { label: {} } } ) ).should.not.throw();
		} );

		it( "supports provision of existing model class for deriving new one from", () => {
			const Stuff = OdemModel.define( "Stuff", MostSimpleDefinition );
			const Item = OdemModel.define( "Item", MostSimpleDefinition, Stuff );

			Item.should.not.equal( Stuff );
			Item.should.not.equal( OdemModel );
			Item.prototype.should.be.instanceof( Stuff );
			Item.prototype.should.be.instanceof( OdemModel );
		} );

		it( "accepts empty schema definition when defining derived model", () => {
			( () => OdemModel.define( "Item", {}, CustomBaseClass ) ).should.not.throw();
		} );

		it( "accepts schema definition omitting section for defining properties when defining derived model", () => {
			( () => OdemModel.define( "Item", { methods: { fn: () => 0 } }, CustomBaseClass ) ).should.not.throw();

			( () => OdemModel.define( "Item", { methods: { fn: () => 0 }, props: { label: {} } }, CustomBaseClass ) ).should.not.throw();
		} );

		it( "accepts schema definition including empty section for defining properties when defining derived model", () => {
			( () => OdemModel.define( "Item", { props: {} }, CustomBaseClass ) ).should.not.throw();

			( () => OdemModel.define( "Item", { props: { label: {} } }, CustomBaseClass ) ).should.not.throw();
		} );

		it( "rejects schema definition including definition of property using wrong type of information when defining derived model", () => {
			( () => OdemModel.define( "Item", { props: { label: null } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: false } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: true } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: 1 } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: "" } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: "string" } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: () => {} } }, CustomBaseClass ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => OdemModel.define( "Item", { props: { label: [] } }, CustomBaseClass ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", { props: { label: ["string"] } }, CustomBaseClass ) ).should.throw( TypeError );

			( () => OdemModel.define( "Item", { props: { label: {} } }, CustomBaseClass ) ).should.not.throw();
		} );

		it( "rejects to derive from anything but another model class", () => {
			function OldStyleBad() {} // eslint-disable-line no-empty-function, require-jsdoc
			class NewStyleBad {} // eslint-disable-line require-jsdoc

			class NewStyleGood extends OdemModel {} // eslint-disable-line require-jsdoc

			( () => OdemModel.define( "Stuff", MostSimpleDefinition, Object ) ).should.throw( TypeError );
			( () => OdemModel.define( "Stuff", MostSimpleDefinition, Array ) ).should.throw( TypeError );
			( () => OdemModel.define( "Stuff", MostSimpleDefinition, Function ) ).should.throw( TypeError );
			( () => OdemModel.define( "Stuff", MostSimpleDefinition, Promise ) ).should.throw( TypeError );
			( () => OdemModel.define( "Stuff", MostSimpleDefinition, Map ) ).should.throw( TypeError );

			( () => OdemModel.define( "Item", MostSimpleDefinition, OldStyleBad ) ).should.throw( TypeError );
			( () => OdemModel.define( "Item", MostSimpleDefinition, NewStyleBad ) ).should.throw( TypeError );

			( () => OdemModel.define( "Item", MostSimpleDefinition, NewStyleGood ) ).should.not.throw();
		} );

		it( "returns defined model", () => {
			const Item = OdemModel.define( "Item", { props: { label: {} } } );

			Item.prototype.should.be.instanceOf( OdemModel );
		} );

		it( "accepts schema defining actual property of type `string` (implicitly)", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					label: {},
					alias: {},
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.not.be.empty();
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "label" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "alias" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.be.empty();
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );

		it( "accepts schema defining computed property the simple way", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					lastName: {},
					firstName: {},
				},
				computed: {
					fullName() { return this.lastName + ", " + this.firstName; },
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "firstName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "lastName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.have.size( 1 );
			Item.schema.computed.should.have.ownProperty( "fullName" ).which.is.an.Object().and.has.properties( "code", "type", "$type" );
			Item.schema.computed.fullName.code.should.be.Function();
			( Item.schema.computed.fullName.type === undefined ).should.be.true();
			( Item.schema.computed.fullName.$type === undefined ).should.be.true();
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );

		it( "accepts schema defining computed property the simply way with type handler applied", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					lastName: {},
					firstName: {},
				},
				computed: {
					"fullName:date"() { return this.lastName + ", " + this.firstName; },
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "firstName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "lastName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.have.size( 1 );
			Item.schema.computed.should.have.ownProperty( "fullName" ).which.is.an.Object().and.has.properties( "code", "type", "$type" );
			Item.schema.computed.fullName.code.should.be.Function();
			Item.schema.computed.fullName.type.should.be.equal( "date" );
			Item.schema.computed.fullName.$type.prototype.should.be.instanceOf( OdemModelType );
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );

		it( "accepts schema defining computed property more explicitly", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					lastName: {},
					firstName: {},
				},
				computed: {
					fullName: {
						code() { return this.lastName + ", " + this.firstName; },
					},
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "firstName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "lastName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.have.size( 1 );
			Item.schema.computed.should.have.ownProperty( "fullName" ).which.is.an.Object().and.has.properties( "code", "type", "$type" );
			Item.schema.computed.fullName.code.should.be.Function();
			( Item.schema.computed.fullName.type === undefined ).should.be.true();
			( Item.schema.computed.fullName.$type === undefined ).should.be.true();
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );

		it( "accepts schema explicitly defining computed property with custom type handler applied", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					lastName: {},
					firstName: {},
				},
				computed: {
					fullName: {
						code() { return this.lastName + ", " + this.firstName; },
						type: "date",
					},
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "firstName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "lastName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.have.size( 1 );
			Item.schema.computed.should.have.ownProperty( "fullName" ).which.is.an.Object().and.has.properties( "code", "type", "$type" );
			Item.schema.computed.fullName.code.should.be.Function();
			Item.schema.computed.fullName.type.should.be.equal( "date" );
			Item.schema.computed.fullName.$type.prototype.should.be.instanceOf( OdemModelType );
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );

		it( "accepts schema explicitly defining computed property with custom type handler applied implicitly", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					lastName: {},
					firstName: {},
				},
				computed: {
					"fullName:date": {
						code() { return this.lastName + ", " + this.firstName; },
					},
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "firstName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "lastName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.have.size( 1 );
			Item.schema.computed.should.have.ownProperty( "fullName" ).which.is.an.Object().and.has.properties( "code", "type", "$type" );
			Item.schema.computed.fullName.code.should.be.Function();
			Item.schema.computed.fullName.type.should.be.equal( "date" );
			Item.schema.computed.fullName.$type.prototype.should.be.instanceOf( OdemModelType );
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );

		it( "accepts schema explicitly defining computed property with explicitly defined custom type handler overriding implicitly defined one", () => {
			const Item = OdemModel.define( "Item", {
				props: {
					lastName: {},
					firstName: {},
				},
				computed: {
					"fullName:integer": {
						code() { return this.lastName + ", " + this.firstName; },
						type: "date",
					},
				},
			} );

			Item.schema.should.be.Object().which.has.properties( "props", "computed", "methods", "hooks" );
			Item.schema.props.should.have.size( 2 );
			Item.schema.props.should.have.ownProperty( "firstName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.props.should.have.ownProperty( "lastName" ).which.has.property( "type" ).which.is.equal( "string" );
			Item.schema.computed.should.have.size( 1 );
			Item.schema.computed.should.have.ownProperty( "fullName" ).which.is.an.Object().and.has.properties( "code", "type", "$type" );
			Item.schema.computed.fullName.code.should.be.Function();
			Item.schema.computed.fullName.type.should.be.equal( "date" );
			Item.schema.computed.fullName.$type.prototype.should.be.instanceOf( OdemModelType );
			Item.schema.methods.should.be.empty();
			Item.schema.hooks.should.be.empty();
		} );
	} );
} );
