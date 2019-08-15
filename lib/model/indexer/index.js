/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
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

const map = {
	EqualityIndex: require( "./equality" ),
};

const typesMap = new Map();

Object.values( map ).forEach( handler => {
	handler.indexTypes.forEach( name => {
		typesMap.set( name, handler );
	} );
} );

/**
 * Implements mapper for index type names into index handler classes.
 */
class IndexTypes {
	/**
	 * Fetches class implementing handler for selected type of index.
	 *
	 * @param {string} typeName index type name
	 * @returns {class<AbstractIndex>} class implementing handler for selected type of index
	 */
	static select( typeName ) {
		if ( typesMap.has( typeName ) ) {
			return typesMap.get( typeName );
		}

		if ( typesMap.has( typeName.toLowerCase() ) ) {
			return typesMap.get( typeName.toLowerCase() );
		}

		throw new TypeError( `request for handler of unknown type of index ${typeName}` );
	}

	/**
	 * Detects if there is a handler for named type of index.
	 *
	 * @param {string} typeName name of type of look up
	 * @returns {boolean} true if type is supported, false otherwise
	 */
	static has( typeName ) {
		return typesMap.has( typeName ) || typesMap.has( typeName.toLowerCase() );
	}
}

map.IndexTypes = IndexTypes;

module.exports = map;
