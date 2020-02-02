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


const { describe, it, before, beforeEach, afterEach } = require( "mocha" );
require( "should" );

const { fakeApi } = require( "../helper" );

describe( "A hook related to the life-cycle event", () => {
	let Model;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model } = s ); } ) );

	[ "beforeCreate", "afterCreate", "beforeLoad", "afterLoad", "beforeValidate", "afterValidate", "beforeSave", "afterSave", "beforeRemove", "afterRemove" ]
		.forEach( eventName => {
			const isStatic = false;

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
									if ( eventName !== "beforeCreate" ) {
										// can't set properties in beforeCreate for being invoked too early
										this.a = "set";
										this.b = "set";
									}
								},
							}
						} );

						const Derived = Model.define( "Derived", {
							props: { b: {} },
							hooks: {
								[eventName]( ...args ) {
									this.$super[eventName].call( this, ...args );
								},
							}
						}, Parent );

						const item = new Derived();
						( () => item[eventName]() ).should.not.throw();

						if ( eventName !== "beforeCreate" ) {
							item.a.should.be.equal( "set" );
							item.b.should.be.equal( "set" );

							item.$properties.a.should.be.equal( "set" );
							item.$properties.b.should.be.equal( "set" );
						}
					} );
				}
			} );
		} );
} );

