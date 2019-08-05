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

const { Transform } = require( "stream" );

const PromiseUtils = require( "promise-essentials" );
const { EqualityIndex } = require( "./indexer" );
const AbstractTester = require( "./tester/base" );
const { IndexedSorter, NonIndexedSorter } = require( "./sorter" );

const { defaultAdapter } = require( "../defaults" );
const { UUID, Monitor } = require( "../utility" );


/**
 * @typedef {object} ModelProperties
 * @property {{changed: Set<string>}} $context
 */

/**
 * @typedef {object} ModelSchema
 */


const ptnModelItemsKey = /^models\/([^/]+)\/items\/([^/]+)(?:\/(\S+))?$/;


/**
 * Implements basic behaviour of a model.
 *
 * @alias AbstractModel
 */
class Model {
	/**
	 * @param {?(string|Buffer)} itemUUID UUID of model item to be managed by instance, omit for starting new item
	 * @param {boolean|string} onUnsaved set true to omit model logging to stderr on replacing changed property w/o saving first
	 * @param {?Adapter} adapter selects driver for backend to use for storing data
	 */
	constructor( itemUUID = null, { adapter = null, onUnsaved = "fail" } = {} ) {
		// normalize and validate some optionally provided UUID
		let _uuid = null;

		Object.defineProperties( this, {
			/**
			 * Uniquely identifies current instance of model.
			 *
			 * @note UUID can be written only once unless it has been given
			 *       initially for loading some matching instance from storage.
			 *
			 * @note For compatibility reasons this property is always provided
			 *       as string when reading though internal processing of UUIDs
			 *       relies on binary format now to reduce memory consumption.
			 *       The binary format used internally can be read using
			 *       @see Model#$uuid.
			 *
			 * @name Model#uuid
			 * @property {?(string|Buffer)}
			 */
			uuid: {
				get: () => {
					if ( _uuid == null ) {
						return null;
					}

					Object.defineProperties( this, {
						uuid: { value: UUID.format( _uuid ), }
					} );

					return this.uuid;
				},
				set: newUUID => {
					if ( newUUID != null ) {
						if ( _uuid != null ) {
							throw new Error( "re-assigning UUID rejected" );
						}

						_uuid = UUID.normalize( newUUID );
					}
				},
				configurable: true,
			},

			/**
			 * Uniquely identifies current instance of model.
			 *
			 * @note UUID can be set via @see Model#uuid, only.
			 *
			 * @name Model#$uuid
			 * @property {?Buffer}
			 * @readonly
			 */
			$uuid: {
				get: () => _uuid,
			},
		} );

		this.uuid = itemUUID;

		this._onConstruction( _uuid, adapter );


		/**
		 * @type {ModelProperties}
		 */
		let data = Monitor( {}, {
			warn: onUnsaved === "warn",
			fail: onUnsaved === "fail",
			coercion: this.constructor._coercionHandlers,
		} );


		let isLoading = null;
		let markLoaded = false;

		Object.defineProperties( this, {
			/**
			 * Promises previously triggered request for loading properties of
			 * current item to have succeeded or failed. This promise is set
			 * as soon as request for loading properties has been triggered.
			 *
			 * @see Model#$isMarkedLoaded for different indicator suitable for
			 * detecting synchronously if properties have been loaded before.
			 *
			 * @name Model#$loaded
			 * @property {?Promise<Model>}
			 * @readonly
			 */
			$loaded: {
				get: () => isLoading,
				set: promise => {
					if ( isLoading ) {
						throw new Error( "must not promise loading multiple times" );
					}

					if ( !( promise instanceof Promise ) ) {
						throw new Error( "not a promise" );
					}

					isLoading = promise
						.then( record => {
							markLoaded = true;

							if ( _uuid != null ) {
								if ( !record || typeof record !== "object" ) {
									throw new TypeError( "invalid set of properties" );
								}

								if ( data.$context && data.$context.hasChanged ) {
									switch ( onUnsaved ) {
										case "ignore" :
											break;

										case "warn" :
											// eslint-disable-next-line no-console
											console.error( "WARNING: replacing an item's properties after changing some w/o saving" );
											break;

										case "fail" :
										default :
											throw new Error( "WARNING: replacing an item's properties after changing some w/o saving" );
									}
								}

								const constructor = this.constructor;
								const { _deserializeProperties, schema } = constructor;
								const deserialized = typeof _deserializeProperties === "function" ? _deserializeProperties( record, schema.props ) : record;

								data = Monitor( deserialized, {
									warn: onUnsaved === "warn",
									fail: onUnsaved === "fail",
									coercion: this.constructor._coercionHandlers,
								} );
							}

							return this;
						} );
				}
			},

			/**
			 * Synchronously indicates if current instance's properties have
			 * been loaded before or not.
			 *
			 * @name Model#$isMarkedLoaded
			 * @property {boolean}
			 * @readonly
			 */
			$isMarkedLoaded: { get: () => markLoaded },

			/**
			 * Marks if current model instance is new (thus still lacking UUID).
			 *
			 * @name Model#$isNew
			 * @property {boolean}
			 * @readonly
			 */
			$isNew: { get: () => _uuid == null },

			/**
			 * Refers to adapter connecting instance of model to some storage
			 * for storing it persistently.
			 *
			 * @name Model#$adapter
			 * @property {Adapter}
			 * @readonly
			 */
			$adapter: { value: adapter || this.constructor.adapter || defaultAdapter },

			/**
			 * Fetches data key of current model usually to be used with some
			 * KV-based storage.
			 *
			 * @name Model#$dataKey
			 * @property {string}
			 * @readonly
			 */
			$dataKey: {
				value: this.constructor.uuidToKey( _uuid ),
				configurable: _uuid == null,
			},

			/**
			 * Provides properties of current instance of model.
			 *
			 * @name Model#$properties
			 * @property {ModelProperties}
			 * @readonly
			 */
			$properties: { get: () => data },
		} );


		if ( _uuid == null ) {
			this.$loaded = Promise.resolve();
		}
	}

