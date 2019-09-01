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


/* eslint no-unused-vars: ["error", { "args": "none" }] */

const { Readable } = require( "stream" );

/**
 * @name Adapter
 */
class Adapter {
	/**
	 * Drops all data available via current adapter.
	 *
	 * @note This method is primarily meant for use while testing. It might be
	 *       useful in similar situations as well, like uninstalling some app.
	 *
	 * @returns {Promise} promises purging all data available via current adapter
	 * @abstract
	 */
	purge() {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Puts provided data in storage assigning new unique key.
	 *
	 * @param {string} keyTemplate template of key containing %u to be replaced with assigned UUID
	 * @param {object} data record to be written
	 * @returns {Promise.<string>} promises unique key of new record
	 * @abstract
	 */
	create( keyTemplate, data ) {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Checks if provided key exists.
	 *
	 * @param {string} key unique key of record to test
	 * @returns {Promise.<boolean>} promises information if key exists or not
	 * @abstract
	 */
	has( key ) {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Lists keys of all elements directly subordinated to selected parent.
	 *
	 * @param {string} parentKey unique key considered parent to records to be listed here
	 * @returns {Promise.<Array<string>>} promises list of keys
	 * @abstract
	 */
	list( parentKey ) {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Reads data selected by provided key.
	 *
	 * @param {string} key unique key of record to read
	 * @param {object} ifMissing data object to return if selected record is missing
	 * @returns {Promise.<object>} promises read data
	 * @abstract
	 */
	read( key, { ifMissing = null } = {} ) {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Writes provided data to given key.
	 *
	 * @note To support REST API in hitchy-plugin-odem-rest this method must be
	 *       capable of writing to record that didn't exist before, thus
	 *       creating new record with provided key.
	 *
	 * @param {string} key unique key of record to be written
	 * @param {object} data record to be written
	 * @returns {Promise.<object>} promises provided data
	 * @abstract
	 */
	write( key, data ) {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Removes data addressed by given key.
	 *
	 * @note Removing some parent key includes removing all subordinated keys.
	 *
	 * @param {string} key unique key of record to be removed
	 * @returns {Promise.<key>} promises key of removed data
	 * @abstract
	 */
	remove( key ) {
		return Promise.reject( new Error( "invalid use of abstract base adapter" ) );
	}

	/**
	 * Retrieves stream of available keys.
	 *
	 * @param {string} prefix stream keys with given prefix, only
	 * @param {int} maxDepth skip keys beyond this depth (relative to `prefix`)
	 * @param {string} separator consider this character separating segments of key selecting different depth, set null to disable depth processing
	 * @returns {Readable} stream of keys
	 * @abstract
	 */
	keyStream( { prefix = "", maxDepth = Infinity, separator = "/" } = {} ) {
		return new Readable( {
			read() {
				this.emit( "error", new Error( "invalid use of abstract base adapter" ) );
			}
		} );
	}

	/**
	 * Retrieves stream of available values.
	 *
	 * @param {string} prefix stream keys with given prefix, only
	 * @param {int} maxDepth skip keys beyond this depth (relative to `prefix`)
	 * @param {?string} separator consider this character separating segments of key selecting different depth, omit to disable depth processing
	 * @returns {Readable} stream of values
	 * @abstract
	 */
	valueStream( { prefix = "", maxDepth = Infinity, separator = null } = {} ) {
		return new Readable( {
			read() {
				this.emit( "error", new Error( "invalid use of abstract base adapter" ) );
			}
		} );
	}

	/**
	 * Maps some key to relative pathname to use on addressing related record in
	 * backend.
	 *
	 * @note This is available e.g. for splitting longer IDs into several path
	 *       segments e.g. for limiting number of possible files per folder in a
	 *       file-based backend.
	 *
	 * @param {string} key key to be mapped
	 * @returns {string} related path name to use for actually addressing entity in backend
	 */
	static keyToPath( key ) {
		return key;
	}

	/**
	 * Maps some relative pathname to use on addressing related record in
	 * backend into related key.
	 *
	 * @note This is available to reverse process of Adapter.keyToPath().
	 *
	 * @param {string} path path name addressing some entity in backend
	 * @returns {string} unique key for addressing selected entity
	 */
	static pathToKey( path ) {
		return path;
	}

	/**
	 * Starts transaction on current adapter.
	 *
	 * @returns {Promise} promises current connection granted transaction
	 */
	begin() {
		return Promise.reject( new Error( "missing transaction support" ) );
	}

	/**
	 * Cancels all modifications to data in current transaction.
	 *
	 * @returns {Promise} promises transaction rolled back
	 */
	rollBack() {
		return Promise.reject( new Error( "There is no running transaction to be rolled back." ) );
	}

	/**
	 * Commits all modifications to data in current transaction ending the
	 * latter.
	 *
	 * @returns {Promise} promises transaction rolled back
	 */
	commit() {
		return Promise.reject( new Error( "There is no running transaction to be committed." ) );
	}

	/**
	 * Indicates if adapter is capable of storing Buffer as property value.
	 *
	 * This information can be used by property type handlers on serializing
	 * data for storing via this adapter.
	 *
	 * @returns {boolean} true if adapter can save binary buffers as property value
	 */
	static get supportsBinary() { return false; }
}

module.exports = Adapter;
