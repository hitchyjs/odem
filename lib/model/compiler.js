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


const PromiseUtil = require( "promise-essentials" );

const { Adapter } = require( "../adapter" );
const Model = require( "./base" );
const Types = require( "./type" );
const { deepSeal } = require( "../utility/object" );
const { ptnKeyword } = require( "../utility/string" );
const { extractBody, ptnTrailingReturn } = require( "../utility/function" );



/**
 * Describes definition of properties as supported by `Object.defineProperties()`.
 *
 * @typedef {object<string,{get:function():*,set:function(*)}>} ObjectPropertyDefinitions
 */

/**
 * Describes properties exposed by a model compiled from definition.
 *
 * @typedef {Model} CompiledModel
 * @property {string} name defined name of model
 * @property {ModelSchema} schema model's definition
 * @property {Adapter} adapter adapter to use with instances of model by default
 */

/**
 * Describes structure of definition of a model known as the model's schema.
 *
 * @typedef {object} ModelSchema
 * @property {object<string,object>} props actual properties
 * @property {object<string,function>} computed computed properties
 * @property {object<string,function>} methods methods of model
 * @property {object<string,function[]>} hooks life cycle hooks
 */



/**
 * Lists names and related normalizer functions supported in a schema defining
 * any model.
 *
 * @type {Array<string[]>}
 */
const SchemaSections = [
	[ "props", normalizeSchemaProperties ],
	[ "computed", normalizeSchemaComputedProperties ],
	[ "methods", normalizeSchemaMethods ],
	[ "hooks", normalizeSchemaHooks ],
];

/**
 * Lists names of supported life cycle hooks.
 *
 * @type {string[]}
 */
const SupportedLifeCycleHooks = [
	"beforeCreate", "afterCreate",
	"beforeValidate", "afterValidate",
	"beforeSave", "afterSave",
	"beforeRemove", "afterRemove",
];

/**
 * Lists reserved names not to be used for any element of a model's schema.
 *
 * @type {string[]}
 */
const ReservedSchemaElementNames = [
	"super",
	"prototype",
	"constructor",
];



/**
 * Compiles class inherited from abstract model managing described schema.
 *
 * @param {string} modelName name of model
 * @param {object} modelSchema definition of model's properties, computed properties and lifecycle hooks
 * @param {object} baseClass custom base class to derive model class from
 * @param {Adapter} adapter selects adapter to use on instances of resulting model by default
 * @returns {class<Model>} compiled model class
 * @alias ModelCompiler
 */
