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


const { sep } = require( "path" );
const { Readable } = require( "stream" );

const Adapter = require( "./base" );
const UUID = require( "../utility/uuid" );

const DefaultConfig = {
	dataSource: "memory:///",
};


/**
 * Implements backend managing all data in files of local file system.
 *
 * @name MemoryAdapter
 * @extends Adapter
 * @property {object} config options customizing current adapter
 * @property {string} dataSource path name of folder containing all data files
 */
class MemoryAdapter extends Adapter {
	/**
	 * @param {object} config configuration of adapter
	 */
	constructor( config ) {
		super();

		Object.defineProperties( this, {
			/**
			 * Exposes configuration of current adapter.
			 *
			 * @name MemoryAdapter#config
			 * @property {object}
			 * @readonly
			 */
			config: { value: Object.assign( {}, DefaultConfig, config ) },

			/**
			 * Exposes data source managed by current adapter.
			 *
			 * @name MemoryAdapter#dataSource
			 * @property {Map}
			 * @readonly
			 */
			dataSource: { value: new Map() },
		} );
	}

	/** @inheritDoc */
	purge() {
		this.dataSource.clear();

		return Promise.resolve();
	}

	/** @inheritDoc */
	create( keyTemplate, data ) {
		return UUID.create()
			.then( uuid => {
				const key = this.constructor.keyToPath( keyTemplate.replace( /%u/g, UUID.format( uuid ) ) );

				this.dataSource.set( key, data );

				return key;
			} );
	}

	/** @inheritDoc */
	has( key ) {
		return Promise.resolve( this.dataSource.has( key ) );
	}

	/** @inheritDoc */
	list( parentKey ) {
		const matches = [];

		let trim = parentKey.length;
		let trimmed = false;
		while ( parentKey[trim - 1] === sep ) {
			trim--;
			trimmed = true;
		}

		const prefix = trimmed ? parentKey.substr( 0, trim ) + sep : parentKey;

		for ( const key of this.dataSource.keys() ) {
			if ( key.startsWith( prefix ) ) {
				matches.push( key );
			}
		}

		return Promise.resolve( matches );
	}

	/** @inheritDoc */
	read( key, { ifMissing = null } = {} ) {
		const dataSource = this.dataSource;

		if ( dataSource.has( key ) ) {
			return Promise.resolve( dataSource.get( key ) );
		}

		if ( ifMissing ) {
			return Promise.resolve( ifMissing );
		}

		return Promise.reject( new Error( `no such record @${key}` ) );
	}

	/** @inheritDoc */
	write( key, data ) {
		this.dataSource.set( key, data );

		return Promise.resolve( data );
	}

	/** @inheritDoc */
	remove( key ) {
		this.dataSource.delete( key );

		return Promise.resolve( key );
	}

	/** @inheritDoc */
	keyStream( { prefix = "", maxDepth = Number( Infinity ), separator = "/" } = {} ) {
		const iterator = this.dataSource[Symbol.iterator]();

		return new Readable( {
			objectMode: true,
			read: this.constructor.getFeeder( iterator, 0, { prefix, maxDepth, separator } ),
		} );
	}

	/** @inheritDoc */
	valueStream( { prefix = "", maxDepth = Number( Infinity ), separator = "/" } = {} ) {
		const iterator = this.dataSource[Symbol.iterator]();

		return new Readable( {
			objectMode: true,
			read: this.constructor.getFeeder( iterator, 1, { prefix, maxDepth, separator } ),
		} );
	}

	/**
	 * Retrieves feeder function for use with IteratorStream to provide either
	 * key or value of every record matching described criteria.
	 *
	 * @param {Iterator} iterator successively iterates over pairs of keys and contents of records
	 * @param {int} index 0 for providing keys, 1 for providing values
	 * @param {string} prefix limits exposed records to those w/ keys matching this prefix
	 * @param {int} maxDepth marks upper limit on descending into key hierarchy (ignored unless separator is set)
	 * @param {string} separator marks separator used to distinguish different hierarchy levels of keys from each other
	 * @returns {function(this:IteratorStream)} implementation of method `read()` for use with a readable stream
	 */
	static getFeeder( iterator, index, { prefix = "", maxDepth = Number( Infinity ), separator = "/" } ) {
		return function() {
			let item = {};
			let writable = true;

			while ( writable && !item.done ) {
				item = iterator.next();

				if ( item.done ) {
					this.push( null );
				} else {
					const [key] = item.value;
					if ( typeof key !== "string" ) {
						continue;
					}

					const prefixLength = prefix.length;
					if ( key.slice( 0, prefixLength ) !== prefix ) {
						continue;
					}

					const sub = key.slice( prefixLength );
					if ( separator != null ) {
						const lead = key[prefixLength];

						if ( prefix.length > 0 && lead !== separator && lead != null ) {
							continue;
						}

						const segments = sub.split( separator );
						let depth = segments.length;
						let cursor = 0;

						while ( cursor < depth && !segments[cursor].length ) {
							cursor++;
						}

						depth -= cursor;
						if ( depth > maxDepth ) {
							continue;
						}
					}

					writable = this.push( item.value[index] );
				}
			}
		};
	}
}

module.exports = MemoryAdapter;
