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

const { Model, Adapter, MemoryAdapter } = require( "../../index" );


suite( "Abstract Model", function() {
	let memory;

	suiteSetup( function() {
		memory = new MemoryAdapter();
	} );

	test( "is exposed in property `Model`", function() {
		Should( Model ).be.ok();
	} );

	test( "can be used to create instance", function() {
		( () => new Model( "01234567-89ab-cdef-fedc-ba9876543210" ) ).should.not.throw();
	} );

	test( "does not require UUID on creating instance", function() {
		( () => new Model() ).should.not.throw();
	} );

	test( "supports provision of UUID on creating instance", function() {
		( () => new Model( "12345678-9abc-def0-0fed-cba987654321" ) ).should.not.throw();
	} );

	test( "requires any UUID provided on creating instance to be valid", function() {
		( () => new Model( "123456789abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abcdef0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-def00fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-def0-0fedcba987654321" ) ).should.throw();
		( () => new Model( "2345678-9abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-ef0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-def0-fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-def0-0fed-ba987654321" ) ).should.throw();
		( () => new Model( "012345678-9abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-89abc-def0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-cdef0-0fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-def0-00fed-cba987654321" ) ).should.throw();
		( () => new Model( "12345678-9abc-def0-0fed-dcba987654321" ) ).should.throw();
	} );

	test( "supports provision of options in second parameter on creating instance", function() {
		( () => new Model( "12345678-9abc-def0-0fed-cba987654321", { adapter: new MemoryAdapter() } ) ).should.not.throw();
		( () => new Model( null, { adapter: new MemoryAdapter() } ) ).should.not.throw();

		( () => new Model( { adapter: new MemoryAdapter() } ) ).should.throw();
	} );

	test( "supports provision of empty options in second parameter on creating instance", function() {
		( () => new Model( "12345678-9abc-def0-0fed-cba987654321", {} ) ).should.not.throw();
		( () => new Model( null, {} ) ).should.not.throw();

		( () => new Model( {} ) ).should.throw();
	} );

	test( "exposes instance properties of Model API", function() {
		const uuid = "01234567-89ab-cdef-fedc-ba9876543210";
		const instance = new Model( uuid );

		instance.should.have.property( "uuid" ).which.is.a.String().and.equal( uuid );
		instance.should.have.property( "loaded" ).which.is.null();
		instance.should.have.property( "isNew" ).which.is.a.Boolean().which.is.false();
		instance.should.have.property( "adapter" ).which.is.an.instanceOf( Adapter );
		instance.should.have.property( "dataKey" ).which.is.a.String().and.not.empty();
		instance.should.have.property( "$properties" ).which.is.an.Object().and.ok();
		instance.should.have.property( "exists" ).which.is.a.Promise().and.resolvedWith( false );
	} );

	test( "exposes instance methods of Model API", function() {
		const instance = new Model( "01234567-89ab-cdef-fedc-ba9876543210" );

		instance.should.have.property( "load" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "save" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "validate" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "toObject" ).which.is.a.Function().of.length( 0 );
	} );

	test( "exposes class/static properties of Model API", function() {
		Model.should.have.property( "name" ).which.is.a.String().and.equal( "$$AbstractModel$$" );
	} );

	test( "exposes class/static methods of Model API", function() {
		Model.should.have.property( "keyToUuid" ).which.is.a.Function().of.length( 1 );
		Model.should.have.property( "keyToModelName" ).which.is.a.Function().of.length( 1 );
	} );

	test( "exposes context of monitoring properties for changes", function() {
		const instance = new Model( "01234567-89ab-cdef-fedc-ba9876543210" );

		Should( instance.$properties.$context ).be.an.Object().which.is.ok().and.has.property( "changed" ).which.is.ok().and.empty();
	} );

	test( "marks initially unbound instance as new", function() {
		const instance = new Model( null );

		instance.isNew.should.be.true();
	} );

	test( "does not mark initially bound instance as new", function() {
		const instance = new Model( "01234567-89ab-cdef-fedc-ba9876543210" );

		instance.isNew.should.be.false();
	} );

	test( "considers unbound instance loaded instantly, thus setting property `loaded` prior to invoking Model#load()", function() {
		const instance = new Model();
		const promise = instance.loaded;

		Should( promise ).not.be.null();

		promise.should.be.Promise().which.is.resolved();

		instance.load().should.be.Promise().which.is.equal( promise );
		instance.load().should.be.Promise().which.is.equal( promise );

		return promise.should.be.resolved();
	} );

	test( "sets property `loaded` on invoking Model#load() on a bound instance", function() {
		const instance = new Model( "01234567-89ab-cdef-fdec-ba9876543210" );

		Should( instance.loaded ).be.null();

		const promise = instance.load();

		return instance.loaded.should.be.Promise().which.is.equal( promise ).and.is.rejected();
	} );

	test( "rejects to load persistent data of unknown item on invoking Model#load()", function() {
		return new Model( "01234567-89ab-cdef-fdec-ba9876543210" ).load().should.be.Promise().which.is.rejected();
	} );

	test( "succeeds to 'load' initial data of unbound instance on invoking Model#load()", function() {
		return new Model().load().should.be.Promise().which.is.resolved();
	} );

	test( "keeps returning same eventually rejected promise on Model#load() on an instance bound to unknown item", function() {
		const instance = new Model( "01234567-89ab-cdef-fdec-ba9876543210" );

		const promise = instance.load();

		instance.loaded.should.be.Promise().which.is.equal( promise );

		instance.load().should.be.Promise().which.is.equal( promise );
		instance.load().should.be.Promise().which.is.equal( promise );

		return promise.should.be.rejected();
	} );

	test( "supports saving unbound instance to persistent storage using Model#save()", function() {
		const instance = new Model( null, { adapter: memory } );

		return instance.save().should.be.Promise().which.is.resolvedWith( instance );
	} );

	test( "rejects saving instance bound to unknown item to persistent storage using Model#save()", function() {
		const instance = new Model( "01234567-89ab-cdef-fedc-ba9876543210", { adapter: memory } );

		return instance.save().should.be.Promise().which.is.rejected();
	} );

	test( "exposes UUID assigned on saving unbound instance to persistent storage using Model#save()", function() {
		const instance = new Model( null, { adapter: memory } );

		Should( instance.uuid ).be.null();

		return instance.save()
			.then( () => {
				instance.uuid.should.be.String().which.is.not.empty();
			} );
	} );

	test( "stops marking initially unbound instance as new after having saved to persistent storage using Model#save()", function() {
		const instance = new Model( null, { adapter: memory } );

		instance.isNew.should.be.true();

		return instance.save()
			.then( () => {
				instance.isNew.should.be.false();
			} );
	} );


	suite( "bound to existing item", function() {
		let created;

		suiteSetup( function() {
			created = new Model( null, { adapter: memory } );

			return created.save();
		} );


		test( "saves instance bound to known item to persistent storage using Model#save()", function() {
			const instance = new Model( created.uuid, { adapter: memory } );

			return instance.save().should.be.Promise().which.is.rejected();
		} );

		test( "rejects saving instance bound to known item to persistent storage using Model#save() w/o loading first", function() {
			const instance = new Model( created.uuid, { adapter: memory } );

			return instance.load()
				.then( () => instance.save().should.be.Promise().which.is.resolvedWith( instance ) );
		} );

		test( "clears mark on changed properties after saving to persistent storage using Model#save()", function() {
			const instance = new Model( created.uuid, { adapter: memory } );

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

		test( "clears mark on changed properties after loaded from persistent storage using Model#load()", function() {
			const instance = new Model( created.uuid, { adapter: memory, onUnsaved: "ignore" } );

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

		test( "rejects to load after having changed properties of bound item using Model#load()", function() {
			const instanceUnchanged = new Model( created.uuid, { adapter: memory, onUnsaved: "fail" } );

			instanceUnchanged.$properties.$context.changed.should.be.empty();
			instanceUnchanged.$properties.$context.hasChanged.should.be.false();

			return instanceUnchanged.load().should.be.Promise().which.is.not.rejected()
				.then( () => {
					const instanceChanging = new Model( created.uuid, { adapter: memory, onUnsaved: "fail" } );

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