function compileModel( modelName, modelSchema = {}, baseClass = null, adapter = null ) {
	if ( typeof modelName !== "string" || !ptnKeyword.test( modelName ) ) {
		throw new TypeError( "invalid model name" );
	}

	// manage base class for deriving class to be defined from
	const _baseClass = baseClass == null ? Model : baseClass;
	const isDerived = _baseClass !== Model;

	if ( isDerived && !( _baseClass.prototype instanceof Model ) ) {
		throw new TypeError( "provided base class must be inheriting from AbstractModel" );
	}

	if ( adapter != null && !( adapter instanceof Adapter ) ) {
		throw new TypeError( "missing or invalid adapter" );
	}


	// validate and qualify provided schema definition
	const errors = [];
	const individualSchema = normalizeSchema( modelName, modelSchema, errors );

	if ( errors.length > 0 ) {
		throw new TypeError( `provided schema of model ${modelName} is invalid:\n${errors.join( "\n" )}` );
	}

	// create merged schema to be exposed in context of current model's class
	const parentSchema = isDerived ? _baseClass.schema || {} : normalizeSchema( "<empty>", {} );
	const mergedSchema = {};

	for ( const [section] of SchemaSections ) {
		mergedSchema[section] = Object.assign( {}, parentSchema[section], individualSchema[section] );
	}


	let DefinedModel;

	// eslint-disable-next-line no-eval
	eval( `DefinedModel = class ${modelName} extends _baseClass { 
		constructor( ...args ) { 
			super( ...args ); 
		}
	}` );



	const proto = DefinedModel.prototype;

	// customize prototype of defined model
	Object.defineProperties( proto, {
		/**
		 * Validates properties of current instance.
		 *
		 * @name Model#validate
		 * @prototype {function():Promise<Error[]>}
		 * @readonly
		 */
		validate: {
			value() {
				const myClass = this.constructor;
				const { schema, _validateProperties } = myClass;

				const { hooks } = schema;
				const { onBeforeValidate = [], onAfterValidate = [] } = hooks;


				if ( !onBeforeValidate.length && !onAfterValidate.length ) {
					return new Promise( resolve => resolve( _validateProperties.call( this ) ) );
				}


				let promise;

				if ( onBeforeValidate.length ) {
					promise = PromiseUtil.each( onBeforeValidate, hook => hook.call( this ) )
						.then( () => _validateProperties.call( this ) );
				} else {
					promise = new Promise( resolve => resolve( _validateProperties.call( this ) ) );
				}

				if ( onAfterValidate.length ) {
					promise = promise
						.then( _errors => PromiseUtil.each( onAfterValidate, hook => hook.call( this, _errors ) ) );
				}


				return promise;
			},
		},

		/**
		 * Exposes instance properties and methods defined in scope of base
		 * class.
		 *
		 * @name Model#$super
		 * @property {object}
		 * @readonly
		 */
		$super: { value: Object.create( isDerived ? baseClass.prototype : Object.prototype ) },
	} );


	// implement getter/setter for every defined property and method
	const { props, computed, methods } = individualSchema;

	Object.defineProperties( proto, compileProperties( proto, props ) );
	Object.defineProperties( proto, compileComputedProperties( proto, computed ) );
	Object.defineProperties( proto, compileMethods( proto, methods ) );


	// customize static methods and properties
	Object.defineProperties( DefinedModel, {
		/**
		 * @name Model.derivesFrom
		 * @property {class<Model>}
		 * @readonly
		 */
		derivesFrom: { value: _baseClass },

		/**
		 * @name Model.adapter
		 * @property {Adapter}
		 * @readonly
		 */
		adapter: { value: adapter },

		/**
		 * @name Model.name
		 * @property {string}
		 * @readonly
		 */
		name: { value: modelName },

		/**
		 * @name Model.schema
		 * @property {object}
		 * @readonly
		 */
		schema: { value: deepSeal( mergedSchema ) },

		/**
		 * @name Model._coerceProperties
		 * @property {function}
		 * @readonly
		 * @protected
		 */
		_coerceProperties: { value: compileCoercion( props ) },

		/**
		 * @name Model._coercionHandlers
		 * @property {object<string,function(*,string):*>}
		 * @readonly
		 * @protected
		 */
		_coercionHandlers: { value: compileCoercionMap( props ) },

		/**
		 * @name Model._validateProperties
		 * @property {function():Error[]}
		 * @readonly
		 * @protected
		 */
		_validateProperties: { value: compileValidator( props ) },

		/**
		 * @name Model._serializeProperties
		 * @property {function(object):object}
		 * @readonly
		 * @protected
		 */
		_serializeProperties: { value: compileSerializer( props ) },

		/**
		 * @name Model._deserializeProperties
		 * @property {function(object, object):object}
		 * @readonly
		 * @protected
		 */
		_deserializeProperties: { value: compileDeserializer( props ) },
	} );


	return DefinedModel;
}

/**
 * Detects if provided name is valid for naming an element of a model's schema.
 *
 * @param {string} name name of element to be tested
 * @returns {boolean} true if provided name is valid
 */
function isValidSchemaElementName( name ) {
	return typeof name === "string" &&
	       name.charAt( 0 ) !== "$" &&
	       ReservedSchemaElementNames.indexOf( name ) < 0;
}

/**
 * Normalizes schema definition.
 *
 * @param {string} modelName name of model schema is associated with
 * @param {object} schema definition to be normalized
 * @param {Error[]} errors collected errors encountered while processing definition
 * @returns {ModelSchema} normalized and qualified schema
 */
function normalizeSchema( modelName, schema = {}, errors = [] ) {
	if ( !modelName || typeof modelName !== "string" ) {
		throw new TypeError( "invalid name of model" );
	}

	if ( !schema || typeof schema !== "object" || Array.isArray( schema ) ) {
		throw new TypeError( "invalid model schema definition" );
	}

	const names = [];

	for ( const [ section, normalizer ] of SchemaSections ) {
		if ( !Object.prototype.hasOwnProperty.call( schema, section ) ) {
			schema[section] = {};
		}

		schema[section] = normalizer( modelName, schema[section], names, errors );
	}

	return schema;
}

