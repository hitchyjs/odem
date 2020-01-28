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

module.exports = function() {
	/**
	 * Implements function-related utility functions.
	 */
	class OdemUtilityFunction {
		/**
		 * Extracts body of function.
		 *
		 * @param {function} fn function to extract body from
		 * @returns {{args:string[], body:string}} extracted body and names of arguments
		 */
		static extractBody( fn ) {
			if ( typeof fn !== "function" ) {
				throw new TypeError( "not a function" );
			}

			const code = String( fn ).replace( /\/\*.*?\*\//g, "" );

			if ( !/^\s*[a-z_]\w*\s*(?:\*\s*)?\(/i.test( code ) ) {
				return this.extractBodyFromArrowFunction( code );
			}

			return this.extractBodyFromRegularFunction( code );
		}


		/**
		 * Extracts body and names of arguments of traditional function declaration.
		 *
		 * @param {string} code code of whole function to extract body from
		 * @returns {{args:string[], body:string}} extracted body and names of arguments
		 */
		static extractBodyFromRegularFunction( code ) {
			const ptnParentheses = /[)(]/g;

			let endOfArgsAt = -1;
			let depth = 0;
			let match;

			while ( endOfArgsAt < 0 && ( match = ptnParentheses.exec( code ) ) ) {
				switch ( match[0] ) {
					case "(" :
						depth++;
						break;

					case ")" :
						if ( depth-- === 1 ) {
							endOfArgsAt = match.index + 1;
						}
						break;
				}
			}

			const args = this.extractArgs( code
				.slice( code.indexOf( "(" ) + 1, code.lastIndexOf( ")", endOfArgsAt ) )
				.trim() );


			const codeFrom = code.indexOf( "{", endOfArgsAt );
			const codeUntil = code.lastIndexOf( "}" );

			const body = codeFrom > -1 && codeFrom < codeUntil ? code
				.slice( codeFrom + 1, codeUntil )
				.trim() : "";


			return {
				args,
				body,
			};
		}

		/**
		 * Extracts body of ES6 arrow function declaration.
		 *
		 * @param {string} code code of whole function to extract body from
		 * @returns {{args:string[], body:string}} extracted body and names of arguments
		 */
		static extractBodyFromArrowFunction( code ) {
			const ptnArrowBody = /^(?:\s*{)([\s\S]*)(?:}\s*)$/;

			let [ argsCode, ...rest ] = code.split( "=>" ); // eslint-disable-line prefer-const
			const bodyCode = rest.join( "=>" );

			const firstParen = argsCode.indexOf( "(" );
			const lastParen = argsCode.lastIndexOf( ")" );

			if ( firstParen > -1 && lastParen > -1 ) {
				argsCode = argsCode.slice( firstParen + 1, lastParen ).trim();
			}

			const match = ptnArrowBody.exec( bodyCode );
			const body = match ? match[1] : `return ${bodyCode.trim()};`;

			return {
				args: this.extractArgs( argsCode ),
				body: body.trim(),
			};
		}

		/**
		 * Extracts list of argument names from provided code declaring arguments
		 * accepted by function.
		 *
		 * @param {string} argsCode code declaring arguments as part of a function definition
		 * @returns {string[]} names of arguments found in provided declaration
		 */
		static extractArgs( argsCode ) {
			const ptnAllButOpenBraces = /[^{]+/g;
			const ptnAllButCloseBraces = /[^}]+/g;
			const ptnAllButOpenBrackets = /[^[]+/g;
			const ptnAllButCloseBrackets = /[^\]]+/g;
			const ptnStripDefaultValue = /\s*=.+$/;

			const args = argsCode
				.trim()
				.split( /\s*,\s*/ );

			for ( let i = 0, length = args.length; i < length; i++ ) {
				const arg = args[i];

				if ( ( arg.replace( ptnAllButOpenBraces, "" ).length !== arg.replace( ptnAllButCloseBraces, "" ).length ) ||
				     ( arg.replace( ptnAllButOpenBrackets, "" ).length !== arg.replace( ptnAllButCloseBrackets, "" ).length ) ) {
					throw new TypeError( "no support for extracting function w/ destructuring arguments" );
				}

				args[i] = arg.replace( ptnStripDefaultValue, "" );
			}

			if ( args.length === 1 && args[0] === "" ) {
				args.splice( 0, 1 );
			}

			return args;
		}
	}

	Object.defineProperties( OdemUtilityFunction, {
		/**
		 * Detects Javascript return-statement at end of some string considered to
		 * contain javascript code.
		 *
		 * @name OdemUtilityFunction.ptnTrailingReturn
		 * @property {RegExp}
		 * @readonly
		 */
		ptnTrailingReturn: {
			value: /\breturn\b([\s\S]+?);?\s*$/,
			enumerable: true,
		},
	} );

	return OdemUtilityFunction;
};
