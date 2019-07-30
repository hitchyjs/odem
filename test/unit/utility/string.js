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


const { suite, test } = require( "mocha" );
const Should = require( "should" );

const API = require( "../../lib/utility/string" );


suite( "Utility API for processing strings", function() {
	test( "is available", function() {
		Should.exist( API );
	} );

	test( "exposes methods for converting case formats", function() {
		API.should.be.an.Object().which.has.properties( "camelToSnake", "camelToKebab", "snakeToCamel", "snakeToKebab", "kebabToCamel", "kebabToPascal", "kebabToSnake", "autoKebabToPascal" );
	} );

	test( "exposes method camelToSnake() which converts camelCase string to snake_case", function() {
		API.camelToSnake( "" ).should.be.String().which.is.empty();
		API.camelToSnake( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		API.camelToSnake( "someCamelCase" ).should.be.String().which.is.equal( "some_camel_case" );
		API.camelToSnake( "SomeCamelCase" ).should.be.String().which.is.equal( "Some_camel_case" );
		API.camelToSnake( "ignores space but handles camelCase" ).should.be.String().which.is.equal( "ignores space but handles camel_case" );
	} );

	test( "exposes method camelToKebab() which converts camelCase string to kebab-case", function() {
		API.camelToKebab( "" ).should.be.String().which.is.empty();
		API.camelToKebab( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		API.camelToKebab( "someCamelCase" ).should.be.String().which.is.equal( "some-camel-case" );
		API.camelToKebab( "SomeCamelCase" ).should.be.String().which.is.equal( "Some-camel-case" );
		API.camelToKebab( "ignores space but handles camelCase" ).should.be.String().which.is.equal( "ignores space but handles camel-case" );
	} );

	test( "exposes method snakeToCamel() which converts snake_case string to camelCase", function() {
		API.snakeToCamel( "" ).should.be.String().which.is.empty();
		API.snakeToCamel( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		API.snakeToCamel( "some_snake_case" ).should.be.String().which.is.equal( "someSnakeCase" );
		API.snakeToCamel( "Some_snake_case" ).should.be.String().which.is.equal( "SomeSnakeCase" );
		API.snakeToCamel( "ignores space but handles snake_case" ).should.be.String().which.is.equal( "ignores space but handles snakeCase" );
		API.snakeToCamel( "collapses__multiple_____________underscores" ).should.be.String().which.is.equal( "collapsesMultipleUnderscores" );
	} );

	test( "exposes method snakeToKebab() which converts snake_case string to kebab-case", function() {
		API.snakeToKebab( "" ).should.be.String().which.is.empty();
		API.snakeToKebab( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		API.snakeToKebab( "some_snake_case" ).should.be.String().which.is.equal( "some-snake-case" );
		API.snakeToKebab( "Some_snake_case" ).should.be.String().which.is.equal( "Some-snake-case" );
		API.snakeToKebab( "ignores space but handles snake_case" ).should.be.String().which.is.equal( "ignores space but handles snake-case" );
		API.snakeToKebab( "collapses__multiple_____________underscores" ).should.be.String().which.is.equal( "collapses-multiple-underscores" );
	} );

	test( "exposes method kebabToCamel() which converts kebab-case string to camelCase", function() {
		API.kebabToCamel( "" ).should.be.String().which.is.empty();
		API.kebabToCamel( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		API.kebabToCamel( "some-kebab-case" ).should.be.String().which.is.equal( "someKebabCase" );
		API.kebabToCamel( "Some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
		API.kebabToCamel( "ignores space but handles kebab-case" ).should.be.String().which.is.equal( "ignores space but handles kebabCase" );
		API.kebabToCamel( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "collapsesMultipleUnderscores" );
	} );

	test( "exposes method kebabToPascal() which converts kebab-case string to PascalCase", function() {
		API.kebabToPascal( "" ).should.be.String().which.is.empty();
		API.kebabToPascal( "indifferent" ).should.be.String().which.is.equal( "Indifferent" );
		API.kebabToPascal( "some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
		API.kebabToPascal( "Some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
		API.kebabToPascal( "does not handle spaces pretty well though also containing kebab-case" ).should.be.String().which.is.equal( "Does not handle spaces pretty well though also containing kebabCase" );
		API.kebabToPascal( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "CollapsesMultipleUnderscores" );
	} );

	test( "exposes method kebabToSnake() which converts kebab-case string to snake_case", function() {
		API.kebabToSnake( "" ).should.be.String().which.is.empty();
		API.kebabToSnake( "indifferent" ).should.be.String().which.is.equal( "indifferent" );
		API.kebabToSnake( "some-kebab-case" ).should.be.String().which.is.equal( "some_kebab_case" );
		API.kebabToSnake( "Some-kebab-case" ).should.be.String().which.is.equal( "Some_kebab_case" );
		API.kebabToSnake( "ignores space but handles kebab-case" ).should.be.String().which.is.equal( "ignores space but handles kebab_case" );
		API.kebabToSnake( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "collapses_multiple_underscores" );
	} );

	suite( "exposes method autoKebabToPascal() which", () => {
		test( "assumes any non-PascalCase input as kebab-case to be converted to PascalCase", function() {
			API.autoKebabToPascal( "" ).should.be.String().which.is.empty();
			API.autoKebabToPascal( "indifferent" ).should.be.String().which.is.equal( "Indifferent" );
			API.autoKebabToPascal( "some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
			API.autoKebabToPascal( "Some-kebab-case" ).should.be.String().which.is.equal( "SomeKebabCase" );
			API.autoKebabToPascal( "does not handle spaces pretty well though also containing kebab-case" ).should.be.String().which.is.equal( "Does not handle spaces pretty well though also containing kebabCase" );
			API.autoKebabToPascal( "collapses--multiple-------------underscores" ).should.be.String().which.is.equal( "CollapsesMultipleUnderscores" );
		} );

		test( "drops existing mixture of lower and upper case in provided non-PascalCase string before converting to PascalCase", function() {
			API.autoKebabToPascal( "some-stringWith-extraUpper-caseLetters" ).should.be.String().which.is.equal( "SomeStringwithExtraupperCaseletters" );
		} );

		test( "detects provided PascalCase string to be kept as-is", function() {
			API.autoKebabToPascal( "SomeStringWithUpperCaseLetters" ).should.be.String().which.is.equal( "SomeStringWithUpperCaseLetters" );
		} );
	} );
} );