/**
 * Validates and qualifies provided definition of actual properties.
 *
 * @note Due to included qualification the provided definition in `properties`
 *       might be changed.
 *
 * @param {string} modelName name of model definition of properties is used for
 * @param {object<string,object>} properties definition of properties, might be adjusted on return
 * @param {string[]} names collector of names used to detect naming conflicts
 * @param {Error[]} errors collector of encountered  errors
 * @returns {object<string,ModelType>} optionally qualified definition of properties
 * @throws TypeError on encountering severe issues with provided definition
 */
function normalizeSchemaProperties( modelName, properties, names, errors = [] ) {
	const propertyNames = Object.keys( properties );
	const numProperties = propertyNames.length;
	const qualified = {};

	if ( numProperties ) {
		for ( let i = 0; i < numProperties; i++ ) {
			const name = propertyNames[i];

			if ( isValidSchemaElementName( name ) ) {
				const property = properties[name];
				if ( property && typeof property === "object" && !Array.isArray( property ) ) {
					if ( !property.type ) {
						property.type = "string";
					}

					const type = Types.selectByName( property.type );
					if ( !type ) {
						errors.push( `invalid type "${property.type}" for property "${name}" of model "${modelName}"` );
					}

					if ( names.indexOf( name ) > -1 ) {
						errors.push( `duplicate use of name "${name}" in model "${modelName}` );
					} else {
						names.push( name );
					}

					qualified[name] = property;
				} else {
					errors.push( `invalid description of property "${name}" in model "${modelName}"` );
				}
			} else {
				errors.push( `invalid name of property "${name}" in model "${modelName}"` );
			}
		}
	} else {
		errors.push( "missing definition of any actual property" );
	}

	return qualified;
}

/**
 * Validates and qualifies provided definition of computed properties.
 *
 * @param {string} modelName name of model definition of properties is used for
 * @param {object<string,object>} computedProperties definition of computed properties
 * @param {string[]} names collector of names used to detect naming conflicts
 * @param {Error[]} errors collector of encountered errors
 * @returns {object} qualified definition of computed properties
 * @throws TypeError on encountering severe issues with provided definition
 */
function normalizeSchemaComputedProperties( modelName, computedProperties, names, errors = [] ) {
	const computedNames = Object.keys( computedProperties );
	const numComputed = computedNames.length;

	if ( numComputed ) {
		for ( let i = 0; i < numComputed; i++ ) {
			const name = computedNames[i];

			if ( isValidSchemaElementName( name ) ) {
				const computed = computedProperties[name];

				if ( typeof computed !== "function" ) {
					errors.push( `computed property "${name}" of model "${modelName}" must be a function` );
				}

				if ( names.indexOf( name ) > -1 ) {
					errors.push( `duplicate use of name "${name}" in model "${modelName}` );
				} else {
					names.push( name );
				}
			} else {
				errors.push( `invalid name of computed property "${name}" of model "${modelName}"` );
			}
		}
	}

	return computedProperties;
}

/**
 * Validates and qualifies provided definition of methods.
 *
 * @param {string} modelName name of model definition of properties is used for
 * @param {object<string,function>} methods definition of methods
 * @param {string[]} names collector of names used to detect naming conflicts
 * @param {Error[]} errors collector of encountered errors
 * @returns {object} qualified definition of methods
 * @throws TypeError on encountering severe issues with provided definition
 */
