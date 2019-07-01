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

const ptnCamel = /(\S)([A-Z])/g;
const ptnSnake = /(\S)_+(\S)/g;
const ptnKebab = /(\S)-+(\S)/g;


/**
 * Converts string from camelCase to snake_case.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function camelToSnake( string ) {
	return string.replace( ptnCamel, ( all, predecessor, match ) => predecessor + "_" + match.toLocaleLowerCase() );
}

/**
 * Converts string from camelCase to kebab-case.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function camelToKebab( string ) {
	return string.replace( ptnCamel, ( all, predecessor, match ) => predecessor + "-" + match.toLocaleLowerCase() );
}

/**
 * Converts string from snake_case to camelCase.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function snakeToCamel( string ) {
	return string.replace( ptnSnake, ( all, predecessor, match ) => predecessor + match.toLocaleUpperCase() );
}

/**
 * Converts string from snake_case to kebab-case.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function snakeToKebab( string ) {
	return string.replace( ptnSnake, ( all, predecessor, match ) => predecessor + "-" + match );
}

/**
 * Converts string from kebab-case to camelCase.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function kebabToCamel( string ) {
	return string.replace( ptnKebab, ( all, predecessor, match ) => predecessor + match.toLocaleUpperCase() );
}

/**
 * Converts string from kebab-case to PascalCase.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function kebabToPascal( string ) {
	const camel = kebabToCamel( string );

	return camel.slice( 0, 1 ).toUpperCase() + camel.slice( 1 );
}

/**
 * Converts string from kebab-case to snake_case.
 *
 * @param {string} string string to convert
 * @returns {string} converted string
 */
function kebabToSnake( string ) {
	return string.replace( ptnKebab, ( all, predecessor, match ) => predecessor + "_" + match );
}

/**
 * Converts string from kebab-case to PascalCase ignoring uppercase letters in
 * provided string unless it looks like PascalCase string already.
 *
 * @param {string} string string to convert, uppercase letters are lost unless it's considered PascalCase already
 * @returns {string} converted string
 */
function autoKebabToPascal( string ) {
	if ( ( parseFloat( process.versions.node ) >= 10.3 ? /^\s*(\p{Lu}\p{Ll}*)+\s*$/u : /^\s*([A-Z][a-z]*)+\s*$/ ).test( string ) ) {
		return string;
	}

	const camel = kebabToCamel( String( string ).toLocaleLowerCase() );

	return camel.slice( 0, 1 ).toUpperCase() + camel.slice( 1 );
}


module.exports = Object.seal( {
	camelToSnake,
	camelToKebab,
	snakeToCamel,
	snakeToKebab,
	kebabToCamel,
	kebabToPascal,
	kebabToSnake,

	autoKebabToPascal,

	// keep supporting previous version of API using names with German spelling
	camelToKebap: camelToKebab,
	snakeToKebap: snakeToKebab,
	kebapToCamel: kebabToCamel,
	kebapToPascal: kebabToPascal,
	kebapToSnake: kebabToSnake,

	/**
	 * Detects if some string contains valid keyword or not.
	 *
	 * @type {RegExp}
	 * @readonly
	 */
	ptnKeyword: /^[a-z][a-z0-9_]*$/i,
} );

global.hitchyPtnKeyword = module.exports.ptnKeyword;