	/**
	 * Generates data key related to given UUID suitable for selecting related
	 * record in datasource connected via current adapter.
	 *
	 * @param {?(string|Buffer)} uuid UUID to be converted
	 * @returns {string} backend-compatible key for selecting related record there
	 */
	static uuidToKey( uuid ) {
		const _uuid = UUID.normalize( uuid );
		if ( _uuid ) {
			return `models/${this.name}/items/${UUID.format( _uuid )}`;
		}

		return `models/${this.name}/items/%u`;
	}

	/**
	 * Handles code specific to initializing new instance of model.
	 *
	 * @note This method is a hook to be used by derived classes to customize
	 *       instances on construction.
	 *
	 * @param {?Buffer} uuid UUID of model instance
	 * @param {Adapter} adapter adapter to use with model instance
	 * @returns {void}
	 * @protected
	 */
	_onConstruction( uuid, adapter ) {} // eslint-disable-line no-unused-vars, no-empty-function

	/**
	 * Fetches defined name of current model.
	 *
	 * @returns {string} defined name of model
	 */
	static get name() {
		return "$$AbstractModel$$";
	}

	/**
	 * Lists  definitions of indices extracted from properties of current model.
	 *
	 * @returns {array} list of indices' definitions
	 * @readonly
	 */
	static get indices() {
		return [];
	}

	/**
	 * Extracts UUID of some addressed instance from provided key.
	 *
	 * @param {string} key key used with data backend
	 * @returns {?string} UUID of this model's instance extracted from key, null if no UUID was found
	 */
	static keyToUuid( key ) {
		const result = ptnModelItemsKey.exec( key );
		if ( result ) {
			return Buffer.from( result[2].replace( /-/g, "" ), "hex" );
		}

		throw new Error( "invalid key to extract UUID from" );
	}

	/**
	 * Extracts name of model addressed by provided key.
	 *
	 * @param {string} key key used with data backend
	 * @returns {?string} name of model addressed by given key, null if key doesn't address any model
	 */
	static keyToModelName( key ) {
		const match = ptnModelItemsKey.exec( key );

		return match ? match[1] : null;
	}

	/**
	 * Tests if backend contains data of current item or not.
	 *
	 * @returns {Promise<boolean>} promises true if data exists and false otherwise
	 */
	get $exists() {
		return !this.$isNew && this.$adapter.has( this.$dataKey );
	}

	/* eslint-disable no-empty-function, require-jsdoc, lines-between-class-members */
	static beforeCreate( values ) { return values; }

	afterCreate() {}

	beforeValidate() {}

	afterValidate( errors ) { return errors; }

	beforeSave() {}

	afterSave() {}

	beforeRemove() {}

	afterRemove() {}

	/* eslint-enable no-empty-function, require-jsdoc, lines-between-class-members */

