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
	const api = this;
	const { services: Services } = api.runtime;

	/**
	 * Implements scalar type `date` for use with attributes of defined models.
	 *
	 * @name OdemModelTypeDate
	 * @extends ModelType
	 */
	class OdemModelTypeDate extends Services.OdemModelType {
		/** @inheritDoc */
		static get typeName() {
			return "date";
		}

		/** @inheritDoc */
		static get aliases() {
			return [ "datetime", "timestamp" ];
		}

		/** @inheritDoc */
		static checkDefinition( definition ) {
			const errors = super.checkDefinition( definition );
			if ( !errors.length ) {
				let { min, max } = definition;
				const { step } = definition;

				if ( min != null ) {
					switch ( typeof min ) {
						case "string" :
							if ( Services.OdemUtilityNumber.ptnFloat.test( min ) ) {
								min = parseFloat( min );
							}

						// falls through
						case "number" :
							definition.min = min = new Date( min );
							break;

						case "object" :
							if ( min instanceof Date ) {
								break;
							}

						// falls through
						default :
							definition.min = min = NaN;
					}

					if ( isNaN( min ) ) {
						errors.push( new TypeError( "invalid requirement on minimum timestamp" ) );
					}
				}

				if ( max != null ) {
					switch ( typeof max ) {
						case "string" :
							if ( Services.OdemUtilityNumber.ptnFloat.test( max ) ) {
								max = parseFloat( max );
							}

						// falls through
						case "number" :
							definition.max = max = new Date( max );
							break;

						case "object" :
							if ( max instanceof Date ) {
								break;
							}

						// falls through
						default :
							definition.max = max = NaN;
					}

					if ( isNaN( max ) ) {
						errors.push( new TypeError( "invalid requirement on maximum timestamp" ) );
					}
				}

				if ( min && max && min.getTime() > max.getTime() ) {
					definition.min = max;
					definition.max = min;
				}

				if ( step != null && ( !step || step < 0 || typeof step === "object" || !Services.OdemUtilityNumber.ptnFloat.test( step ) ) ) {
					errors.push( new TypeError( "invalid requirement on value stepping" ) );
				}
			}

			return errors;
		}

		/* eslint-disable no-param-reassign */
		/** @inheritDoc */
		static coerce( value, requirements, defaultMarker ) {
			if ( value === defaultMarker && requirements ) {
				value = requirements.default;
			}

			if ( value == null || value === "" ) {
				value = null;
			} else {
				switch ( typeof value ) {
					case "string" :
						value = value.trim();
						if ( !value.length ) {
							value = null;
							break;
						}

						if ( global.hitchyPtnFloat.test( value ) ) {
							value = parseFloat( value );
						} else {
							value = Date.parse( value );
						}

					// falls through
					case "number" :
						if ( !isNaN( value ) ) {
							value = new Date( Math.trunc( value ) );

							if ( "time" in requirements && !requirements.time ) {
								value.setUTCHours( 0 );
								value.setUTCMinutes( 0 );
								value.setUTCSeconds( 0 );
							}
						}
						break;

					case "object" :
						if ( value instanceof Date ) {
							break;
						}

					// falls through
					default :
						value = NaN;
				}


				const { step } = requirements;

				if ( step > 0 && value instanceof Date ) {
					const ms = value.getTime();

					let { min = 0 } = requirements;
					min = min ? min.getTime() : 0;

					value = new Date( ( Math.round( ( ms - min ) / step ) * step ) + min );
				}
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/** @inheritDoc */
		static isValid( name, value, requirements, errors ) {
			if ( requirements.required && ( value == null || isNaN( value ) ) ) {
				errors.push( new Error( `${name} is required` ) );
			}

			if ( value != null ) {
				let { min, max } = requirements;

				if ( !isNaN( min ) ) {
					min = new Date( min );
				}

				if ( min instanceof Date && ( isNaN( value ) || value.getTime() < min.getTime() ) ) {
					errors.push( new Error( `${name} is below required minimum` ) );
				}

				if ( !isNaN( max ) ) {
					max = new Date( max );
				}

				if ( max instanceof Date && ( isNaN( value ) || value > max ) ) {
					errors.push( new Error( `${name} is above required maximum` ) );
				}
			}
		}

		/* eslint-disable no-param-reassign */
		/** @inheritDoc */
		static serialize( value, adapter ) { // eslint-disable-line no-unused-vars
			if ( value instanceof Date ) {
				value = value.toISOString();
			} else {
				value = null;
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/* eslint-disable no-param-reassign */
		/** @inheritDoc */
		static deserialize( value ) {
			switch ( typeof value ) {
				case "object" :
					if ( !value || value instanceof Date ) {
						break;
					}

				// falls through
				case "string" :
					value = new Date( String( value ) );
					break;

				case "number" :
					value = new Date( value * 1000 );
					break;

				case "undefined" :
					value = null;
					break;
			}

			return value;
		}
		/* eslint-enable no-param-reassign */

		/** @inheritDoc */
		static compare( value, reference, operation ) {
			let result;

			switch ( operation ) {
				case "eq" :
					if ( value == null ) {
						result = reference == null;
					} else {
						result = reference != null && ( value.getTime() === reference.getTime() );
					}
					break;

				case "neq" :
				case "noteq" :
					if ( value == null ) {
						result = reference != null;
					} else {
						result = reference == null || value.getTime() !== reference.getTime();
					}
					break;

				case "lt" :
					result = value != null && reference != null && ( value.getTime() < reference.getTime() );
					break;

				case "lte" :
					if ( value == null ) {
						result = reference == null;
					} else {
						result = reference != null && ( value.getTime() <= reference.getTime() );
					}
					break;

				case "gt" :
					result = value != null && reference != null && ( value.getTime() > reference.getTime() );
					break;

				case "gte" :
					if ( value == null ) {
						result = reference == null;
					} else {
						result = reference != null && ( value.getTime() >= reference.getTime() );
					}
					break;

				case "null" :
					result = value == null;
					break;

				case "notnull" :
					result = value != null;
					break;

				case "not" :
					result = !value;
					break;

				default :
					result = false;
					break;
			}

			return result;
		}

		/** @inheritDoc */
		static indexReducer( value ) {
			return value ? value.getTime() : null;
		}
	}

	return OdemModelTypeDate;
};
