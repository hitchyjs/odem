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

module.exports = function() {
	const api = this;
	const { services: Services } = api.runtime;
	const logDebug = api.log( "hitchy:odem:debug" );

	/**
	 * Implements abstract base for any tester supported by model collection
	 * processing.
	 *
	 * @alias this.runtime.services.OdemModelTester
	 */
	class OdemModelTester {
		/**
		 * Compiles tester instance according to provided test description.
		 *
		 * @abstract
		 *
		 * @param {class<Model>} ModelClass class of model to be tested
		 * @param {object} description describes test to compile
		 * @param {string} testType names type of test or its actual operation
		 * @param {string} sortBy name of property finally resulting list of matches will be sorted by (provided to help optimizing tester)
		 * @param {boolean} sortAscendingly true if provided property will be used eventuall to sort in ascending order (provided to help optimizing tester)
		 * @returns {OdemModelTester} compiled tester
		 */
		static fromDescription( ModelClass, description, testType = null, { sortBy = null, sortAscendingly = true } = {} ) { // eslint-disable-line no-unused-vars
			if ( !description || typeof description !== "object" ) {
				throw new TypeError( "invalid test description" );
			}

			const operations = Object.keys( description );
			if ( operations.length !== 1 ) {
				throw new TypeError( "invalid test description with no or multiple operations" );
			}

			const operation = operations[0];

			const testerClass = Services.OdemModelTesterMap[operation];
			if ( !testerClass ) {
				throw new TypeError( `unknown test operation: ${operation}` );
			}

			logDebug( "using %s for picking matches of model %s", testerClass.name, ModelClass.name );

			const tester = testerClass.fromDescription( ModelClass, description[operation], operation, { sortBy, sortAscendingly } );
			if ( !( tester instanceof this ) ) {
				throw new TypeError( "invalid type of compiled tester" );
			}

			return tester;
		}

		/**
		 * Creates stream generating instances of provided model's class matching
		 * test.
		 *
		 * @return {ReadableStream<Model>} stream of provided model's instances
		 */
		createStream() {
			throw new Error( "abstract tester does not provide actual stream" );
		}
	}

	return OdemModelTester;
};
