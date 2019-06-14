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
const Should = require( "should" );


const Model = require( "../../lib/model/base" );
const Compiler = require( "../../lib/model/compiler" );
const { Adapter, MemoryAdapter, FileAdapter } = require( "../../lib/adapter" );


suite( "Model compiler", function() {
	/**
	 * Creates some "class" imitating parts of `Model`.
	 *
	 * @param {object<string,object>} attributes attributes' definitions to be exposed in faked model's schema
	 * @param {object<string,function>} computeds computed attributes' definitions to be exposed in faked model's schema
	 * @param {object<string,function[]>} hooks hook definitions to be exposed in faked model's schema
	 * @returns {Function} class faking essential parts of Model's API
	 */
	function fakeModel( { attributes = {}, computeds = {}, hooks = {} } = {} ) {
		const fake = function FakeModel() {}; // eslint-disable-line no-empty-function, func-style

		Object.defineProperties( fake, {
			schema: { value: { attributes, computeds, hooks } },
		} );

		return fake;
	}

	/**
	 * Creates instance of some "class" imitating parts of `Model`.
	 *
	 * @param {object<string,*>} properties properties of instance of faked model
	 * @param {object<string,object>} attributes attributes' definitions to be exposed in faked model's schema
	 * @param {object<string,function>} computeds computed attributes' definitions to be exposed in faked model's schema
	 * @param {object<string,function[]>} hooks hook definitions to be exposed in faked model's schema
	 * @returns {object} instance imitating essential parts of a Model's item's API
	 */
	function fakeModelInstance( { properties = {}, attributes = {}, computeds = {}, hooks = {} } = {} ) {
		const Fake = fakeModel( { attributes, computeds, hooks } );
		const fake = new Fake();

		Object.defineProperties( fake, {
			properties: { value: properties },
		} );

		return fake;
	}


	test( "is available", function() {
		Should.exist( Compiler );
	} );

	suite( "basically exports compiler function which", function() {
		/**
		 * Does not inherit from basic model class.
		 */
		class CustomClass {}

		/**
		 * Inherits from basic model class.
		 */
		class CustomBaseClass extends Model {}



		test( "is available", function() {
			Compiler.should.be.Function();
		} );

		test( "requires at least one argument", function() {
			Compiler.should.have.length( 1 );
		} );

		test( "requires provision of valid name of model to define in first argument", function() {
			( () => Compiler() ).should.throw();
			( () => Compiler( undefined ) ).should.throw();
			( () => Compiler( null ) ).should.throw();
			( () => Compiler( false ) ).should.throw();
			( () => Compiler( true ) ).should.throw();
			( () => Compiler( 5 ) ).should.throw();
			( () => Compiler( -3.5 ) ).should.throw();
			( () => Compiler( 0 ) ).should.throw();
			( () => Compiler( [] ) ).should.throw();
			( () => Compiler( ["name"] ) ).should.throw();
			( () => Compiler( { name: "name" } ) ).should.throw();
			( () => Compiler( () => "name" ) ).should.throw();
			( () => Compiler( "" ) ).should.throw();

			( () => Compiler( "name" ) ).should.not.throw();
		} );

		test( "supports optional provision of schema definition object in second argument", function() {
			( () => Compiler( "name" ) ).should.not.throw();
			( () => Compiler( "name", undefined ) ).should.not.throw();

			( () => Compiler( "name", null ) ).should.throw();
			( () => Compiler( "name", false ) ).should.throw();
			( () => Compiler( "name", true ) ).should.throw();
			( () => Compiler( "name", 5 ) ).should.throw();
			( () => Compiler( "name", -3.5 ) ).should.throw();
			( () => Compiler( "name", 0 ) ).should.throw();
			( () => Compiler( "name", [] ) ).should.throw();
			( () => Compiler( "name", [{}] ) ).should.throw();
			( () => Compiler( "name", () => {} ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => Compiler( "name", "" ) ).should.throw();
			( () => Compiler( "name", "schema" ) ).should.throw();

			( () => Compiler( "name", {} ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} } ) ).should.not.throw();
			( () => Compiler( "name", { prop: { type: "string" } } ) ).should.not.throw();
		} );

		test( "supports optional provision of base class derived from `Model` to become base class of defined Model implementation", function() {
			( () => Compiler( "name", { prop: {} } ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, undefined ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, null ) ).should.not.throw();

			( () => Compiler( "name", { prop: {} }, false ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, true ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, 5 ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, -3.5 ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, 0 ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, [] ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, [CustomBaseClass] ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, () => {} ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => Compiler( "name", { prop: {} }, () => CustomBaseClass ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, {} ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, { base: CustomBaseClass } ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, "" ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, "CustomBaseClass" ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, CustomClass ) ).should.throw();

			( () => Compiler( "name", { prop: {} }, Model ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, CustomBaseClass ) ).should.not.throw();
		} );

		test( "supports optional provision of adapter to use explicitly with resulting implementation of Model", function() {
			( () => Compiler( "name", { prop: {} }, null ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, null, undefined ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, null, null ) ).should.not.throw();

			( () => Compiler( "name", { prop: {} }, null, false ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, true ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, 5 ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, -3.5 ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, 0 ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, [] ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, [CustomBaseClass] ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, () => {} ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => Compiler( "name", { prop: {} }, null, () => CustomBaseClass ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, {} ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, { base: CustomBaseClass } ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, "" ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, "CustomBaseClass" ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, CustomClass ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, CustomBaseClass ) ).should.throw();

			( () => Compiler( "name", { prop: {} }, null, Adapter ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, MemoryAdapter ) ).should.throw();
			( () => Compiler( "name", { prop: {} }, null, FileAdapter ) ).should.throw();

			( () => Compiler( "name", { prop: {} }, null, new Adapter() ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, null, new MemoryAdapter() ) ).should.not.throw();
			( () => Compiler( "name", { prop: {} }, null, new FileAdapter() ) ).should.not.throw();
		} );

		suite( "returns class that", function() {
			test( "is derived from `Model` (when invoked w/o schema)", function() {
				const Sub = Compiler( "mySub" );

				Sub.prototype.should.be.instanceOf( Model );
			} );

			test( "can be instantiated (when invoked w/o schema)", function() {
				const Sub = Compiler( "mySub" );

				const item = new Sub();

				item.should.be.instanceOf( Model );
			} );

			test( "can be used as base class in another invocation", function() {
				const Sub = Compiler( "mySub" );
				const SubSub = Compiler( "mySub", {}, Sub );

				const sub = new Sub();
				const subSub = new SubSub();

				sub.should.be.instanceOf( Model );
				subSub.should.be.instanceOf( Model );

				sub.should.be.instanceOf( Sub );
				subSub.should.be.instanceOf( Sub );

				sub.should.not.be.instanceOf( SubSub );
				subSub.should.be.instanceOf( SubSub );
			} );

			test( "is exposing attributes defined in provided schema as properties of every instance", function() {
				const Employee = Compiler( "employee", {
					name: {},
					age: {
						type: "int"
					},
					label: function() {
						return `${this.name} (Age: ${this.age})`;
					}
				} );

				const boss = new Employee();
				boss.name = "John Doe";
				boss.age = 45;

				boss.label.should.equal( "John Doe (Age: 45)" );
			} );

			test( "is statically exposing adapter provided on call for compilation", function() {
				const adapter = new MemoryAdapter();
				const Employee = Compiler( "employee", { name: {} }, null, adapter );

				Employee.adapter.should.be.equal( adapter );
			} );

			test( "is exposing adapter provided on call for compilation on every instance, too", function() {
				const adapter = new MemoryAdapter();
				const Employee = Compiler( "employee", { name: {} }, null, adapter );

				const boss = new Employee();

				boss.adapter.should.be.equal( adapter );
			} );

			test( "can be instantiated with instances suitable for validating properties, saving them to and reading them from a storage", () => {
				const storage = new MemoryAdapter();
				const MyModel = Compiler( "MyModel", {
					name: {},
					height: { type: "integer", min: 50 },
					weight: { type: "number", min: 10 },
					dayOfBirth: { type: "date" },
					isFriend: { type: "boolean" },
				}, null, storage );

				// creating new item of model
				const freshOne = new MyModel( null, { onUnsaved: false } );

				// assigning values and checking implicit coercion of values
				freshOne.name = 5;
				freshOne.name.should.be.String().which.is.equal( "5" );

				freshOne.height = "48.6";
				freshOne.height.should.be.Number().which.is.equal( 49 );

				freshOne.weight = " 5.2 ";
				freshOne.weight.should.be.Number().which.is.equal( 5.2 );

				freshOne.dayOfBirth = "2000-09-06";
				freshOne.dayOfBirth.should.be.Date();
				freshOne.dayOfBirth.getFullYear().should.be.equal( 2000 );
				freshOne.dayOfBirth.getMonth().should.be.equal( 8 ); // for counting from 0 for January
				freshOne.dayOfBirth.getDate().should.be.equal( 6 );

				freshOne.isFriend = 1;
				freshOne.isFriend.should.be.Boolean().which.is.true();

				Should( freshOne.uuid ).be.null();

				// try saving w/ partially invalid property values
				return freshOne.save().should.be.Promise().which.is.rejected()
					.then( () => {
						Should( freshOne.uuid ).be.null();

						// check validation explicitly
						return freshOne.validate().should.be.Promise().which.is.resolvedWith( [
							new Error( ["height is below required minimum"] ),
							new Error( ["weight is below required minimum"] ),
						] );
					} )
					.then( () => {
						// adjust values (no warning or exception here due to `onUnsaved` set false in c'tor before)
						freshOne.height = 50;
						freshOne.weight = 10.8;

						Should( freshOne.uuid ).be.null();

						// try saving w/ fixed values again
						return freshOne.save().should.be.Promise().which.is.resolved();
					} )
					.then( () => {
						Should( freshOne.uuid ).not.be.null();

						// check validation explicitly, again
						return freshOne.validate().should.be.Promise().which.is.resolvedWith( [] );
					} )
					.then( () => {
						// check record serialization by reading record from backend directly
						return storage.read( freshOne.dataKey.replace( /%u/g, freshOne.uuid ) )
							.then( record => {
								record.should.be.Object();
								record.should.have.property( "name" ).which.is.a.String().and.equal( "5" );
								record.should.have.property( "height" ).which.is.a.Number().and.equal( 50 );
								record.should.have.property( "weight" ).which.is.a.Number().and.equal( 10.8 );
								record.should.have.property( "dayOfBirth" ).which.is.a.String().and.match( /^2000-09-06(?:T00:00:00)/ );
								record.should.have.property( "isFriend" ).which.is.a.Number().and.equal( 1 );
							} );
					} )
					.then( () => {
						// adjust record in storage
						return storage.write( freshOne.dataKey.replace( /%u/g, freshOne.uuid ), {
							name: "Jane Doe",
							height: "46.4",
							weight: "2.854",
							dayOfBirth: "2004-02-07",
							isFriend: null,
						} );
					} )
					.then( () => {
						// create another instance reading from that record (testing deserializer)
						const copy = new MyModel( freshOne.uuid );

						return copy.load()
							.then( () => {
								copy.name.should.be.String().which.is.equal( "Jane Doe" );
								copy.height.should.be.Number().which.is.equal( 46 );
								copy.weight.should.be.Number().which.is.equal( 2.854 );
								copy.dayOfBirth.should.be.Date();
								copy.dayOfBirth.getFullYear().should.be.equal( 2004 );
								copy.dayOfBirth.getMonth().should.be.equal( 1 ); // for counting from 0 for January
								copy.dayOfBirth.getDate().should.be.equal( 7 );
								Should( copy.isFriend ).be.null();

								// validate loaded record again (failing again)
								return copy.validate().should.be.Promise().which.is.resolvedWith( [
									new Error( ["height is below required minimum"] ),
									new Error( ["weight is below required minimum"] ),
								] );
							} );
					} );
			} );
		} );
	} );

	test( "additionally exposes internally used functions for unit-testing", function() {
		Compiler.should.have.property( "_utility" ).which.is.an.Object();

		Compiler._utility.should.have.property( "splitSchemaElements" ).which.is.a.Function();
		Compiler._utility.should.have.property( "validateAttributes" ).which.is.a.Function();
		Compiler._utility.should.have.property( "compileSerializer" ).which.is.a.Function();
	} );

	suite( "contains internal method for splitting schema elements which", function() {
		const { splitSchemaElements } = Compiler._utility;

		test( "validates proper provision of a model's name in first argument", function() {
			( () => splitSchemaElements() ).should.throw();
			( () => splitSchemaElements( undefined ) ).should.throw();
			( () => splitSchemaElements( null ) ).should.throw();
			( () => splitSchemaElements( false ) ).should.throw();
			( () => splitSchemaElements( true ) ).should.throw();
			( () => splitSchemaElements( 0 ) ).should.throw();
			( () => splitSchemaElements( 4.5 ) ).should.throw();
			( () => splitSchemaElements( -3000 ) ).should.throw();
			( () => splitSchemaElements( [] ) ).should.throw();
			( () => splitSchemaElements( ["name"] ) ).should.throw();
			( () => splitSchemaElements( {} ) ).should.throw();
			( () => splitSchemaElements( { name: "name" } ) ).should.throw();
			( () => splitSchemaElements( () => "name" ) ).should.throw();
			( () => splitSchemaElements( "" ) ).should.throw();

			( () => splitSchemaElements( "name" ) ).should.not.throw();
		} );

		test( "validates proper provision of a schema definition in second argument", function() {
			// okay due to 2nd arg defaulting to empty object:
			( () => splitSchemaElements( "name" ) ).should.not.throw();
			( () => splitSchemaElements( "name", undefined ) ).should.not.throw();

			// fail on providing anything but an object
			( () => splitSchemaElements( "name", null ) ).should.throw();
			( () => splitSchemaElements( "name", false ) ).should.throw();
			( () => splitSchemaElements( "name", true ) ).should.throw();
			( () => splitSchemaElements( "name", 0 ) ).should.throw();
			( () => splitSchemaElements( "name", 4.5 ) ).should.throw();
			( () => splitSchemaElements( "name", -3000 ) ).should.throw();
			( () => splitSchemaElements( "name", [] ) ).should.throw();
			( () => splitSchemaElements( "name", ["name"] ) ).should.throw();
			( () => splitSchemaElements( "name", () => "name" ) ).should.throw();
			( () => splitSchemaElements( "name", "" ) ).should.throw();
			( () => splitSchemaElements( "name", "name" ) ).should.throw();

			( () => splitSchemaElements( "name", {} ) ).should.not.throw();
			( () => splitSchemaElements( "name", { name: {} } ) ).should.not.throw();
		} );

		test( "accepts array for collecting errors while splitting in third argument", function() {
			( () => splitSchemaElements( "name", undefined, [] ) ).should.not.throw();
			( () => splitSchemaElements( "name", {}, [] ) ).should.not.throw();
			( () => splitSchemaElements( "name", { name: {} }, [] ) ).should.not.throw();
		} );

		test( "supports empty schema", function() {
			( () => splitSchemaElements( "name" ) ).should.not.throw();
			( () => splitSchemaElements( "name", undefined ) ).should.not.throw();
			( () => splitSchemaElements( "name", {} ) ).should.not.throw();
		} );

		test( "always returns separate sets mutually exclusively containing attributes, computed attributes and hooks of schema", function() {
			const empty = splitSchemaElements( "name" );

			empty.should.be.Object();
			empty.should.have.property( "attributes" ).which.is.an.Object().which.is.empty();
			empty.should.have.property( "computeds" ).which.is.an.Object().which.is.empty();
			empty.should.have.property( "hooks" ).which.is.an.Object().which.is.empty();
		} );

		test( "considers all schema elements of type (regular) object to be attribute definition", function() {
			const errors = [];
			const split = splitSchemaElements( "name", {
				someData: {},
			}, errors );

			split.should.be.Object();
			split.should.have.property( "attributes" ).which.is.an.Object().which.is.not.empty();
			split.should.have.property( "computeds" ).which.is.an.Object().which.is.empty();
			split.should.have.property( "hooks" ).which.is.an.Object().which.is.empty();

			split.attributes.should.have.property( "someData" ).which.is.an.Object();

			errors.should.be.empty();
		} );

		test( "considers all schema elements of type function to be computed properties", function() {
			const errors = [];
			const split = splitSchemaElements( "name", {
				someComputed: () => null,
			}, errors );

			split.should.be.Object();
			split.should.have.property( "attributes" ).which.is.an.Object().which.is.empty();
			split.should.have.property( "computeds" ).which.is.an.Object().which.is.not.empty();
			split.should.have.property( "hooks" ).which.is.an.Object().which.is.empty();

			split.computeds.should.have.property( "someComputed" ).which.is.a.Function();

			errors.should.be.empty();
		} );

		test( "considers all schema elements of type array to be lists of lifecycle hook handlers", function() {
			const errors = [];
			const split = splitSchemaElements( "name", {
				onSomeEvent: [() => null],
			}, errors );

			split.should.be.Object();
			split.should.have.property( "attributes" ).which.is.an.Object().which.is.empty();
			split.should.have.property( "computeds" ).which.is.an.Object().which.is.empty();
			split.should.have.property( "hooks" ).which.is.an.Object().which.is.not.empty();

			split.hooks.should.have.property( "onSomeEvent" ).which.is.an.Array().which.has.length( 1 );

			errors.should.be.empty();
		} );

		test( "collects errors on all invalid schema elements in optionally provided list", function() {
			[
				{ someInvalidElement: null },
				{ someInvalidElement: false },
				{ someInvalidElement: true },
				{ someInvalidElement: 0 },
				{ someInvalidElement: 1.5 },
				{ someInvalidElement: -4321 },
				{ someInvalidElement: "" },
				{ someInvalidElement: "string" },
			]
				.forEach( schema => {
					const errors = [];
					const split = splitSchemaElements( "name", schema, errors );

					split.should.be.Object();
					split.should.have.property( "attributes" ).which.is.an.Object().which.is.empty();
					split.should.have.property( "computeds" ).which.is.an.Object().which.is.empty();
					split.should.have.property( "hooks" ).which.is.an.Object().which.is.empty();

					errors.should.have.length( 1 );
				} );
		} );
	} );

	suite( "contains internal method for validating attribute definitions which", function() {
		const { validateAttributes } = Compiler._utility;

		test( "does not validate proper provision of a model's name in first argument", function() {
			( () => validateAttributes() ).should.not.throw();
			( () => validateAttributes( undefined ) ).should.not.throw();
			( () => validateAttributes( null ) ).should.not.throw();
			( () => validateAttributes( false ) ).should.not.throw();
			( () => validateAttributes( true ) ).should.not.throw();
			( () => validateAttributes( 0 ) ).should.not.throw();
			( () => validateAttributes( 4.5 ) ).should.not.throw();
			( () => validateAttributes( -3000 ) ).should.not.throw();
			( () => validateAttributes( [] ) ).should.not.throw();
			( () => validateAttributes( ["name"] ) ).should.not.throw();
			( () => validateAttributes( {} ) ).should.not.throw();
			( () => validateAttributes( { name: "name" } ) ).should.not.throw();
			( () => validateAttributes( () => "name" ) ).should.not.throw();
			( () => validateAttributes( "" ) ).should.not.throw();
			( () => validateAttributes( "name" ) ).should.not.throw();
		} );

		test( "requires provision of some object in second argument", function() {
			// okay due to 2nd arg defaulting to empty object:
			( () => validateAttributes( "name" ) ).should.not.throw();
			( () => validateAttributes( "name", undefined ) ).should.not.throw();

			// fail on providing anything but an object
			( () => validateAttributes( "name", null ) ).should.throw();
			( () => validateAttributes( "name", false ) ).should.throw();
			( () => validateAttributes( "name", true ) ).should.throw();
			( () => validateAttributes( "name", 0 ) ).should.throw();
			( () => validateAttributes( "name", 4.5 ) ).should.throw();
			( () => validateAttributes( "name", -3000 ) ).should.throw();
			( () => validateAttributes( "name", [] ) ).should.throw();
			( () => validateAttributes( "name", ["name"] ) ).should.throw();
			( () => validateAttributes( "name", () => "name" ) ).should.throw();
			( () => validateAttributes( "name", "" ) ).should.throw();
			( () => validateAttributes( "name", "name" ) ).should.throw();

			( () => validateAttributes( "name", {} ) ).should.not.throw();
			( () => validateAttributes( "name", { name: {} } ) ).should.not.throw();
		} );

		test( "adjusts provided definition of attribute w/o explicit selection of type to use 'string' by default", function() {
			const definition = {};

			validateAttributes( "name", { name: definition } );

			definition.should.be.Object().which.has.property( "type" ).which.is.equal( "string" );
		} );

		test( "does not reject special attribute names", function() {
			( () => validateAttributes( "name", { prototype: {} } ) ).should.not.throw();
			( () => validateAttributes( "name", { constructor: {} } ) ).should.not.throw();
			( () => validateAttributes( "name", { super: {} } ) ).should.not.throw();

			( () => validateAttributes( "name", { exists: {} } ) ).should.not.throw();
			( () => validateAttributes( "name", { load: {} } ) ).should.not.throw();
			( () => validateAttributes( "name", { save: {} } ) ).should.not.throw();
			( () => validateAttributes( "name", { validate: {} } ) ).should.not.throw();
		} );

		test( "returns related handler per defined attribute", function() {
			const definition = {};
			const handlers = validateAttributes( "name", { name: definition } );

			handlers.should.be.Object().which.has.size( 1 ).and.have.ownProperty( "name" ).which.is.not.equal( definition );
		} );

		test( "returns same handler for same type of attribute", function() {
			const definition = { name: { type: "string" }, label: {} };
			const handlers = validateAttributes( "name", definition );

			handlers.should.have.size( 2 );
			handlers.should.have.ownProperty( "name" );
			handlers.should.have.ownProperty( "label" ).which.is.equal( handlers.name );
			definition.name.should.not.equal( definition.label );
		} );

		test( "returns same handler for same type of attribute using different aliases", function() {
			const definition = { name: { type: "string" }, label: { type: "text" } };
			const handlers = validateAttributes( "name", definition );

			handlers.should.have.size( 2 );
			handlers.should.have.ownProperty( "name" );
			handlers.should.have.ownProperty( "label" ).which.is.equal( handlers.name );
			definition.name.should.not.equal( definition.label );
		} );

		test( "returns same handler for same type of attribute using different forms of same alias", function() {
			const definition = { name: { type: "string" }, label: { type: "STRING" } };
			const handlers = validateAttributes( "name", definition );

			handlers.should.have.size( 2 );
			handlers.should.have.ownProperty( "name" );
			handlers.should.have.ownProperty( "label" ).which.is.equal( handlers.name );
			definition.name.should.not.equal( definition.label );
		} );

		test( "returns different handler for different type of attribute", function() {
			const definition = { name: { type: "string" }, label: { type: "integer" } };
			const handlers = validateAttributes( "name", definition );

			handlers.should.have.size( 2 );
			handlers.should.have.ownProperty( "name" );
			handlers.should.have.ownProperty( "label" ).which.is.not.equal( handlers.name );
			definition.name.should.not.equal( definition.label );
		} );

		test( "returns same handler for same type of attribute selected by different aliases", function() {
			const definition = { name: { type: "int" }, label: { type: "integer" } };
			const handlers = validateAttributes( "name", definition );

			handlers.should.have.size( 2 );
			handlers.should.have.ownProperty( "name" );
			handlers.should.have.ownProperty( "label" ).which.is.equal( handlers.name );
			definition.name.should.not.equal( definition.label );
		} );
	} );

	suite( "contains internal method for compiling attribute validation code which", function() {
		const { compileValidator } = Compiler._utility;

		test( "requires provision of apparently valid and qualified definition of attributes in first argument", function() {
			( () => compileValidator() ).should.throw();
			( () => compileValidator( undefined ) ).should.throw();
			( () => compileValidator( null ) ).should.throw();
			( () => compileValidator( false ) ).should.throw();
			( () => compileValidator( true ) ).should.throw();
			( () => compileValidator( 0 ) ).should.throw();
			( () => compileValidator( 4.5 ) ).should.throw();
			( () => compileValidator( -3000 ) ).should.throw();
			( () => compileValidator( [] ) ).should.throw();
			( () => compileValidator( ["name"] ) ).should.throw();
			( () => compileValidator( () => "name" ) ).should.throw();
			( () => compileValidator( "" ) ).should.throw();
			( () => compileValidator( "name" ) ).should.throw();
			( () => compileValidator( { name: "name" } ) ).should.throw();
			( () => compileValidator( { name: {} } ) ).should.throw(); // due to the lack of property `type`

			( () => compileValidator( {} ) ).should.not.throw();
			( () => compileValidator( { name: { type: "int" } } ) ).should.not.throw();
		} );

		test( "returns function not expecting any arguments on invocation", function() {
			const validator = compileValidator( {} );

			validator.should.be.Function().which.has.length( 0 );
		} );

		test( "returns function expecting to be bound to some model instance or similar on invocation", function() {
			const validator = compileValidator( {} );

			validator.should.throw();
			validator.bind( fakeModelInstance() ).should.not.throw();
		} );

		test( "returns empty function returning empty array on invocation", function() {
			const validator = compileValidator( {} );

			validator.call( fakeModelInstance() ).should.be.Array().which.is.empty();
		} );

		test( "returns non-empty function on non-empty definition which is throwing on invocation w/o context similar to Model instance and w/o attributes' definition", function() {
			const definition = { name: { type: "string" }, age: { type: "int" } };
			const validator = compileValidator( definition );

			validator.should.be.Function().which.has.length( 0 );
			validator.should.throw();

			validator.bind( fakeModelInstance() ).should.throw();
			validator.bind( fakeModelInstance( { attributes: definition } ) ).should.not.throw();
			validator.bind( fakeModelInstance( { attributes: definition } ) )().should.be.Array();
		} );
	} );

	suite( "contains internal method for compiling code coercing all attributes of model in a row which", function() {
		const { compileCoercion } = Compiler._utility;

		test( "requires provision of apparently valid and qualified definition of attributes in first argument", function() {
			( () => compileCoercion() ).should.throw();
			( () => compileCoercion( undefined ) ).should.throw();
			( () => compileCoercion( null ) ).should.throw();
			( () => compileCoercion( false ) ).should.throw();
			( () => compileCoercion( true ) ).should.throw();
			( () => compileCoercion( 0 ) ).should.throw();
			( () => compileCoercion( 4.5 ) ).should.throw();
			( () => compileCoercion( -3000 ) ).should.throw();
			( () => compileCoercion( [] ) ).should.throw();
			( () => compileCoercion( ["name"] ) ).should.throw();
			( () => compileCoercion( () => "name" ) ).should.throw();
			( () => compileCoercion( "" ) ).should.throw();
			( () => compileCoercion( "name" ) ).should.throw();
			( () => compileCoercion( { name: "name" } ) ).should.throw();
			( () => compileCoercion( { name: {} } ) ).should.throw(); // due to the lack of property `type`

			( () => compileCoercion( {} ) ).should.not.throw();
			( () => compileCoercion( { name: { type: "int" } } ) ).should.not.throw();
		} );

		test( "returns function not expecting any arguments on invocation", function() {
			const coercer = compileCoercion( {} );

			coercer.should.be.Function().which.has.length( 0 );
		} );

		test( "returns function expecting to be bound to some model instance or similar on invocation", function() {
			const coercer = compileCoercion( {} );

			coercer.should.throw();
			coercer.bind( fakeModelInstance() ).should.not.throw();
		} );

		test( "returns empty function not returning anything", function() {
			const coercer = compileCoercion( {} );

			Should( coercer.call( fakeModelInstance() ) ).be.undefined();
		} );

		test( "returns non-empty function on non-empty definition which is expecting attributes' definition as soon as there are matching properties", function() {
			const attributes = { name: { type: "string" }, age: { type: "int" } };
			const mismatching = { label: "John", size: 42 };
			const matchingName = { name: "John" };
			const matchingAge = { age: 42 };
			const matchingBoth = { name: "John", age: 42 };
			const coercer = compileCoercion( attributes );

			coercer.should.be.Function().which.has.length( 0 );
			coercer.should.throw();

			coercer.bind( fakeModelInstance( {} ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: mismatching } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: mismatching, attributes } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: Object.assign( {}, mismatching, matchingName ) } ) ).should.throw();
			coercer.bind( fakeModelInstance( { properties: Object.assign( {}, mismatching, matchingName ), attributes } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: Object.assign( {}, mismatching, matchingAge ) } ) ).should.throw();
			coercer.bind( fakeModelInstance( { properties: Object.assign( {}, mismatching, matchingAge ), attributes } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: Object.assign( {}, mismatching, matchingBoth ) } ) ).should.throw();
			coercer.bind( fakeModelInstance( { properties: Object.assign( {}, mismatching, matchingBoth ), attributes } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: matchingName } ) ).should.throw();
			coercer.bind( fakeModelInstance( { properties: matchingName, attributes } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: matchingAge } ) ).should.throw();
			coercer.bind( fakeModelInstance( { properties: matchingAge, attributes } ) ).should.not.throw();
			coercer.bind( fakeModelInstance( { properties: matchingBoth } ) ).should.throw();
			coercer.bind( fakeModelInstance( { properties: matchingBoth, attributes } ) ).should.not.throw();
		} );

		test( "returns non-empty function on non-empty definition not returning anything", function() {
			const definition = { name: { type: "string" }, age: { type: "int" } };
			const coercer = compileCoercion( definition );

			Should( coercer.call( fakeModelInstance( { properties: {}, attributes: definition } ) ) ).be.undefined();
		} );

		test( "returns non-empty function on non-empty definition adjusting properties provided as context", function() {
			let attributes = { name: { type: "string" } };
			let coercer = compileCoercion( attributes );

			coercer.should.be.Function().which.has.length( 0 );
			coercer.should.throw();

			let item = fakeModelInstance( { properties: { name: "John Doe", age: 42 }, attributes } );
			let coerced = coercer.bind( item, attributes )();
			Should.not.exist( coerced );
			item.properties.should.have.size( 2 );
			item.properties.should.have.ownProperty( "name" ).which.is.equal( "John Doe" );
			item.properties.should.have.ownProperty( "age" ).which.is.equal( 42 );


			attributes = { name: { type: "string" }, age: { type: "int" }, active: { type: "bool" } };
			coercer = compileCoercion( attributes );

			item = fakeModelInstance( { properties: { name: "John Doe", age: 42, active: true }, attributes } );
			coerced = coercer.bind( item, attributes )();
			Should.not.exist( coerced );
			item.properties.should.have.size( 3 );
			item.properties.should.have.ownProperty( "name" ).which.is.equal( "John Doe" );
			item.properties.should.have.ownProperty( "age" ).which.is.equal( 42 );
			item.properties.should.have.ownProperty( "active" ).which.is.equal( true );

			item = fakeModelInstance( { properties: { name: null, age: "42", active: 1 }, attributes } );
			coerced = coercer.bind( item, attributes )();
			Should.not.exist( coerced );
			item.properties.should.have.size( 3 );
			item.properties.should.have.ownProperty( "name" ).which.is.null();
			item.properties.should.have.ownProperty( "age" ).which.is.equal( 42 );
			item.properties.should.have.ownProperty( "active" ).which.is.equal( true );
		} );

		test( "returns non-empty function on non-empty definition adjusting defined properties in provided context, only", function() {
			const attributes = { name: { type: "string" } };
			const coercer = compileCoercion( attributes );

			coercer.should.be.Function().which.has.length( 0 );
			coercer.should.throw();

			const item = fakeModelInstance( { properties: { name: "John Doe", age: "42", active: 1 }, attributes } );
			const coerced = coercer.bind( item, attributes )();
			Should.not.exist( coerced );
			item.properties.should.have.size( 3 );
			item.properties.should.have.ownProperty( "name" ).which.is.equal( "John Doe" );
			item.properties.should.have.ownProperty( "age" ).which.is.equal( "42" );
			item.properties.should.have.ownProperty( "active" ).which.is.equal( 1 );
		} );

		test( "returns non-empty function on non-empty definition setting all defined properties `null` if unset", function() {
			const attributes = { name: { type: "string" }, age: { type: "int" }, active: { type: "bool" } };
			const coercer = compileCoercion( attributes );

			const item = fakeModelInstance( { attributes } );
			const coerced = coercer.bind( item, attributes )();
			Should.not.exist( coerced );
			item.properties.should.have.size( 3 );
			item.properties.should.have.ownProperty( "name" ).which.is.null();
			item.properties.should.have.ownProperty( "age" ).which.is.null();
			item.properties.should.have.ownProperty( "active" ).which.is.null();
		} );
	} );

	suite( "contains internal method for compiling code serializing all attributes of model in a row which", function() {
		const { compileSerializer } = Compiler._utility;

		test( "requires provision of apparently valid and qualified definition of attributes in first argument", function() {
			( () => compileSerializer() ).should.throw();
			( () => compileSerializer( undefined ) ).should.throw();
			( () => compileSerializer( null ) ).should.throw();
			( () => compileSerializer( false ) ).should.throw();
			( () => compileSerializer( true ) ).should.throw();
			( () => compileSerializer( 0 ) ).should.throw();
			( () => compileSerializer( 4.5 ) ).should.throw();
			( () => compileSerializer( -3000 ) ).should.throw();
			( () => compileSerializer( [] ) ).should.throw();
			( () => compileSerializer( ["name"] ) ).should.throw();
			( () => compileSerializer( () => "name" ) ).should.throw();
			( () => compileSerializer( "" ) ).should.throw();
			( () => compileSerializer( "name" ) ).should.throw();
			( () => compileSerializer( { name: "name" } ) ).should.throw();
			( () => compileSerializer( { name: {} } ) ).should.throw(); // due to the lack of property `type`

			( () => compileSerializer( {} ) ).should.not.throw();
			( () => compileSerializer( { name: { type: "int" } } ) ).should.not.throw();
		} );

		suite( "can be invoked with empty definition of attributes so it returns a function which", () => {
			let serializer;

			setup( () => {
				serializer = compileSerializer( {} );
			} );

			test( "is expecting sole argument on invocation", function() {
				serializer.should.be.Function().which.has.length( 1 );
			} );

			test( "is instantly invocable w/o any argument, though", function() {
				serializer.should.not.throw();
			} );

			describe( "is returning empty object of serialized values when it", () => {
				test( "is invoked w/o argument", function() {
					serializer().should.be.Object().which.is.empty();
				} );

				test( "is invoked w/ empty object", function() {
					serializer( {} ).should.be.Object().which.is.empty();
				} );

				test( "is invoked w/ non-empty object", function() {
					serializer( {
						name: "John Doe",
						age: "23",
					} ).should.be.Object().which.is.empty();
				} );
			} );
		} );

		suite( "can be invoked with non-empty definition of attributes so it returns a function which", () => {
			let serializer;

			setup( () => {
				serializer = compileSerializer( {
					name: { type: "string" },
					age: { type: "int" },
				} );
			} );

			test( "is expecting sole argument on invocation", function() {
				serializer.should.be.Function().which.has.length( 1 );
			} );

			test( "is instantly invocable w/o any argument, though", function() {
				serializer.should.not.throw();
			} );

			describe( "is returning non-empty object containing all defined attributes as properties with _serialized_ values when it", () => {
				test( "is invoked w/o argument", function() {
					serializer().should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				test( "is invoked w/ empty object", function() {
					serializer( {} ).should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				test( "is invoked w/ non-empty object providing some defined attributes, only", function() {
					let serialized = serializer( {
						name: 23,
					} );

					serialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					serialized.name.should.be.String().which.is.equal( "23" );
					Should( serialized.age ).be.null();

					serialized = serializer( {
						age: 23,
					} );

					serialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					Should( serialized.name ).be.null();
					serialized.age.should.be.Number().which.is.equal( 23 );
				} );

				test( "is invoked w/ non-empty object providing all defined attributes, only", function() {
					const serialized = serializer( {
						name: 23,
						age: 23,
					} );

					serialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					serialized.name.should.be.String().which.is.equal( "23" );
					serialized.age.should.be.Number().which.is.equal( 23 );
				} );

				test( "is invoked w/ non-empty object providing properties in addition to defined attributes", function() {
					const serialized = serializer( {
						name: 23,
						age: 23,
						additional: true,
					} );

					serialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					serialized.name.should.be.String().which.is.equal( "23" );
					serialized.age.should.be.Number().which.is.equal( 23 );
				} );
			} );
		} );
	} );

	suite( "contains internal method for compiling code deserializing all attributes of model in a row which", function() {
		const { compileDeserializer } = Compiler._utility;

		test( "requires provision of apparently valid and qualified definition of attributes in first argument", function() {
			( () => compileDeserializer() ).should.throw();
			( () => compileDeserializer( undefined ) ).should.throw();
			( () => compileDeserializer( null ) ).should.throw();
			( () => compileDeserializer( false ) ).should.throw();
			( () => compileDeserializer( true ) ).should.throw();
			( () => compileDeserializer( 0 ) ).should.throw();
			( () => compileDeserializer( 4.5 ) ).should.throw();
			( () => compileDeserializer( -3000 ) ).should.throw();
			( () => compileDeserializer( [] ) ).should.throw();
			( () => compileDeserializer( ["name"] ) ).should.throw();
			( () => compileDeserializer( () => "name" ) ).should.throw();
			( () => compileDeserializer( "" ) ).should.throw();
			( () => compileDeserializer( "name" ) ).should.throw();
			( () => compileDeserializer( { name: "name" } ) ).should.throw();
			( () => compileDeserializer( { name: {} } ) ).should.throw(); // due to the lack of property `type`

			( () => compileDeserializer( {} ) ).should.not.throw();
			( () => compileDeserializer( { name: { type: "int" } } ) ).should.not.throw();
		} );

		suite( "can be invoked with empty definition of attributes so it returns a function which", () => {
			let deserializer;

			setup( () => {
				deserializer = compileDeserializer( {} );
			} );

			test( "is expecting two arguments on invocation", function() {
				deserializer.should.be.Function().which.has.length( 2 );
			} );

			test( "isn't instantly invocable w/o any argument", function() {
				deserializer.should.throw();
			} );

			test( "isn't instantly invocable w/ sole argument, too", function() {
				( () => deserializer( {} ) ).should.throw();
			} );

			test( "is instantly invocable w/ two proper arguments", function() {
				( () => deserializer( {}, {} ) ).should.not.throw();
			} );

			describe( "is returning empty object of deserialized values when it", () => {
				test( "is invoked w/ empty object of data and empty set attributes", function() {
					deserializer( {}, {} ).should.be.Object().which.is.empty();
				} );

				test( "is invoked w/ non-empty object of data and empty set of attributes", function() {
					deserializer( {
						name: "John Doe",
						age: "23",
					}, {} ).should.be.Object().which.is.empty();
				} );
			} );
		} );

		suite( "can be invoked with non-empty definition of attributes so it returns a function which", () => {
			let deserializer;
			const attributes = {
				name: { type: "string" },
				age: { type: "int" },
			};

			setup( () => {
				deserializer = compileDeserializer( attributes );
			} );

			test( "is expecting two arguments on invocation", function() {
				deserializer.should.be.Function().which.has.length( 2 );
			} );

			test( "isn't instantly invocable w/o any argument", function() {
				deserializer.should.throw();
			} );

			test( "isn't instantly invocable w/ sole argument, too", function() {
				( () => deserializer( {} ) ).should.throw();
			} );

			test( "is instantly invocable w/ two proper arguments", function() {
				( () => deserializer( {}, attributes ) ).should.not.throw();
			} );

			describe( "is returning non-empty object containing all defined attributes as properties with _deserialized_ values when it", () => {
				test( "is invoked w/ empty object and proper attributes definition", function() {
					deserializer( {}, attributes ).should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				test( "is invoked w/ non-empty object providing some defined attributes, only, and proper attributes definition", function() {
					let deserialized = deserializer( {
						name: 23,
					}, attributes );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					Should( deserialized.age ).be.null();

					deserialized = deserializer( {
						age: 23,
					}, attributes );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					Should( deserialized.name ).be.null();
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );

				test( "is invoked w/ non-empty object providing all defined attributes, only, and proper attributes definition", function() {
					const deserialized = deserializer( {
						name: 23,
						age: 23,
					}, attributes );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );

				test( "is invoked w/ non-empty object providing properties in addition to defined attributes and proper attributes definition", function() {
					const deserialized = deserializer( {
						name: 23,
						age: 23,
						additional: true,
					}, attributes );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );
			} );
		} );
	} );

	suite( "contains internal method for compiling definition of getters and setters for conveniently accessing defined and computed attributes of model which", function() {
		const { compileGettersAndSetters } = Compiler._utility;

		test( "requires three arguments", function() {
			compileGettersAndSetters.should.be.a.Function().which.has.length( 3 );

			( () => compileGettersAndSetters() ).should.throw();
			( () => compileGettersAndSetters( {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, {} ) ).should.not.throw();
		} );

		test( "requires all arguments to be suitable for object-like processing", function() {
			( () => compileGettersAndSetters( undefined, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( null, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( false, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( true, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( 0, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( 4.5, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( -3000, {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( [], {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( ["name"], {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( () => "name", {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( "", {}, {} ) ).should.throw();
			( () => compileGettersAndSetters( "name", {}, {} ) ).should.throw();

			( () => compileGettersAndSetters( {}, undefined, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, null, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, false, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, true, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, 0, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, 4.5, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, -3000, {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, [], {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, ["name"], {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, () => "name", {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, "", {} ) ).should.throw();
			( () => compileGettersAndSetters( {}, "name", {} ) ).should.throw();

			( () => compileGettersAndSetters( {}, {}, undefined ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, null ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, false ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, true ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, 0 ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, 4.5 ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, -3000 ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, [] ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, ["name"] ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, () => "name" ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, "" ) ).should.throw();
			( () => compileGettersAndSetters( {}, {}, "name" ) ).should.throw();

			( () => compileGettersAndSetters( {}, {}, {} ) ).should.not.throw();
			( () => compileGettersAndSetters( {}, { name: "name" }, {} ) ).should.not.throw();
			( () => compileGettersAndSetters( {}, { name: {} }, {} ) ).should.not.throw();
			( () => compileGettersAndSetters( {}, {}, { name: "name" } ) ).should.not.throw();
			( () => compileGettersAndSetters( {}, {}, { name: {} } ) ).should.not.throw();
		} );

		test( "returns an object", function() {
			const map = compileGettersAndSetters( {}, {}, {} );

			map.should.be.Object();
		} );

		test( "returns empty object on providing empty sets of attributes and computeds", function() {
			const map = compileGettersAndSetters( {}, {}, {} );

			map.should.be.Object().which.is.empty();
		} );

		test( "returns non-empty object listing entry for every attribute in provided definition", function() {
			const attributes = { name: { type: "string" }, age: { type: "int" } };
			const properties = { name: "Jane Doe", age: 23 };
			const map = compileGettersAndSetters( {}, attributes, {} );

			map.should.be.Object().which.has.size( 2 );

			map.should.have.ownProperty( "name" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.name.get.should.be.Function().which.has.length( 0 );
			map.name.set.should.be.Function().which.has.length( 1 );

			map.name.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "Jane Doe" );
			map.name.set.bind( fakeModelInstance( { properties } ), "Jill Doe" ).should.not.throw();
			map.name.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "Jill Doe" );

			map.should.have.ownProperty( "age" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.age.get.should.be.Function().which.has.length( 0 );
			map.age.set.should.be.Function().which.has.length( 1 );

			map.age.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 23 );
			map.age.set.bind( fakeModelInstance( { properties } ), 42 ).should.not.throw();
			map.age.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 42 );
		} );

		test( "returns non-empty object listing entry for every computed attribute in provided definition", function() {
			const computeds = {
				name: function( ...args ) { // eslint-disable-line consistent-return
					if ( args.length === 0 ) {
						return this.properties.name.toUpperCase();
					}

					this.properties.name = args[0];
				},
				age: function( ...args ) { // eslint-disable-line consistent-return
					if ( args.length === 0 ) {
						return this.properties.age * 2;
					}

					this.properties.age = args[0];
				}
			};
			const properties = { name: "Jane Doe", age: 23 };
			const map = compileGettersAndSetters( {}, {}, computeds );

			map.should.be.Object().which.has.size( 2 );

			map.should.have.ownProperty( "name" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.name.get.should.be.Function().which.has.length( 0 );
			map.name.set.should.be.Function().which.has.length( 1 );

			map.name.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "JANE DOE" );
			map.name.set.bind( fakeModelInstance( { properties } ), "Jill Doe" ).should.not.throw();
			map.name.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "JILL DOE" );

			map.should.have.ownProperty( "age" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.age.get.should.be.Function().which.has.length( 0 );
			map.age.set.should.be.Function().which.has.length( 1 );

			map.age.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 46 );
			map.age.set.bind( fakeModelInstance( { properties } ), 42 ).should.not.throw();
			map.age.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 84 );
		} );

		test( "prefers definition of getter/setter on attribute on clashing name w/ computed", function() {
			const attributes = { name: {}, age: {} };
			const computeds = { name: () => "John Doe", age: () => 42, altName: () => "John Doe", size: () => 180 };
			const properties = { name: "Jane Doe", age: 23 };
			const map = compileGettersAndSetters( {}, attributes, computeds );

			map.should.be.Object().which.has.size( 4 );

			map.should.have.ownProperty( "name" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.name.get.should.be.Function().which.has.length( 0 );
			map.name.set.should.be.Function().which.has.length( 1 );

			map.name.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "Jane Doe" );
			map.name.set.bind( fakeModelInstance( { properties } ), "Jill Doe" ).should.not.throw();
			map.name.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "Jill Doe" );

			map.should.have.ownProperty( "altName" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.altName.get.should.be.Function().which.has.length( 0 );
			map.altName.set.should.be.Function().which.has.length( 1 );

			map.altName.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "John Doe" );
			map.altName.set.bind( fakeModelInstance( { properties } ), "Jill Doe" ).should.not.throw();
			map.altName.get.call( fakeModelInstance( { properties } ) ).should.be.equal( "John Doe" );

			map.should.have.ownProperty( "age" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.age.get.should.be.Function().which.has.length( 0 );
			map.age.set.should.be.Function().which.has.length( 1 );

			map.age.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 23 );
			map.age.set.bind( fakeModelInstance( { properties } ), 25 ).should.not.throw();
			map.age.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 25 );

			map.should.have.ownProperty( "size" ).which.is.an.Object().and.has.size( 2 ).and.has.properties( [ "get", "set" ] );
			map.size.get.should.be.Function().which.has.length( 0 );
			map.size.set.should.be.Function().which.has.length( 1 );

			map.size.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 180 );
			map.size.set.bind( fakeModelInstance( { properties } ), 170 ).should.not.throw();
			map.size.get.call( fakeModelInstance( { properties } ) ).should.be.equal( 180 );
		} );

		test( "does not define getter/setter for attributes with names basically used by implementation of Model", function() {
			compileGettersAndSetters( {}, { prototype: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( {}, { constructor: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( {}, { super: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( {}, { exists: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( {}, { load: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( {}, { save: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( {}, { validate: {} }, {} ).should.be.Object().which.has.size( 0 );
		} );

		test( "does not define getter/setter for attributes with names already existing in provided context", function() {
			compileGettersAndSetters( {}, { accepted: {} }, {} ).should.be.Object().which.has.size( 1 );
			compileGettersAndSetters( { accepted: false }, { accepted: {} }, {} ).should.be.Object().which.has.size( 0 );
			compileGettersAndSetters( Object.defineProperty( {}, "accepted", { value: false } ), { accepted: {} }, {} ).should.be.Object().which.has.size( 0 );
		} );
	} );
} );
