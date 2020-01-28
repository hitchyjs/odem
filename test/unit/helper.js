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
	loadAllServices( mockedAPI = {}, mockedOptions = {} ) {
		if ( !mockedAPI.runtime ) {
			mockedAPI.runtime = {};
		}

		if ( !mockedAPI.runtime.services ) {
			mockedAPI.runtime.services = {};
		}

		const relFolder = "../../api/services";
		const baseFolder = Path.resolve( __dirname, relFolder );

		return Find( baseFolder, {
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
						const module = require( Path.join( relFolder, file ) );

						mockedAPI.runtime.services[name] = typeof module === "function" && module.useCMP !== false ? module.call( mockedAPI, mockedOptions ) : module;
					} catch ( error ) {
						console.error( "loading service component %s failed: %s", name, error.stack );
						throw error;
					}
				} );

				return mockedAPI.runtime.services;
			} );
	},
} );
