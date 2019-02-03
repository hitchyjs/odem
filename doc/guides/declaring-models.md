# Declaring Models

Because of this extension's tight integration with Hitchy models are declared following conventions defined by Hitchy. That's why declaring a model basically requires adding a Javascript file in folder **api/model** of your Hitchy-based project. By creating file **api/model/user.js** you are implicitly declaring to have a user model named `User`. The file needs to expose an empty object at least.

```javascript
module.exports = {};
```

To create an application working with models post, comment and user you basically need to create files **post.js**, **comment.js** and **user.js** in folder **api/model**.

## Naming Models

Every declaration of a model may provide an explicit name to use when exposing and accepting it.

## Elements of Model Declaration

Empty model declarations don't help much, though. You need to start declaring elements that define the structure of a model's records and their behaviour. 

The declaration of some model may consist of 

* attributes describing structural similarities in instances of a model actually stored in a database,

* computed attributes deriving additional value from values of actual attributes or other computed attributes and

* callback functions to be invoked on certain events related to either instance's life cycle.

Either kind of element is declared by adding another property to the object exported in a declaration file as shown above.

* Regular attributes are declared using an object with declaration properties regarding either attribute.

* Providing a function results in the declaration of a computed attribute. Computed attributes are invoked with a reference to an instance of the model in first argument. They are expected to return some value.

  Since the returned value might be a function it is possible to declare instance-related methods this way as well.
  
* Arrays are expected to consist of functions, only. Either function is registered as a listener to a life-cycle event matching the declaration property by name. That's why this kind of declaration is considered a life-cycle hook.

Here comes a slightly more elaborate example:

```javascript
module.exports = {
	name: {},
	password: {},
	lastLogin: {},
	// a usual case of computed attribute
	hasLoggedInBefore( item ) {
		return item.lastLogin != null;
	},
	// declaring instance method using support for computed attributes
	lockAccount( item ) {
		return function() {
			item.password = "LOCKED";
		};
	},
	// reducing syntax involved in declaring instance method
	unlockAccount: item => newPassword => {
		item.password = CreateHash( newPassword );
	},
	onSaved: [
		item => {
			// invoked when instance has been saved in database ...
		},
	],
};
```

## Attributes

In case of a user it is going to have a unique name and a password for a start. Adjust file **api/model//user.js** to match this code:

```javascript
module.exports = {
	name: {},
	password: {},
};
```

Due to the preference of convention over configuration this code declares to have two attributes in model `User` with either attribute capable of holding some string value. The same can be achieved using a more explicit declaration:

```javascript
module.exports = {
	name: {
		type: "string",
	},
	password: {
		type: "string",
	},
};
```

As you can see the there is a set of attributes declared with every attribute capable of having one or more declaration properties. `type` is a declaration property selecting one of several available attribute types. When omitting it the attribute is declared to be of type _string_.

Additional declaration properties depend on the declared type of attribute. Some common declaration properties are available without regards to the attribute's declared type.

### Strings

Strings are declared with `type: "string"` or by omitting the declaration property `type` altogether.

Attributes of type `string` are capable of holding a sequence of arbitrary characters. The following declaration properties customize the way either string attribute gets processed and validated. 

#### trim

This boolean declares whether values should be trimmed implicitly or not. By trimming a string value all leading and trailing whitespace gets removed.

#### reduceSpace

This boolean declares whether whitespace should be normalized or not. Normalization refers to replacing all sequences of multiple whitespaces by a single SPC character.

#### upperCase

This boolean demands to replace any lowercase letter in value by its uppercase counterpart.

#### lowerCase

This boolean demands to replace any uppercase letter in value by its lowercase counterpart.

#### minLength

This integer attaches constraint requiring any optionally trimmed value with whitespace optionally reduced to consist of this number of characters at least.

#### maxLength

This integer attaches constraint requiring any optionally trimmed value with whitespace optionally reduced to consist of this number of characters at most.

#### pattern

This regular expression attaches constraint requiring any value to match this pattern. Provided pattern might be literally a regular expression or some string containing it.

#### required

This boolean attaches constraint controlling whether this attribute requires a value or not. When set `true` instances of the model mustn't be saved without providing value for this attribute.

### Numbers

Numbers are declared with `type: "number"`.

Attributes of type number are capable of holding numeric values with decimal digits.

#### step

