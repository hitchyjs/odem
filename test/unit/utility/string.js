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


const { describe, it, before } = require( "mocha" );
const Should = require( "should" );

const { fakeApi } = require( "../helper" );


describe( "Utility API for processing strings", function() {
	let OdemUtilityString;

	before( () => fakeApi().then( ( { runtime: { services: s } } ) => { ( { OdemUtilityString } = s ); } ) );

	it( "is available", function() {
		Should.exist( OdemUtilityString );
	} );

	it( "exposes methods for converting case formats", function() {
		OdemUtilityString.should.have.properties( "camelToSnake", "camelToKebab", "snakeToCamel", "snakeToKebab", "kebabToCamel", "kebabToPascal", "kebabToSnake", "autoKebabToPascal" );
	} );

	it( "exposes method camelToSnake() which converts camelCase string to snake_case", function() {
		OdemUtilityString.camelToSnake( "" ).should.be.String().which.is.empty();
		OdemUtilityString.camelToSnake( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		OdemUtilityString.camelToSnake( "someCamelCase" ).should.be.String().which.is.equal( "some_camel_case" );
		OdemUtilityString.camelToSnake( "SomeCamelCase" ).should.be.String().which.is.equal( "Some_camel_case" );
		OdemUtilityString.camelToSnake( "ignores space but handles camelCase" ).should.be.String().which.is.equal( "ignores space but handles camel_case" );
	} );

	it( "exposes method camelToKebab() which converts camelCase string to kebab-case", function() {
		OdemUtilityString.camelToKebab( "" ).should.be.String().which.is.empty();
		OdemUtilityString.camelToKebab( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		OdemUtilityString.camelToKebab( "someCamelCase" ).should.be.String().which.is.equal( "some-camel-case" );
		OdemUtilityString.camelToKebab( "SomeCamelCase" ).should.be.String().which.is.equal( "Some-camel-case" );
		OdemUtilityString.camelToKebab( "ignores space but handles camelCase" ).should.be.String().which.is.equal( "ignores space but handles camel-case" );
	} );

	it( "exposes method snakeToCamel() which converts snake_case string to camelCase", function() {
		OdemUtilityString.snakeToCamel( "" ).should.be.String().which.is.empty();
		OdemUtilityString.snakeToCamel( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		OdemUtilityString.snakeToCamel( "some_snake_case" ).should.be.String().which.is.equal( "someSnakeCase" );
		OdemUtilityString.snakeToCamel( "Some_snake_case" ).should.be.String().which.is.equal( "SomeSnakeCase" );
		OdemUtilityString.snakeToCamel( "ignores space but handles snake_case" ).should.be.String().which.is.equal( "ignores space but handles snakeCase" );
		OdemUtilityString.snakeToCamel( "collapses__multiple_____________underscores" ).should.be.String().which.is.equal( "collapsesMultipleUnderscores" );
	} );

	it( "exposes method snakeToKebab() which converts snake_case string to kebab-case", function() {
		OdemUtilityString.snakeToKebab( "" ).should.be.String().which.is.empty();
		OdemUtilityString.snakeToKebab( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		OdemUtilityString.snakeToKebab( "some_snake_case" ).should.be.String().which.is.equal( "some-snake-case" );
		OdemUtilityString.snakeToKebab( "Some_snake_case" ).should.be.String().which.is.equal( "Some-snake-case" );
		OdemUtilityString.snakeToKebab( "ignores space but handles snake_case" ).should.be.String().which.is.equal( "ignores space but handles snake-case" );
		OdemUtilityString.snakeToKebab( "collapses__multiple_____________underscores" ).should.be.String().which.is.equal( "collapses-multiple-underscores" );
	} );

	it( "exposes method kebabToCamel() which converts kebab-case string to camelCase", function() {
		OdemUtilityString.kebabToCamel( "" ).should.be.String().which.is.empty();
		OdemUtilityString.kebabToCamel( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		OdemUtilityString.kebabToCamel( "some-kebab-case" ).should.be.String().which.is.equal( "someKebabCase" );
		OdemUtilityString.kebabToCamel( "Some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
		OdemUtilityString.kebabToCamel( "ignores space but handles kebab-case" ).should.be.String().which.is.equal( "ignores space but handles kebabCase" );
		OdemUtilityString.kebabToCamel( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "collapsesMultipleUnderscores" );
	} );

	it( "exposes method kebabToPascal() which converts kebab-case string to PascalCase", function() {
		OdemUtilityString.kebabToPascal( "" ).should.be.String().which.is.empty();
		OdemUtilityString.kebabToPascal( "indifferent" ).should.be.String().which.is.equal( "Indifferent" );
		OdemUtilityString.kebabToPascal( "some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
		OdemUtilityString.kebabToPascal( "Some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
		OdemUtilityString.kebabToPascal( "does not handle spaces pretty well though also containing kebab-case" ).should.be.String().which.is.equal( "Does not handle spaces pretty well though also containing kebabCase" );
		OdemUtilityString.kebabToPascal( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "CollapsesMultipleUnderscores" );
	} );

	it( "exposes method kebabToSnake() which converts kebab-case string to snake_case", function() {
		OdemUtilityString.kebabToSnake( "" ).should.be.String().which.is.empty();
		OdemUtilityString.kebabToSnake( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		OdemUtilityString.kebabToSnake( "some-kebab-case" ).should.be.String().which.is.equal( "some_kebab_case" );
		OdemUtilityString.kebabToSnake( "Some-kebab-case" ).should.be.String().which.is.equal( "Some_kebab_case" );
		OdemUtilityString.kebabToSnake( "ignores space but handles kebab-case" ).should.be.String().which.is.equal( "ignores space but handles kebab_case" );
		OdemUtilityString.kebabToSnake( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "collapses_multiple_underscores" );
	} );

	describe( "exposes method autoKebabToPascal() which", () => {
		it( "assumes any non-PascalCase input as kebab-case to be converted to PascalCase", function() {
			OdemUtilityString.autoKebabToPascal( "" ).should.be.String().which.is.empty();
			OdemUtilityString.autoKebabToPascal( "indifferent" ).should.be.String().which.is.equal( "Indifferent" );
			OdemUtilityString.autoKebabToPascal( "some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
			OdemUtilityString.autoKebabToPascal( "Some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
			OdemUtilityString.autoKebabToPascal( "does not handle spaces pretty well though also containing kebab-case" ).should.be.String().which.is.equal( "Does not handle spaces pretty well though also containing kebabCase" );
			OdemUtilityString.autoKebabToPascal( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "CollapsesMultipleUnderscores" );
		} );

		it( "drops existing mixture of lower and upper case in provided non-PascalCase string before converting to PascalCase", function() {
			OdemUtilityString.autoKebabToPascal( "some-stringWith-extraUpper-caseLetters" ).should.be.String().which.is.equal( "SomeStringwithExtraupperCaseletters" );
		} );

		it( "detects provided PascalCase string to be kept as-is", function() {
			OdemUtilityString.autoKebabToPascal( "SomeStringWithUpperCaseLetters" ).should.be.String().which.is.equal( "SomeStringWithUpperCaseLetters" );
		} );
	} );
} );
