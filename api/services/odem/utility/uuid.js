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


const { randomBytes } = require( "crypto" );

const PtnUuidParser = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const PtnUuidFormatter = /^(.{8})(.{4})(.{4})(.{4})(.{12})$/;


module.exports = function() {
	/**
	 * Wraps functionality regarding OdemUtilityUuid handling.
	 */
	class OdemUtilityUuid {
		/**
		 * Creates buffer containing OdemUtilityUuid.
		 *
		 * @returns {Promise<Buffer>} promises buffer describing OdemUtilityUuid
		 */
		static create() {
			return new Promise( ( resolve, reject ) => {
				randomBytes( 16, ( error, buffer ) => {
					if ( error ) {
						reject( new Error( "fetching random data failed: " + error ) );
						return;
					}

					// mark buffer to contain OdemUtilityUuid
					buffer[6] = ( buffer[6] & 0x0f ) | 0x40;
					buffer[8] = ( buffer[8] & 0x3f ) | 0x80;

					resolve( buffer );
				} );
			} );
		}

		/**
		 * Renders provided UUID as string.
		 *
		 * @param {Buffer} uuid buffer containing normalized UUID
		 * @returns {string} representation of provided UUID as string
		 */
		static format( uuid ) {
			if ( !Buffer.isBuffer( uuid ) || uuid.length < 16 ) {
				throw new TypeError( "UUID must be provided as buffer of sufficient size" );
			}

			return uuid.toString( "hex" ).toLowerCase().slice( 0 , 32 )
				.replace( PtnUuidFormatter, "$1-$2-$3-$4-$5" );
		}

		/**
		 * Detects if provided value is a UUID.
		 *
		 * @param {*} value possible binary UUID or representation of UUID as string
		 * @returns {boolean} true if value is considered valid UUID
		 */
		static isUUID( value ) {
			if ( !value ) {
				return false;
			}

			if ( Buffer.isBuffer( value ) && value.length >= 16 ) {
				return true;
			}

			return typeof value === "string" && PtnUuidParser.test( value );
		}

		/**
		 * Normalizes provided value to be binary UUID.
		 *
		 * @param {*} value value to be normalized
		 * @returns {Buffer} found UUID as binary buffer of 16 octets
		 * @throws TypeError on providing value that can't be converted to UUID
		 */
		static normalize( value ) {
			if ( value != null ) {
				if ( Buffer.isBuffer( value ) ) {
					if ( value.length === 16 ) {
						return value;
					}

					if ( value.length >= 16 ) {
						return value.slice( 0, 16 );
					}
				} else if ( typeof value === "string" ) {
					const trimmed = value.trim();

					if ( PtnUuidParser.test( trimmed ) ) {
						return Buffer.from( trimmed.replace( /-/g, "" ), "hex" );
					}
				}

				throw new TypeError( "provided value is not a UUID" );
			}

			return null;
		}
	}

	Object.defineProperties( OdemUtilityUuid, {
		/**
		 * Exposes pattern detecting whether some string is properly representing
		 * UUID or not.
		 *
		 * @name OdemUtilityUuid.ptnUuid
		 * @property {RegExp}
		 * @readonly
		 */
		ptnUuid: { value: PtnUuidParser },
	} );

	return OdemUtilityUuid;
};
