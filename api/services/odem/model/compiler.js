/* eslint-disable max-depth */
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

/**
 * Describes definition of properties as supported by `Object.defineProperties()`.
 *
 * @typedef {object<string,{get:function():*,set:function(*)}>} ObjectPropertyDefinitions
 */

/**
 * Describes properties exposed by a model compiled from definition.
 *
 * @typedef {Services.Model} CompiledModel
 * @property {string} name defined name of model
 * @property {ModelSchema} schema model's definition
 * @property {Services.OdemAdapter} adapter adapter to use with instances of model by default
 */

/**
 * Describes structure of definition of a model known as the model's schema.
 *
 * @typedef {object} ModelSchema
 * @property {object<string,object>} props actual properties
 * @property {object<string,function>} computed computed properties
 * @property {object<string,function>} methods methods of model
 * @property {object<string,function>} hooks life cycle hooks
 */

/**
 * Lists names of sections and of related normalizer functions supported in a
 * schema defining any model.
 *
 * @type {Array<string[]>}
 */
const SchemaSections = [
	[ "props", "normalizeSchemaProperties" ],
	[ "computed", "normalizeSchemaComputedProperties" ],
	[ "methods", "normalizeSchemaMethods" ],
	[ "hooks", "normalizeSchemaHooks" ],
	[ "options", "normalizeSchemaOptions" ],
	[ "indices", "normalizeSchemaIndices", "indexes", "index" ],
];

/**
 * Maps names of all supported life cycle hooks into flag indicating whether
 * related hook is to be invoked in context of model's class rather than any of
 * its instances.
 *
 * @type {object<string,boolean>}
 */
const SupportedLifeCycleHooks = {
	beforeCreate: false,
	afterCreate: false,
	beforeLoad: false,
	afterLoad: false,
	beforeValidate: false,
	afterValidate: false,
	beforeSave: false,
	afterSave: false,
	beforeRemove: false,
	afterRemove: false,
};

/**
 * Lists reserved names not to be used for any element of a model's schema.
 *
 * @type {string[]}
 */
const ReservedSchemaElementNames = [
	"super",
	"prototype",
	"constructor",
	"uuid",
];



