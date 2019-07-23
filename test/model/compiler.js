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
const Should = require( "should" );


const Model = require( "../../lib/model/base" );
const Compiler = require( "../../lib/model/compiler" );
const { Adapter, MemoryAdapter, FileAdapter } = require( "../../lib/adapter" );


describe( "Model compiler module", () => {
	/**
	 * Creates some "class" imitating parts of `Model`.
	 *
	 * @param {object<string,object>} props attributes' definitions to be exposed in fake model's schema
	 * @param {object<string,function>} computed computed attributes' definitions to be exposed in fake model's schema
	 * @param {object<string,function>} methods methods' definitions to be exposed in fake model's schema
	 * @param {object<string,function[]>} hooks hook definitions to be exposed in fake model's schema
	 * @returns {Function} class faking essential parts of Model's API
	 */
	function fakeModel( { props = {}, computed = {}, methods = {}, hooks = {} } = {} ) {
		const fake = function FakeModel() {}; // eslint-disable-line no-empty-function, func-style

		Object.defineProperties( fake, {
			schema: { value: { props, computed, methods, hooks } },
		} );

		return fake;
	}

	/**
	 * Creates instance of some "class" imitating parts of `Model`.
	 *
	 * @param {object<string,*>} properties properties of instance of fake model
	 * @param {object<string,object>} props properties' definitions to be exposed in fake model's schema
	 * @param {object<string,function>} computed computed attributes' definitions to be exposed in fake model's schema
	 * @param {object<string,function>} methods methods' definitions to be exposed in fake model's schema
	 * @param {object<string,function[]>} hooks hook definitions to be exposed in fake model's schema
	 * @returns {object} instance imitating essential parts of a Model's item's API
	 */
	function fakeModelInstance( { properties = {}, props = {}, computed = {}, methods = {}, hooks = {} } = {} ) {
		const Fake = fakeModel( { props, computed, methods, hooks } );
		const fake = new Fake();

		Object.defineProperties( fake, {
			$properties: { value: properties },
		} );

		return fake;
	}


	it( "exposes internally used functions for unit-testing", () => {
		Compiler.should.have.property( "_utility" ).which.is.an.Object();

		Compiler._utility.should.have.property( "normalizeSchema" ).which.is.a.Function();
		Compiler._utility.should.have.property( "normalizeSchemaProperties" ).which.is.a.Function();
		Compiler._utility.should.have.property( "normalizeSchemaComputedProperties" ).which.is.a.Function();
		Compiler._utility.should.have.property( "normalizeSchemaMethods" ).which.is.a.Function();
		Compiler._utility.should.have.property( "normalizeSchemaHooks" ).which.is.a.Function();

		Compiler._utility.should.have.property( "compileCoercion" ).which.is.a.Function();
		Compiler._utility.should.have.property( "compileValidator" ).which.is.a.Function();
		Compiler._utility.should.have.property( "compileSerializer" ).which.is.a.Function();
		Compiler._utility.should.have.property( "compileDeserializer" ).which.is.a.Function();
	} );

	describe( "exports compiler function which", () => {
		/** Does not inherit from basic model class. */
		class ImproperBaseClass {}

		/** Inherits from basic model class. */
		class ProperBaseClass extends Model {}

		const MostSimpleSchema = { props: { a: {} } };


		it( "is a function", () => {
			Compiler.should.be.Function();
		} );

		it( "requires at least two arguments", () => {
			Compiler.should.have.length( 1 );

			( () => Compiler() ).should.throw( TypeError );
			( () => Compiler( "name" ) ).should.throw( TypeError );

			( () => Compiler( "name", MostSimpleSchema ) ).should.not.throw();
		} );

		it( "requires provision of valid name of model to define in first argument", () => {
			( () => Compiler( undefined, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( null, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( false, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( true, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( 5, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( -3.5, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( 0, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( [], MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( ["name"], MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( { name: "name" }, MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( () => "name", MostSimpleSchema ) ).should.throw( TypeError );
			( () => Compiler( "", MostSimpleSchema ) ).should.throw( TypeError );

			( () => Compiler( "name", MostSimpleSchema ) ).should.not.throw();
		} );

		it( "requires provision of proper schema definition in second argument", () => {
			( () => Compiler( "name", undefined ) ).should.throw( TypeError );
			( () => Compiler( "name", null ) ).should.throw( TypeError );
			( () => Compiler( "name", false ) ).should.throw( TypeError );
			( () => Compiler( "name", true ) ).should.throw( TypeError );
			( () => Compiler( "name", 5 ) ).should.throw( TypeError );
			( () => Compiler( "name", -3.5 ) ).should.throw( TypeError );
			( () => Compiler( "name", 0 ) ).should.throw( TypeError );
			( () => Compiler( "name", [] ) ).should.throw( TypeError );
			( () => Compiler( "name", [{}] ) ).should.throw( TypeError );
			( () => Compiler( "name", () => {} ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => Compiler( "name", "" ) ).should.throw( TypeError );
			( () => Compiler( "name", "schema" ) ).should.throw( TypeError );
			( () => Compiler( "name", {} ) ).should.throw( TypeError );
			( () => Compiler( "name", { props: {} } ) ).should.throw( TypeError );

			( () => Compiler( "name", { props: { a: {} } } ) ).should.not.throw();
		} );

		it( "supports optional provision of base class derived from `Model` to become base class of defined Model implementation", () => {
			( () => Compiler( "name", MostSimpleSchema ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, undefined ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, null ) ).should.not.throw();

			( () => Compiler( "name", MostSimpleSchema, false ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, true ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, 5 ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, -3.5 ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, 0 ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, [] ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, [ProperBaseClass] ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, () => {} ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => Compiler( "name", MostSimpleSchema, () => ProperBaseClass ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, {} ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, { base: ProperBaseClass } ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, "" ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, "CustomBaseClass" ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, ImproperBaseClass ) ).should.throw( TypeError );

			( () => Compiler( "name", MostSimpleSchema, Model ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, ProperBaseClass ) ).should.not.throw();
		} );

		it( "supports optional provision of adapter to use explicitly with resulting implementation of Model", () => {
			( () => Compiler( "name", MostSimpleSchema, null ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, null, undefined ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, null, null ) ).should.not.throw();

			( () => Compiler( "name", MostSimpleSchema, null, false ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, true ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, 5 ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, -3.5 ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, 0 ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, [] ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, [ProperBaseClass] ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, () => {} ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => Compiler( "name", MostSimpleSchema, null, () => ProperBaseClass ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, {} ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, { base: ProperBaseClass } ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, "" ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, "CustomBaseClass" ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, ImproperBaseClass ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, ProperBaseClass ) ).should.throw( TypeError );

			( () => Compiler( "name", MostSimpleSchema, null, Adapter ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, MemoryAdapter ) ).should.throw( TypeError );
			( () => Compiler( "name", MostSimpleSchema, null, FileAdapter ) ).should.throw( TypeError );

			( () => Compiler( "name", MostSimpleSchema, null, new Adapter() ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, null, new MemoryAdapter() ) ).should.not.throw();
			( () => Compiler( "name", MostSimpleSchema, null, new FileAdapter() ) ).should.not.throw();
		} );

		describe( "returns class that", () => {
			it( "is derived from `Model`", () => {
				const Sub = Compiler( "mySub", MostSimpleSchema );

				Sub.prototype.should.be.instanceOf( Model );
			} );

			it( "can be instantiated", () => {
				const Sub = Compiler( "mySub", MostSimpleSchema );

				const item = new Sub();

				item.should.be.instanceOf( Model );
			} );

			it( "can be used as base class in another model definition", () => {
				const Sub = Compiler( "mySub", MostSimpleSchema );
				const SubSub = Compiler( "mySub", MostSimpleSchema, Sub );

				const sub = new Sub();
				const subSub = new SubSub();

				sub.should.be.instanceOf( Model );
				subSub.should.be.instanceOf( Model );

				sub.should.be.instanceOf( Sub );
				subSub.should.be.instanceOf( Sub );

				sub.should.not.be.instanceOf( SubSub );
				subSub.should.be.instanceOf( SubSub );
			} );

			it( "is exposing properties defined in provided schema as properties of every instance", () => {
				const Employee = Compiler( "employee", {
					props: {
						name: {},
						age: {
							type: "int"
						},
					},
					computed: {
						label() {
							return `${this.name} (Age: ${this.age})`;
						},
					},
				} );

				const boss = new Employee();
				boss.name = "John Doe";
				boss.age = 45;

				boss.label.should.equal( "John Doe (Age: 45)" );
			} );

			it( "is exposing adapter provided on compilation as static property of model", () => {
				const adapter = new MemoryAdapter();
				const Employee = Compiler( "employee", { props: { name: {} } }, null, adapter );

				Employee.adapter.should.be.equal( adapter );
			} );

			it( "is exposing adapter provided on compilation as property of model's every instance", () => {
				const adapter = new MemoryAdapter();
				const Employee = Compiler( "employee", { props: { name: {} } }, null, adapter );

				const boss = new Employee();

				boss.$adapter.should.be.equal( adapter );
			} );

			it( "can be instantiated with instances suitable for validating properties, saving them to and reading them from a storage", () => {
				const storage = new MemoryAdapter();
				const MyModel = Compiler( "MyModel", {
					props: {
						name: {},
						height: { type: "integer", min: 50 },
						weight: { type: "number", min: 10 },
						dayOfBirth: { type: "date" },
						isFriend: { type: "boolean" },
					},
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
				return freshOne.$save().should.be.Promise().which.is.rejected()
					.then( () => {
						Should( freshOne.uuid ).be.null();

						// check validation explicitly
						return freshOne.$validate().should.be.Promise().which.is.resolvedWith( [
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
						return freshOne.$save().should.be.Promise().which.is.resolved();
					} )
					.then( () => {
						Should( freshOne.uuid ).not.be.null();

						// check validation explicitly, again
						return freshOne.$validate().should.be.Promise().which.is.resolvedWith( [] );
					} )
					.then( () => {
						// check record serialization by reading record from backend directly
						return storage.read( freshOne.$dataKey.replace( /%u/g, freshOne.uuid ) )
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
						return storage.write( freshOne.$dataKey.replace( /%u/g, freshOne.uuid ), {
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

						return copy.$load()
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
								return copy.$validate().should.be.Promise().which.is.resolvedWith( [
									new Error( ["height is below required minimum"] ),
									new Error( ["weight is below required minimum"] ),
								] );
							} );
					} );
			} );
		} );
	} );

	describe( "contains internal method for compiling code serializing all attributes of model in a row which", () => {
		const { compileSerializer } = Compiler._utility;

		it( "requires provision of apparently valid and qualified definition of attributes in first argument", () => {
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

		describe( "can be invoked with empty definition of attributes so it returns a function which", () => {
			let serializer;

			beforeEach( () => {
				serializer = compileSerializer( {} );
			} );

			it( "is expecting sole argument on invocation", () => {
				serializer.should.be.Function().which.has.length( 1 );
			} );

			it( "is instantly invocable w/o any argument, though", () => {
				serializer.should.not.throw();
			} );

			describe( "is returning empty object of serialized values when it", () => {
				it( "is invoked w/o argument", () => {
					serializer().should.be.Object().which.is.empty();
				} );

				it( "is invoked w/ empty object", () => {
					serializer( {} ).should.be.Object().which.is.empty();
				} );

				it( "is invoked w/ non-empty object", () => {
					serializer( {
						name: "John Doe",
						age: "23",
					} ).should.be.Object().which.is.empty();
				} );
			} );
		} );

		describe( "can be invoked with non-empty definition of attributes so it returns a function which", () => {
			let serializer;

			beforeEach( () => {
				serializer = compileSerializer( {
					name: { type: "string" },
					age: { type: "int" },
				} );
			} );

			it( "is expecting sole argument on invocation", () => {
				serializer.should.be.Function().which.has.length( 1 );
			} );

			it( "is instantly invocable w/o any argument, though", () => {
				serializer.should.not.throw();
			} );

			describe( "is returning non-empty object containing all defined attributes as properties with _serialized_ values when it", () => {
				it( "is invoked w/o argument", () => {
					serializer().should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				it( "is invoked w/ empty object", () => {
					serializer( {} ).should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				it( "is invoked w/ non-empty object providing some defined attributes, only", () => {
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

				it( "is invoked w/ non-empty object providing all defined attributes, only", () => {
					const serialized = serializer( {
						name: 23,
						age: 23,
					} );

					serialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					serialized.name.should.be.String().which.is.equal( "23" );
					serialized.age.should.be.Number().which.is.equal( 23 );
				} );

				it( "is invoked w/ non-empty object providing properties in addition to defined attributes", () => {
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

	describe( "contains internal method for compiling code deserializing all attributes of model in a row which", () => {
		const { compileDeserializer } = Compiler._utility;

		it( "requires provision of apparently valid and qualified definition of attributes in first argument", () => {
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

		describe( "can be invoked with empty definition of attributes so it returns a function which", () => {
			let deserializer;

			beforeEach( () => {
				deserializer = compileDeserializer( {} );
			} );

			it( "is expecting two arguments on invocation", () => {
				deserializer.should.be.Function().which.has.length( 2 );
			} );

			it( "isn't instantly invocable w/o any argument", () => {
				deserializer.should.throw();
			} );

			it( "isn't instantly invocable w/ sole argument, too", () => {
				( () => deserializer( {} ) ).should.throw();
			} );

			it( "is instantly invocable w/ two proper arguments", () => {
				( () => deserializer( {}, {} ) ).should.not.throw();
			} );

			describe( "is returning empty object of deserialized values when it", () => {
				it( "is invoked w/ empty object of data and empty set attributes", () => {
					deserializer( {}, {} ).should.be.Object().which.is.empty();
				} );

				it( "is invoked w/ non-empty object of data and empty set of attributes", () => {
					deserializer( {
						name: "John Doe",
						age: "23",
					}, {} ).should.be.Object().which.is.empty();
				} );
			} );
		} );

		describe( "can be invoked with non-empty definition of attributes so it returns a function which", () => {
			let deserializer;
			const attributes = {
				name: { type: "string" },
				age: { type: "int" },
			};

			beforeEach( () => {
				deserializer = compileDeserializer( attributes );
			} );

			it( "is expecting two arguments on invocation", () => {
				deserializer.should.be.Function().which.has.length( 2 );
			} );

			it( "isn't instantly invocable w/o any argument", () => {
				deserializer.should.throw();
			} );

			it( "isn't instantly invocable w/ sole argument, too", () => {
				( () => deserializer( {} ) ).should.throw();
			} );

			it( "is instantly invocable w/ two proper arguments", () => {
				( () => deserializer( {}, attributes ) ).should.not.throw();
			} );

			describe( "is returning non-empty object containing all defined attributes as properties with _deserialized_ values when it", () => {
				it( "is invoked w/ empty object and proper attributes definition", () => {
					deserializer( {}, attributes ).should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				it( "is invoked w/ non-empty object providing some defined attributes, only, and proper attributes definition", () => {
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

				it( "is invoked w/ non-empty object providing all defined attributes, only, and proper attributes definition", () => {
					const deserialized = deserializer( {
						name: 23,
						age: 23,
					}, attributes );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );

				it( "is invoked w/ non-empty object providing properties in addition to defined attributes and proper attributes definition", () => {
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
} );
