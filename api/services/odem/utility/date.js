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
	 * Implements date-related utilities.
	 */
	class OdemUtilityDate {
	}

	Object.defineProperties( OdemUtilityDate, {
		/**
		 * Matches any string representing date in ISO-8601 form.
		 *
		 * @type {RegExp}
		 * @readonly
		 */
		ptnISO8601: {
			value: /^\s*(?:\d\d\d\d-\d\d?-\d\d?)(?:T\d\d:\d\d:\d\d(?:[.,]\d+)?)?(?:Z|[+-]\d\d?:\d\d)?\s*$/i,
			enumerable: true,
		},
	} );

	/*
	 * Expose patterns used in re-compiled methods of model attribute type handlers
	 * running w/o their current closure scope in recompiled use cases.
	 */
	global.hitchyPtnISO8601 = OdemUtilityDate.ptnISO8601;

	return OdemUtilityDate;
};

