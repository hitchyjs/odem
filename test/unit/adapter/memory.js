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


const { join } = require( "path" );
const { Readable } = require( "stream" );

const { describe, it, before, beforeEach } = require( "mocha" );
const Should = require( "should" );

const { fakeApi } = require( "../helper" );


describe( "OdemAdapterMemory", function() {
	let OdemAdapter, OdemAdapterMemory;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemAdapter, OdemAdapterMemory } = s ); } ) );

	it( "is exposed as service component", function() {
		Should( OdemAdapterMemory ).be.ok();
	} );

	it( "can be used to create instance", function() {
		( () => new OdemAdapterMemory() ).should.not.throw();
	} );

	it( "is derived from basic Adapter", function() {
		new OdemAdapterMemory().should.be.instanceOf( OdemAdapter );
	} );

	it( "exposes instance methods of Adapter API", function() {
		const instance = new OdemAdapterMemory();

		instance.should.have.property( "create" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "has" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "read" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "write" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "begin" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "rollBack" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "commit" ).which.is.a.Function().of.length( 0 );
	} );

	it( "exposes class/static methods of Adapter API", function() {
		OdemAdapterMemory.should.have.property( "keyToPath" ).which.is.a.Function().of.length( 1 );
		OdemAdapterMemory.should.have.property( "pathToKey" ).which.is.a.Function().of.length( 1 );
	} );

	it( "returns promise on invoking create() which is resolved with key of created record", function() {
		const instance = new OdemAdapterMemory();

		const myData = { someProperty: "its value" };

		return instance.create( "model/%u", myData ).should.be.Promise().which.is.resolved()
			.then( key => {
				key.should.be.String().which.is.not.empty().and.startWith( "model/" ).and.not.endWith( "%u" );

				return instance.read( key ).should.be.Promise().which.is.resolvedWith( myData );
			} );
	} );

	it( "returns promise on invoking read() which is rejected on missing record and resolved with data on existing record", function() {
		const instance = new OdemAdapterMemory();

		const myData = { someProperty: "its value" };

		return instance.read( "model/some-id" ).should.be.Promise().which.is.rejected()
			.then( () => instance.write( "model/some-id", myData ) )
			.then( () => instance.read( "model/some-id" ).should.be.Promise().which.is.resolvedWith( myData ) );
	} );

	it( "promises provided fallback value on trying to read() missing record", function() {
		const instance = new OdemAdapterMemory();

		const myFallbackData = { someProperty: "its value" };

		return instance.read( "model/some-id" ).should.be.Promise().which.is.rejected()
			.then( () => instance.read( "model/some-id", { ifMissing: myFallbackData } ).should.be.Promise().which.is.resolvedWith( myFallbackData ) );
	} );

	it( "returns promise on invoking write() which is resolved with written data", function() {
		const instance = new OdemAdapterMemory();

		const myData = { someProperty: "its value" };

		return instance.write( "model/some-id", myData ).should.be.Promise().which.is.resolved()
			.then( result => {
				result.should.equal( myData );
			} );
	} );

	it( "returns promise on invoking has() which is resolved with information on having selected record or not", function() {
		const instance = new OdemAdapterMemory();

		return instance.has( "model/some-id" ).should.be.Promise().which.is.resolved()
			.then( exists => {
				Should( exists ).be.false();
			} )
			.then( () => instance.write( "model/some-id", {} ) )
			.then( () => instance.has( "model/some-id" ).should.be.Promise().which.is.resolved() )
			.then( exists => {
				Should( exists ).be.true();
			} );
	} );

	it( "returns promise on invoking remove() which is resolved with key of record no matter if record exists or not", function() {
		const instance = new OdemAdapterMemory();

		return instance.remove( "model/some-id" ).should.be.Promise().which.is.resolvedWith( "model/some-id" )
			.then( instance.write( "model/some-id", { someProperty: "its value" } ) )
			.then( instance.remove( "model/some-id" ).should.be.Promise().which.is.resolvedWith( "model/some-id" ) );
	} );

	it( "returns promise on invoking begin() which is rejected due to lack of support for transactions", function() {
		const instance = new OdemAdapterMemory();

		return instance.begin().should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking rollBack() which is rejected due to lack of support for transactions", function() {
		const instance = new OdemAdapterMemory();

		return instance.rollBack().should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking commit() which is rejected due to lack of support for transactions", function() {
		const instance = new OdemAdapterMemory();

		return instance.commit().should.be.Promise().which.is.rejected();
	} );

	it( "returns keys w/o UUID as given on request for mapping it into some path name", function() {
		[
			"",
			"a",
			"some/test",
		].forEach( key => OdemAdapterMemory.keyToPath( key ).replace( /\\/g, "/" ).should.be.String().which.is.equal( key ) );
	} );

	it( "returns keys w/ UUID as given on request for mapping it into some path name", function() {
		[
			"01234567-89ab-cdef-fedc-ba9876543210",
			"item/00000000-1111-2222-4444-888888888888",
		].forEach( key => OdemAdapterMemory.keyToPath( key ).replace( /\\/g, "/" ).should.be.String().which.is.equal( key ) );
	} );

	it( "returns path names not related to some UUID as given on request for mapping it into some key", function() {
		[
			"",
			"a",
			join( "some", "test" ),
		].forEach( key => OdemAdapterMemory.pathToKey( key ).should.be.String().which.is.equal( key ) );
	} );

	it( "returns path names related to some UUID as given on request for mapping it into some key", function() {
		[
			join( "0", "12", "34567-89ab-cdef-fedc-ba9876543210" ),
			join( "item", "0", "00", "00000-1111-2222-4444-888888888888" ),
		].forEach( key => OdemAdapterMemory.pathToKey( key ).should.be.String().which.is.equal( key ) );
	} );

	describe( "provides `keyStream()` which", function() {
		let adapter;

		beforeEach( function() {
			adapter = new OdemAdapterMemory( { dataSource: "../data" } );

			return adapter.write( "some/key/without/uuid-1", { id: "first" } )
				.then( () => adapter.write( "some/key/without/uuid-2", { id: "second" } ) )
				.then( () => adapter.write( "some/other/key/without/uuid-3", { id: "third" } ) )
				.then( () => adapter.write( "some/key/with/uuid/12345678-1234-1234-1234-1234567890ab", { id: "fourth" } ) )
				.then( () => adapter.write( "some/key/with/uuid/00000000-0000-0000-0000-000000000000", { id: "fifth" } ) );
		} );

		it( "is a function", function() {
			adapter.should.have.property( "keyStream" ).which.is.a.Function();
		} );

		it( "returns a readable stream", function() {
			return new Promise( resolve => {
				const stream = adapter.keyStream();

				stream.should.be.instanceOf( Readable );
				stream.on( "end", resolve );
				stream.resume();
			} );
		} );

		it( "generates keys of all records in selected datasource by default", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream();

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 5 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/with/uuid/00000000-0000-0000-0000-000000000000",
						"some/key/with/uuid/12345678-1234-1234-1234-1234567890ab",
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
						"some/other/key/without/uuid-3",
					] );

					resolve();
				} );
			} );
		} );

		it( "generates keys of all records in selected datasource matching some selected prefix", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key/without",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 2 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
					] );

					resolve();
				} );
			} );
		} );

		it( "generates no key if prefix doesn't select any folder or single record in backend", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/missing/key",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.is.empty();
					resolve();
				} );
			} );
		} );

		it( "generates no key if prefix partially matching key of some folder in backend, only", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key/wit",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.is.empty();
					resolve();
				} );
			} );
		} );

		it( "generates some matching record's key used as prefix, only", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key/without/uuid-1",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 1 );
					streamed.should.eql( ["some/key/without/uuid-1"] );
					resolve();
				} );
			} );
		} );

		it( "generates keys of all records in selected datasource up to some requested maximum depth", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					maxDepth: 4,
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 2 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
					] );

					resolve();
				} );
			} );
		} );

		it( "generates keys of all records in selected datasource with requested maximum depth considered relative to given prefix", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key",
					maxDepth: 2,
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 2 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
					] );

					resolve();
				} );
			} );
		} );

		it( "obeys key depth instead of backend path depth which is higher due to splitting contained UUIDs into several segments", function() {
			return adapter.write( "some/12345678-1234-1234-1234-1234567890ab", {} )
				.then( () => adapter.write( "some/00000000-0000-0000-0000-000000000000", {} ) )
				.then( () => adapter.write( "some/non-UUID", {} ) )
				.then( () => adapter.write( "some/deeper/00000000-0000-0000-0000-000000000000", {} ) )
				.then( () => new Promise( resolve => {
					const streamed = [];
					const stream = adapter.keyStream( {
						prefix: "some",
						maxDepth: 1,
					} );

					stream.should.be.instanceOf( Readable );
					stream.on( "data", data => streamed.push( data ) );
					stream.on( "end", () => {
						streamed.should.be.Array().which.has.length( 3 );

						streamed.sort();

						streamed.should.eql( [
							"some/00000000-0000-0000-0000-000000000000",
							"some/12345678-1234-1234-1234-1234567890ab",
							"some/non-UUID",
						] );

						resolve();
					} );
				} ) );
		} );
	} );
} );
