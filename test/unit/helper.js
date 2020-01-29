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

const Path = require( "path" );

const { each: PromiseEach } = require( "promise-essentials" );
const { Find } = require( "file-essentials" );

/**
 * Retrieves list of values covering all basic kinds of data supported in
 * Javascript.
 *
 * @returns {*[]} list of values
 */
function allTypesOfData() {
	return [
		undefined,
		null,
		false,
		true,
		{},
		{ property: "value" },
		[ "item", "item" ],
		"",
		"hello world",
		0,
		NaN,
		-Infinity,
		Number( Infinity ),
		-10.5,
		+10.5,
		() => {}, // eslint-disable-line no-empty-function
		() => "",
		function() { return ""; },
	];
}

module.exports = Object.seal( {
	allTypesOfData,
	allTypesOfDataButNullLike() {
		return allTypesOfData().filter( i => i != null );
	},
	allComparisonOperations() {
		return [
			"eq",
			"neq",
			"noteq",
			"not",
			"null",
			"notnull",
			"between",
			"lt",
			"lte",
			"gt",
			"gte",
		];
	},
	fakeApi( mockedAPI = {}, mockedOptions = {} ) {
		const relFolder = "../..";
		const baseFolder = Path.resolve( __dirname, relFolder );

		for ( const name of [ "runtime", "config" ] ) {
			if ( !mockedAPI[name] ) {
				mockedAPI[name] = {};
			}
		}

		return _loadComponents().then( () => _loadConfig() ).then( () => mockedAPI );

		function _loadComponents() {
			return PromiseEach( [
				[ "model", "models" ],
				[ "service", "services" ],
				[ "policy", "policies" ],
				[ "controller", "controllers" ],
			], ( [ singular, plural ] ) => {
				if ( !mockedAPI.runtime[plural] ) {
					mockedAPI.runtime[plural] = {};
				}

				if ( !mockedAPI.runtime[singular] ) {
					mockedAPI.runtime[singular] = mockedAPI.runtime[plural];
				}

				return _load( Path.resolve( baseFolder, "api", singular ) )
					.then( () => _load( Path.resolve( baseFolder, "api", plural ) ) );

				function _load( localFolder ) {
					return Find( localFolder, {
						depthFirst: false,
						converter: ( name, qname, stats ) => ( stats.isFile() && name.endsWith( ".js" ) ? name : null ),
					} )
						.then( files => {
							const ptn = new RegExp( "[^\\" + Path.sep + "]+", "g" );

							files.sort( ( l, r ) => {
								const ls = l.replace( ptn, "" ).length;
								const rs = r.replace( ptn, "" ).length;

								return ls < rs ? -1 : ls > rs ? 1 : l.localeCompare( r );
							} );

							files.forEach( file => {
								const name = file
									.replace( /\.js$/, "" )
									.replace( new RegExp( "\\" + Path.sep + "(?:[0-9]{1,2}-)?", "g" ), "-" )
									.toLowerCase()
									.replace( /(?:^|-)([a-z])/g, ( _, leading ) => leading.toUpperCase() );

								try {
									const module = require( Path.join( localFolder, file ) );

									mockedAPI.runtime[plural][name] = typeof module === "function" && module.useCMP !== false ? module.call( mockedAPI, mockedOptions ) : module;
								} catch ( error ) {
									console.error( "loading service component %s failed: %s", name, error.stack );
									throw error;
								}
							} );
						} );
				}
			} );
		}

		function _loadConfig() {
			const localFolder = Path.resolve( baseFolder, "config" );

			return Find( localFolder, {
				depthFirst: false,
				converter: ( name, qname, stats ) => ( stats.isFile() && !name.startsWith( "." ) && name.endsWith( ".js" ) ? qname : null ),
			} )
				.then( files => files.forEach( file => {
					if ( file !== Path.resolve( localFolder, "local.js" ) ) {
						let config;

						try {
							const module = require( file );

							config = typeof module === "function" && module.useCMP !== false ? module.call( mockedAPI, mockedOptions ) : module;
						} catch ( error ) {
							console.error( "loading config from %s failed: %s", file, error.stack );
							throw error;
						}

						Object.assign( mockedAPI.config, config );
					}
				} ) );
		}
	},
} );