This numeric value results in snapping numbers to multitudes of this value related to configured minimum value in declaration property `min` or to 0 on omitting that declaration property.

::: tip
Declaring step size `1.0` while having integer minimum value constraint in `min` limits values to be integers, though they are still handled as fractional numbers without decimal digits.
:::

#### min

This numeric value attaches constraint requiring any value to be greater than this value or equal it.

#### max

This numeric value attaches constraint requiring any value to be less than this value or equal it.

#### required

This boolean attaches constraint controlling whether this attribute requires a value or not. When set `true` instances of the model mustn't be saved without providing value for this attribute.

### Booleans

Booleans are declared with `type: "boolean"`.

Boolean values are `true` and `false`.

#### isSet

This boolean attaches constraint requiring any provided value to be `true`.

#### required

This boolean attaches constraint controlling whether this attribute requires a value or not. When set `true` instances of the model mustn't be saved without providing value for this attribute.

### Timestamps

Timestamps are declared with `type: "date"`.

Values are represented using instance of Javascript's native class for `Date`. Due to supported coercion it's possible to assign strings as well using a limited set of formats.

#### time

This boolean declaration property results in timestamps being stripped off their time of day information. It must be set `false` explicitly to achieve that.

#### step

This numeric value is a number of milliseconds timestamp values are snapped to. The snapping occurs related to a given minimum timestamp declared in `min`.

#### min

This timestamp attaches constraint requiring any value to be greater than this timestamp or equal it.

The value might be given as string complying with a limited set of formats, as a string providing number of milliseconds since midnight of January 1st, 1970 or as an instance of Javascript's natively supported class `Date`.

#### max

This timestamp attaches constraint requiring any value to be less than this timestamp or equal it.

The value might be given as string complying with a limited set of formats, as a string providing number of milliseconds since midnight of January 1st, 1970 or as an instance of Javascript's natively supported class `Date`.

#### required

This boolean attaches constraint controlling whether this attribute requires a value or not. When set `true` instances of the model mustn't be saved without providing value for this attribute.

## Computed Attributes

Computed attributes are actually functions invoked to derive additional information by computing one or more attributes or accessing additional information sources. Either function is invoked with reference on a model's instance in first argument. The computed attribute's value is returned by the function provided as part of a model's declaration.

::: tip Functions provided here are registered as getters of resulting instances of model. Because of that they are used like attributes: reading the computed value doesn't require use of parentheses as provided function is invoked transparently.
:::

::: tip
This code has been used above as part of a example declaring some basic user model.
:::

```javascript
module.exports = {
	name: {},
	password: {},
	lastLogin: {},
	// a usual case of computed attribute
	hasLoggedInBefore( item ) {
		return item.lastLogin != null;
	},
};
```

The computed attribute `hasLoggedInBefore` can be accessed on a particular instance of this model using

```javascript
if ( instance.hasLoggedInbefore ) {
	// put code depending on user logged in here
}
```

### Methods

Currently, instance methods are available as a special case of computed attributes, only. Relying on closure scopes the computed value might be a function to be invoked for processing in context of either instance taking additional parameters.

::: tip
This code has been used above as part of a example declaring some basic user model.
:::

```javascript
module.exports = {
	// declaring instance method using support for computed attributes
	lockAccount( item ) {
		return function() {
			item.password = "LOCKED";
		};
	},
	// reducing syntax involved in declaring instance method
	unlockAccount: item => newPassword => {
		item.password = CreateHash( newPassword );
	},
};
```

Here two instance methods are declared:

* `instance.lockAccount()` can be invoked to mark account locked by assigning some invalid password.
* `instance.unlockAccount( "new-secret" )` reverts this by setting new password for the user to log in.

## Life-Cycle Hooks

Working with a model's instance either instance passes several stage of its life cycle. In either stage callbacks can be registered to add custom behaviour to instances of a model.

::: tip
This code has been used above as part of a example declaring some basic user model.
:::

```javascript
module.exports = {
	onSaved: [
		item => {
			// invoked when instance has been saved in database ...
		},
	],
};
```

This declaration adds a list if callbacks to be invoked sequentially after having saved an instance of this model. In fact this example provides single function, but it still has to be declared as a list of functions so the function is detected as a life-cycle hook rather than some computed attribute.

Here comes a list of supported life-cycle hooks:

tba.
