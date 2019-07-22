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


const { sep, posix, resolve: PathResolve, join, dirname } = require( "path" );
const { write: fsWrite, close } = require( "fs" );
const { PassThrough } = require( "stream" );

const { MkFile, Stat, MkDir, List, Read, Write, RmDir, Find } = require( "file-essentials" );

const Adapter = require( "./base" );
const { ptnUuid } = require( "../utility/uuid" );

const DefaultConfig = {
	dataSource: "/data",
};


/**
 * Implements backend managing all data in files of local file system.
 *
 * @name FileAdapter
 * @extends Adapter
 * @property {object} config options customizing current adapter
 * @property {string} dataSource path name of folder containing all data files
 */
class FileAdapter extends Adapter {
	/**
	 * @param {object} config configuration of adapter
	 */
	constructor( config ) {
		super();

		const _config = Object.assign( {}, DefaultConfig, config );

		Object.defineProperties( this, {
			/**
			 * Exposes configuration customizing behaviour of current adapter.
			 *
			 * @name FileAdapter#config
			 * @property {object}
			 * @readonly
			 */
			config: { value: _config },

			/**
			 * Exposes data source managed by current adapter.
			 *
			 * @note In context of FileAdapter this is the path name of folder
			 *       containing all files managed by this adapter.
			 *
			 * @name FileAdapter#dataSource
			 * @property {string}
			 * @readonly
			 */
			dataSource: { value: _config.dataSource },
		} );
	}

	/** @inheritDoc */
	purge() {
		return RmDir( this.dataSource, { subsOnly: true } );
	}

	/** @inheritDoc */
	create( keyTemplate, data ) {
		let key = null;

		return MkFile( this.dataSource, {
			uuidToPath: uuid => {
				key = keyTemplate.replace( /%u/g, uuid );
				return this.constructor.keyToPath( key ).split( /[\\/]/ );
			},
		} )
			.then( ( { fd } ) => {
				return new Promise( ( resolve, reject ) => {
					fsWrite( fd, JSON.stringify( data ), 0, "utf8", writeError => {
						if ( writeError ) {
							close( fd );
							reject( writeError );
						} else {
							close( fd, closeError => {
								if ( closeError ) {
									reject( closeError );
								} else {
									resolve( key );
								}
							} );
						}
					} );
				} );
			} );
	}

	/** @inheritDoc */
	has( key ) {
		return Stat( PathResolve( this.dataSource, this.constructor.keyToPath( key ) ) ).then( s => Boolean( s ) );
	}

	/** @inheritDoc */
	list( parentKey ) {
		let path = this.constructor.keyToPath( parentKey );

		if ( path.match( /[\\/]\.\.?[\\/]/ ) ) {
			return Promise.reject( new Error( "invalid key: " + parentKey ) );
		}

		path = PathResolve( this.dataSource, path );

		return List( path, { noHidden: true } )
			.then( entries => {
				for ( let read = 0, length = entries.length; read < length; read++ ) {
					entries[read] = join( parentKey, entries[read] );
				}

				return entries;
			} );
	}

	/** @inheritDoc */
	read( key, { ifMissing = null } = {} ) {
		let path = this.constructor.keyToPath( key );

		if ( path.match( /[\\/]\.\.?[\\/]/ ) ) {
			return Promise.reject( new Error( "invalid key: " + key ) );
		}

		path = PathResolve( this.dataSource, path );

		const parent = dirname( path );

		return Stat( parent )
			.then( exists => {
				if ( exists && exists.isDirectory() ) {
					return Read( path )
						.then( content => JSON.parse( content.toString( "utf8" ) ) )
						.catch( error => {
							if ( error.code === "ENOENT" ) {
								if ( ifMissing ) {
									return ifMissing;
								}

								throw new Error( `no such record @${key}` );
							}

							throw error;
						} );
				}
				if ( ifMissing ) {
					return ifMissing;
				}

				throw new Error( `no such record @${key}` );

			} );
	}

	/** @inheritDoc */
	write( key, data ) {
		const path = this.constructor.keyToPath( key );

		if ( path.match( /[\\/]\.\.?[\\/]/ ) ) {
			return Promise.reject( new Error( "invalid key: " + key ) );
		}

		const parent = dirname( path );
		let promise;

		switch ( parent ) {
			case "" :
			case "." :
			case "/" :
				promise = Promise.resolve();
				break;

			default :
				promise = MkDir( this.dataSource, parent );
		}

		return promise
			.then( () => Write( PathResolve( this.dataSource, path ), JSON.stringify( data ) ) )
			.then( () => data );
	}

	/** @inheritDoc */
	remove( key ) {
		const path = this.constructor.keyToPath( key );

		if ( path.match( /[\\/]\.\.?[\\/]/ ) ) {
			return Promise.reject( new Error( "invalid key: " + key ) );
		}

		return RmDir( PathResolve( this.dataSource, path ) ).then( () => key );
	}

	/** @inheritDoc */
	keyStream( { prefix = "", maxDepth = Infinity, separator = "/" } = {} ) {
		const { pathToKey } = this.constructor;

		return this.constructor._createStream( this.dataSource, {
			prefix,
			maxDepth,
			separator,
			converter: function( local, full, state ) {
				if ( !state.isDirectory() ) {
					const key = local === "." ? "" : pathToKey( local );

					return prefix === "" ? key : posix.join( prefix, key );
				}

				return null;
			},
		} );
	}

