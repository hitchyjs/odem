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

const UUID = require( "../../../lib/utility/uuid" );
const Index = require( "../../../lib/model/indexer/equality" );
const PromiseUtils = require( "promise-essentials" );

/**
 * runs an resilience test with different values and types
 * @return {Promise<Array>} resolves if test is finished
 */
function test() {
	console.log( '"records"; "different values"; "type"; "rss"; "heapTotal"; "heapUsed"; "external"' );
	const Values = [
		[ "integer", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => index ) ],
		[ "string", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => `prefix${index}suffix` ) ],
	];

	return PromiseUtils.each( [ 1000, 10000, 100000, 500000 ], NumRecords => {
		const uuids = new Array( NumRecords );
		return new Promise( ( resolve, reject ) => {
			const create = index => {
				if ( index >= NumRecords ) {
					resolve();
				} else {
					UUID.create()
						.then( uuid => {
							if ( uuids.indexOf( uuid ) < 0 ) {
								uuids[index] = uuid;
								create( index + 1 );
							} else {
								create( index );
							}
						} )
						.catch( reject );
				}
			};
			create( 0 );
		} ).then( () => {
			return PromiseUtils.each( [ 1, 2, 10, 100, 1000, 10000, 100000, 500000 ], numValues => {
				if ( numValues > NumRecords ) {
					return Promise.resolve();
				}

				return PromiseUtils.each( Values,( [ valueType, valueGenerator ] ) => {
					const values = valueGenerator( numValues );
					let memoryUsageBefore;

					const MyIndex = new Index( { revision: 0 } );

					return gc()
						.then( function() {
							memoryUsageBefore = process.memoryUsage();

							for ( let i = 0; i < NumRecords; i++ ) {
								MyIndex.add( uuids[i], values[i % numValues], undefined, { checkDuplicate: false } );
							}

							return UUID.create()
								.then( id => {
									MyIndex.add( id, values[0] );
								} ).then( () => {
									const memoryUsage = process.memoryUsage();
									console.error( "computing:", `${NumRecords} records with ${numValues} different values of type ${valueType}` );

									const diff = {
										rss: memoryUsage.rss - memoryUsageBefore.rss,
										heapTotal: memoryUsage.heapTotal - memoryUsageBefore.heapTotal,
										heapUsed: memoryUsage.heapUsed - memoryUsageBefore.heapUsed,
										external: memoryUsage.external - memoryUsageBefore.external,
									};

									console.log( `${NumRecords}; ${numValues}; ${valueType}; ${diff.rss}; ${diff.heapTotal}; ${diff.heapUsed}; ${diff.external}` ); // eslint-disable-line max-len
								} );
						} );
				} );
			} );
		} );
	} )
		.catch( error => {
			console.error( `FAILED: ${error.stack}` );
		} );
}

test();

/**
 * Invokes garbage collection and waits a moment.
 *
 * @param {int} delayMs number of milliseconds to wait after triggering GC
 * @returns {Promise} promises garbage collection triggered and delay passed
 */
function gc( delayMs = 5000 ) {
	if ( !global.gc ) {
		return Promise.reject( new Error( "run node with option --expose-gc (e.g. `node --expose-gc index.js`)" ) );
	}

	return new Promise( resolve => {
		global.gc( true );

		setTimeout( resolve, delayMs );
	} );
}
