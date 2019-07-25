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


const PromiseUtils = require( "promise-essentials" );
const Index = require( "../index/index" );

const { defaultAdapter } = require( "../defaults" );
const { Uuid, Monitor } = require( "../utility" );


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
	 * @param {?string} itemUuid UUID of model item to be managed by instance, omit for starting new item
	 * @param {boolean|string} onUnsaved set true to omit model logging to stderr on replacing changed property w/o saving first
	 * @param {?Adapter} adapter selects driver for backend to use for storing data
	 */
	constructor( itemUuid = null, { adapter = null, onUnsaved = "fail" } = {} ) {
		// normalize and validate some optionally provided UUID
		let _uuid = normalizeUuid( itemUuid );
		if ( _uuid != null && !Uuid.ptnUuid.test( _uuid ) ) {
			throw new TypeError( `invalid UUID: ${_uuid}` );
		}


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

		Object.defineProperties( this, {
			/**
			 * Uniquely identifies current instance of model.
			 *
			 * @note UUID can be written only once unless it has been given
			 *       initially for loading some matching instance from storage.
			 *
			 * @name Model#uuid
			 * @property {?string}
			 */
			uuid: {
				get: () => _uuid,
				set: newUuid => {
					const normalizedUuid = normalizeUuid( newUuid );
					if ( normalizedUuid != null ) {
						if ( _uuid != null ) {
							throw new Error( "re-assigning UUID rejected" );
						}

						if ( !Uuid.ptnUuid.test( normalizedUuid ) ) {
							throw new TypeError( `invalid UUID: ${normalizedUuid}` );
						}

						_uuid = normalizedUuid;
					}
				},
			},

			/**
			 * Marks if request for loading properties from storage has been
			 * issued before promising model instance with properties updated
			 * according to fetched record.
			 *
			 * @name Model#$loaded
			 * @property {Promise<Model>}
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


		/**
		 * Normalizes some optionally given UUID ensuring its null or some
		 * truthy value eligibly considered valid UUID.
		 *
		 * @param {*} uuid some information considered to describe some UUID
		 * @returns {?string} normalized UUID
		 */
		function normalizeUuid( uuid ) {
			switch ( typeof uuid ) {
				case "undefined" :
					return null;

				case "string" : {
					const trimmed = uuid.trim();
					return trimmed.length ? trimmed : null;
				}
			}

			return uuid;
		}
	}

	/**
	 * Generates data key related to given UUID suitable for selecting related
	 * record in datasource connected via current adapter.
	 *
	 * @param {string} uuid UUID to be converted
	 * @returns {string} backend-compatible key for selecting related record there
	 */
	static uuidToKey( uuid ) {
		return `models/${this.name}/items/${uuid == null ? "%u" : uuid}`;
	}

	/**
	 * Handles code specific to initializing new instance of model.
	 *
	 * @note This method is a hook to be used by derived classes to customize
	 *       instances on construction.
	 *
	 * @param {string} uuid UUID of model instance
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
	 * Extracts UUID of some addressed instance from provided key.
	 *
	 * @param {string} key key used with data backend
	 * @returns {?string} UUID of this model's instance extracted from key, null if no UUID was found
	 */
	static keyToUuid( key ) {
		const match = ptnModelItemsKey.exec( key );

		return match ? match[2] : null;
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
				// item hasn't been changed, so there is no actual need to save anything
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
							if ( !uuid || !Uuid.ptnUuid.test( uuid ) ) {
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

				return this.$adapter.write( this.$dataKey, serialized )
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
		return this.$adapter.remove( this.$dataKey ).then( () => this );
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
	 * Unconditionally lists existing items of model.
	 *
	 * @this {StaticModelContext}
	 * @param {int} offset number of items to skip
	 * @param {int} limit maximum number of items to retrieve
	 * @param {boolean} loadProperties set true to load properties per matching item prior to returning them
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @returns {Promise<Model[]>} promises fetched instances of model
	 */
	static list( offset = 0, limit = Infinity, loadProperties = false, metaCollector = null ) {
		const { adapter } = this;
		const numItems = limit < 1 ? Infinity : limit;
		const collected = numItems > 1000 ? [] : new Array( numItems );
		const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );
		let numSkipped = offset;
		let written = 0;
		let count = 0;

		return PromiseUtils.process( stream, dataKey => { // eslint-disable-line consistent-return
			count++;

			if ( numSkipped > 0 ) {
				numSkipped--;
			} else if ( written < numItems ) {
				const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

				if ( loadProperties ) {
					return item.load()
						.then( () => {
							collected[written++] = item;

							if ( !metaCollector && written >= numItems ) {
								stream.pause();
								stream.emit( "cancel" );
							}
						} );
				}

				collected[written++] = item;

				if ( !metaCollector && written >= numItems ) {
					stream.pause();
					stream.emit( "cancel" );
				}
			}
		} )
			.then( () => {
				collected.splice( written );

				if ( metaCollector ) {
					metaCollector.count = count;
				}

				return collected;
			} );
	}

	/**
	 * Searches collection of current model for items matching selected test
	 * on values of a given attribute of model.
	 *
	 * @this {StaticModelContext}
	 * @param {string} name name of model's attribute to inspect for finding matches
	 * @param {*} value value to compare each model's attribute with for finding matches
	 * @param {string} operation name of operation to perform to detect match
	 * @param {int} offset number of leading matches to skip
	 * @param {int} limit maximum number of matches to retrieve
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @returns {Promise<Model[]>} resulting matches
	 */
	static findByAttribute( name, value = null, operation = "eq", offset = 0, limit = Number( Infinity ), metaCollector = null ) {
		// eslint-disable-next-line promise/catch-or-return
		this.indexLoaded.then( indexList => {
			const definition = this.schema.props[name];
			if ( !definition ) {
				throw new TypeError( `no such attribute: ${name}` );
			}

			const type = definition.$type;
			if ( !type ) {
				throw new TypeError( `invalid type ${definition.type} of attribute ${name}` );
			}

			const collected = limit > 1000 ? [] : new Array( limit );
			const adapter = this.adapter || defaultAdapter;
			const coercedValue = type.coerce( value, definition );
			let written = 0;
			let numSkipped = offset;
			let count = 0;

			if( indexList[name] ) {
				const generator = indexList.find( value );
				return new Promise( ( resolve, reject ) => {
					let iterator = generator();
					const next = () => {
						const uuid = iterator.next();
						if( uuid ) {
							const item = new this( this.uuidToKey( uuid ) );
							item.load().then( () => {
								const itemValue = type.coerce( type.deserialize( item.$properties[name] ), definition );

								if ( type.compare( itemValue, coercedValue, operation ) ) {
									count++;

									if ( numSkipped > 0 ) {
										numSkipped--;
									} else if ( written < limit ) {
										collected[written++] = item;
										if ( !metaCollector && written >= limit ) {
											iterator = { next: () => false };
										}
									}
								}
							} ).catch( reason => reject( reason ) );
						} else {
							collected.splice( written );

							if ( metaCollector ) {
								metaCollector.count = count;
							}

							resolve( collected );
						}
					};

				} );
			}

			const path = `models/${this.name}/items`;

			const stream = adapter.keyStream( { prefix: path } );

			return PromiseUtils.process( stream, dataKey => {
				const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

				return item.load()
					.then( () => {
						const itemValue = type.coerce( type.deserialize( item.$properties[name] ), definition );

						if ( type.compare( itemValue, coercedValue, operation ) ) {
							count++;

							if ( numSkipped > 0 ) {
								numSkipped--;
							} else if ( written < limit ) {
								collected[written++] = item;

								if ( !metaCollector && written >= limit ) {
									stream.pause();
									stream.emit( "cancel" );
								}
							}
						}
					} );
			} )
				.then( () => {
					collected.splice( written );

					if ( metaCollector ) {
						metaCollector.count = count;
					}

					return collected;
				} );


		} );
	}

	/**
	 * resolves when an initial index was created
	 * @return {Promise<{}>} Promise that resolves with an Object of indeces
	 */
	static get indexLoaded() {
		if( !this.indexPromise ) {
			const { adapter, indeces } = this;
			const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );
			const numIndeces = indeces.length;
			if( numIndeces ) {
				const indexList = {};
				for( let i = 0; i < numIndeces; i++ ) {
					const { property, type } = indeces[i];
					indexList[property] = new Index( { revision: 0 } );
				}

				this.indexPromise = PromiseUtils.process( stream, dataKey => {
					const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

					return item.load()
						.then( () => {
							const { uuid } = item;
							for( let i = 0; i < numIndeces; i++ ) {
								const { property } = indeces[i];
								indexList[property].add( item[property], uuid );
							}
						} );
				} ).then( () => indexList );
			} else {
				this.indexPromise = Promise.resolve( {} );
			}
		}
		return this.indexPromise;
	}

	static get indexLoaded() {
		if( !this.indexPromise ) {
			const { adapter, indeces, schema } = this;
			const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );
			const numIndeces = indeces.length;
			if( numIndeces ) {
				const indexList = {};
				for( let i = 0; i < numIndeces; i++ ) {
					const { property, type } = indeces[i];
					const { compare } = schema[property].$type;
					indexList[property] = new Index( { compare: ( l, r ) => compare( l, r, "indexCompare" ), revision: 0 } );
				}

				this.indexPromise = PromiseUtils.process( stream, dataKey => {
					const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap

					return item.load()
						.then( () => {
							const { uuid } = item;
							for( let i = 0; i < numIndeces; i++ ) {
								const { property } = indeces[i];
								indexList[property].add( item[property], uuid );
							}
						} );
				} ).then( () => indexList );
			} else {
				this.indexPromise = Promise.resolve( [] );
			}
		}
		return this.indexPromise;
	}
}

module.exports = Model;
