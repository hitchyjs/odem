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
	constructor( itemUUID = null, { adapter = null, onUnsaved = null } = {} ) {
		const args = this.beforeCreate( { uuid: itemUUID, options: { adapter, onUnsaved } } ) || {};

		const { adapter: _adapter, onUnsaved: __onUnsaved } = args.options || {};
		const _onUnsaved = __onUnsaved == null ? this.constructor.onUnsaved : __onUnsaved;

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

		this.uuid = args.uuid;



		/**
		 * @type {ModelProperties}
		 */
		let data = Monitor( {}, {
			warn: _onUnsaved === "warn",
			fail: _onUnsaved === "fail",
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
									switch ( _onUnsaved ) {
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
									warn: _onUnsaved === "warn",
									fail: _onUnsaved === "fail",
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
			$adapter: { value: _adapter || this.constructor.adapter || defaultAdapter },

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

		this.$properties.$context.relax();
		this.afterCreate();
		this.$properties.$context.relax( false );
	}

	/**
	 * Fetches defined name of current model.
	 *
	 * @returns {string} defined name of model
	 */
	static get name() {
		return "$$AbstractModel$$";
	}

	/**
	 * Exposes default mode for handling multiple value assignments to a
	 * property without saving intermittently.
	 *
	 * @returns {string} default value of model-related option onUnsaved
	 */
	static get onUnsaved() { return "fail"; }

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
	 * Normalizes provided input to be UUID as an instance of Buffer with 16
	 * octets at least.
	 *
	 * @param {Buffer|string} uuid UUID to be normalized
	 * @returns {Buffer} normalized UUID
	 */
	static normalizeUUID( uuid ) {
		return UUID.normalize( uuid );
	}

	/**
	 * Creates string representing provided UUID.
	 *
	 * @param {Buffer|string} uuid UUID to be represented
	 * @returns {string} string representing UUID
	 */
	static formatUUID( uuid ) {
		return UUID.format( uuid );
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
	 * Extracts UUID of some addressed instance from provided key.
	 *
	 * @param {string} key key used with data backend
	 * @returns {Buffer} UUID of this model's instance extracted from key, null if no UUID was found
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
		if ( this.$isNew ) {
			return Promise.resolve( false );
		}

		return this.$adapter.has( this.$dataKey );
	}

	/**
	 * Implements default hook invoked first in every item's constructor.
	 *
	 * @note Creating item doesn't refer to creating record in an attached data
	 *       storage, but constructing new instance of `Model` at runtime.
	 *
	 * @note Returning promise isn't available here due to being invoked in
	 *       constructor of model instance.
	 *
	 * @param {?(Buffer|string)} uuid UUID of item to be represented by instance, null for starting new item
	 * @param {object<string,string>} options options provided for new instance
	 * @returns {{uuid:(Buffer|string), options:object<string,string>}} provided information, probably adjusted
	 */
	beforeCreate( { uuid = null, options = {} } = {} ) {
		return { uuid, options };
	}

	/**
	 * Implements default hook invoked after having created item.
	 *
	 * @note Creating item doesn't refer to creating record in an attached data
	 *       storage, but constructing new instance of `Model` at runtime.
	 *
	 * @note Returning promise isn't available here due to being invoked in
	 *       constructor of model instance.
	 *
	 * @returns {void}
	 */
	afterCreate() {} // eslint-disable-line no-empty-function

	/**
	 * Implements default hook invoked before loading item's record from attached
	 * data storage.
	 *
	 * @returns {undefined|Promise} optional promise settled when hook has finished
	 */
	beforeLoad() {} // eslint-disable-line no-empty-function

	/**
	 * Implements default hook invoked after having loaded item's record from
	 * attached data storage.
	 *
	 * @param {object} record raw record as read from data storage
	 * @returns {object} record to use eventually for setting properties
	 */
	afterLoad( record ) { return record; }

	/**
	 * Implements default hook invoked before validating properties of items.
	 *
	 * @returns {undefined|Error[]|Promise<Error[]>} list of errors encountered by hook
	 */
	beforeValidate() {} // eslint-disable-line no-empty-function

	/**
	 * Implements default hook invoked after having validated properties of
	 * items.
	 *
	 * @param {Error[]} errors lists error encountered while validating
	 * @returns {Error[]} probably filtered list of validation errors
	 */
	afterValidate( errors ) { return errors; }

	/**
	 * Implements default hook invoked before saving validated properties of
	 * item.
	 *
	 * @param {boolean} existsAlready true if item exists in backend already
	 * @param {object} record record of current item's serialized property values to be written in backend
	 * @returns {object} item's record to be written in backend eventually
	 */
	beforeSave( existsAlready, record ) { // eslint-disable-line no-unused-vars
		return record;
	}

	/**
	 * Implements default hook invoked after saving validated properties of
	 * item.
	 *
	 * @param {boolean} existsAlready true if item exists in backend already
	 * @returns {undefined|Promise} optional promise settled when hook finished
	 */
	afterSave( existsAlready ) {} // eslint-disable-line no-unused-vars,no-empty-function

	/**
	 * Implements default hook invoked before removing item from backend.
	 *
	 * @returns {undefined|Promise} optional promise settled when hook has finished
	 */
	beforeRemove() {} // eslint-disable-line no-empty-function

	/**
	 * Implements default hook invoked after removing item from backend.
	 *
	 * @returns {undefined|Promise} optional promise settled when hook has finished
	 */
	afterRemove() {} // eslint-disable-line no-empty-function

	/**
	 * Loads data of item from backend.
	 *
	 * @returns {Promise<Model>} promises model instance with properties loaded from storage
	 */
	load() {
		if ( !this.$loaded ) {
			this.$loaded = Promise.resolve()
				.then( () => this.beforeLoad() )
				.then( () => this.$adapter.read( this.$dataKey ) )
				.then( record => this.afterLoad( record ) );
			// NOTE Properties are replaced in setter of `this.$loaded`.
		}

		return this.$loaded;
	}

	/**
	 * Writes data of item to backend.
	 *
	 * @param {boolean} ignoreUnloaded set true to permit saving record w/o loading first
	 * @returns {Promise<Model>} promises instance of model with its properties saved to persistent storage
	 */
	save( { ignoreUnloaded = false } = {} ) {
		const { constructor, $isNew: isNew } = this;
		let load;

		if ( !isNew && !this.$loaded && !ignoreUnloaded ) {
			if ( this.$properties.$context.changed.size > 0 ) {
				return Promise.reject( new Error( "saving unloaded item rejected" ) );
			}

			return Promise.resolve( this );
		}

		if ( !isNew && this.$loaded ) {
			load = this.$loaded.then( () => this.$properties.$context.changed.size > 0 );
		} else {
			load = Promise.resolve( true );
		}

		return load.then( hasChanged => {
			if ( !hasChanged ) {
				return this;
			}

			return this.validate()
				.catch( severeError => [severeError] )
				.then( validationErrors => {
					if ( validationErrors && validationErrors.length > 0 ) {
						throw Object.assign( new Error( `saving invalid properties rejected (${validationErrors.map( e => e.message ).join( ", " )})` ), {
							validationErrors,
						} );
					}

					if ( isNew ) {
						return false;
					}

					return this.$exists;
				} )
				.then( existsAlready => Promise.resolve()
					.then( () => {
						if ( typeof constructor._serializeProperties === "function" ) {
							return constructor._serializeProperties( this.$properties );
						}

						return this.$properties;
					} )
					.then( record => {
						this.$properties.$context.relax();
						return this.beforeSave( existsAlready, record );
					} )
					.then( record => {
						if ( existsAlready ) {
							return constructor.indexLoaded
								.then( indices => {
									const length = indices.length;
									if ( length ) {
										const { computed, props } = constructor.schema;
										let oldContext = null;

										for ( let i = 0; i < length; i++ ) {
											const { property, handler } = indices[i];
											const computedInfo = computed[property];
											let newProp, oldProp;

											if ( computedInfo ) {
												// required: old value of computed property for updating index
												// -> need to re-compute it when bound to old set of actual properties
												if ( !oldContext ) {
													const oldProperties = this.$properties.$context.clone().$context.rollBack();

													oldContext = new Proxy( this, {
														get( target, prop ) {
															if ( prop === "$properties" ) {
																return oldProperties;
															}

															if ( props[prop] ) {
																return oldProperties[prop];
															}

															return target[prop];
														},
													} );
												}

												oldProp = computedInfo.code.call( oldContext );
												newProp = this[property];
											} else {
												newProp = this.$properties[property];
												oldProp = this.$properties.$context.changed.get( property );
											}

											if ( newProp !== oldProp ) {
												handler.update( this.$uuid, oldProp, newProp );
											}
										}
									}

									return this.$adapter.write( this.$dataKey, record );
								} );
						}

						return constructor.indexLoaded.then( indices => {
							return this.$adapter.create( this.$dataKey, record )
								.then( dataKey => {
									const uuid = constructor.keyToUuid( dataKey );
									if ( !uuid ) {
										throw new Error( "first-time saving instance in backend didn't yield proper UUID" );
									}

									if ( isNew ) {
										this.uuid = uuid;
									}

									Object.defineProperties( this, {
										$dataKey: { value: constructor.uuidToKey( uuid ) },
									} );

									const numIndices = indices.length;

									for ( let i = 0; i < numIndices; i++ ) {
										const { property, handler } = indices[i];
										const { computed } = constructor.schema;

										const newProp = computed[property] ? this[property] : this.$properties[property];

										handler.add( uuid, newProp );
									}
								} );
						} );
					} )
					.then( () => this.afterSave( existsAlready ) )
					.then( () => {
						// clear marks on changed properties for having
						// saved them right before
						this.$properties.$context.commit();
						this.$properties.$context.relax( false );
					} )
					.catch( error => {
						this.$properties.$context.relax( false );
						throw error;
					} )
					.then( () => this )
				);
		} );
	}

	/**
	 * Removes item from backend.
	 *
	 * @returns {Promise<Model>} promises model instance being removed from backend
	 */
	remove() {
		return Promise.resolve()
			.then( () => {
				this.$properties.$context.relax();
				return this.beforeRemove();
			} )
			.then( () => {
				this.$properties.$context.relax( false );
				return this.constructor.indexLoaded;
			} )
			.then( indices => {
				const length = indices.length;

				if ( length ) {
					return this.load().then( () => {
						for ( let i = 0; i < length; i++ ) {
							const { handler, property } = indices[i];

							if ( this.$isMarkedLoaded ) {
								handler.removeValue( this.$uuid, this[property] );
							} else {
								// don't know the properties' values -> have to
								// search the whole index for removing UUID
								handler.remove( this.$uuid );
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
				const property = this[name];

				if( property != null ) {
					output[name] = property;
				}
			}
		}

		names = Object.keys( props );
		for ( let i = 0, length = names.length; i < length; i++ ) {
			const name = names[i];
			const property = this.$properties[name];

			if( property != null ) {
				output[name] = this.$properties[name];
			}
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
	static getIndex( property, type = "eq" ) {
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
			keyStream.unpipe( uuidStream );
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
	 *       test selecting every record of model.
	 *
	 * @param {int} offset number of items to skip
	 * @param {int} limit maximum number of items to retrieve
	 * @param {string} sortBy names property of model matching records shall be sorted by
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
	 * Aliases Model#find().
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
				let source = this.processTerm( test, sortBy, sortAscendingly );

				if ( sortBy ) {
					const sortIndex = this.getIndex( sortBy, "eq" );
					let sorted;

					if ( sortIndex ) {
						sorted = new IndexedSorter( sortIndex, sortAscendingly );
					} else {
						sorted = new NonIndexedSorter( this, sortBy, sortAscendingly );
					}

					const origSource = source;

					sorted.on( "close", () => {
						origSource.unpipe( sorted );
						origSource.pause();
						origSource.destroy();
					} );

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
						process.nextTick( () => {
							source.pause();
							source.destroy();

							// destroying source prevents emission of end event
							source.emit( "end" );
						} );
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
	 * @param {string} sortBy name of property finally resulting list of matches will be sorted by (provided to help optimizing tester)
	 * @param {boolean} sortAscendingly true if provided property will be used eventuall to sort in ascending order (provided to help optimizing tester)
	 * @returns {Readable<Model>} stream of instances matching given test
	 */
	static processTerm( testDescription, sortBy = null, sortAscendingly = true ) {
		return AbstractTester.fromDescription( this, testDescription, null, { sortBy, sortAscendingly } ).createStream();
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
				const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );

				this.indexPromise = PromiseUtils.process( stream, dataKey => {
					return new this( this.keyToUuid( dataKey ), { adapter } ) // eslint-disable-line new-cap
						.load().then( item => {
							const { $uuid } = item;

							for ( let i = 0; i < numIndices; i++ ) {
								const { property, handler } = indices[i];

								handler.add( $uuid, item[property], undefined, true );
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

	/**
	 * Compiles provided schema into model class derived from AbstractModel or
	 * some explicitly provided model class.
	 *
	 * @param {string} modelName name of model
	 * @param {object} schema definition of model's schema
	 * @param {class} customBaseClass model class inheriting from AbstractModel
	 * @param {Adapter} adapter selects adapter to use on instances of resulting model by default
	 * @returns {class} compiled model class
	 */
	static define( modelName, schema, customBaseClass = null, adapter = defaultAdapter ) {
		return require( "./compiler" ).call( this, modelName, schema, customBaseClass, adapter );
	}
}

module.exports = Model;
