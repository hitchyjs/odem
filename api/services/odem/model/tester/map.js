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
	const api = this; // eslint-disable-line consistent-this
	const { services: Services } = api.runtime;

	/**
	 * Maps operator names used in query filters into classes implementing test
	 * for picking records considered matches accordingly.
	 */
	class OdemModelTesterMap {
		/* eslint-disable require-jsdoc */
		static get true() { return Services.OdemModelTesterNonIndexedAll; }

		static get eq() { return Services.OdemModelTesterIndexedEquality; }

		static get neq() { return Services.OdemModelTesterNonIndexedComparison; }

		static get lt() { return Services.OdemModelTesterNonIndexedComparison; }

		static get gt() { return Services.OdemModelTesterNonIndexedComparison; }

		static get lte() { return Services.OdemModelTesterNonIndexedComparison; }

		static get gte() { return Services.OdemModelTesterNonIndexedComparison; }

		static get null() { return Services.OdemModelTesterIndexedNull; }

		static get notnull() { return Services.OdemModelTesterIndexedNotNull; }

		static get between() { return Services.OdemModelTesterIndexedBetween; }
		/* eslint-enable require-jsdoc */
	}

	return OdemModelTesterMap;
};
