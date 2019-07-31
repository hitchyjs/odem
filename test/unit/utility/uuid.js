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

const { Uuid } = require( "../../../lib/utility" );


suite( "UUIDv4 generator", function() {
	test( "is exposed properly", function() {
		Should( Uuid ).be.ok();
	} );

	test( "is a function", function() {
		Uuid.should.be.Function().which.has.length( 0 );
	} );

	test( "does not throw", function() {
		let result;

		( () => ( result = Uuid() ) ).should.not.throw();

		return result;
	} );

	test( "returns a promise", function() {
		return Uuid().should.be.Promise().which.is.resolved();
	} );

	test( "promises string containing Uuid in commonly expected format", function() {
		return Uuid()
			.then( result => {
				Should( result ).be.ok();

				result.should.be.String().and.match( /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i );
			} );
	} );

	test( "exposes static function isUUID() for testing whether some string is containing UUID or not.", function() {
		Should( Uuid.isUUID ).be.ok();
		Uuid.isUUID.should.be.Function().which.has.length( 1 );

		( () => Uuid.isUUID() ).should.not.throw();

		Uuid.isUUID().should.be.Boolean().which.is.false();
		Uuid.isUUID( null ).should.be.Boolean().which.is.false();
		Uuid.isUUID( undefined ).should.be.Boolean().which.is.false();
		Uuid.isUUID( false ).should.be.Boolean().which.is.false();
		Uuid.isUUID( true ).should.be.Boolean().which.is.false();
		Uuid.isUUID( 0 ).should.be.Boolean().which.is.false();
		Uuid.isUUID( 0.0 ).should.be.Boolean().which.is.false();
		Uuid.isUUID( -1 ).should.be.Boolean().which.is.false();
		Uuid.isUUID( 1.0 ).should.be.Boolean().which.is.false();
		Uuid.isUUID( [] ).should.be.Boolean().which.is.false();
		Uuid.isUUID( {} ).should.be.Boolean().which.is.false();
		Uuid.isUUID( { uuid: "01234567-89ab-cdef-fedc-ba9876543210" } ).should.be.Boolean().which.is.false();
		Uuid.isUUID( () => {} ).should.be.Boolean().which.is.false(); // eslint-disable-line no-empty-function
		Uuid.isUUID( () => "01234567-89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( new Set() ).should.be.Boolean().which.is.false();

		Uuid.isUUID( "" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567_89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab_cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef_fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-fedc_ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567 89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-fedc ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "1234567-89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-9ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-def-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-edc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-fedc-a9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "012345678-89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89abb-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdeff-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-fedcc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-fedc-ba98765432100" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "0123456g-89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ag-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cgef-fedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-gedc-ba9876543210" ).should.be.Boolean().which.is.false();
		Uuid.isUUID( "01234567-89ab-cdef-fedc-ga9876543210" ).should.be.Boolean().which.is.false();

		Uuid.isUUID( "01234567-89ab-cdef-fedc-ba9876543210" ).should.be.Boolean().which.is.true();
		Uuid.isUUID( "01234567-89AB-CDEF-FEDC-BA9876543210" ).should.be.Boolean().which.is.true();

		// due to coercion:
		Uuid.isUUID( ["01234567-89ab-cdef-fedc-ba9876543210"] ).should.be.Boolean().which.is.false();
	} );

} );
