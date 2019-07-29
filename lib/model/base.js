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
		let _uuid = null;

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
				get: () => {
					if( _uuid == null ) {
						return null;
					}
					const h = _uuid.toString( "hex" );
					Object.defineProperties( this, {
						uuid: {
							value: `${h.substr( 0, 8 )}-${h.substr( 8, 4 )}-${h.substr( 12, 4 )}-${h.substr( 16, 4 )}-${h.substr( 20, 12 )}`
						}
					} );
					return this.uuid;
				},
				set: newUuid => {
					const normalizedUuid = Uuid.normalizeUuid( newUuid );
					if ( normalizedUuid != null ) {
						if ( _uuid != null ) {
							throw new Error( "re-assigning UUID rejected" );
						}
						_uuid = normalizedUuid;
					}
				},
				configurable: true,
			},

			/**
			 * Uniquely identifies current instance of model.
			 *
			 * @note Can only be set through this.uuid.
			 *
			 * @name Model#$uuid
			 * @property {?Buffer}
			 * @readonly
			 */
			$uuid: {
				get: () => _uuid,
			},
		} );

		this.uuid = itemUuid;

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
	 * @param {?Buffer} uuid UUID to be converted
	 * @returns {string} backend-compatible key for selecting related record there
	 */
	static uuidToKey( uuid ) {
		let _uuid = uuid;
		if( !Buffer.isBuffer( uuid ) || uuid != null ) {
			_uuid = Uuid.normalizeUuid( uuid );
		}
		if( _uuid ) {
			const h = _uuid.toString( "hex" );
			_uuid = `${h.substr( 0, 8 )}-${h.substr( 8, 4 )}-${h.substr( 12, 4 )}-${h.substr( 16, 4 )}-${h.substr( 20, 12 )}`;
		}
		return `models/${this.name}/items/${_uuid == null ? "%u" : _uuid}`;
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
	 * List defined indices.
	 * @readonly
	 * @returns {[]} defined indices
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
		const [ ,,match ] = ptnModelItemsKey.exec( key );
		if( match ) return Buffer.from( match.replace( /-/g, "" ), "hex" );
		throw new Error();
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
										if ( newProp != null ) handler.add( uuid, newProp );
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
									handler.updateIndex( this.uuid, oldProp, newProp );
								}
								if ( ( newProp == null ) && ( oldProp != null ) ) {
									handler.remove( this.uuid, oldProp );
								}
								if ( ( newProp != null ) && ( oldProp == null ) ) {
									handler.add( this.uuid, newProp );
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
								handler.remove( this[property], this.uuid );
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
	 * Unconditionally lists existing items of model.
	 *
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
	 * @param {string} name name of model's attribute to inspect for finding matches
	 * @param {*} value value to compare each model's attribute with for finding matches
	 * @param {string} operation name of operation to perform to detect match
	 * @param {int} offset number of leading matches to skip
	 * @param {int} limit maximum number of matches to retrieve
	 * @param {?{count:int}} metaCollector object receiving meta information on return
	 * @param {boolean} loadRecords set false to get instances of matching records left to be loaded later
	 * @returns {Promise<Model[]>} resulting matches
	 */
	static findByAttribute( name, value = null, operation = "eq",
	                        { offset = 0, limit = Infinity } = {},
	                        { metaCollector = null, loadRecords = true } = {} ) {
		const collected = limit > 1000 ? [] : new Array( limit );
		let count = 0;
		let written = 0;

		// eslint-disable-next-line promise/catch-or-return
		return this.indexLoaded.then( indices => {
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

			const path = `models/${this.name}/items`;
			const coercedValue = type.coerce( value, definition );
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
			} );
		} ).then( () => {
			collected.splice( written );

			if ( metaCollector ) {
				metaCollector.count = count;
			}

			return collected;
		} );
	}

	/**
	 * resolves when an initial index was created
	 * @return {Promise<{}>} Promise that resolves with an Object of indices
	 */
	static get indexLoaded() {
		if ( !this.indexPromise ) {
			if ( this.name === "$$AbstractModel$$" ) {
				console.log( new Error().stack );
			}

			const { adapter, indices } = this;
			const numIndices = indices.length;

			if ( numIndices ) {
				for ( let i = 0; i < numIndices; i++ ) {
					const { type } = indices[i];
					if ( type !== "eq" ) {
						throw new Error( `index of type ${type} not yet supported` );
					}

					indices[i].handler = new Index( { revision: 0 } );
				}

				const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );

				this.indexPromise = PromiseUtils.process( stream, dataKey => {
					const item = new this( this.keyToUuid( dataKey ), { adapter } ); // eslint-disable-line new-cap
					return item.load()
						.then( () => {
							const { $uuid } = item;
							for ( let i = 0; i < numIndices; i++ ) {
								const { property } = indices[i];
								if( item[property] != null ) indices[i].handler.add( $uuid, item[property] );
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
