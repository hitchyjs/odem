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


const Compiler = require( "./compiler" );
const Model = require( "./base" );
const ModelAttributeTypes = require( "./type" );
const { defaultAdapter } = require( "../defaults" );


/**
 * Compiles provided schema into model class derived from AbstractModel or
 * some explicitly provided model class.
 *
 * @param {string} modelName name of model
 * @param {object} schema definition of model's schema
 * @param {class} customBaseClass model class inheriting from AbstractModel
 * @param {Adapter} adapter selects adapter to use on instances of resulting model by default
 * @returns {class} compiled model class
 */
Model.define = function( modelName, schema, customBaseClass = null, adapter = defaultAdapter ) {
	return Compiler( modelName, schema, customBaseClass, adapter );
};

module.exports = {
	Model,
	ModelAttributeTypes,
};
