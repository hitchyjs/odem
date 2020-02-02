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
const Should = require( "should" );

const { fakeApi } = require( "../helper" );


describe( "Abstract Model", () => {
	let Model, OdemAdapter, OdemAdapterMemory;
	let memory;
	let CustomModel;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model, OdemAdapter, OdemAdapterMemory } = s ); } ) );

	before( () => {
		/**
		 * Derives from abstract model w/o changing anything to test abstract base
		 * class without causing side-effects in upcoming tests due to adjusting
		 * static properties in scope of shared base class.
		 */
		CustomModel = class DerivedModel extends Model {};

		Object.defineProperty( CustomModel, "adapter", { value: new OdemAdapterMemory() } );
	} );

	before( () => {
		memory = new OdemAdapterMemory();
	} );

	it( "is exposed as service component `Model`", () => {
		Should( Model ).be.ok();
	} );

	it( "can be used to create instance", () => {
		( () => new CustomModel( "01234567-89ab-cdef-fedc-ba9876543210" ) ).should.not.throw();
	} );

	it( "does not require UUID on creating instance", () => {
		( () => new CustomModel() ).should.not.throw();
	} );

	it( "supports provision of UUID on creating instance", () => {
		( () => new CustomModel( "12345678-9abc-def0-0fed-cba987654321" ) ).should.not.throw();
	} );

	it( "requires any UUID provided on creating instance to be valid", () => {
		( () => new CustomModel( "123456789abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abcdef0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-def00fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-def0-0fedcba987654321" ) ).should.throw();
		( () => new CustomModel( "2345678-9abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-ef0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-def0-fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-def0-0fed-ba987654321" ) ).should.throw();
		( () => new CustomModel( "012345678-9abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-89abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-cdef0-0fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-def0-00fed-cba987654321" ) ).should.throw();
		( () => new CustomModel( "12345678-9abc-def0-0fed-dcba987654321" ) ).should.throw();
	} );

	it( "supports provision of options in second parameter on creating instance", () => {
		( () => new CustomModel( "12345678-9abc-def0-0fed-cba987654321", { adapter: new OdemAdapterMemory() } ) ).should.not.throw();
		( () => new CustomModel( null, { adapter: new OdemAdapterMemory() } ) ).should.not.throw();

		( () => new CustomModel( { adapter: new OdemAdapterMemory() } ) ).should.throw();
	} );

	it( "supports provision of empty options in second parameter on creating instance", () => {
		( () => new CustomModel( "12345678-9abc-def0-0fed-cba987654321", {} ) ).should.not.throw();
		( () => new CustomModel( null, {} ) ).should.not.throw();

		( () => new CustomModel( {} ) ).should.throw();
	} );

	it( "exposes instance properties of Model API", () => {
		const uuid = "01234567-89ab-cdef-fedc-ba9876543210";
		const instance = new CustomModel( uuid );

		instance.should.have.property( "uuid" ).which.is.a.String().and.equal( uuid );
		instance.should.have.property( "$loaded" ).which.is.null();
		instance.should.have.property( "$isNew" ).which.is.a.Boolean().which.is.false();
		instance.should.have.property( "$dataKey" ).which.is.a.String().and.not.empty();
		instance.should.have.property( "$properties" ).which.is.an.Object().and.ok();
		instance.should.have.property( "$exists" ).which.is.a.Promise().and.resolvedWith( false );
	} );

	it( "exposes instance methods of Model API", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fedc-ba9876543210" );

		instance.should.have.property( "load" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "save" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "validate" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "toObject" ).which.is.a.Function().of.length( 0 );
	} );

	it( "exposes class/static properties of Model API", () => {
		Model.should.have.property( "name" ).which.is.a.String().and.equal( "$$OdemModel$$" );
	} );

	it( "exposes class/static methods of Model API", () => {
		CustomModel.should.have.property( "keyToUuid" ).which.is.a.Function().of.length( 1 );
		CustomModel.should.have.property( "keyToModelName" ).which.is.a.Function().of.length( 1 );
	} );

	it( "exposes context of monitoring properties for changes", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fedc-ba9876543210" );

		Should( instance.$properties.$context ).be.an.Object().which.is.ok().and.has.property( "changed" ).which.is.ok().and.empty();
	} );

	it( "marks initially unbound instance as new", () => {
		const instance = new CustomModel( null );

		instance.$isNew.should.be.true();
	} );

	it( "does not mark initially bound instance as new", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fedc-ba9876543210" );

		instance.$isNew.should.be.false();
	} );

	it( "considers unbound instance loaded instantly, thus setting property `loaded` prior to invoking Model#load()", () => {
		const instance = new CustomModel();
		const promise = instance.$loaded;

		Should( promise ).not.be.null();

		promise.should.be.Promise().which.is.resolved();

		instance.load().should.be.Promise().which.is.equal( promise );
		instance.load().should.be.Promise().which.is.equal( promise );

		return promise.should.be.resolved();
	} );

	it( "sets property `loaded` on invoking Model#load() on a bound instance", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fdec-ba9876543210" );

		Should( instance.$loaded ).be.null();

		const promise = instance.load();

		return instance.$loaded.should.be.Promise().which.is.equal( promise ).and.is.rejected();
	} );

	it( "rejects to load persistent data of unknown item on invoking Model#load()", () => {
		return new CustomModel( "01234567-89ab-cdef-fdec-ba9876543210" ).load().should.be.Promise().which.is.rejected();
	} );

	it( "succeeds to 'load' initial data of unbound instance on invoking Model#load()", () => {
		return new CustomModel().load().should.be.Promise().which.is.resolved();
	} );

	it( "keeps returning same eventually rejected promise on Model#load() on an instance bound to unknown item", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fdec-ba9876543210" );

		const promise = instance.load();

		instance.$loaded.should.be.Promise().which.is.equal( promise );

		instance.load().should.be.Promise().which.is.equal( promise );
		instance.load().should.be.Promise().which.is.equal( promise );

		return promise.should.be.rejected();
	} );

	it( "supports saving unbound instance to persistent storage using Model#save()", () => {
		const instance = new CustomModel( null, { adapter: memory } );

		return instance.save().should.be.Promise().which.is.resolvedWith( instance );
	} );

	it( "accepts saving instance bound to unknown item to persistent storage using Model#save() w/o loading or changing anything first", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fedc-ba9876543210", { adapter: memory } );

		return instance.save().should.be.Promise().which.is.resolvedWith( instance );
	} );

	it( "rejects saving instance bound to unknown item to persistent storage using Model#save() w/o loading, but changing something first", () => {
		const instance = new CustomModel( "01234567-89ab-cdef-fedc-ba9876543210", { adapter: memory } );

		instance.$properties.adjusted = "1";

		return instance.save().should.be.Promise().which.is.rejected();
	} );

	it( "exposes UUID assigned on saving unbound instance to persistent storage using Model#save()", () => {
		const instance = new CustomModel( null, { adapter: memory } );

		Should( instance.uuid ).be.null();

		return instance.save()
			.then( () => {
				instance.uuid.should.be.String().which.is.not.empty();
			} );
	} );

	it( "stops marking initially unbound instance as new after having saved to persistent storage using Model#save()", () => {
		const instance = new CustomModel( null, { adapter: memory } );

		instance.$isNew.should.be.true();

		return instance.save()
			.then( () => {
				instance.$isNew.should.be.false();
			} );
	} );


	describe( "bound to existing item", () => {
		let created;

		before( () => {
			created = new CustomModel( null, { adapter: memory } );

			return created.save();
		} );


		it( "saves instance bound to known item to persistent storage using Model#save() w/o loading or changing anything first", () => {
			const instance = new CustomModel( created.uuid, { adapter: memory } );

			return instance.save().should.be.Promise().which.is.resolvedWith( instance );
		} );

		it( "rejects saving instance bound to known item to persistent storage using Model#save() w/o loading, but changing something first", () => {
			const instance = new CustomModel( created.uuid, { adapter: memory } );

			instance.$properties.adjusted = "1";

			return instance.save().should.be.Promise().which.is.rejected();
		} );

		it( "saves instance bound to known item to persistent storage using Model#save()", () => {
			const instance = new CustomModel( created.uuid, { adapter: memory } );

			return instance.load()
				.then( () => instance.save().should.be.Promise().which.is.resolvedWith( instance ) );
		} );

		it( "clears mark on changed properties after saving to persistent storage using Model#save()", () => {
			const instance = new CustomModel( created.uuid, { adapter: memory } );

			return instance.load()
				.then( () => {
					instance.$properties.$context.changed.should.be.empty();
					instance.$properties.$context.hasChanged.should.be.false();

					instance.$properties.adjusted = "1";

					instance.$properties.$context.changed.should.not.be.empty();
					instance.$properties.$context.hasChanged.should.be.true();

					return instance.save();
				} )
				.then( () => {
					instance.$properties.$context.changed.should.be.empty();
					instance.$properties.$context.hasChanged.should.be.false();
				} );
		} );

		it( "clears mark on changed properties after loaded from persistent storage using Model#load()", () => {
			const instance = new CustomModel( created.uuid, { adapter: memory, onUnsaved: "ignore" } );

			instance.$properties.$context.changed.should.be.empty();
			instance.$properties.$context.hasChanged.should.be.false();

			instance.$properties.adjusted = "1";

			instance.$properties.$context.changed.should.not.be.empty();
			instance.$properties.$context.hasChanged.should.be.true();

			return instance.load()
				.then( () => {
					instance.$properties.$context.changed.should.be.empty();
					instance.$properties.$context.hasChanged.should.be.false();
				} );
		} );

		it( "rejects to load after having changed properties of bound item using Model#load()", () => {
			const instanceUnchanged = new CustomModel( created.uuid, { adapter: memory, onUnsaved: "fail" } );

			instanceUnchanged.$properties.$context.changed.should.be.empty();
			instanceUnchanged.$properties.$context.hasChanged.should.be.false();

			return instanceUnchanged.load().should.be.Promise().which.is.not.rejected()
				.then( () => {
					const instanceChanging = new CustomModel( created.uuid, { adapter: memory, onUnsaved: "fail" } );

					instanceChanging.$properties.$context.changed.should.be.empty();
					instanceChanging.$properties.$context.hasChanged.should.be.false();

					instanceChanging.$properties.adjusted = "1";

					instanceChanging.$properties.$context.changed.should.not.be.empty();
					instanceChanging.$properties.$context.hasChanged.should.be.true();

					return instanceChanging.load().should.be.Promise().which.is.rejected();
				} );
		} );
	} );
} );