	/**
	 * Loads data of item from backend.
	 *
	 * @note This method is reading up-to-date data from backend on every
	 *       invocation. Thus make sure to cache the result if possible.
	 *
	 * @returns {Promise<Model>} promises model instance with properties loaded from storage
	 */
	load() {
		if ( !this.$loaded ) {
			this.$loaded = this.$adapter.read( this.$dataKey );
		}

		return this.$loaded;
	}

	/**
	 * Writes data of item to backend.
	 *
	 * @returns {Promise<Model>} promises instance of model with its properties saved to persistent storage
	 */
	save() {
		const constructor = this.constructor;
		const isNew = this.$isNew;
		const properties = this.$properties;

		if ( !isNew ) {
			// item is addressing existing record in storage
			if ( !this.$loaded ) {
				return Promise.reject( new Error( "saving unloaded item rejected" ) );
			}

			if ( !properties.$context.changed.size ) {
				// item hasn't been changed, so there is no need to waste time
				// for actually validating and saving anything
				return Promise.resolve( this );
			}
		}


		let validated;

		if ( this.$loaded ) {
			validated = this.$loaded.then( () => this.validate() );
		} else {
			validated = this.validate();
		}

		return validated
			.catch( severeError => [severeError] )
			.then( validationErrors => {
				if ( validationErrors && validationErrors.length > 0 ) {
					throw new Error( `saving invalid properties rejected (${validationErrors.map( e => e.message ).join( ", " )})` );
				}

				const serialized = typeof constructor._serializeProperties === "function" ? constructor._serializeProperties( properties ) : properties;

				if ( isNew ) {
					return this.$adapter.create( this.$dataKey, serialized )
						.then( dataKey => {
							const uuid = this.constructor.keyToUuid( dataKey );

							return this.constructor.indexLoaded.then( indices => {
								const length = indices.length;
								if ( length ) {
									for ( let i = 0; i < length; i++ ) {
										const { property, handler } = indices[i];
										const newProp = this.$properties[property];
										if ( newProp != null ) {
											handler.add( uuid, newProp );
										}
									}
								}
							} ).then( () => uuid );
						} )
						.then( uuid => {
							if ( !uuid ) {
								throw new Error( "first-time saving instance in backend didn't yield proper UUID" );
							}

							this.uuid = uuid;

							Object.defineProperties( this, {
								$dataKey: { value: this.constructor.uuidToKey( uuid ) },
							} );

							// clear marks on changed properties for having
							// saved them right before
							this.$properties.$context.commit();

							return this;
						} );
				}

				return this.constructor.indexLoaded
					.then( indices => {
						const length = indices.length;
						if ( length ) {
							for ( let i = 0; i < length; i++ ) {
								const { property, handler } = indices[i];
								const newProp = this.$properties[property];
								const oldProp = this.$properties.$context.changed.get( property );

								if ( ( newProp != null ) && ( oldProp != null ) ) {
									handler.updateIndex( this.$uuid, oldProp, newProp );
								} else if ( oldProp != null ) {
									handler.remove( this.$uuid, oldProp );
								} else if ( newProp != null ) {
									handler.add( this.$uuid, newProp );
								}
							}
						}
					} )
					.then( () => this.$adapter.write( this.$dataKey, serialized ) )
					.then( () => {
						// clear marks on changed properties for having
						// saved them right before
						this.$properties.$context.commit();

						return this;
					} );
			} );
	}

	/**
	 * Removes item from backend.
	 *
	 * @returns {Promise<Model>} promises model instance being removed from backend
	 */
	remove() {
		return Promise.resolve( this.beforeRemove() )
			.then( () => this.constructor.indexLoaded )
			.then( indices => {
				const length = indices.length;
				if ( length ) {
					return this.load().then( () => {
						for ( let i = 0; i < length; i++ ) {
							const { handler, property } = indices[i];
							if ( this[property] ) {
								handler.remove( this[property], this.$uuid );
							}
						}
					} );
				}
				return undefined;
			} )
			.then( () => this.$adapter.remove( this.$dataKey ) )
			.then( () => this.afterRemove() )
			.then( () => this );
	}

	/**
	 * Validates current set of properties.
	 *
	 * @returns {Promise<Error[]>} promises list of validation errors
	 */
	validate() {
		return Promise.resolve( [] );
	}

