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


const { describe, it } = require( "mocha" );
require( "should" );

const { Model } = require( "../../../" );


describe( "A hook related to the life-cycle event", () => {
	[ "beforeCreate", "afterCreate", "beforeValidate", "afterValidate", "beforeSave", "afterSave", "beforeRemove", "afterRemove" ]
		.forEach( eventName => {
			const isStatic = eventName === "beforeCreate";

			describe( `"${eventName}"`, () => {
				const altName = "on" + eventName.charAt( 0 ).toUpperCase() + eventName.slice( 1 );

				it( "can be defined", () => {
					const MyModel = Model.define( "MyModel", {
						props: {
							a: {},
						},
						hooks: {
							[eventName]() {}, // eslint-disable-line no-empty-function
						},
					} );

					if ( isStatic ) {
						MyModel[eventName].should.be.a.Function();
					} else {
						MyModel.prototype[eventName].should.be.a.Function();
					}
				} );

				it( `can be defined using alternative name "${altName}" in definition`, () => {
					const MyModel = Model.define( "MyModel", {
						props: {
							a: {},
						},
						hooks: {
							[altName]() {}, // eslint-disable-line no-empty-function
						},
					} );

					if ( isStatic ) {
						MyModel[eventName].should.be.a.Function();
					} else {
						MyModel.prototype[eventName].should.be.a.Function();
					}
				} );

				it( `is exposed in${isStatic ? "" : " prototype of"} resulting model`, () => {
					const MyModel = Model.define( "MyModel", {
						props: {
							a: {},
						},
						hooks: {
							[eventName]() {}, // eslint-disable-line no-empty-function
						},
					} );

					if ( isStatic ) {
						MyModel[eventName].should.be.a.Function();
					} else {
						MyModel.prototype[eventName].should.be.a.Function();
					}
				} );

				if ( !isStatic ) {
					it( "is available in context of single instance of defined model", () => {
						const MyModel = Model.define( "MyModel", {
							props: {
								a: {},
							},
							hooks: {
								[eventName]() {}, // eslint-disable-line no-empty-function
							},
						} );

						const item = new MyModel();

						item[eventName].should.be.a.Function();
					} );
				}

				it( "may be used though omitted in definition", () => {
					const MyModel = Model.define( "MyModel", {
						props: {
							a: {},
						},
						hooks: {},
					} );

					if ( isStatic ) {
						MyModel[eventName].should.be.a.Function();
					} else {
						MyModel.prototype[eventName].should.be.a.Function();

						const item = new MyModel();

						item[eventName].should.be.a.Function();
					}
				} );

				it( "can be tested for being defined", () => {
					let MyModel = Model.define( "MyModel", {
							props: {
								a: {},
							},
							hooks: {},
						} ), item;

					if ( isStatic ) {
						Object.prototype.hasOwnProperty.call( MyModel, eventName ).should.be.false();
					} else {
						Object.prototype.hasOwnProperty.call( MyModel.prototype, eventName ).should.be.false();

						item = new MyModel();

						Object.prototype.hasOwnProperty.call( Object.getPrototypeOf( item ), eventName ).should.be.false();
					}

					MyModel = Model.define( "MyModel", {
						props: {
							a: {},
						},
						hooks: {
							[eventName]() {}, // eslint-disable-line no-empty-function
						},
					} );

					if ( isStatic ) {
						Object.prototype.hasOwnProperty.call( MyModel, eventName ).should.be.true();
					} else {
						Object.prototype.hasOwnProperty.call( MyModel.prototype, eventName ).should.be.true();

						item = new MyModel();

						Object.prototype.hasOwnProperty.call( Object.getPrototypeOf( item ), eventName ).should.be.true();
					}
				} );

				if ( isStatic ) {
					it( "can invoke related hook defined in context of model current one is derived from", () => {
						let invoked = false;

						const Parent = Model.define( "Parent", {
							props: { a: {} },
							hooks: {
								[eventName]() {
									invoked = true;
								},
							}
						} );

						const Derived = Model.define( "Derived", {
							props: { b: {} },
							hooks: {
								[eventName]() {
									this.derivesFrom[eventName]();
								},
							}
						}, Parent );

						( () => Derived[eventName]() ).should.not.throw();

						invoked.should.be.true();
					} );
				} else {
					it( "can invoke related hook defined in context of instance of model current one is derived from", () => {
						const Parent = Model.define( "Parent", {
							props: { a: {} },
							hooks: {
								[eventName]() {
									this.a = "set";
									this.b = "set";
								},
							}
						} );

						const Derived = Model.define( "Derived", {
							props: { b: {} },
							hooks: {
								[eventName]() {
									this.$super[eventName].call( this );
								},
							}
						}, Parent );

						const item = new Derived();
						( () => item[eventName]() ).should.not.throw();

						item.a.should.be.equal( "set" );
						item.b.should.be.equal( "set" );

						item.$properties.a.should.be.equal( "set" );
						item.$properties.b.should.be.equal( "set" );
					} );
				}
			} );
		} );
} );
