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


const { describe, it } = require( "mocha" );
require( "should" );

const { UUID } = require( "../../../lib/utility" );


describe( "Utility for handling UUIDs", () => {
	describe( "has static method UUID.normalize() that", () => {
		it( "throws when used without arguments", () => {
			( () => UUID.normalize() ).should.throw( TypeError );
		} );

		it( "throws when used with argument not suitable for representing UUID", () => {
			( () => UUID.normalize( null ) ).should.throw( TypeError );
			( () => UUID.normalize( undefined ) ).should.throw( TypeError );
			( () => UUID.normalize( false ) ).should.throw( TypeError );
			( () => UUID.normalize( true ) ).should.throw( TypeError );
			( () => UUID.normalize( 0 ) ).should.throw( TypeError );
			( () => UUID.normalize( 1.0 ) ).should.throw( TypeError );
			( () => UUID.normalize( -1000 ) ).should.throw( TypeError );
			( () => UUID.normalize( [] ) ).should.throw( TypeError );
			( () => UUID.normalize( ["12345678-1234-1234-1234-1234567890ab"] ) ).should.throw( TypeError );
			( () => UUID.normalize( {} ) ).should.throw( TypeError );
			( () => UUID.normalize( { uuid: "12345678-1234-1234-1234-1234567890ab" } ) ).should.throw( TypeError );
			( () => UUID.normalize( () => {} ) ).should.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => UUID.normalize( () => "12345678-1234-1234-1234-1234567890ab" ) ).should.throw( TypeError );
		} );

		it( "rejects array consisting of 16 integers in range 0-0xFF as argument", () => {
			( () => UUID.normalize( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] ) ).should.throw( TypeError );
		} );

		it( "rejects array consisting of 4 integers in range 0-0xFFFFFFFF as argument", () => {
			( () => UUID.normalize( [ 1, 2, 3, 4 ] ) ).should.throw( TypeError );
		} );

		it( "rejects string not containing valid UUID as argument", () => {
			( () => UUID.normalize( "" ) ).should.throw( TypeError );
			( () => UUID.normalize( "1-1234-1234-1234-1234567890ab" ) ).should.throw( TypeError );
			( () => UUID.normalize( "12345678_1234-1234-1234-1234567890ab" ) ).should.throw( TypeError );
			( () => UUID.normalize( "g2345678-1234-1234-1234-1234567890ab" ) ).should.throw( TypeError );
		} );

		it( "accepts string containing valid UUID as argument", () => {
			( () => UUID.normalize( "12345678-1234-1234-1234-1234567890ab" ) ).should.not.throw();
			( () => UUID.normalize( "12345678-1234-1234-1234-1234567890AB" ) ).should.not.throw();
			( () => UUID.normalize( "  12345678-1234-1234-1234-1234567890ab  " ) ).should.not.throw();
		} );

		it( "accepts Buffer consisting of 16 bytes", () => {
			( () => UUID.normalize( Buffer.alloc( 16 ) ) ).should.not.throw();
		} );

		it( "accepts Buffer consisting of more than 16 bytes", () => {
			( () => UUID.normalize( Buffer.alloc( 17 ) ) ).should.not.throw();
			( () => UUID.normalize( Buffer.alloc( 32 ) ) ).should.not.throw();
			( () => UUID.normalize( Buffer.alloc( 8192 ) ) ).should.not.throw();
		} );

		it( "rejects Buffer consisting of less than 16 bytes", () => {
			( () => UUID.normalize( Buffer.alloc( 15 ) ) ).should.throw( TypeError );
			( () => UUID.normalize( Buffer.alloc( 1 ) ) ).should.throw( TypeError );
		} );
	} );

	describe( "provides static method UUIDv4.create() that", () => {
		it( "doesn't throw", () => {
			let result;

			( () => ( result = UUID.create() ) ).should.not.throw();

			return result;
		} );

		it( "returns a promise", () => {
			return UUID.create().should.be.Promise().which.is.resolved();
		} );

		it( "promises Buffer with 16 bytes", () => {
			return UUID.create()
				.then( result => {
					result.should.be.instanceOf( Buffer );
					result.should.have.length( 16 );
				} );
		} );
	} );

	describe( "provides static method UUIDv4.isUUID() that", () => {
		it( "requires provision of one argument", () => {
			UUID.isUUID.should.be.Function().which.has.length( 1 );
		} );

		it( "doesn't throw when calling without arguments", () => {
			( () => UUID.isUUID() ).should.not.throw();
		} );

		it( "rejects most regular types of input not suitable for purely describing single UUID", () => {
			UUID.isUUID().should.be.false();
			UUID.isUUID( null ).should.be.false();
			UUID.isUUID( undefined ).should.be.false();
			UUID.isUUID( false ).should.be.false();
			UUID.isUUID( true ).should.be.false();
			UUID.isUUID( 0 ).should.be.false();
			UUID.isUUID( 0.0 ).should.be.false();
			UUID.isUUID( -1 ).should.be.false();
			UUID.isUUID( 1.0 ).should.be.false();
			UUID.isUUID( [] ).should.be.false();
			UUID.isUUID( {} ).should.be.false();
			UUID.isUUID( { uuid: "01234567-89ab-cdef-fedc-ba9876543210" } ).should.be.false();
			UUID.isUUID( () => {} ).should.be.false(); // eslint-disable-line no-empty-function
			UUID.isUUID( () => "01234567-89ab-cdef-fedc-ba9876543210" ).should.be.is.false();
			UUID.isUUID( new Set() ).should.be.is.false();
			UUID.isUUID( ["01234567-89ab-cdef-fedc-ba9876543210"] ).should.be.false();
		} );

		it( "rejects strings not representing UUID", () => {
			UUID.isUUID( "" ).should.be.false();

			// using invalid separator
			UUID.isUUID( "01234567_89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab_cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef_fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc_ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567 89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc ba9876543210" ).should.be.false();

			// lacking one character
			UUID.isUUID( "1234567-89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-9ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-def-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-edc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc-a9876543210" ).should.be.false();

			// containing extra character
			UUID.isUUID( "012345678-89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89abb-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdeff-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedcc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc-ba98765432100" ).should.be.false();

			// using invalid digit
			UUID.isUUID( "0123456g-89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ag-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cgef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-gedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc-ga9876543210" ).should.be.false();
		} );

		it( "accepts strings representing UUID using lowercase letters", () => {
			UUID.isUUID( "01234567-89ab-cdef-fedc-ba9876543210" ).should.be.true();
		} );

		it( "accepts strings representing UUID using uppercase letters", () => {
			UUID.isUUID( "01234567-89AB-CDEF-FEDC-BA9876543210" ).should.be.true();
		} );

		it( "accepts Buffer consisting of 16 bytes", () => {
			UUID.isUUID( Buffer.alloc( 16 ) ).should.be.true();
		} );

		it( "accepts Buffer consisting of more than 16 bytes", () => {
			UUID.isUUID( Buffer.alloc( 17 ) ).should.be.true();
			UUID.isUUID( Buffer.alloc( 32 ) ).should.be.true();
			UUID.isUUID( Buffer.alloc( 8192 ) ).should.be.true();
		} );

		it( "rejects Buffer consisting of less than 16 bytes", () => {
			UUID.isUUID( Buffer.alloc( 15 ) ).should.be.false();
			UUID.isUUID( Buffer.alloc( 1 ) ).should.be.false();
		} );
	} );

	describe( "provides static method UUIDv4.normalize() that", () => {
		it( "requires provision of one argument", () => {
			UUID.normalize.should.be.Function().which.has.length( 1 );
		} );

		it( "throws when calling without arguments", () => {
			( () => UUID.normalize() ).should.throw( TypeError );
		} );

		it( "rejects most regular types of input not suitable for purely describing single UUID", () => {
			( () => UUID.normalize( null ) ).should.throw( TypeError );
			( () => UUID.normalize( undefined ) ).should.throw( TypeError );
			( () => UUID.normalize( false ) ).should.throw( TypeError );
			( () => UUID.normalize( true ) ).should.throw( TypeError );
			( () => UUID.normalize( 0 ) ).should.throw( TypeError );
			( () => UUID.normalize( 0.0 ) ).should.throw( TypeError );
			( () => UUID.normalize( -1 ) ).should.throw( TypeError );
			( () => UUID.normalize( 1.0 ) ).should.throw( TypeError );
			( () => UUID.normalize( [] ) ).should.throw( TypeError );
			( () => UUID.normalize( {} ) ).should.throw( TypeError );
			( () => UUID.normalize( { uuid: "01234567-89ab-cdef-fedc-ba9876543210" } ) ).should.throw( TypeError );
			( () => UUID.normalize( () => {} ) ).should.be.throw( TypeError ); // eslint-disable-line no-empty-function
			( () => UUID.normalize( () => "01234567-89ab-cdef-fedc-ba9876543210" ) ).should.throw( TypeError );
			( () => UUID.normalize( new Set() ) ).should.throw( TypeError );
			( () => UUID.normalize( [ 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef ] ) ).should.throw( TypeError ); // eslint-disable-line max-len
			( () => UUID.normalize( new Uint8Array( [ 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef ] ) ) ).should.throw( TypeError ); // eslint-disable-line max-len
			( () => UUID.normalize( new Uint32Array( [ 0x01234567, 0x89abcdef, 0x01234567, 0x89abcdef ] ) ) ).should.throw( TypeError );
			( () => UUID.normalize( ["01234567-89ab-cdef-fedc-ba9876543210"] ) ).should.throw( TypeError );
		} );

		it( "rejects strings not representing UUID", () => {
			UUID.isUUID( "" ).should.be.false();

			// using invalid separator
			UUID.isUUID( "01234567_89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab_cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef_fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc_ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567 89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc ba9876543210" ).should.be.false();

			// lacking one character
			UUID.isUUID( "1234567-89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-9ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-def-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-edc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc-a9876543210" ).should.be.false();

			// containing extra character
			UUID.isUUID( "012345678-89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89abb-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdeff-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedcc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc-ba98765432100" ).should.be.false();

			// using invalid digit
			UUID.isUUID( "0123456g-89ab-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ag-cdef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cgef-fedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-gedc-ba9876543210" ).should.be.false();
			UUID.isUUID( "01234567-89ab-cdef-fedc-ga9876543210" ).should.be.false();
		} );

		it( "accepts strings representing UUID using lowercase letters", () => {
			UUID.isUUID( "01234567-89ab-cdef-fedc-ba9876543210" ).should.be.true();
		} );

		it( "accepts strings representing UUID using uppercase letters", () => {
			UUID.isUUID( "01234567-89AB-CDEF-FEDC-BA9876543210" ).should.be.true();
		} );

		it( "accepts Buffer consisting of 16 bytes", () => {
			UUID.isUUID( Buffer.alloc( 16 ) ).should.be.true();
		} );

		it( "accepts Buffer consisting of more than 16 bytes", () => {
			UUID.isUUID( Buffer.alloc( 17 ) ).should.be.true();
			UUID.isUUID( Buffer.alloc( 32 ) ).should.be.true();
			UUID.isUUID( Buffer.alloc( 8192 ) ).should.be.true();
		} );

		it( "rejects Buffer consisting of less than 16 bytes", () => {
			UUID.isUUID( Buffer.alloc( 15 ) ).should.be.false();
			UUID.isUUID( Buffer.alloc( 1 ) ).should.be.false();
		} );
	} );

	describe( "provides static method UUIDv4#format() that", () => {
		it( "is function requiring one argument", () => {
			UUID.format.length.should.be.equal( 1 );
		} );

		it( "throws on calling without any argument", () => {
			( () => UUID.format() ).should.throw();
		} );

		it( "throws on providing something that's not a Buffer", () => {
			( () => UUID.format( undefined ) ).should.throw();
			( () => UUID.format( null ) ).should.throw();
			( () => UUID.format( false ) ).should.throw();
			( () => UUID.format( true ) ).should.throw();
			( () => UUID.format( 0 ) ).should.throw();
			( () => UUID.format( "" ) ).should.throw();
			( () => UUID.format( "some-value" ) ).should.throw();
			( () => UUID.format( "01234567-0123-0123-0123-0123456789ab" ) ).should.throw();
			( () => UUID.format( {} ) ).should.throw();
			( () => UUID.format( { uuid: "01234567-0123-0123-0123-0123456789ab" } ) ).should.throw();
			( () => UUID.format( [] ) ).should.throw();
			( () => UUID.format( ["01234567-0123-0123-0123-0123456789ab"] ) ).should.throw();
			( () => UUID.format( () => {} ) ).should.throw(); // eslint-disable-line no-empty-function
			( () => UUID.format( () => "01234567-0123-0123-0123-0123456789ab" ) ).should.throw();
		} );

		it( "renders string representing UUID provided as binary buffer", () => {
			const uuid = UUID.format( Buffer.from( [ 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef ] ) );

			uuid.toString().should.be.String().which.match( /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i );
		} );

		it( "keeps byte order UUID", () => {
			const uuid = UUID.format( Buffer.from( [ 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef ] ) );

			uuid.toString().should.be.equal( "01234567-89ab-cdef-0123-456789abcdef" );
		} );
	} );
} );