describe( "A model defining hook", () => {
	let Model;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { Model } = s ); } ) );

	describe( "beforeCreate()", () => {
		let MyModel, hookData;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {} },
				hooks: {
					beforeCreate( data ) {

						if ( data.options.onUnsaved === "fail" ) {
							hookData = JSON.parse( JSON.stringify( data ) );

							data.uuid = "00000000-0000-0000-0000-123412341234";
							data.options.onUnsaved = "ignore";
						} else {
							hookData = data;
						}

						return data;
					}
				}
			} );
		} );

		beforeEach( () => {
			hookData = null;
		} );

		it( "is invoking that hook", () => {
			( hookData == null ).should.be.true();

			new MyModel();

			hookData.should.be.Object().which.has.size( 2 ).and.has.properties( "uuid", "options" );
		} );

		it( "passing provided UUID", () => {
			( hookData == null ).should.be.true();

			new MyModel( "12345678-8765-4321-abcd-fedcba987654" );

			hookData.uuid.should.be.String().which.is.equal( "12345678-8765-4321-abcd-fedcba987654" );

			new MyModel( Buffer.from( "1234567887654321abcdfedcba987654", "hex" ) );

			hookData.uuid.should.be.instanceOf( Buffer ).which.has.length( 16 );
		} );

		it( "passing supported options as provided", () => {
			( hookData == null ).should.be.true();

			new MyModel( null, { onUnsaved: "ignore", arbitrary: "stuff" } );

			hookData.options.should.be.Object().which.has.size( 1 ).and.properties( "onUnsaved" );
			hookData.options.onUnsaved.should.be.String().which.is.equal( "ignore" );
		} );

		it( "processes data returned from hook", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( "12345678-8765-4321-abcd-fedcba987654", { onUnsaved: "fail" } );

			hookData.uuid.should.be.String().which.is.equal( "12345678-8765-4321-abcd-fedcba987654" );
			hookData.options.onUnsaved.should.be.String().which.is.equal( "fail" );

			item.uuid.should.be.String().which.is.equal( "00000000-0000-0000-0000-123412341234" );

			( () => { item.someProp = "a"; item.someProp = "b"; } ).should.not.throw();
		} );
	} );

	describe( "afterCreate()", () => {
		let MyModel, hookData, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {} },
				hooks: {
					afterCreate() {
						hookData = this.uuid;

						if ( mode === "assign" ) {
							this.someProp = "a";
							this.someProp = "b";

							mode = "assigned";
						}
					}
				}
			} );
		} );

		beforeEach( () => {
			hookData = false;
			mode = null;
		} );

		it( "is invoking that hook", () => {
			hookData.should.be.false();

			new MyModel();

			( hookData == null ).should.be.true();
		} );

		it( "is having access on created instance", () => {
			hookData.should.be.false();

			new MyModel( "98761234-abcd-abcd-efde-012301230000" );

			hookData.should.be.equal( "98761234-abcd-abcd-efde-012301230000" );
		} );

		it( "does not reject to re-assign property values by default", () => {
			hookData.should.be.false();

			mode = "assign";

			new MyModel();

			( hookData == null ).should.be.true();
			mode.should.be.equal( "assigned" );
		} );
	} );

	describe( "beforeLoad()", () => {
		let MyModel, hookData, uuid, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {} },
				hooks: {
					beforeLoad() {
						hookData = this.uuid;

						if ( mode === "fail" ) {
							throw new TypeError( "want to fail" );
						}
					}
				}
			} );

			const item = new MyModel();

			item.someProp = "fetched";

			return item.save()
				.then( () => {
					uuid = item.uuid;
				} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			( hookData == null ).should.be.true();

			return item.load().catch( () => {
				( hookData == null ).should.be.false();
			} );
		} );

		it( "is invoking that hook on an existing item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load().then( () => {
				hookData.should.be.equal( uuid );
			} );
		} );

		it( "can use this hook to enforce failed loading", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load().should.be.rejectedWith( "want to fail" );
		} );
	} );

	describe( "afterLoad()", () => {
		let MyModel, hookData, uuid, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {} },
				hooks: {
					afterLoad( record ) {
						hookData = record;

						if ( mode === "fail" ) {
							throw new TypeError( "want to fail" );
						}

						return record;
					}
				}
			} );

			const item = new MyModel();

			item.someProp = "fetched";

			return item.save()
				.then( () => {
					uuid = item.uuid;
				} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is not invoking that hook on a new item due to loading failed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			( hookData == null ).should.be.true();

			return item.load().catch( () => {
				( hookData == null ).should.be.true();
			} );
		} );

		it( "is invoking that hook on an existing item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load().then( () => {
				hookData.should.be.deepEqual( { someProp: "fetched" } );
			} );
		} );

		it( "can use this hook to enforce failed loading", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load().should.be.rejectedWith( "want to fail" );
		} );
	} );

	describe( "beforeValidate()", () => {
		let MyModel, hookData, uuid = null, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: {
					someProp: { required: true },
					anotherProp: { minLength: 5 },
				},
				hooks: {
					beforeValidate() {
						hookData = this.uuid || "missing UUID";

						switch ( mode ) {
							case "fail" :
								throw new TypeError( "want to fail" );

							case "softfail" :
								return [new Error( "want to fail softly" )];

							case "empty" :
								return [];

							case "assign" :
								this.someProp = "a";
								this.someProp = "b";

								mode = "assigned";
								break;
						}

						return undefined;
					}
				}
			} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		beforeEach( () => {
			const item = new MyModel( uuid );

			if ( uuid ) {
				return item.load()
					.then( () => {
						item.someProp = "fetched";

						return item.save();
					} );
			}

			item.someProp = "fetched";

			return item.save()
				.then( () => {
					uuid = item.uuid;
				} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on saving a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.should.be.equal( "missing UUID" );
			} );
		} );

		it( "is not invoking that hook on an existing item that is not even validated without changing anything", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();
				} )
				.then( () => item.save() )
				.then( () => {
					( hookData == null ).should.be.true();
				} );
		} );

		it( "is invoking that hook on an existing item that is not saved after failed validation", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = null;
				} )
				.then( () => item.save() )
				.catch( error => error.message.should.match( /invalid/i ) )
				.then( () => {
					hookData.should.be.equal( item.uuid );
				} );
		} );

		it( "is invoking that hook on an existing item that is saved after changing something", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.then( () => {
					hookData.should.be.equal( item.uuid );
				} );
		} );

		it( "can use this hook to enforce failed validation/saving", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail" );
				} );
		} );

		it( "can use this hook to enforce failed validation/saving preventing record in data storage from being changed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail" );
				} )
				.then( () => {
					const copy = new MyModel( uuid );

					return copy.load().then( () => {
						copy.someProp.should.be.equal( "fetched" );
					} );
				} );
		} );

		it( "can use this hook to enqueue another validation error causing failed validation/saving", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "softfail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail softly" );
				} );
		} );

		it( "can use this hook to enforce failed validation/saving preventing record in data storage from being changed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "softfail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail softly" );
				} )
				.then( () => {
					const copy = new MyModel( uuid );

					return copy.load().then( () => {
						copy.someProp.should.be.equal( "fetched" );
					} );
				} );
		} );

		it( "does not reject to re-assign property values by default", () => {
			( hookData == null ).should.be.true();

			mode = "assign";

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.should.be.equal( "missing UUID" );
				mode.should.be.equal( "assigned" );
			} );
		} );
	} );

	describe( "afterValidate()", () => {
		let MyModel, hookData, uuid = null, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: {
					someProp: { required: true },
					anotherProp: { minLength: 5 },
				},
				hooks: {
					afterValidate( errors ) {
						hookData = {
							uuid: this.uuid || "missing UUID",
							errors,
						};

						switch ( mode ) {
							case "fail" :
								throw new TypeError( "want to fail" );

							case "softfail" :
								return errors.concat( new Error( "want to fail softly" ) );

							case "assign" :
								this.someProp = "b";
								this.someProp = "bb";

								mode = "assigned";
								break;
						}

						return undefined;
					}
				}
			} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		beforeEach( () => {
			const item = new MyModel( uuid );

			if ( uuid ) {
				return item.load()
					.then( () => {
						item.someProp = "fetched";

						return item.save();
					} );
			}

			item.someProp = "fetched";

			return item.save()
				.then( () => {
					uuid = item.uuid;
				} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on saving a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.uuid.should.be.equal( "missing UUID" );
				hookData.errors.should.be.Array().which.is.empty();
			} );
		} );

		it( "is not invoking that hook on an existing item that is not even validated without changing anything", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();
				} )
				.then( () => item.save() )
				.then( () => {
					( hookData == null ).should.be.true();
				} );
		} );

		it( "is invoking that hook on an existing item that is not saved after failed validation", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = null;
				} )
				.then( () => item.save() )
				.catch( error => error.message.should.match( /invalid/i ) )
				.then( () => {
					hookData.uuid.should.be.equal( uuid );
					hookData.errors.should.be.Array().which.is.not.empty();
				} );
		} );

		it( "is invoking that hook on an existing item that is saved after changing something", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.then( () => {
					hookData.uuid.should.be.equal( uuid );
					hookData.errors.should.be.Array().which.is.empty();
				} );
		} );

		it( "can use this hook to enforce failed validation/saving", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail" );
				} );
		} );

		it( "can use this hook to enforce failed validation/saving preventing record in data storage from being changed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail" );
				} )
				.then( () => {
					const copy = new MyModel( uuid );

					return copy.load().then( () => {
						copy.someProp.should.be.equal( "fetched" );
					} );
				} );
		} );

		it( "can use this hook to enqueue another validation error causing failed validation/saving", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "softfail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail softly" );
				} );
		} );

		it( "can use this hook to enforce failed validation/saving preventing record in data storage from being changed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "softfail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.catch( error => {
					error.validationErrors.should.be.Array().which.has.length( 1 );
					error.validationErrors[0].message.should.be.equal( "want to fail softly" );
				} )
				.then( () => {
					const copy = new MyModel( uuid );

					return copy.load().then( () => {
						copy.someProp.should.be.equal( "fetched" );
					} );
				} );
		} );

		it( "does not reject to re-assign property values by default", () => {
			( hookData == null ).should.be.true();

			mode = "assign";

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.uuid.should.be.equal( "missing UUID" );
				hookData.errors.should.be.Array().which.is.empty();
				mode.should.be.equal( "assigned" );
			} );
		} );
	} );

	describe( "beforeSave()", () => {
		let MyModel, hookData, uuid = null, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {
					required: true,
				} },
				hooks: {
					beforeSave( existsAlready, record ) {
						hookData = {
							exists: existsAlready,
							record: JSON.parse( JSON.stringify( record ) )
						};

						if ( mode === "fail" ) {
							throw new TypeError( "want to fail" );
						}

						if ( mode === "assign" ) {
							this.someProp = "f";
							this.someProp = "g";

							mode = "assigned";
						}

						return record;
					}
				}
			} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		beforeEach( () => {
			const item = new MyModel( uuid );

			if ( uuid ) {
				return item.load()
					.then( () => {
						item.someProp = "fetched";

						return item.save();
					} );
			}

			item.someProp = "fetched";

			return item.save()
				.then( () => {
					uuid = item.uuid;
				} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on saving a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.should.be.Object().which.has.size( 2 ).and.properties( "record", "exists" );
				hookData.record.should.be.deepEqual( { someProp: "created" } );
				hookData.exists.should.be.false();
			} );
		} );

		it( "is not invoking that hook on an existing item that is not even saved without changing anything", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();
				} )
				.then( () => item.save() )
				.then( () => {
					( hookData == null ).should.be.true();
				} );
		} );

		it( "is not invoking that hook on an existing item that is not even saved after failed validation", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = null;
				} )
				.then( () => item.save() )
				.catch( error => error.message.should.match( /invalid/i ) )
				.then( () => {
					( hookData == null ).should.be.true();
				} );
		} );

		it( "is invoking that hook on an existing item that is saved after changing something", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.then( () => {
					hookData.should.be.Object().which.has.size( 2 ).and.properties( "record", "exists" );
					hookData.record.should.be.deepEqual( { someProp: "adjusted" } );
					hookData.exists.should.be.true();
				} );
		} );

		it( "can use this hook to enforce failed saving", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.should.be.rejectedWith( "want to fail" );
		} );

		it( "can use this hook to enforce failed saving preventing record in data storage from being changed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.should.be.rejectedWith( "want to fail" )
				.then( () => {
					const copy = new MyModel( uuid );

					return copy.load().then( () => {
						copy.someProp.should.be.equal( "fetched" );
					} );
				} );
		} );

		it( "does not reject to re-assign property values by default", () => {
			( hookData == null ).should.be.true();

			mode = "assign";

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.should.be.Object().which.has.size( 2 ).and.properties( "record", "exists" );
				hookData.record.should.be.deepEqual( { someProp: "created" } );
				hookData.exists.should.be.false();
				mode.should.be.equal( "assigned" );
			} );
		} );
	} );

	describe( "afterSave()", () => {
		let MyModel, hookData, uuid = null, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {
					required: true,
				} },
				hooks: {
					afterSave( existsAlready ) {
						hookData = {
							exists: existsAlready
						};

						if ( mode === "fail" ) {
							throw new TypeError( "want to fail" );
						}

						if ( mode === "assign" ) {
							this.someProp = "h";
							this.someProp = "kl";

							mode = "assigned";
						}
					}
				}
			} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		beforeEach( () => {
			const item = new MyModel( uuid );

			if ( uuid ) {
				return item.load()
					.then( () => {
						item.someProp = "fetched";

						return item.save();
					} );
			}

			item.someProp = "fetched";

			return item.save()
				.then( () => {
					uuid = item.uuid;
				} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on saving a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.should.be.Object().which.has.size( 1 ).and.properties( "exists" );
				hookData.exists.should.be.false();
			} );
		} );

		it( "is not invoking that hook on an existing item that is not even saved without changing anything", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();
				} )
				.then( () => item.save() )
				.then( () => {
					( hookData == null ).should.be.true();
				} );
		} );

		it( "is invoking that hook on an existing item that is saved after changing something", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.then( () => {
					hookData.should.be.Object().which.has.size( 1 ).and.properties( "exists" );
					hookData.exists.should.be.true();
				} );
		} );

		it( "can use this hook to enforce failed saving", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.should.be.rejectedWith( "want to fail" );
		} );

		it( "can use this hook to enforce failed saving though record has been actually saved then nonetheless", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.load()
				.then( () => {
					( hookData == null ).should.be.true();

					item.someProp.should.be.equal( "fetched" );

					item.someProp = "adjusted";
				} )
				.then( () => item.save() )
				.should.be.rejectedWith( "want to fail" )
				.then( () => {
					const copy = new MyModel( uuid );

					return copy.load().then( () => {
						copy.someProp.should.be.equal( "adjusted" );
					} );
				} );
		} );

		it( "does not reject to re-assign property values by default", () => {
			( hookData == null ).should.be.true();

			mode = "assign";

			const item = new MyModel();

			item.someProp = "created";

			( hookData == null ).should.be.true();

			return item.save().then( () => {
				hookData.should.be.Object().which.has.size( 1 ).and.properties( "exists" );
				hookData.exists.should.be.false();
				mode.should.be.equal( "assigned" );
			} );
		} );
	} );

	describe( "beforeRemove()", () => {
		let MyModel, hookData, uuid = null, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {} },
				hooks: {
					beforeRemove() {
						hookData = this.uuid || "missing UUID";

						if ( mode === "fail" ) {
							throw new TypeError( "want to fail" );
						}

						if ( mode === "assign" ) {
							this.someProp = "jukl";
							this.someProp = "osdj";

							mode = "assigned";
						}
					}
				}
			} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		beforeEach( () => {
			const item = new MyModel();

			item.someProp = "created";

			return item.save().then( () => {
				uuid = item.uuid;
			} );
		} );

		afterEach( () => {
			return new MyModel( uuid ).remove().catch( () => {} ); // eslint-disable-line no-empty-function
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on removing a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			( hookData == null ).should.be.true();

			return item.remove().then( () => {
				hookData.should.be.equal( "missing UUID" );
			} );
		} );

		it( "is invoking that hook on removing an existing item that hasn't been fully loaded", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.$exists.then( exists => {
				exists.should.be.true();

				return item.remove().then( () => {
					hookData.should.be.equal( uuid );

					return new MyModel( uuid ).$exists
						.then( _exists => {
							_exists.should.be.false();
						} );
				} );
			} );
		} );

		it( "is invoking that hook on removing an existing item that has been fully loaded", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.$exists.then( exists => {
				exists.should.be.true();

				return item.load()
					.then( () => item.remove() )
					.then( () => {
						hookData.should.be.equal( uuid );

						return new MyModel( uuid ).$exists
							.then( _exists => {
								_exists.should.be.false();
							} );
					} );
			} );
		} );

		it( "can use this hook to enforce failed removal", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.remove()
				.should.be.rejectedWith( "want to fail" );
		} );

		it( "can use this hook to enforce failed removal preventing record in data storage from being removed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.remove()
				.should.be.rejectedWith( "want to fail" )
				.then( () => {
					return new MyModel( uuid ).$exists
						.then( exists => {
							exists.should.be.true();
						} );
				} );
		} );

		it( "does not reject to re-assign property values by default", () => {
			( hookData == null ).should.be.true();

			mode = "assign";

			const item = new MyModel();

			( hookData == null ).should.be.true();

			return item.remove().then( () => {
				hookData.should.be.equal( "missing UUID" );
				mode.should.be.equal( "assigned" );
			} );
		} );
	} );

	describe( "afterRemove()", () => {
		let MyModel, hookData, uuid = null, mode;

		before( () => {
			MyModel = Model.define( "MyModel", {
				props: { someProp: {} },
				hooks: {
					afterRemove() {
						hookData = this.uuid || "missing UUID";

						if ( mode === "fail" ) {
							throw new TypeError( "want to fail" );
						}
					}
				}
			} );
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		beforeEach( () => {
			const item = new MyModel();

			item.someProp = "created";

			return item.save().then( () => {
				uuid = item.uuid;
			} );
		} );

		afterEach( () => {
			return new MyModel( uuid ).remove().catch( () => {} ); // eslint-disable-line no-empty-function
		} );

		beforeEach( () => {
			mode = null;
			hookData = null;
		} );

		it( "is invoking that hook on removing a new item", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel();

			( hookData == null ).should.be.true();

			return item.remove().then( () => {
				hookData.should.be.equal( "missing UUID" );
			} );
		} );

		it( "is invoking that hook on removing an existing item that hasn't been fully loaded", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.$exists.then( exists => {
				exists.should.be.true();

				return item.remove().then( () => {
					hookData.should.be.equal( uuid );

					return new MyModel( uuid ).$exists
						.then( _exists => {
							_exists.should.be.false();
						} );
				} );
			} );
		} );

		it( "is invoking that hook on removing an existing item that has been fully loaded", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			return item.$exists.then( exists => {
				exists.should.be.true();

				return item.load()
					.then( () => item.remove() )
					.then( () => {
						hookData.should.be.equal( uuid );

						return new MyModel( uuid ).$exists
							.then( _exists => {
								_exists.should.be.false();
							} );
					} );
			} );
		} );

		it( "can use this hook to enforce failed removal", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.remove()
				.should.be.rejectedWith( "want to fail" );
		} );

		it( "can use this hook to enforce failed removal preventing record in data storage from being removed", () => {
			( hookData == null ).should.be.true();

			const item = new MyModel( uuid );

			mode = "fail";

			return item.remove()
				.should.be.rejectedWith( "want to fail" )
				.then( () => {
					return new MyModel( uuid ).$exists
						.then( exists => {
							exists.should.be.false();
						} );
				} );
		} );
	} );
} );
