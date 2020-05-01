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

const { Model: RawModel } = require( "../../../.." );

module.exports = {
	models( req, res ) {
		res.json( Object.keys( this.api.runtime.models ) );
	},

	modelClass( req, res ) {
		const { Model } = this.api.runtime.services;

		res.json( Boolean( Model && Model.define && Model.list && Model.find ) );
	},

	modelImplicitInstance( req, res ) {
		const { BasicData } = this.api.runtime.models;

		const item = new BasicData();

		return item.save()
			.then( () => {
				res.json( item.toObject() );
			} );
	},

	modelImplicitCmfpInstance( req, res ) {
		const { CmfpRegular } = this.api.runtime.models;

		const item = new CmfpRegular();

		return item.save()
			.then( () => {
				res.json( item.toObject() );
			} );
	},

	modelExplicitInstance( req, res ) {
		const ExtraModel = this.api.runtime.services.Model.define( "RawModel", {
			props: {
				someString: {},
			},
			hooks: {
				beforeValidate() {
					this.someString = Object.keys( this.$api.runtime.models ).join( "," );
				},
			},
		} );

		const item = new ExtraModel();

		return item.save()
			.then( () => {
				res.json( item.toObject() );
			} );
	},

	modelExplicitRawInstance( req, res ) {
		const ExtraRawModel = RawModel.define( "RawModel", {
			props: {
				someString: {},
			},
			hooks: {
				beforeValidate() {
					this.someString = Object.keys( this.$api.runtime.models ).join( "," );
				},
			},
		} );

		const item = new ExtraRawModel();

		return item.save()
			.then( () => {
				res.json( item.toObject() );
			} );
	},
};