	/**
	 * Extracts item's values per attribute and computed attribute as well as
	 * its UUID to regular object.
	 *
	 * @param {boolean} omitComputed set true to extract actual properties and UUID, only
	 * @returns {object} object providing item's UUID and values of its properties
	 */
	toObject( omitComputed = false ) {
		const { props, computed } = this.constructor.schema;
		const output = {};
		let names;

		if ( !omitComputed ) {
			names = Object.keys( computed );
			for ( let i = 0, length = names.length; i < length; i++ ) {
				const name = names[i];

				output[name] = this[name];
			}
		}

		names = Object.keys( props );
		for ( let i = 0, length = names.length; i < length; i++ ) {
			const name = names[i];

			output[name] = this.$properties[name];
		}

		output.uuid = this.uuid;

		return output;
	}

	/**
	 * Fetches index handler matching named property and type of index.
	 *
	 * @param {string} property name of property to be covered by index
	 * @param {string} type type name of index
	 * @returns {EqualityIndex|undefined} found index
	 */
	static getIndex( property, type ) {
		const indices = this.indices;
		const numIndices = indices.length;

		for ( let i = 0; i < numIndices; i++ ) {
			const index = indices[i];

			if ( index.property === property && index.type === type ) {
				return index.handler;
			}
		}

		return undefined;
	}

	/**
	 * Retrieves stream of UUIDs of current model's instances.
	 *
	 * @returns {Readable} readable stream with UUIDs of model's instances
	 */
	static uuidStream() {
		const that = this;
		const keyStream = this.adapter.keyStream( { prefix: `models/${this.name}/items` } );

		const uuidStream = new Transform( {
			objectMode: true,
			transform( key, _, done ) {
				this.push( that.keyToUuid( key ) );
				done();
			},
		} );

		uuidStream.on( "close", () => {
			keyStream.pause();
			keyStream.destroy();
		} );

		keyStream.pipe( uuidStream );

		return uuidStream;
	}

	/**
	 * Unconditionally lists existing items of model.
	 *
	 * @note This method is basically an alias for finding records using special
	 * test selecting every record of model.
	 *
	 * @param {int} offset number of items to skip
	 * @param {int} limit maximum number of items to retrieve
	 * @param {string} sortyBy names property of model matching records shall be sorted by
	 * @param {boolean} sortAscendingly set true to sort matches in ascending order, set false for descending order
	 * @param {boolean} loadRecords set false to omit loading properties per matching item prior to returning them
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @returns {Promise<Model[]>} promises fetched instances of model
	 */
	static list( { offset = 0, limit = Infinity, sortBy = null, sortAscendingly = true } = {}, { loadRecords = true, metaCollector = null } = {} ) {
		return this.find(
			{ true: {} },
			{ offset, limit, sortBy, sortAscendingly },
			{ loadRecords, metaCollector }
		);
	}

	/**
	 * Aliases Model.find().
	 *
	 * @note This method was exposed in previous versions and is kept for
	 * compatibility reasons. Is is meant to vanish in a future release.
	 *
	 * @param {string} name names attribute/property to check per record
	 * @param {*} value provides value to compare with per record
	 * @param {string} operation names operation to use for comparing per record
	 * @param {int} offset number of leading matches to skip
	 * @param {int} limit maximum number of matches to retrieve
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @param {boolean} loadRecords set false to get instances of matching records left to be loaded later
	 * @returns {Promise<Model[]>} resulting matches
	 * @deprecated
	 */
	static findByAttribute( name, value = null, operation = "eq",
	                        { offset = 0, limit = Infinity } = {},
	                        { metaCollector = null, loadRecords = true } = {} ) {
		return this.find( { [operation]: { name, value } }, { offset, limit }, { loadRecords, metaCollector } );
	}

