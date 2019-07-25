---
prev: ../glossary.md
next: ./using-models.md
---

# Model Definition

## How To Define

There are two ways supported for defining models:

* In server-side code you may use the Model API directly to define new models.
* Due to integrating with Hitchy's automatic discovery of extensions it is possible to place model definitions in files expected in certain locations of your project.

Both scenarios are described below.

### Defining in Server-Side Code

:::tip  
The preferred way of defining models in a Hitchy application is via filesystem as described below.  
:::

For sure, there is code reading and processing those files. That code is using API to be described in this chapter. You might want to use this API in testing your code e.g. to mock models your code is relying on.

The main module of hitchy-odem library exposes several classes. One of them is `Model`.

```javascript
const { Model } = require( "hitchy-odem" );
```

This class is providing static method `Model.define()` accepting these arguments:

* First there is the name of the desired model. 

  When defining models via filesystem this name is derived from the file's basename without extension and it is converted from kebab-case to PascalCase there. The resulting model's name is used to expose the model in context of Hitchy's runtime API there.
  
  When defining in code you are responsible for applying any such derivations as desired. In this case the model's name isn't used in any sort of registry implicitly and thus might be ignored as well.
  
  ::: tip Reminder  
  The definition in second argument might contain property [`name`](./defining-models-filesystem.md#naming-models) to define a different name. This information is always used in favour of the name provided in first argument here.  
  :::
  
  The model's name is used to expose it as part of Hitchy's runtime API. It might be used to name the related set in datasource available via some adapter, as well.

* Second argument provides the definition as it is exported by the defining file. The definition is required. It also must define at least one actual property.

* An optional third argument may be provided to choose a particular base class the defined model is deriving from. That base class still needs to be derived from `Model`, though.

* A fourth argument might be given to select an adapter to be explicitly used with the resulting model instead of using some globally configured default adapter.

The full signature is:

```javascript
Model.define( name, definition, baseClass = Model, dataStorageAdapter = null );
```

Basically it is okay to stick with the first two arguments:

```javascript
const { Model } = require( "hitchy-odem" );

const Person = Model.define( "person", {
	props: {
		lastName: {},
		firstName: {},
		age: {},
	},
} );
```

Third argument can be used to create a hierarchy of models:

```javascript
const { Model } = require( "hitchy-odem" );

const Person = Model.define( "person", {
	props: {
		lastName: {},
		firstName: {},
		age: { type: "number" },
	},
} );

const Employee = Model.define( "employee", {
	props: {
		employedSince: { type: "date" },
	},
}, Person );
```


### Defining In Filesystem

Hitchy ODM is tightly integrated with Hitchy by means of meeting the latter one's conventions on how to declare server-side models. That's why defining a model basically works just by adding a Javascript file in folder **api/model** of your Hitchy-based project. For example, by creating file **api/model/user.js** you are implicitly defining to have a user model named `User`. 

Any such file is assumed to expose the definition of another model. This is possible by sticking with the following pattern:

```javascript
module.exports = <definition>;
```

In this pattern `<definition>` must be replaced with the actual definition of a model. A definition's syntax is commonly described below.

Any file-based definition of a model is eventually processed through `Model.define()` as decribed before. The resulting model is then exposed in Hitchy's runtime API. So in a request handler you might use the model as `req.api.runtime.models.<ModelName>`.

The name of a model is derived from the name of the defining file. This derivation assumes filename is given in kebab-case and converts it into PascalCase.

:::tip Example  
To create an application working with models **Post**, **Comment** and **User** you basically need to create files **post.js**, **comment.js** and **user.js** in folder **api/model**. A model named **BlogEditor** would be defined in a file named **api/model/blog-editor.js**.  
:::


## Definition Syntax

The definition of a model always starts with an object. Most properties of this object start another section of definition each defining a different kind of elements per model. In addition some further properties are used to define global information.

:::tip Properties vs. Properties  
This documentation is using the term _properties_ in different situations. For better understanding it is viable to understand those differences.

* **Definition properties** are properties of the definition object as described here.

* **Root-level definition properties** are those properties of the definition object mentioned right before. They start sections of the definition or define global information. In opposition to those all other definition properties are used at deeper levels of definition object's hierarchy. 

* Defining a model always requires to define the model's properties. These are separated into 

  * **actual properties** and 
  * **computed properties**

  with the latter being calculated from the former or any other source of information at runtime of a model's instance.
:::

### Elements of Model Definition

Every definition of a module needs to contain at least one property. As demonstrated before, properties are defined in a separate section of definition named **props**. This section is just one of several supported sections like these:

* **props** is defining all _actual properties_,

* **computed** defines _computed properties_ that derive their value from actual properties,

* **methods** lists functions to be exposed as _instance methods_ of resulting model,

* **hooks** provides lists of functions to be registered as handlers for a limited set of life cycle event.

Either part is described in detail below.

### Actual Properties

Defining at least one actual property in **props** is mandatory. Every such property definition consists of a unique name for the property and an object describing its type and optional constraints.

:::warning
The name of an actual property mustn't be used by any other actual or computed property or method of same model. In addition it may neither start with `$` nor match name of any life cycle event nor match any of following keywords: `prototype`, `super`, `constructor`, `uuid`.  
:::

```javascript
{
    props: {
        firstName: {},
        lastName: {}
    }
}
```

This example is defining two actual properties. Their type defaults to _string_ unless some type is picked explicitly by providing `type` in property description:

```javascript
{
    props: {
        firstName: {},
        lastName: {},
        age: {
            type: "integer"
        }
    }
}
```

Currently supported types are:

* `string`
* `number`
* `integer`
* `date`
* `boolean`

Either types comes with a set of specific constraints to be defined in addition. Some constraints are applicable to either type of property.

### Computed Properties
 
Computed properties are defined in section **computed** by either one's unique name and the implementation as a function. Those functions are invoked in context of an instance of current model when reading the related computed property. The function is assumed to return any value which is provided as the 

:::warning
The name of an computed property mustn't be used by any other actual or computed property or method of same model. In addition it may neither start with `$` nor match name of any life cycle event nor match any of following keywords: `prototype`, `super`, `constructor`, `uuid`.  
:::

```javascript
{
    props: {
        ageInSeconds: { type: "integer" }
    },
    computed: {
        ageInDays() { return this.ageInSeconds / 86400; }
    }
}
```

Computed properties can be used like regular properties:

```javascript
console.log( someModelInstance.ageInDays );
```

This includes assigning value to a computed property:

```javascript
someModelInstance.ageInDays = 5;
```

In this case the defined function implementing the computed property's behaviour is invoked with assigned value in first argument:

```javascript
{
    props: {
        ageInSeconds: { type: "integer" }
    },
    computed: {
        ageInDays( value ) {
            if ( value === undefined ) {
                return this.ageInSeconds / 86400;
            }
            
            this.ageInSeconds = value * 86400;
        }
    }
}
```


### Instance Methods

The definition may list methods to be exposed per instance of resulting model. They are provided in section **methods** of definition object. Methods are invoked in context of a particular instance of resulting model, thus using `this` is available for accessing an instance's properties. 

:::warning
Arrow functions don't work here for lacking support for `this`.
:::

:::warning
The name of a method mustn't be used by any other actual or computed property or method of same model. In addition it may neither start with `$` nor match name of any life cycle event nor match any of following keywords: `prototype`, `super`, `constructor`, `uuid`.   
:::

```javascript
{
    props: {
        password: {}
    },
    methods: {
        setPassword( clearText ) { 
            this.password = create_hash( cleartext ); 
        }
    }
}
```

### Hooks for Life-Cycle Events

In section ``hooks`` a listener function for every supported life-cycle event may be defined. A listener is invoked in context of the affected model (except for beforeCreate), thus using `this` is available to access the affected instance. Arguments passed on calling either hook depends on related life cycle event.

:::warning
Arrow functions don't work here for lacking support for `this`.
:::

```javascript
{
    props: {
        someProp: {}
    },
    hooks: {
        beforeValidate() {
            // TODO implement handler, instance is available as `this`
        }
    }
}
```

:::tip Information  
For improved readability of resulting definition hooks may use prefix `on` preceding name of life-cycle event with that one's first letter capitalized. Thus, the alias `onBeforeValidate` can be used in definition instead of `beforeValidate`. In the schema exposed on resulting model this prefix will be removed, though.  
:::

### Indices

Defining a model basically does not require definition of indices. However, managing large amounts of instances strongly benefits from indices that support common operations used to search and sort instances by the property covered by either index. Indices result in redundantly stored information and thus shouldn't be created for every property and every operation probably used for searching instances some day. Managing indices has an impact on saving data. Temporary indices also result in Hitchy applications taking more time to come up full. That's why you should explicitly define the indices you need, only.

Indices are defined in conjunction with either property just like its type and optional constraints. A property's indices are defined in another definition property named `index` there. This definition property is listing comparison operations presumably used on finding instances by this particular property.
 
::: warning  
Defining indices work with actual, non-computed properties, only.  
::: 
 
::: warning  
Currently, there is no support for multi-property indices.  
::: 

```javascript
module.exports = {
    props: {
        firstName: {
            index: "eq"
        },
        lastName: {},
        age: { 
            type: "number",
            index: ["gt", "lt"]
        },
    },
};
```

This example is declaring indices for the properties `firstName` and `age`. It doesn't define an index for property `lastName`. 

In case of `firstName` an index for finding instances having the exactly same value as searched (a.k.a. equality, thus using abbreviation `eq`) is defined. Since there is only one index defined the comparison operation may be given as string. When compiling model its schema is always exposing this string converted into a single-item array.

The second case of `age` is defining two separate indices to be managed for searching instances with `age` being **g**reater **t**han (thus `gt`) or **l**ess **t**han (thus `lt`) some given value. Defining multiple indices requires provision of an array listing either one's operation.

### Naming Models

The name of a model is provided as first argument to `Model.define()`. In case of defining via filesystem this name is derived from the defining file as described before. 

However, every definition of a model may provide an explicit name to use instead. This name must be provided in special root-level definition property `name`.

::: warning Limitations  
Due to using a model's name in string interpolations in context of evaluated code model names have to start with a latin letter followed by a mixture of further latin letters, digits and underscores.

* **Good:** My5thGrade_YearBook_ 
* **Bad:** My 5.-Grade Year Book _or_ My-5thGrade-YearBook
:::

```javascript
{
    name: "MyCustomName",
    props: {
        someName: {}
    }
}
```

When putting this in a file **api/model/public-holiday.js** the resulting model won't be implicitly named **PublicHoliday**, but **MyCustomName**.

### Concluding with an Example

Let's define a model for managing users:

```javascript
{
    name: "User",
    props: {
        name: {},
        password: {},
        lastLogin: {},
    },
    computed: {
        hasLoggedInBefore() {
            return this.lastLogin != null;
        },
    },
    methods: {
        lockAccount() {
            this.password = "LOCKED";
        },
        unlockAccount( newPassword ) {
            this.password = create_hash( newPassword );
        },
    },
    hooks: {
        saved() {
            // invoked when instance has been saved in database ...
        },
    }
}
```

## Property Types

As described before every defined property is bound to one out of several supported types. Properties not picking any type explicitly are using type _string_ by default. The following example defines two properties of type _string_.
 
```javascript
{
    props: {
        name: {},
        password: {}
    }
}
```

The same can be achieved by picking types explicitly like this:

```javascript
{
    props: {
        name: {
            type: "string"
        },
        password: {
            type: "string"
        }
    }
}
```

In property definitions the `type` information selects a _type handler_ which is affecting the property's processing in many different ways.

* It implements a type-specific coercion which is used to convert all kinds of different values assigned to a property being converted to the property's actual type.
* It provides type-specific methods for serializing and unserializing values to persistently store them in a connected data storage.
* Either type handler contains a method for comparing values of its type supporting a set of possible comparison operations. 
* Eventually, support for defining constraints and for obeying those as part of validation processes strongly depends on the defined type of a property. Some common constraints are available without regards to the property's type, though.


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

### Integers

A separate type handler is provided to particularly handle _integers_. This type handler is used when declaring a property with `type: "integer"`.

The type handler provides the same options as the more common type handler for numbers though working with any constraint value limited to integer values as well.

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


## Life Cycle Events

When working with a model's instance it passes several stages of its _life cycle_. In either stage callbacks can be registered to be invoked as soon as the related _life cycle event_ occurs.

:::tip Are there real events?  
The term _event_ has been chosen explicitly to help understanding the intention. However, in difference to other systems using events there is no actual event emitted and dispatched. Instead any callback defined for listening to a _life cycle event_ is exclusively invoked when available. If there is no callback then there is no _event_ handling at all.

This is why the section is actually named **hooks** for this term is closer to the real functionality.  
:::

```javascript
module.exports = {
    hooks: {
        afterSave() {
            // invoked when instance has been saved in database ...
        },
    },
};
```

This example declares a callback to be invoked after having saved an instance of this model. `this` is referring to the affected instance.

In a derived model callbacks of superordinated classes aren't invoked implicitly. You need to invoke them explicitly using `this.$super.hooks.afterSave()`.

Here comes a list of supported life-cycle events:

### beforeCreate( properties ) : properties

Whenever creating a new instance of a model the **beforecreate** event is dispatched. Registered listeners are invoked with set of new item's properties. It is assumed to return the eventually desired set of new item's properties.

The result is always passed through validation before creating instance.

### afterCreate()

Right after creating a new instance of a model the **afterCreate** event is dispatched. Listeners are invoked providing access on created instance via `this`.

### beforeValidate()

When validating current properties of an instance this event is emitted.

### afterValidate( errors ): errors

After 

### beforeSave

### afterSave

### beforeRemove

### afterRemove
