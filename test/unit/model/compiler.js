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


const { describe, it, before, beforeEach } = require( "mocha" );
const Should = require( "should" );

const { fakeApi } = require( "../helper" );

describe( "Model compiler module", () => {
	let Model, OdemModelCompiler, OdemAdapter, OdemAdapterFile, OdemAdapterMemory;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => {
		( { Model, OdemModelCompiler, OdemAdapter, OdemAdapterFile, OdemAdapterMemory } = s );
	} ) );

	it( "exposes internally used functions for unit-testing", () => {
		OdemModelCompiler.should.have.property( "normalizeSchema" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "normalizeSchemaProperties" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "normalizeSchemaComputedProperties" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "normalizeSchemaMethods" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "normalizeSchemaHooks" ).which.is.a.Function();

		OdemModelCompiler.should.have.property( "compileCoercion" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "compileValidator" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "compileSerializer" ).which.is.a.Function();
		OdemModelCompiler.should.have.property( "compileDeserializer" ).which.is.a.Function();
	} );

	describe( "exports compiler function which", () => {
		/** Does not inherit from basic model class. */
		class ImproperBaseClass {}

		let ProperBaseClassRef;

		before( () => {
			/** Inherits from basic model class. */
			ProperBaseClassRef = class ProperBaseClass extends Model {};
		} );

		const MostSimpleSchema = { props: { a: {} } };


		it( "is a function", () => {
			OdemModelCompiler.compileModel.should.be.Function();
		} );

		it( "requires at least two arguments", () => {
			OdemModelCompiler.compileModel.should.have.length( 1 );

			( () => OdemModelCompiler.compileModel() ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name" ) ).should.throw( TypeError );

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema ) ).should.not.throw();
		} );

		it( "requires provision of valid name of model to define in first argument", () => {
			( () => OdemModelCompiler.compileModel( undefined, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( null, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( false, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( true, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( 5, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( -3.5, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( 0, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( [], MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( ["name"], MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( { name: "name" }, MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( () => "name", MostSimpleSchema ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "", MostSimpleSchema ) ).should.throw( TypeError );

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema ) ).should.not.throw();
		} );

		it( "requires provision of proper schema definition in second argument", () => {
			( () => OdemModelCompiler.compileModel( "name", undefined ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", null ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", false ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", true ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", 5 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", -3.5 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", 0 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", [] ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", [{}] ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", () => {} ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => OdemModelCompiler.compileModel( "name", "" ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", "schema" ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", {} ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", { props: {} } ) ).should.throw( TypeError );

			( () => OdemModelCompiler.compileModel( "name", { props: { a: {} } } ) ).should.not.throw();
		} );

		it( "supports optional provision of base class derived from `Model` to become base class of defined Model implementation", () => {
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema ) ).should.not.throw();
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, undefined ) ).should.not.throw();
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null ) ).should.not.throw();

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, false ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, true ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, 5 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, -3.5 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, 0 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, [] ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, [ProperBaseClassRef] ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, () => {} ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, () => ProperBaseClassRef ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, {} ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, { base: ProperBaseClassRef } ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, "" ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, "CustomBaseClass" ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, ImproperBaseClass ) ).should.throw( TypeError );

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, Model ) ).should.not.throw();
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, ProperBaseClassRef ) ).should.not.throw();
		} );

		it( "supports optional provision of adapter to use explicitly with resulting implementation of Model", () => {
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null ) ).should.not.throw();
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, undefined ) ).should.not.throw();

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, null ) ).should.not.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, false ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, true ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, 5 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, -3.5 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, 0 ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, [] ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, [ProperBaseClassRef] ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, () => {} ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, () => ProperBaseClassRef ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, {} ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, { base: ProperBaseClassRef } ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, "" ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, "CustomBaseClass" ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, ImproperBaseClass ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, ProperBaseClassRef ) ).should.throw( TypeError );

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, OdemAdapter ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, OdemAdapterMemory ) ).should.throw( TypeError );
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, OdemAdapterFile ) ).should.throw( TypeError );

			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, new OdemAdapter() ) ).should.not.throw();
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, new OdemAdapterMemory() ) ).should.not.throw();
			( () => OdemModelCompiler.compileModel( "name", MostSimpleSchema, null, new OdemAdapterFile() ) ).should.not.throw();
		} );

		describe( "returns class that", () => {
			it( "is derived from `Model`", () => {
				const Sub = OdemModelCompiler.compileModel( "mySub", MostSimpleSchema );

				Sub.prototype.should.be.instanceOf( Model );
			} );

			it( "can be instantiated", () => {
				const Sub = OdemModelCompiler.compileModel( "mySub", MostSimpleSchema );

				const item = new Sub();

				item.should.be.instanceOf( Model );
			} );

			it( "can be used as base class in another model definition", () => {
				const Sub = OdemModelCompiler.compileModel( "mySub", MostSimpleSchema );
				const SubSub = OdemModelCompiler.compileModel( "mySub", MostSimpleSchema, Sub );

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
				const Employee = OdemModelCompiler.compileModel( "employee", {
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
				const adapter = new OdemAdapterMemory();
				const Employee = OdemModelCompiler.compileModel( "employee", { props: { name: {} } }, null, adapter );

				Employee.adapter.should.be.equal( adapter );
			} );

			it( "is exposing adapter provided on compilation as property of model's every instance", () => {
				const adapter = new OdemAdapterMemory();
				const Employee = OdemModelCompiler.compileModel( "employee", { props: { name: {} } }, null, adapter );

				const boss = new Employee();

				boss.$adapter.should.be.equal( adapter );
			} );

			it( "can be instantiated with instances suitable for validating properties, saving them to and reading them from a storage", () => {
				const storage = new OdemAdapterMemory();
				const MyModel = OdemModelCompiler.compileModel( "MyModel", {
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

	describe( "contains internal method for compiling code serializing all properties of model in a row which", () => {
		it( "requires provision of apparently valid and qualified definition of properties in first argument", () => {
			( () => OdemModelCompiler.compileSerializer() ).should.throw();
			( () => OdemModelCompiler.compileSerializer( undefined ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( null ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( false ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( true ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( 0 ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( 4.5 ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( -3000 ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( [] ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( ["name"] ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( () => "name" ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( "" ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( "name" ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( { name: "name" } ) ).should.throw();
			( () => OdemModelCompiler.compileSerializer( { name: {} } ) ).should.throw(); // due to the lack of property `type`

			( () => OdemModelCompiler.compileSerializer( {} ) ).should.not.throw();
			( () => OdemModelCompiler.compileSerializer( { name: { type: "int" } } ) ).should.not.throw();
		} );

		describe( "can be invoked with empty definition of properties so it returns a function which", () => {
			let serializer;

			beforeEach( () => {
				serializer = OdemModelCompiler.compileSerializer( {} );
			} );

			it( "is expecting sole argument on invocation", () => {
				serializer.should.be.Function().which.has.length( 2 );
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

		describe( "can be invoked with non-empty definition of properties so it returns a function which", () => {
			let serializer;

			beforeEach( () => {
				serializer = OdemModelCompiler.compileSerializer( {
					name: { type: "string" },
					age: { type: "int" },
				} );
			} );

			it( "is expecting sole argument on invocation", () => {
				serializer.should.be.Function().which.has.length( 2 );
			} );

			it( "is instantly invocable w/o any argument, though", () => {
				serializer.should.not.throw();
			} );

			describe( "is returning non-empty object containing all defined properties with _serialized_ values when it", () => {
				it( "is invoked w/o argument", () => {
					serializer().should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				it( "is invoked w/ empty object", () => {
					serializer( {} ).should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				it( "is invoked w/ non-empty object providing some defined properties, only", () => {
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

				it( "is invoked w/ non-empty object providing all defined properties, only", () => {
					const serialized = serializer( {
						name: 23,
						age: 23,
					} );

					serialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					serialized.name.should.be.String().which.is.equal( "23" );
					serialized.age.should.be.Number().which.is.equal( 23 );
				} );

				it( "is invoked w/ non-empty object providing properties in addition to defined properties", () => {
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

	describe( "contains internal method for compiling code deserializing all properties of model in a row which", () => {
		it( "requires provision of apparently valid and qualified definition of properties in first argument", () => {
			( () => OdemModelCompiler.compileDeserializer() ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( undefined ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( null ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( false ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( true ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( 0 ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( 4.5 ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( -3000 ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( [] ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( ["name"] ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( () => "name" ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( "" ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( "name" ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( { name: "name" } ) ).should.throw();
			( () => OdemModelCompiler.compileDeserializer( { name: {} } ) ).should.throw(); // due to the lack of property `type`

			( () => OdemModelCompiler.compileDeserializer( {} ) ).should.not.throw();
			( () => OdemModelCompiler.compileDeserializer( { name: { type: "int" } } ) ).should.not.throw();
		} );

		describe( "can be invoked with empty definition of properties so it returns a function which", () => {
			let deserializer;

			beforeEach( () => {
				deserializer = OdemModelCompiler.compileDeserializer( {} );
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
				it( "is invoked w/ empty object of data and empty set properties", () => {
					deserializer( {}, {} ).should.be.Object().which.is.empty();
				} );

				it( "is invoked w/ non-empty object of data and empty set of properties", () => {
					deserializer( {
						name: "John Doe",
						age: "23",
					}, {} ).should.be.Object().which.is.empty();
				} );
			} );
		} );

		describe( "can be invoked with non-empty definition of properties so it returns a function which", () => {
			let deserializer;
			const properties = {
				name: { type: "string" },
				age: { type: "int" },
			};

			beforeEach( () => {
				deserializer = OdemModelCompiler.compileDeserializer( properties );
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
				( () => deserializer( {}, properties ) ).should.not.throw();
			} );

			describe( "is returning non-empty object containing all defined properties with _deserialized_ values when it", () => {
				it( "is invoked w/ empty object and proper properties definition", () => {
					deserializer( {}, properties ).should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
				} );

				it( "is invoked w/ non-empty object providing some defined properties, only, and proper properties definition", () => {
					let deserialized = deserializer( {
						name: 23,
					}, properties );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					Should( deserialized.age ).be.null();

					deserialized = deserializer( {
						age: 23,
					}, properties );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					Should( deserialized.name ).be.null();
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );

				it( "is invoked w/ non-empty object providing all defined properties, only, and proper properties definition", () => {
					const deserialized = deserializer( {
						name: 23,
						age: 23,
					}, properties );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );

				it( "is invoked w/ non-empty object providing properties in addition to defined properties and proper properties definition", () => {
					const deserialized = deserializer( {
						name: 23,
						age: 23,
						additional: true,
					}, properties );

					deserialized.should.be.Object().which.has.size( 2 ).and.has.properties( "name", "age" );
					deserialized.name.should.be.String().which.is.equal( "23" );
					deserialized.age.should.be.Number().which.is.equal( 23 );
				} );
			} );
		} );
	} );
} );