module.exports = function() {
	const api = this;
	const { services: Services } = api.runtime;

	/**
	 * Compiles classes deriving from Model from a schema-like definition.
	 *
	 * @alias this.runtime.services.OdemModelCompiler
	 */
	class OdemModelCompiler {
		/**
		 * Compiles class inherited from abstract model managing described schema.
		 *
		 * @param {string} modelName name of model
		 * @param {object} modelSchema definition of model's properties, computed properties and lifecycle hooks
		 * @param {object} baseClass custom base class to derive model class from
		 * @param {Services.OdemAdapter} adapter selects adapter to use on instances of resulting model by default
		 * @returns {class<Services.Model>} compiled model class
		 * @alias ModelCompiler
		 */
		static compileModel( modelName, modelSchema = {}, baseClass = null, adapter = null ) {
			if ( typeof modelName !== "string" || !Services.OdemUtilityString.ptnKeyword.test( modelName ) ) {
				throw new TypeError( "invalid model name" );
			}

			// manage base class for deriving class to be defined from
			const _baseClass = baseClass == null ? Services.Model : baseClass;
			const isDerived = _baseClass !== Services.Model;

			if ( isDerived && !( _baseClass.prototype instanceof Services.Model ) ) {
				throw new TypeError( "provided base class must be inheriting from AbstractModel" );
			}

			const _adapter = adapter == null ? api.config.database.default : adapter;

			if ( !( _adapter instanceof Services.OdemAdapter ) ) {
				throw new TypeError( "missing or invalid adapter" );
			}


			// validate and qualify provided schema definition
			const errors = [];
			const individualSchema = this.normalizeSchema( modelName, modelSchema, isDerived, errors );

			if ( errors.length > 0 ) {
				throw new TypeError( `provided schema of model ${modelName} is invalid:\n${errors.join( "\n" )}` );
			}

			// create merged schema to be exposed in context of current model's class
			const parentSchema = isDerived ? _baseClass.schema || {} : this.normalizeSchema( "<empty>", {}, false, [] );
			const mergedSchema = {};

			for ( const [section] of SchemaSections ) {
				mergedSchema[section] = Object.assign( {}, parentSchema[section], individualSchema[section] );
			}


			let DefinedModel;

			// eslint-disable-next-line no-eval
			eval( `DefinedModel = class ${modelName} extends _baseClass {}` );



			const proto = DefinedModel.prototype;

			// customize prototype of defined model
			Object.defineProperties( proto, {
				/**
				 * Validates properties of current instance.
				 *
				 * @note This method is replacing Services.Model#$validate().
				 *
				 * @name Services.Model#validate
				 * @prototype {function():Promise<Error[]>}
				 * @readonly
				 */
				validate: {
					value() {
						return Promise.resolve()
							.then( () => {
								this.$properties.$context.relax();

								return this.beforeValidate();
							} )
							.catch( error => [error] )
							.then( _errors => this.constructor._validateProperties.call( this, _errors ) )
							.then( _errors => this.afterValidate( _errors ) )
							.catch( error => {
								this.$properties.$context.relax( false );
								throw error;
							} )
							.then( _errors => {
								this.$properties.$context.relax( false );
								return _errors;
							} );
					},
				},

				/**
				 * Exposes instance properties and methods defined in scope of base
				 * class.
				 *
				 * @name Services.Model#$super
				 * @property {object}
				 * @readonly
				 */
				$super: { value: Object.create( _baseClass.prototype ) },

				/**
				 * Exposes Hitchy's API for simplified access in methods of this
				 * model.
				 *
				 * @name Services.Model#$api
				 * @property {HitchyAPI|object}
				 * @readonly
				 */
				$api: { value: api },
			} );


			// implement getter/setter for every defined property and method
			const { props, computed, methods, hooks, options, indices } = individualSchema;

			Object.defineProperties( proto, this.compileProperties( props ) );
			Object.defineProperties( proto, this.compileComputedProperties( computed ) );
			Object.defineProperties( proto, this.compileMethods( methods ) );
			Object.defineProperties( proto, this.compileInstanceHooks( hooks ) );


			// extract indices here before sealing schema
			const flatIndices = this.extractIndices( _baseClass.indices, indices );
			let observed = null;


			// customize static methods and properties
			Object.defineProperties( DefinedModel, {
				/**
				 * @name Services.Model.derivesFrom
				 * @property {class<Services.Model>}
				 * @readonly
				 */
				derivesFrom: { value: _baseClass },

				/**
				 * @name Services.Model.adapter
				 * @property {Services.OdemAdapter}
				 * @readonly
				 */
				adapter: { value: _adapter },

				/**
				 * @name Services.Model.name
				 * @property {string}
				 * @readonly
				 */
				name: { value: modelName },

				/**
				 * @name Services.Model.schema
				 * @property {object}
				 * @readonly
				 */
				schema: { value: Services.OdemUtilityObject.deepSeal( mergedSchema ) },

				/**
				 * Lists all indices defined in schema.
				 *
				 * @name Services.Model.indices
				 * @property {Array<ExtractedIndex>}
				 * @readonly
				 */
				indices: { value: flatIndices },

				/**
				 * @name Services.Model._coerceProperties
				 * @property {function}
				 * @readonly
				 * @protected
				 */
				_coerceProperties: { value: this.compileCoercion( props ) },

				/**
				 * @name Services.Model._coercionHandlers
				 * @property {object<string,function(*,string):*>}
				 * @readonly
				 * @protected
				 */
				_coercionHandlers: { value: this.compileCoercionMap( props ) },

				/**
				 * @name Services.Model._validateProperties
				 * @property {function():Error[]}
				 * @readonly
				 * @protected
				 */
				_validateProperties: { value: this.compileValidator( props ) },

				/**
				 * @name Services.Model._serializeProperties
				 * @property {function(object):object}
				 * @readonly
				 * @protected
				 */
				_serializeProperties: { value: this.compileSerializer( props ) },

				/**
				 * @name Services.Model._deserializeProperties
				 * @property {function(object, object):object}
				 * @readonly
				 * @protected
				 */
				_deserializeProperties: { value: this.compileDeserializer( props ) },

				/**
				 * Exposes adapter observed for remote change of data on behalf of
				 * current model.
				 *
				 * @name Services.Model._observedAdapter
				 * @property {Services.OdemAdapter}
				 * @protected
				 */
				_observedAdapter: {
					get: () => observed,
					set: newAdapter => {
						if ( newAdapter instanceof Services.OdemAdapter ) {
							if ( observed == null ) {
								observed = newAdapter;
							} else {
								throw new TypeError( "observing multiple backends not supported" );
							}
						} else {
							throw new TypeError( "invalid backend adapter to be observed" );
						}
					},
				},

				...this.compileOptions( options ),
				...this.compileStaticHooks( hooks ),
			} );


			return DefinedModel;
		}

		/**
		 * Detects if provided name is valid for naming an element of a model's schema.
		 *
		 * @param {string} name name of element to be tested
		 * @returns {boolean} true if provided name is valid
		 */
		static isValidSchemaElementName( name ) {
			return typeof name === "string" &&
			       name.charAt( 0 ) !== "$" &&
			       ReservedSchemaElementNames.indexOf( name ) < 0 &&
			       SupportedLifeCycleHooks[name] === undefined;
		}

		/**
		 * Normalizes schema definition.
		 *
		 * @param {string} modelName name of model schema is associated with
		 * @param {object} schema definition to be normalized
		 * @param {boolean} isDerived set true if named model is deriving from another one
		 * @param {Error[]} errors collected errors encountered while processing definition
		 * @returns {ModelSchema} normalized and qualified schema
		 */
		static normalizeSchema( modelName, schema, isDerived, errors ) {
			if ( !modelName || typeof modelName !== "string" ) {
				throw new TypeError( "invalid name of model" );
			}

			if ( !schema || typeof schema !== "object" || Array.isArray( schema ) ) {
				throw new TypeError( "invalid model schema definition" );
			}

			const names = [];
			const normalized = {};

			for ( const [ section, normalizerName, ...fallbacks ] of SchemaSections ) {
				let source = schema[section];
				if ( !source ) {
					for ( let i = 0; !source && i < fallbacks.length; i++ ) {
						source = schema[fallbacks[i]];
					}
				}

				normalized[section] = this[normalizerName]( modelName, normalized, source || {}, names, isDerived, errors );
			}

			return normalized;
		}

		/**
		 * Validates and qualifies provided definition of actual properties.
		 *
		 * @note Due to included qualification the provided definition in `properties`
		 *       might be changed.
		 *
		 * @param {string} modelName name of model definition of properties is used for
		 * @param {object} normalized refers to parts of schema already normalized (for inspection, only)
		 * @param {object<string,object>} properties definition of properties, might be adjusted on return
		 * @param {string[]} names collector of names used to detect naming conflicts
		 * @param {boolean} isDerived set true if named model is derived from another one
		 * @param {Error[]} errors collector of encountered  errors
		 * @returns {object<string,Services.OdemModelType>} optionally qualified definition of properties
		 * @throws TypeError on encountering severe issues with provided definition
		 */
		static normalizeSchemaProperties( modelName, normalized, properties, names, isDerived, errors ) {
			const propertyNames = Object.keys( properties );
			const numProperties = propertyNames.length;
			const qualified = {};
			const indices = normalized.indices = normalized.indices || {};

			if ( numProperties ) {
				for ( let i = 0; i < numProperties; i++ ) {
					const name = propertyNames[i];

					if ( this.isValidSchemaElementName( name ) ) {
						const property = properties[name];
						if ( property && typeof property === "object" && !Array.isArray( property ) ) {
							if ( !property.type ) {
								property.type = "string";
							}

							const $type = Services.OdemModelType.selectByName( property.type );
							if ( $type ) {
								property.$type = $type;
								property.type = $type.typeName;
							} else {
								errors.push( `invalid type "${property.type}" for property "${name}" of model "${modelName}"` );
							}

							if ( names.indexOf( name ) > -1 ) {
								errors.push( `duplicate use of name "${name}" in model "${modelName}` );
							} else {
								names.push( name );
							}


							const { index } = property;

							if ( index ) {
								const collected = [];

								switch ( typeof index ) {
									case "function" :
										collected.push( { property: name, $type, type: "eq", reducer: index } );
										break;

									case "object" :
										if ( Array.isArray( index ) ) {
											const numIndices = index.length;

											for ( let j = 0; j < numIndices; j++ ) {
												let indexType = index[j];
												indexType = String( indexType || "eq" ).toLowerCase();

												collected.push( { property: name, $type, type: indexType } );
											}
										} else {
											const types = Object.keys( index );
											const numNames = types.length;

											for ( let j = 0; j < numNames; j++ ) {
												let indexType = types[j];
												const indexValue = index[indexType];

												if ( indexValue ) {
													indexType = String( indexType || "eq" ).toLowerCase();

													const info = { property: name, $type, type: indexType };

													if ( typeof indexValue === "function" ) {
														info.reducer = indexValue;
													}

													collected.push( info );
												}
											}
										}
										break;

									case "boolean" :
									case "string" :
										collected.push( { property: name, $type, type: index.length ? index.toLowerCase() : "eq" } );
										break;

									default :
										throw new TypeError( `invalid index type "${index}" on property "${name}" of model "${modelName}"` );
								}

								const numCollected = collected.length;
								const local = property.index = numCollected > 0 ? {} : null;

								for ( let j = 0; j < numCollected; j++ ) {
									const info = collected[j];
									const type = info.type;
									const indexName = `${name}_${type}`;

									if ( local[type] || indices[indexName] ) {
										throw new TypeError( `double definition of index type "${type}" on property "${name}" in model "${modelName}"` );
									}

									local[type] = indices[indexName] = info;
								}
							}

							qualified[name] = property;
						} else {
							errors.push( `invalid description of property "${name}" in model "${modelName}"` );
						}
					} else {
						errors.push( `invalid name of property "${name}" in model "${modelName}"` );
					}
				}
			} else if ( !isDerived ) {
				errors.push( "missing definition of any actual property" );
			}

			return qualified;
		}

		/**
		 * Validates and qualifies provided definition of computed properties.
		 *
		 * @param {string} modelName name of model definition of properties is used for
		 * @param {object} normalized refers to parts of schema already normalized (for inspection, only)
		 * @param {object<string,object>} computedProperties definition of computed properties
		 * @param {string[]} names collector of names used to detect naming conflicts
		 * @param {boolean} isDerived set true if named model is deriving from another one
		 * @param {Error[]} errors collector of encountered errors
		 * @returns {object} qualified definition of computed properties
		 * @throws TypeError on encountering severe issues with provided definition
		 */
		static normalizeSchemaComputedProperties( modelName, normalized, computedProperties, names, isDerived, errors ) {
			const computedNames = Object.keys( computedProperties );
			const numComputed = computedNames.length;
			const result = {};

			if ( numComputed ) {
				for ( let i = 0; i < numComputed; i++ ) {
					const key = computedNames[i];
					const match = typeof key === "string" ? /^([^:]+)(?::([^:]+))?$/.exec( key.trim() ) : undefined;

					const name = match ? match[1] : key;
					const embeddedType = match ? match[2] : undefined;

					if ( this.isValidSchemaElementName( name ) ) {
						const computed = computedProperties[key];

						const code = typeof computed === "function" ? computed : computed ? computed.code : undefined;
						const type = ( computed && typeof computed === "object" && computed.type ) || embeddedType;

						if ( typeof code !== "function" ) {
							errors.push( `computed property "${key}" of model "${modelName}" must be implemented as a function` );
						}

						let $type;

						if ( type ) {
							$type = Services.OdemModelType.selectByName( type );
							if ( !$type ) {
								errors.push( `invalid type "${type}" for computed property "${name}" of model "${modelName}"` );
							}
						}

						if ( names.indexOf( name ) > -1 ) {
							errors.push( `duplicate use of name "${name}" in model "${modelName}` );
						} else {
							names.push( name );
						}

						result[name] = { code, type: $type && $type.typeName, $type };
					} else {
						errors.push( `invalid name of computed property "${match ? match[1] : key}" of model "${modelName}"` );
					}
				}
			}

			return result;
		}

		/**
		 * Validates and qualifies provided definition of methods.
		 *
		 * @param {string} modelName name of model definition of properties is used for
		 * @param {object} normalized refers to parts of schema already normalized (for inspection, only)
		 * @param {object<string,function>} methods definition of methods
		 * @param {string[]} names collector of names used to detect naming conflicts
		 * @param {boolean} isDerived set true if named model is deriving from another one
		 * @param {Error[]} errors collector of encountered errors
		 * @returns {object} qualified definition of methods
		 * @throws TypeError on encountering severe issues with provided definition
		 */
		static normalizeSchemaMethods( modelName, normalized, methods, names, isDerived, errors ) {
			const methodNames = Object.keys( methods );
			const numMethods = methodNames.length;

			if ( numMethods ) {
				for ( let i = 0; i < numMethods; i++ ) {
					const name = methodNames[i];

					if ( SupportedLifeCycleHooks[name] === false ) {
						errors.push( `method "${name}" must be defined as hook in model "${modelName}"` );
					} else if ( this.isValidSchemaElementName( name ) ) {
						const method = methods[name];

						if ( typeof method !== "function" ) {
							errors.push( `method "${name}" of model "${modelName}" must be a function` );
						}

						if ( names.indexOf( name ) > -1 ) {
							errors.push( `duplicate use of name "${name}" in model "${modelName}` );
						} else {
							names.push( name );
						}
					} else {
						errors.push( `invalid name of method "${name}" of model "${modelName}"` );
					}
				}
			}

			return methods;
		}

		/**
		 * Validates and qualifies provided definition of life cycle hooks.
		 *
		 * @param {string} modelName name of model definition of hooks is used for
		 * @param {object} normalized refers to parts of schema already normalized (for inspection, only)
		 * @param {object<string,function>} hooks definition of hooks
		 * @param {string[]} names collector of names used to detect naming conflicts
		 * @param {boolean} isDerived set true if named model is deriving from another one
		 * @param {Error[]} errors collector of encountered errors
		 * @returns {object<string,function[]>} qualified definition of life cycle hooks
		 * @throws TypeError on encountering severe issues with provided definition
		 */
		static normalizeSchemaHooks( modelName, normalized, hooks, names, isDerived, errors ) {
			const hookNames = Object.keys( hooks );
			const numHooks = hookNames.length;
			const qualified = {};

			if ( numHooks ) {
				for ( let i = 0; i < numHooks; i++ ) {
					const name = hookNames[i];
					const _name = name.replace( /^on([A-Z])/, ( _, leading ) => leading.toLowerCase() );

					if ( SupportedLifeCycleHooks[_name] === undefined ) {
						errors.push( `invalid hook for unknown life cycle event "${name}" in model "${modelName}"` );
					} else {
						const hook = hooks[name];

						if ( typeof hook === "function" ) {
							qualified[_name] = hook;
						} else {
							errors.push( `definition of hook for life cycle event "${name}" of model "${modelName}" is not a function` );
						}
					}
				}
			}

			return qualified;
		}

		/**
		 * Validates and qualifies provided definition of options customizing model.
		 *
		 * @param {string} modelName name of model definition of options is used for
		 * @param {object} normalized refers to parts of schema already normalized (for inspection, only)
		 * @param {object<string,*>} options definition of options
		 * @param {string[]} names collector of names used to detect naming conflicts
		 * @param {boolean} isDerived set true if named model is deriving from another one
		 * @param {Error[]} errors collector of encountered errors
		 * @returns {object<string,*>} qualified definition of model-related options
		 * @throws TypeError on encountering severe issues with provided definition
		 */
		static normalizeSchemaOptions( modelName, normalized, options, names, isDerived, errors ) {
			switch ( String( options.onUnsaved ).toLowerCase() ) {
				case "ignore" :
				case "warn" :
				case "fail" :
					options.onUnsaved = options.onUnsaved.toLowerCase();
					break;

				default :
					if ( options.onUnsaved != null ) {
						errors.push( new Error( "invalid model option for handling assignments to unsaved properties" ) );
					}
			}

			return options;
		}

		/**
		 * Validates and qualifies separately provided definition of indices.
		 *
		 * @param {string} modelName name of model definition of indices is used for
		 * @param {object} normalized refers to parts of schema already normalized (for inspection, only)
		 * @param {object<string,*>} indices definition of indices
		 * @param {string[]} names collector of names used to detect naming conflicts
		 * @param {boolean} isDerived set true if named model is deriving from another one
		 * @param {Error[]} errors collector of encountered errors
		 * @returns {object<string,*>} qualified definition of model-related options
		 * @throws TypeError on encountering severe issues with provided definition
		 */
		static normalizeSchemaIndices( modelName, normalized, indices, names, isDerived, errors ) { // eslint-disable-line no-unused-vars
			const qualified = normalized.indices || {};
			const indexNames = Object.keys( indices );
			const numNames = indexNames.length;

			// normalize indices defined in dedicated section of schema
			for ( let i = 0; i < numNames; i++ ) {
				const indexName = indexNames[i];
				const source = indices[indexName];
				let info;

				if ( !source ) {
					continue;
				}

				switch ( typeof source ) {
					case "function" :
						info = { property: indexName, type: "eq", reducer: source };
						break;

					case "boolean" :
					case "string" :
						info = { property: indexName, type: source.length ? source.toLowerCase() : "eq" };
						break;

					case "object" :
						if ( Array.isArray( source ) ) {
							throw new TypeError( `invalid definition of index "${indexName}" for model "${modelName}" using array` );
						}

						info = Object.assign( {}, source );

						if ( !info.property ) {
							// TODO check if this definition is for index that works fine w/o particular property
							info.property = indexName;
						}
						break;

					default :
						throw new TypeError( `invalid definition of index "${indexName}" for model "${modelName}"` );
				}

				if ( qualified[indexName] ) {
					throw new TypeError( `double definition of index "${indexName}" for model "${modelName}"` );
				}

				qualified[indexName] = info;
			}

			// commonly validate all eventually defined indices (incl. those defined per property before)
			const qualifiedNames = Object.keys( qualified );
			const numIndices = qualifiedNames.length;
			const multiDetector = {};

			for ( let i = 0; i < numIndices; i++ ) {
				const indexName = qualifiedNames[i];
				const info = qualified[indexName];
				const { type, property: propertyName } = info;

				if ( type == null ) {
					info.type = "eq";
				} else if ( !type || !Services.OdemModelIndexer.has( type ) ) {
					throw new TypeError( `missing or invalid type "${type}" of index "${indexName}" in model ${modelName}` );
				}

				if ( propertyName ) {
					if ( !this.isValidSchemaElementName( propertyName ) ) {
						throw new TypeError( `invalid property name "${propertyName}" in index "${indexName}" of model ${modelName}` );
					}

					const property = normalized.props[propertyName];
					const computed = normalized.computed[propertyName];
					if ( !property && !computed ) {
						throw new TypeError( `invalid index definition "${indexName}" for unknown property "${propertyName}" in model ${modelName}` );
					}

					const key = propertyName + "||" + ( type || "eq" );
					if ( multiDetector[key] ) {
						throw new TypeError( `double definition of index type "${type || "eq"}" for property "${propertyName}" of model ${modelName}` );
					}

					multiDetector[key] = true;

					if ( !info.$type ) {
						if ( property ) {
							info.$type = property.$type;
						} else if ( computed.$type ) {
							info.$type = computed.$type;
						} else if ( info.propertyType ) {
							info.$type = Services.OdemModelType.selectByName( info.propertyType );
						} else {
							info.$type = Services.OdemModelType;
						}
					}
				}
			}

			return qualified;
		}

		/**
		 * @typedef {object} ExtractedIndex
		 * @property {string} property name of property covered by index
		 * @property {string} type name of covering index' type or operation
		 * @property {Services.OdemModelType} $type instance handling type-specific behaviour of covered property
		 * @property {?function(*):*} reducer callback invoked for deriving values tracked by index from those found in tracked property
		 * @property {EqualityIndex} handler index manager
		 */

		/**
		 * Extracts list of indices defined on properties as given in provided section
		 * of definition.
		 *
		 * @param {array<object>} baseClassIndices indices defined in context of base model
		 * @param {object<string,object>} indices indices defined in context of current model
		 * @returns {Array<ExtractedIndex>} extracted list of defined indices
		 */
		static extractIndices( baseClassIndices, indices ) {
			const localNames = Object.keys( indices );
			const numLocalIndices = localNames.length;
			const mergedIndices = new Array( numLocalIndices );

			for ( let i = 0; i < numLocalIndices; i++ ) {
				mergedIndices[i] = indices[localNames[i]];
			}

			// adopt indices additionally defined in base class
			const numBaseIndices = baseClassIndices.length;

			for ( let j, i = 0; i < numBaseIndices; i++ ) {
				const base = baseClassIndices[i];
				const numIndices = mergedIndices.length;

				for ( j = 0; j < numIndices; j++ ) {
					const local = mergedIndices[j];

					// TODO implement more sophisticated comparison incl. indices that work fine w/o property
					if ( local.type === base.type && local.property === base.property ) {
						break;
					}
				}

				if ( j >= numIndices ) {
					mergedIndices.push( Object.assign( {}, base ) );
				}
			}

			// eventually create handler instances for every resulting index of model
			const numMergedIndices = mergedIndices.length;

			for ( let i = 0; i < numMergedIndices; i++ ) {
				const index = mergedIndices[i];

				index.handler = Services.OdemModelIndexer.select( index.type ).create( index );
			}

			return mergedIndices;
		}

		/**
		 * Compiles coercion handlers for every property of model.
		 *
		 * @param {object<string,object>} properties definition of properties
		 * @returns {object<string,function(*,object):*>} map of properties' names into either property's coercion handler
		 */
		static compileCoercionMap( properties ) {
			if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
				throw new TypeError( "definition of properties must be object" );
			}

			const coercions = {};

			const propertyNames = Object.keys( properties );
			for ( let ai = 0, aLength = propertyNames.length; ai < aLength; ai++ ) {
				const propertyName = propertyNames[ai];
				const property = properties[propertyName];

				( function( name, handler, definition ) {
					coercions[name] = value => handler.coerce( value, definition, Services.Model.prototype.$default );
				} )( propertyName, property.$type || Services.OdemModelType.selectByName( property.type ), property );
			}

			return coercions;
		}

		/**
		 * Creates single function coercing all properties of model in a row.
		 *
		 * @param {object<string,object>} properties definition of properties
		 * @returns {function()} function concatenating coercion handlers of all defined properties
		 */
		static compileCoercion( properties ) {
			if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
				throw new TypeError( "definition of properties must be object" );
			}

			const propertiesNames = Object.keys( properties );
			const numProperties = propertiesNames.length;
			const coercion = [];

			for ( let ai = 0; ai < numProperties; ai++ ) {
				const propertyName = propertiesNames[ai];
				const property = properties[propertyName];

				const handler = property.$type || Services.OdemModelType.selectByName( property.type );

				const { args, body } = Services.OdemUtilityFunction.extractBody( handler.coerce );
				if ( args.length < 3 ) {
					throw new TypeError( `coerce() of ModelType for handling ${property.type} values must accept three arguments` );
				}

				coercion[ai] = `
{
	let ${args[0]} = __properties["${propertyName}"];
	const ${args[1]} = __propertyDefinitions["${propertyName}"];
	const ${args[2]} = this.$default;

	{
		${body.replace( Services.OdemUtilityFunction.ptnTrailingReturn, ( all, term ) => `__properties["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
			}

			// eslint-disable-next-line no-new-func
			return new Function( `
const __propertyDefinitions = this.constructor.schema.props;
const __properties = this.$properties;

${coercion.join( "" )}
` );
		}

		/**
		 * Creates validator function assessing all defined properties of a model.
		 *
		 * @param {object<string,object>} properties definition of properties
		 * @returns {function():Error[]} function concatenating validation handlers of all defined properties
		 */
		static compileValidator( properties ) {
			if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
				throw new TypeError( "definition of properties must be object" );
			}

			const propertiesNames = Object.keys( properties );
			const numProperties = propertiesNames.length;
			const validation = [];

			for ( let ai = 0; ai < numProperties; ai++ ) {
				const propertyName = propertiesNames[ai];
				const property = properties[propertyName];

				const handler = property.$type || Services.OdemModelType.selectByName( property.type );

				const { args, body } = Services.OdemUtilityFunction.extractBody( handler.isValid );
				if ( args.length < 4 ) {
					throw new TypeError( `isValid() of ModelType for handling ${property.type} values must accept four arguments` );
				}

				validation[ai] = `
{
	const ${args[0]} = "${propertyName}";
	let ${args[1]} = __properties["${propertyName}"];
	const ${args[2]} = __propertyDefinitions["${propertyName}"];
	const ${args[3]} = __errors;

	{
		${body}
	}
}
		`;
			}

			// eslint-disable-next-line no-new-func
			return new Function( "errors", `
const __propertyDefinitions = this.constructor.schema.props;
const __properties = this.$properties;
const __errors = Array.isArray( errors ) ? errors : [];

${validation.join( "" )}

return __errors;
` );
		}

		/**
		 * Creates function serializing all properties in a provided record.
		 *
		 * @param {object<string,object>} properties definition of properties
		 * @returns {function(object):object} function mapping some provided record into its serialization
		 */
		static compileSerializer( properties ) {
			if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
				throw new TypeError( "definition of properties must be object" );
			}

			const propertiesNames = Object.keys( properties );
			const numProperties = propertiesNames.length;
			const serialization = new Array( numProperties );

			for ( let ai = 0; ai < numProperties; ai++ ) {
				const propertyName = propertiesNames[ai];
				const property = properties[propertyName];

				const handler = property.$type || Services.OdemModelType.selectByName( property.type );

				const { args, body } = Services.OdemUtilityFunction.extractBody( handler.serialize );
				if ( args.length < 1 ) {
					throw new TypeError( `serialize() of ModelType for handling ${property.type} values must accept one argument` );
				}

				serialization[ai] = `
{
	let ${args[0]} = $$s["${propertyName}"];
	let ${args[1]} = $$a;

	{
		${body.replace( Services.OdemUtilityFunction.ptnTrailingReturn, ( all, term ) => `$$d["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
			}

			// eslint-disable-next-line no-new-func
			return new Function( "$$input", "$$adapter", `
const $$s = $$input && typeof $$input === "object" ? $$input : {};
const $$a = $$adapter && typeof $$adapter === "object" ? $$adapter : {};
const $$d = {};

${serialization.join( "" )}

return $$d;
` );
		}

		/**
		 * Creates function de-serializing and coercing all properties in a provided
		 * record.
		 *
		 * This method is creating function resulting from concatenating methods
		 * `deserialize()` and `coerce()` of every property's type handler.
		 *
		 * @param {object<string,object>} properties definition of properties
		 * @returns {function(object):object} function mapping some provided record into record of de-serialized properties
		 */
		static compileDeserializer( properties ) {
			if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
				throw new TypeError( "definition of properties must be object" );
			}

			const propertiesNames = Object.keys( properties );
			const numProperties = propertiesNames.length;
			const deserialization = new Array( 2 * numProperties );

			let write = 0;
			for ( let ai = 0; ai < numProperties; ai++ ) {
				const propertyName = propertiesNames[ai];
				const property = properties[propertyName];

				const handler = property.$type || Services.OdemModelType.selectByName( property.type );
				let sourceName;

				// append deserialize() method of current property's type handler
				{
					const { args, body } = Services.OdemUtilityFunction.extractBody( handler.deserialize );
					if ( args.length < 1 ) {
						throw new TypeError( `deserialize() of ModelType for handling ${property.type} values must accept one argument` );
					}

					if ( body.replace( Services.OdemUtilityFunction.ptnTrailingReturn, "" ).trim().length ) {
						sourceName = "$$d";
						deserialization[write++] = `
{
	let ${args[0]} = $$s["${propertyName}"];

	{
		${body.replace( Services.OdemUtilityFunction.ptnTrailingReturn, ( all, term ) => `$$d["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
					} else {
						sourceName = "$$s";
					}
				}

				// append coerce() method of current property's type handler
				{
					const { args, body } = Services.OdemUtilityFunction.extractBody( handler.coerce );
					if ( args.length < 3 ) {
						throw new TypeError( `coerce() of ModelType for handling ${property.type} values must accept three arguments` );
					}

					deserialization[write++] = `
{
	let ${args[0]} = ${sourceName}["${propertyName}"];
	const ${args[1]} = $$attrs["${propertyName}"];
	const ${args[2]} = this.$default;

	{
		${body.replace( Services.OdemUtilityFunction.ptnTrailingReturn, ( all, term ) => `$$d["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
				}
			}

			deserialization.splice( write );

			// eslint-disable-next-line no-new-func
			return new Function( "$$input", "$$attrs", `
if ( !$$attrs || typeof $$attrs !== "object" ) {
	throw new TypeError( "missing definition of properties required for deserialization" );
}

const $$s = $$input && typeof $$input === "object" ? $$input : {};
const $$d = {};

${deserialization.join( "" )}

return $$d;
` );
		}

		/**
		 * Compiles definition of getters and setters for conveniently accessing
		 * properties of model.
		 *
		 * @note This method assumes provided set of properties has been normalized before.
		 *
		 * @param {object<string,object>} properties definition of basic properties
		 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
		 */
		static compileProperties( properties ) {
			const definition = {};
			const propertiesNames = Object.keys( properties );
			const numProperties = propertiesNames.length;

			for ( let i = 0; i < numProperties; i++ ) {
				( name => {
					definition[name] = {
						get() {
							return this.$properties[name];
						},
						set( value ) {
							this.$properties[name] = value;
						},
						enumerable: true,
					};
				} )( propertiesNames[i] );
			}

			return definition;
		}

		/**
		 * Compiles definition of getters and setters for conveniently accessing
		 * properties of model.
		 *
		 * @note This method assumes provided set of properties has been normalized before.
		 *
		 * @param {object<string,function>} computedProperties definition of computed properties
		 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
		 */
		static compileComputedProperties( computedProperties ) {
			const definition = {};
			const computedNames = Object.keys( computedProperties );
			const numComputeds = computedNames.length;

			for ( let i = 0; i < numComputeds; i++ ) {
				const name = computedNames[i];

				( ( computedName, computedFn ) => {
					definition[computedName] = {
						get: computedFn,
						set( value ) {
							computedFn.call( this, value );
						},
						enumerable: true,
					};
				} )( name, computedProperties[name].code );
			}

			return definition;
		}

		/**
		 * Compiles definition of getters and setters for conveniently accessing
		 * methods of model.
		 *
		 * @note This method assumes provided set of properties has been normalized before.
		 *
		 * @param {object<string,function>} methods definition of methods
		 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
		 */
		static compileMethods( methods ) {
			const definition = {};
			const methodNames = Object.keys( methods );
			const numMethods = methodNames.length;

			for ( let i = 0; i < numMethods; i++ ) {
				const name = methodNames[i];

				( function( methodName, method ) {
					definition[methodName] = {
						value: method,
						enumerable: true,
					};
				} )( name, methods[name] );
			}

			return definition;
		}

		/**
		 * Compiles definition of getters for conveniently accessing hooks of model for
		 * life-cycle events occurring in context of handling instance of model.
		 *
		 * @note This method assumes provided set of hooks has been normalized before.
		 *
		 * @param {object<string,function>} hooks actually defined listeners for life-cycle events
		 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
		 */
		static compileInstanceHooks( hooks ) {
			const getters = {};
			const hookNames = Object.keys( hooks );
			const numHooks = hookNames.length;

			for ( let i = 0; i < numHooks; i++ ) {
				const name = hookNames[i];
				if ( SupportedLifeCycleHooks[name] === false ) {
					getters[name] = {
						value: hooks[name],
						enumerable: true,
					};
				}
			}

			return getters;
		}

		/**
		 * Compiles definition of getters for conveniently accessing hooks of model for
		 * life-cycle events NOT occurring in context of handling instance of model.
		 *
		 * @note This method assumes provided set of hooks has been normalized before.
		 *
		 * @param {object<string,function>} hooks actually defined listeners for life-cycle events
		 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
		 */
		static compileStaticHooks( hooks ) {
			const getters = {};
			const hookNames = Object.keys( hooks );
			const numHooks = hookNames.length;

			for ( let i = 0; i < numHooks; i++ ) {
				const name = hookNames[i];
				if ( SupportedLifeCycleHooks[name] === true ) {
					getters[name] = {
						value: hooks[name],
						enumerable: true,
					};
				}
			}

			return getters;
		}

		/**
		 * Compiles definition of getters for conveniently accessing options of model.
		 *
		 * @note This method assumes provided set of options has been normalized before.
		 *
		 * @param {object<string,*>} options actually defined options
		 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
		 */
		static compileOptions( options ) {
			const customOptions = {};

			if ( options.onUnsaved != null ) {
				/**
				 * @name Services.Model.onUnsaved
				 * @property {string}
				 * @readonly
				 */
				customOptions.onUnsaved = { value: options.onUnsaved };
			}

			return customOptions;
		}
	}

	return OdemModelCompiler;
};