	/** @inheritDoc */
	valueStream( { prefix = "", maxDepth = Infinity, separator = "/" } = {} ) {
		return this.constructor._createStream( this.dataSource, {
			prefix,
			maxDepth,
			separator,
			retriever: ( context, path ) => {
				return Read( path )
					.then( content => { // eslint-disable-line promise/always-return
						context.data = JSON.parse( content.toString( "utf8" ) );
					} );
			},
			converter: function( local, full, state ) {
				if ( !state.isDirectory() && this.data ) {
					return this.data;
				}

				return null;
			},
		} );
	}

	/**
	 * Commonly implements integration of file-essential's find() method for
	 * streaming either keys or values of records stored in selected datasource.
	 *
	 * @param {string} dataSource path name of folder containing all records of this adapter
	 * @param {function()} converter callback passed to file-essential's find()
	 *        method for converting matching file's path names into whatever
	 *        should be streamed
	 * @param {function(object,string):Promise<Buffer>} retriever optional
	 *        callback to be called from filter passed to file-essential's find()
	 *        method on matching files e.g. for reading and caching their content
	 * @param {string} prefix limits stream to expose records with keys matching this prefix, only
	 * @param {int} maxDepth maximum depth on descending into keys' hierarchy
	 * @param {string} separator separator used to divide keys into hierarchical paths
	 * @returns {Readable} stream generating either keys or content of matching records in backend
	 * @private
	 */
	static _createStream( dataSource, { converter, retriever = null, prefix, maxDepth, separator } ) {
		const ptnFinal = /(^|[\\/])[ps][^\\/]+$/i;
		const { keyToPath, pathToKey } = this;

		const prefixPath = keyToPath( prefix );
		const base = PathResolve( dataSource, prefixPath );

		const stream = new PassThrough( { objectMode: true } );

		Stat( base )
			.then( stats => { // eslint-disable-line consistent-return
				if ( !stats ) {
					stream.end();
				} else if ( stats.isDirectory() ) {
					Find( base, {
						stream: true,
						filter: function( local, full, state ) {
							if ( state.isDirectory() ) {
								if ( separator ) {
									let key;
									try {
										key = pathToKey( local );
									} catch ( e ) {
										return true;
									}

									if ( key.split( separator ).length >= maxDepth ) {
										return false;
									}
								}

								return ptnFinal.test( local );
							}

							if ( !ptnFinal.test( local ) ) {
								return false;
							}

							let partials = 0;
							const segments = local.split( sep );

							for ( let i = 0, length = segments.length; i < length; i++ ) {
								switch ( segments[i][0] ) {
									case "p" :
									case "P" :
										partials++;
										break;

									case "s" :
									case "S" :
										if ( partials % 3 !== 0 ) {
											return false;
										}

										partials = 0;
										break;

									default :
										// basically excluded due to testing directories above
										return false;
								}
							}

							if ( partials % 3 === 0 ) {
								if ( retriever ) {
									return retriever( this, full ).then( () => true );
								}

								return true;
							}

							return false;
						},
						converter,
					} ).pipe( stream );
				} else if ( retriever ) {
					const context = {};
					return retriever( context, base )
						.then( () => stream.end( converter.call( context, ".", base, stats ) ) );
				} else {
					stream.end( converter.call( {}, ".", base, stats ) );
				}
			} )
			.catch( error => stream.emit( "error", error ) );

		return stream;
	}

	/** @inheritDoc */
	static keyToPath( key ) {
		if ( key === "" ) {
			return "";
		}

		const segments = key.split( /\//g );
		const length = segments.length;
		const copy = new Array( length * 3 );
		let write = 0;

		for ( let i = 0; i < length; i++ ) {
			const segment = segments[i];

			if ( ptnUuid.test( segment ) ) {
				copy[write++] = "p" + segment[0];
				copy[write++] = "p" + segment.slice( 1, 3 );
				copy[write++] = "p" + segment.slice( 3 );
			} else {
				copy[write++] = "s" + segment;
			}
		}

		copy.splice( write );

		return copy.join( sep );
	}

	/** @inheritDoc */
	static pathToKey( path ) {
		if ( path === "" ) {
			return "";
		}

		const segments = path.split( /[\\/]/g );
		const length = segments.length;
		const copy = new Array( length );
		let write = 0;

		for ( let i = 0; i < length; i++ ) {
			const segment = segments[i];

			switch ( segment[0] ) {
				case "P" :
				case "p" : {
					const next = segments[i + 1];
					const second = segments[i + 2];

					if ( next == null || ( next[0] !== "p" && next[0] !== "P" ) || second == null || ( second[0] !== "p" && second[0] !== "P" ) ) {
						throw new Error( "insufficient partials of UUID in path" );
					}

					copy[write++] = segment.slice( 1 ) + next.slice( 1 ) + second.slice( 1 );
					i += 2;
					break;
				}

				case "S" :
				case "s" :
					copy[write++] = segment.slice( 1 );
					break;

				default :
					throw new Error( "malformed segment in path name" );
			}
		}

		copy.splice( write );

		return copy.join( "/" );
	}
}

module.exports = FileAdapter;
