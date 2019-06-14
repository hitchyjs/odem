# Declaring Models In Filesystem

Hitchy ODM is tightly integrated with Hitchy by means of satisfying the latter one's abstract assumptions on how to declare models. That's why declaring a model basically works just by adding a Javascript file in folder **api/model** of your Hitchy-based project. 

For example, by creating file **api/model/user.js** you are implicitly declaring to have a user model named `User`. The file needs to expose an empty object at least.

```javascript
module.exports = {};
```

To create an application working with models **Post**, **Comment** and **User** you basically need to create files **post.js**, **comment.js** and **user.js** in folder **api/model**.

## Naming Models

The name of a model is derived from name of defining file as described before. This derivation assumes filename is given in kebab-case and converts it into PascalCase for naming the resulting model.
 
However, every definition of a model may provide an explicit name to use instead of deriving it. This name must be provided in special property `$name`.

::: warning Limitations
Due to using a model's name in string interpolations in context of evaluated code model names have to start with a latin letter followed by a mixture of further latin letters, digits and underscores.

* **Good:** My5thGrade_YearBook_ 
* **Bad:** My 5.-Grade Year Book _or_ My-5thGrade-YearBook
:::

```javascript
module.exports = {
	$name: "MyCustomName",
};
```

When putting this in a file **api/model/public-holiday.js** the resulting model won't be implicitly named **PublicHoliday**, but **MyCustomName**.

## Elements of Model Declaration

Empty model declarations don't help much, though. You need to start declaring elements that define the structure of a model's records and their behaviour. 

The declaration of some model may consist of 

* **attributes** describing structural similarities in instances of a model actually stored in a database,

* **computed attributes** deriving additional value from values of actual attributes or other computed attributes,

* **instance methods** as a special kind of computed attribute and

* **life cycle event listeners**, which are callback functions to be invoked on certain events related to either instance's life cycle.

Either kind of element is declared by adding another property to the object exported in a a model's definition file as shown above. The intention depends on type of either property's value.

* Regular **attributes** are declared using an **object** consisting of declaration properties for either attribute.

  ```javascript
  {
    firstName: {},
    lastName: {}
  }
  ```

* Methods a.k.a. properties of type **function** declare **computed attributes**. Those functions are invoked with a reference to an instance of the model in first argument. They are expected to return some arbitrary value.

  ```javascript
  {
    fullName: item => item.lastName + ", " + item.firstName
  }
  ```

   **Instance methods** for resulting model are defined as computed attributes that return some function to invoke. That function is the instance's method. 

  ```javascript
  {
    setPassword: item => cleartext => item.password = hash( cleartext )
  }
  ```

* **Arrays** are assumed to list functions to be registered as listeners for a particular **life cycle event**. The property's name selects the event and must start with `on` followed by name of life cycle event in PascalCase. The set of provided arguments depend on particular life cycle event, but first argument is reference to affected instance of model.

  ```javascript
  {
    onSaved: [
  	  item => { ... }
    ]
  }
  ```

Let's conclude with a summary:

```javascript
module.exports = {
	// schema elements of model are declared as objects
	name: {},
	password: {},
	lastLogin: {},

	// computed attribute are declared as functions returning derived value
	hasLoggedInBefore( item ) {
		return item.lastLogin != null;
	},

	// instance methods are computed attributes returning function to invoke
	lockAccount( item ) {
		return function() {
			item.password = "LOCKED";
		};
	},

	unlockAccount: item => newPassword => {
		item.password = CreateHash( newPassword );
	},

	// life cycle event listeners are declared as arrays of functions
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

By following _convention over configuration_ paradigm this code declares to have two attributes in model `User` with either attribute capable of holding some arbitrary string value. The same can be achieved using a more explicit declaration:

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

Every property in model's definition describes one of the model's attribute given that the property's value is an object. This object may consist of declaration properties customizing either attribute of model. It might be empty so defaults apply. `type` is a declaration property selecting one of several available attribute types. When omitting it the attribute is declared to be of type _string_.

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

::: tip
Functions provided here are registered as getters of resulting instances of model. Because of that they are used like attributes: reading the computed value doesn't require use of parentheses as provided function is invoked transparently.
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

## Life Cycle Events (LCE)

When working with a model's instance it passes several stages of its life cycle. In either stage callbacks can be registered to be notified as soon as the related life cycle event occurs.

```javascript
module.exports = {
	onSaved: [
		item => {
			// invoked when instance has been saved in database ...
		},
	],
};
```

This example declares a list of callbacks to be invoked sequentially after having saved an instance of this model. Even though there is a single callback, only, this must be provided as array of callbacks to distinguish this declaration of a life-cycle event listener from declaration of a computed attribute

Here comes a list of life-cycle events supported by basic implementation of models:

### Creating Instances

#### onCreate( properties ) : properties

When creating new instance of model the LCE **create** is dispatched. Registered listeners are invoked with set of new item's properties. It is assumed to return the eventually desired set of new item's properties. 

The result of registered listeners is always passed through validation before creating instance.

#### onCreated( item, properties )

Right after creating new instance of model the LCE **created** is dispatched. Listeners are invoked with reference on freshly created instance and set of properties used to create it before.

### Changing Properties

### onChanged

### onSave

### onSaved

### onBeforeValidate

### onAfterValidate

### onRemove

### onRemoved


## Indexing

Defining a model might include definition of per-attribute indices to use. Indices are improving performance on searching items by redundantly saving values per attribute and associating them with references on matching records.

Indices are configured in special property `$index` in definition of model. This property must be an object mapping existing attribute names into one or more test names.

```javascript
module.exports = {
	...,
	$index: { ... }
};
```

The index definition object maps attributes' names onto definitions for how to manage index for either attribute.

::: warning
Defining index works with regular, non-computed attributes, only. There is no support for multi-attribute indices.
::: 

```javascript
module.exports = {
	firstName: {},
	lastName: {},
	age: { type: "number" },
	$index: {
		firstName: {},
		lastName: {},
		age: true,
	},
};
```