	/**
	 * Searches collection of current model for items matching described test.
	 *
	 * @param {object} test description of test operation to identify records to fetch
	 * @param {int} offset number of leading matches to skip
	 * @param {int} limit maximum number of matches to retrieve
	 * @param {string} sortBy names property resulting matches should be sorted by
	 * @param {boolean} sortAscendingly set true to sort in ascending order, false for descending order
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @param {boolean} loadRecords set false to get instances of matching records left to be loaded later
	 * @returns {Promise<Model[]>} resulting matches
	 */
	static find( test,
	             { offset = 0, limit = Infinity, sortBy = null, sortAscendingly = true } = {},
	             { metaCollector = null, loadRecords = true } = {} ) {
		return this.indexLoaded
			.then( () => new Promise( ( resolve, reject ) => { // eslint-disable-line promise/catch-or-return
				let source = this.processTerm( test );

				if ( sortBy ) {
					const sortIndex = this.getIndex( sortBy, "eq" );
					let sorted;

					if ( sortIndex ) {
						sorted = new IndexedSorter( sortIndex, sortAscendingly );
					} else {
						sorted = new NonIndexedSorter( this, sortBy, sortAscendingly );
					}

					sorted.on( "close", () => { source.destroy(); } );

					source.pipe( sorted );

					source = sorted;
				}

				const collected = limit > 1000 ? [] : new Array( limit );
				let count = 0;
				let written = 0;
				let _offset = offset;
				let _limit = limit;

				source.on( "data", item => {
					count++;

					if ( _offset > 0 ) {
						_offset--;
					} else if ( _limit > 0 ) {
						_limit--;

						collected[written++] = item;
					} else if ( !metaCollector ) {
						source.pause();
						source.destroy();
					}
				} );

				source.on( "end", () => {
					if ( metaCollector ) {
						metaCollector.count = count;
					}

					collected.splice( written );

					if ( loadRecords ) {
						// collect all unloaded items
						let unloaded;
						let write = 0;

						for ( let i = 0; i < written; i++ ) {
							const item = collected[i];

							if ( !item.$isMarkedLoaded ) {
								if ( !unloaded ) {
									const size = written - i;
									unloaded = size > 1000 ? [] : new Array( size );
								}

								unloaded[write++] = item.load();
							}
						}

						if ( unloaded ) {
							unloaded.splice( write );

							Promise.all( unloaded )
								.then( () => resolve( collected ) )
								.catch( reject );
							return;
						}
					}

					resolve( collected );
				} );

				source.on( "error", reject );
			} ) );
	}

	/**
	 * Compiles test from provided description and returns its stream of matching items.
	 *
	 * @param {object} testDescription description of test used to pick instances
	 * @returns {Readable<Model>} stream of instances matching given test
	 */
	static processTerm( testDescription ) {
		return AbstractTester.fromDescription( this, testDescription ).createStream();
	}

	/**
	 * Resolves as soon as all defined indices of model are available.
	 *
	 * @return {Promise<Index[]>} promises list of model's prepared indices
	 */
	static get indexLoaded() {
		if ( !this.indexPromise ) {
			const { adapter, indices } = this;
			const numIndices = indices.length;

			if ( numIndices ) {
				for ( let i = 0; i < numIndices; i++ ) {
					const { type } = indices[i];
					if ( type !== "eq" ) {
						throw new Error( `index of type ${type} not yet supported` );
					}

					indices[i].handler = new EqualityIndex( { revision: 0 } );
				}

				const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );

				this.indexPromise = PromiseUtils.process( stream, dataKey => {
					const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

					return item.load()
						.then( () => {
							const { $uuid } = item;

							for ( let i = 0; i < numIndices; i++ ) {
								const { property } = indices[i];

								indices[i].handler.add( $uuid, item[property] );
							}
						} );
				} )
					.then( () => indices );
			} else {
				this.indexPromise = Promise.resolve( indices );
			}
		}

		return this.indexPromise;
	}
}

module.exports = Model;

/*



			const definition = this.schema.props[name];
			if ( !definition ) {
				throw new TypeError( `no such attribute: ${name}` );
			}

			const type = definition.$type;
			if ( !type ) {
				throw new TypeError( `invalid type ${definition.type} of attribute ${name}` );
			}

			const { adapter } = this;

			let numSkipped = offset;
			let handler = false;

			for ( let i = 0; i < indices.length; i++ ) {
				const { property, type: indexType } = indices[i];
				if ( property === name && indexType === "eq" ) {
					handler = indices[i].handler;
					break;
				}
			}

			if ( handler ) {
				const iterator = handler.find( value )();

				// synchronously collect all items caller is interested of
				while ( true ) { // eslint-disable-line no-constant-condition
					let iter;

					do {
						iter = iterator.next().value;
						count++;
					} while ( numSkipped-- > 0 );

					if ( !iter ) {
						break;
					}

					const [uuid] = iter;
					const item = new this( uuid );

					collected[written++] = loadRecords ? item.load() : item;

					if ( written > limit ) {
						if ( metaCollector ) {
							while ( iterator.next().value ) {
								count++;
							}
						}

						break;
					}
				}

				if ( metaCollector ) {
					metaCollector.count = count;
				}

				return loadRecords ? Promise.all( collected ) : collected;
			}

			this.generateWithoutIndex();
		} ).then( () => {
			collected.splice( written );

			if ( metaCollector ) {
				metaCollector.count = count;
			}

			return collected;
		} );


 */
