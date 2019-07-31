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

const Uuid = require( "../../../lib/utility/uuid" );
const Index = require( "../../../lib/index/index" );
const PromisUtils = require( "promise-essentials" );

function test() {
	console.log( '"records"; "different values"; "type"; "rss"; "heapTotal"; "heapUsed"; "external"' );
	const Values = [
		[ "integer", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => index ) ],
		[ "string", num => new Array( num ).fill( 0, 0, num ).map( ( _, index ) => `prefix${index}suffix` ) ],
	];

	return PromisUtils.each( [ 1000, 10000, 100000, 500000 ], NumRecords => {
		const uuids = new Array( NumRecords );
		return new Promise( ( resolve, reject ) => {
			const create = index => {
				if ( index >= NumRecords ) {
					resolve();
				} else {
					Uuid( { binary: true } )
						.then( id => {
							uuids[index] = id;
							create( index + 1 );
						} )
						.catch( reject );
				}
			};
			create( 0 );
		} ).then( () => {
			return PromisUtils.each( [ 1, 1, 2, 10, 100, 1000, 10000, 100000, 500000 ], numValues => {
				if ( numValues > NumRecords ) {
					return Promise.resolve();
				}

				return PromisUtils.each( Values,( [ valueType, valueGenerator ] ) => {
					const values = valueGenerator( numValues );
					let memoryUsageBefore;

					const MyIndex = new Index( { revision: 0 } );

					try {
						if ( global.gc ) {
							global.gc( true );
							console.error( "collecting garbage and waiting 5000ms" );
						}
					} catch ( e ) {
						console.error( "`node --expose-gc index.js`" );
						process.exit();
					}

					return PromisUtils.delay( 5000 )
						.then( function() {
							memoryUsageBefore = process.memoryUsage();
							for ( let i = 0; i < NumRecords; i++ ) {
								MyIndex.add( uuids[i], values[i % numValues], { checkDuplicate: false } );
							}
							return Uuid( { binary: true } )
								.then( id => {
									MyIndex.add( id, values[0] );
								} ).then( () => {
									const memoryUsage = process.memoryUsage();
									console.error( "computing:", `${NumRecords} records with ${numValues} different Values of type ${valueType}` );
									const diff = {
										rss: memoryUsage.rss - memoryUsageBefore.rss,
										heapTotal: memoryUsage.heapTotal - memoryUsageBefore.heapTotal,
										heapUsed: memoryUsage.heapUsed - memoryUsageBefore.heapUsed,
										external: memoryUsage.external - memoryUsageBefore.external,
									};
									console.log( `${NumRecords}; ${numValues}; ${valueType}; ${diff.rss}; ${diff.heapTotal}; ${diff.heapUsed}; ${diff.external}` );
								} );
						} );
				} );
			} );
		} );
	} );
}

test();
