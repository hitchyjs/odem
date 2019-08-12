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

const Adapters = require( "./lib/adapter" );
const Models = require( "./lib/model" );
const Utilities = require( "./lib/utility" );
const { processDiscoveredModelDefinitions } = require( "./lib/hitchy-integration" );

const { Adapter, MemoryAdapter } = Adapters;


module.exports = Object.assign( {},
	Models,
	Adapters,
	Utilities,
	{
		defaults: require( "./lib/defaults" )
	}, {
		onExposed( /* options */ ) {
			const that = this;
			const { log, runtime: { models, config } } = that;
			const Log = log( "odem" );

			// choose configured default adapter for storing model instances
			let adapter = ( config.database || {} ).default;
			if ( adapter ) {
				if ( !( adapter instanceof Adapter ) ) {
					Log( "invalid adapter:", adapter );
					return;
				}
			} else {
				adapter = new MemoryAdapter();
			}

			processDiscoveredModelDefinitions( that, models, adapter );
		}
	}
);
