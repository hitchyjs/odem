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
 * @name Model
 * @property {string} uuid universally unique ID of item
 * @property {Adapter} adapter K/V-style backend driver used for storing data
 * @property {string} dataKey key addressing data of model item
 * @property {object} properties set of item's properties
 * @property {boolean} loaded marks if current set of data has been loaded before or not
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
			 * @name Model#loaded
			 * @property {Promise<Model>}
			 * @readonly
			 */
			loaded: {
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
								const deserialized = typeof _deserializeProperties === "function" ? _deserializeProperties( record, schema.attributes ) : record;

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
			 * @name Model#isNew
			 * @property {boolean}
			 * @readonly
			 */
			isNew: { get: () => _uuid == null },

			/**
			 * Refers to adapter connecting instance of model to some storage
			 * for storing it persistently.
			 *
			 * @name Model#adapter
			 * @property {Adapter}
			 * @readonly
			 */
			adapter: { value: adapter || this.constructor.adapter || defaultAdapter },

			/**
			 * Fetches data key of current model usually to be used with some
			 * KV-based storage.
			 *
			 * @name Model#dataKey
			 * @property {string}
			 * @readonly
			 */
			dataKey: { value: `models/${this.constructor.name}/items/${_uuid == null ? "%u" : _uuid}` },

			/**
			 * Provides properties of current instance of model.
			 *
			 * @name Model#properties
			 * @property {ModelProperties}
			 * @readonly
			 */
			properties: { get: () => data },
		} );


		if ( _uuid == null ) {
			this.loaded = Promise.resolve();
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
	get exists() {
		return !this.isNew && this.adapter.has( this.dataKey );
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
		if ( !this.loaded ) {
			this.loaded = this.adapter.read( this.dataKey );
		}

		return this.loaded;
	}

	/**
	 * Writes data of item to backend.
	 *
	 * @returns {Promise<Model>} promises instance of model with its properties saved to persistent storage
	 */
	save() {
		const constructor = this.constructor;
		const isNew = this.isNew;
		const properties = this.properties;

		if ( !isNew ) {
			// item is addressing existing record in storage
			if ( !this.loaded ) {
				return Promise.reject( new Error( "saving unloaded item rejected" ) );
			}

			if ( !properties.$context.changed.size ) {
				// item hasn't been changed, so there is no actual need to save anything
				return Promise.resolve( this );
			}
		}


		let validated;

		if ( this.loaded ) {
			validated = this.loaded.then( () => this.validate() );
		} else {
			validated = this.validate();
		}

		return validated
			.catch( severeError => [severeError] )
			.then( validationErrors => {
				if ( !validationErrors || validationErrors.length < 1 ) {
					const serialized = typeof constructor._serializeProperties === "function" ? constructor._serializeProperties( properties ) : properties;

					if ( isNew ) {
						return this.adapter.create( this.dataKey, serialized )
							.then( dataKey => {
								const uuid = this.constructor.keyToUuid( dataKey );
								if ( !uuid || !Uuid.ptnUuid.test( uuid ) ) {
									throw new Error( "first-time saving instance in backend didn't yield proper UUID" );
								}

								this.uuid = uuid;

								// clear marks on changed properties for having
								// saved them right before
								this.properties.$context.commit();

								return this;
							} );
					}

					return this.adapter.write( this.dataKey, serialized )
						.then( () => {
							// clear marks on changed properties for having
							// saved them right before
							this.properties.$context.commit();

							return this;
						} );
				}

				throw new Error( `saving invalid properties rejected (${validationErrors.map( e => e.message ).join( ", " )})` );
			} );
	}

	/**
	 * Removes item from backend.
	 *
	 * @returns {Promise<Model>} promises model instance being removed from backend
	 */
	remove() {
		return this.adapter.remove( this.dataKey ).then( () => this );
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
	 * @param {boolean} omitComputed set true to extract basic attributes and UUID, only
	 * @returns {object} object providing item's UUID and values of its attributes
	 */
	toObject( omitComputed = false ) {
		const { attributes, computeds } = this.constructor.schema;
		const output = {};
		let names;

		if ( !omitComputed ) {
			names = Object.keys( computeds );
			for ( let i = 0, length = names.length; i < length; i++ ) {
				const name = names[i];

				output[name] = this[name];
			}
		}

		names = Object.keys( attributes );
		for ( let i = 0, length = names.length; i < length; i++ ) {
			const name = names[i];

			output[name] = this.properties[name];
		}

		output.uuid = this.uuid;

		return output;
	}
}

module.exports = Model;