function normalizeSchemaMethods( modelName, methods, names, errors = [] ) {
	const methodNames = Object.keys( methods );
	const numMethods = methodNames.length;

	if ( numMethods ) {
		for ( let i = 0; i < numMethods; i++ ) {
			const name = methodNames[i];

			if ( isValidSchemaElementName( name ) ) {
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
 * @param {object<string,function>} hooks definition of hooks
 * @param {string[]} names collector of names used to detect naming conflicts
 * @param {Error[]} errors collector of encountered errors
 * @returns {object<string,function[]>} qualified definition of life cycle hooks
 * @throws TypeError on encountering severe issues with provided definition
 */
function normalizeSchemaHooks( modelName, hooks, names, errors = [] ) {
	const hookNames = Object.keys( hooks );
	const numHooks = hookNames.length;
	const qualified = {};

	if ( numHooks ) {
		for ( let i = 0; i < numHooks; i++ ) {
			const name = hookNames[i];

			if ( isValidSchemaElementName( name ) ) {
				const _name = name.replace( /^on([A-Z])/, ( _, leading ) => leading.toLowerCase() );

				if ( SupportedLifeCycleHooks.indexOf( _name ) < 0 ) {
					errors.push( `unknown life cycle hook "${name}" in model "${modelName}"` );
				} else {
					const hook = hooks[name];
					const handlers = Array.isArray( hook ) ? hook : hook ? [hook] : [];
					const numHandlers = handlers.length;

					for ( let j = 0; j < numHandlers; j++ ) {
						const handler = handlers[j];

						if ( typeof handler !== "function" ) {
							errors.push( `definition of life cycle hook "${name}" for model "${modelName}" may contain functions, only` );
						}
					}

					qualified[_name] = handlers;
				}
			} else {
				errors.push( `invalid name of life cycle hook "${name}" in model "${modelName}"` );
			}
		}
	}

	return qualified;
}

/**
 * Fetches type-specific set of handlers for either property given in provided
 * definition of actual properties.
 *
 * @param {object<string,object>} properties definition of properties
 * @param {string[]} errors collector for encountered errors
 * @returns {object<string,ModelType>} lists type-specific handlers for every defined property
 */
function getPropertyHandlers( properties, errors = [] ) {
	if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
		throw new TypeError( "definition of properties must be object" );
	}

	const names = Object.keys( properties );
	const handlers = {};

	for ( let i = 0, length = names.length; i < length; i++ ) {
		const name = names[i];
		const property = properties[name];

		const type = Types.selectByName( property.type );
		if ( type.checkDefinition( property, errors ) ) {
			handlers[name] = type;
		}
	}

	return handlers;
}

/**
 * Compiles coercion handlers for every property of model.
 *
 * @param {object<string,object>} properties definition of properties
 * @returns {object<string,function(*,object):*>} map of properties' names into either property's coercion handler
 */
function compileCoercionMap( properties ) {
	if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
		throw new TypeError( "definition of properties must be object" );
	}

	const coercions = {};

	const propertyNames = Object.keys( properties );
	for ( let ai = 0, aLength = propertyNames.length; ai < aLength; ai++ ) {
		const propertyName = propertyNames[ai];
		const property = properties[propertyName];

		( function( name, handler, definition ) {
			coercions[name] = value => handler.coerce( value, definition );
		} )( propertyName, Types.selectByName( property.type ), property );
	}

	return coercions;
}

/**
 * Creates single function coercing all properties of model in a row.
 *
 * @param {object<string,object>} properties definition of properties
 * @returns {function()} function concatenating coercion handlers of all defined properties
 */
function compileCoercion( properties ) {
	if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
		throw new TypeError( "definition of properties must be object" );
	}

	const propertiesNames = Object.keys( properties );
	const numProperties = propertiesNames.length;
	const coercion = [];

	for ( let ai = 0; ai < numProperties; ai++ ) {
		const propertyName = propertiesNames[ai];
		const property = properties[propertyName];

		const handler = Types.selectByName( property.type );

		const { args, body } = extractBody( handler.coerce );
		if ( args.length < 2 ) {
			throw new TypeError( `coerce() of ModelType for handling ${property.type} values must accept two arguments` );
		}

		coercion[ai] = `
{
	let ${args[0]} = __properties["${propertyName}"];
	const ${args[1]} = __propertyDefinitions["${propertyName}"];

	{
		${body.replace( ptnTrailingReturn, ( all, term ) => `__properties["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
	}

	// eslint-disable-next-line no-new-func
	return new Function( `
const __propertyDefinitions = this.constructor.schema.properties;
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
function compileValidator( properties ) {
	if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
		throw new TypeError( "definition of properties must be object" );
	}

	const propertiesNames = Object.keys( properties );
	const numProperties = propertiesNames.length;
	const validation = [];

	for ( let ai = 0; ai < numProperties; ai++ ) {
		const propertyName = propertiesNames[ai];
		const property = properties[propertyName];

		const handler = Types.selectByName( property.type );

		const { args, body } = extractBody( handler.isValid );
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
	return new Function( `
const __propertyDefinitions = this.constructor.schema.properties;
const __properties = this.$properties;
const __errors = [];

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
function compileSerializer( properties ) {
	if ( !properties || typeof properties !== "object" || Array.isArray( properties ) ) {
		throw new TypeError( "definition of properties must be object" );
	}

	const propertiesNames = Object.keys( properties );
	const numProperties = propertiesNames.length;
	const serialization = new Array( numProperties );

	for ( let ai = 0; ai < numProperties; ai++ ) {
		const propertyName = propertiesNames[ai];
		const property = properties[propertyName];

		const handler = Types.selectByName( property.type );

		const { args, body } = extractBody( handler.serialize );
		if ( args.length < 1 ) {
			throw new TypeError( `serialize() of ModelType for handling ${property.type} values must accept one argument` );
		}

		serialization[ai] = `
{
	let ${args[0]} = $$s["${propertyName}"];

	{
		${body.replace( ptnTrailingReturn, ( all, term ) => `$$d["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
	}

	// eslint-disable-next-line no-new-func
	return new Function( "$$input", `
const $$s = $$input && typeof $$input === "object" ? $$input : {};
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
function compileDeserializer( properties ) {
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

		const handler = Types.selectByName( property.type );
		let sourceName;

		// append deserialize() method of current property's type handler
		{
			const { args, body } = extractBody( handler.deserialize );
			if ( args.length < 1 ) {
				throw new TypeError( `deserialize() of ModelType for handling ${property.type} values must accept one argument` );
			}

			if ( body.replace( ptnTrailingReturn, "" ).trim().length ) {
				sourceName = "$$d";
				deserialization[write++] = `
{
	let ${args[0]} = $$s["${propertyName}"];

	{
		${body.replace( ptnTrailingReturn, ( all, term ) => `$$d["${propertyName}"] = ${term.trim()};` )}
	}
}
		`;
			} else {
				sourceName = "$$s";
			}
		}

		// append coerce() method of current property's type handler
		{
			const { args, body } = extractBody( handler.coerce );
			if ( args.length < 2 ) {
				throw new TypeError( `coerce() of ModelType for handling ${property.type} values must accept two arguments` );
			}

			deserialization[write++] = `
{
	let ${args[0]} = ${sourceName}["${propertyName}"];
	const ${args[1]} = $$attrs["${propertyName}"];

	{
		${body.replace( ptnTrailingReturn, ( all, term ) => `$$d["${propertyName}"] = ${term.trim()};` )}
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
 * @param {object} context reference on object resulting getters/setters will be defined on
 * @param {object<string,object>} properties definition of basic properties
 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
 */
function compileProperties( context, properties ) {
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
 * @param {object} context reference on object resulting getters/setters will be defined on
 * @param {object<string,function>} computedProperties definition of computed properties
 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
 */
function compileComputedProperties( context, computedProperties ) {
	const definition = {};
	const computedNames = Object.keys( computedProperties );
	const numComputeds = computedNames.length;

	for ( let i = 0; i < numComputeds; i++ ) {
		const name = computedNames[i];

		( ( computedName, computedFn ) => {
			definition[computedName] = {
				get() {
					return computedFn.call( this );
				},
				set( value ) {
					computedFn.call( this, value );
				},
				enumerable: true,
			};
		} )( name, computedProperties[name] );
	}

	return definition;
}

/**
 * Compiles definition of getters and setters for conveniently accessing
 * methods of model.
 *
 * @note This method assumes provided set of properties has been normalized before.
 *
 * @param {object} context reference on object resulting getters/setters will be defined on
 * @param {object<string,function>} methods definition of methods
 * @returns {ObjectPropertyDefinitions} map suitable for use with `Object.defineProperties()`
 */
function compileMethods( context, methods ) {
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



module.exports = compileModel;

// expose internal functions to enable individual unit testing
compileModel._utility = {
	normalizeSchema,
	normalizeSchemaProperties,
	normalizeSchemaComputedProperties,
	normalizeSchemaMethods,
	normalizeSchemaHooks,

	getPropertyHandlers,

	compileCoercion,
	compileValidator,
	compileSerializer,
	compileDeserializer,

	compileProperties,
	compileComputedProperties,
	compileMethods,
};
