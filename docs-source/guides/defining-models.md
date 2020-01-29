---
prev: quickstart.md
next: model-derivations.md
---

# Model Definition

## How To Define

There are two ways supported for defining models:

* Due to integrating with Hitchy's automatic discovery of plugins it is possible to place model definitions in files to be discovered into models automatically.
* In server-side code you may use the Model API directly to define new models.

Both scenarios are described below.

### Defining In Filesystem

:::tip  
We consider this approach to be the default for defining models.  
:::

Hitchy ODM is tightly integrated with Hitchy by means of meeting the latter one's conventions on how to declare server-side models. That's why defining a model basically works just by adding a Javascript file in folder **api/models** of your Hitchy-based project. For example, by creating file **api/models/user.js** you are implicitly defining to have a user model named `User`. 

Any such file is assumed to expose the definition of another model. This is possible by sticking with the following pattern:

```javascript
module.exports = <definition>;
```

In this pattern `<definition>` must be replaced with the actual definition of a model. A definition's syntax is commonly described in [a separate chapter](#definition-syntax) below.

Any file-based definition of a model is eventually processed through `Model.define()` which is described in next chapter. The resulting model is then exposed in [Hitchy's API](https://hitchyjs.github.io/core/api/). So in a request handler you might use the model as [`req.hitchy.runtime.models.<ModelName>`](https://hitchyjs.github.io/core/api/#req-hitchy-0-2-0) or as [`this.models.<ModelName>`](https://hitchyjs.github.io/core/api/#in-request-handlers).

The name of a model is derived from the name of the defining file. This derivation assumes filename is given in kebab-case and converts it into PascalCase.

:::tip Example  
To create an application working with models **Post**, **Comment** and **User** you basically need to create files **post.js**, **comment.js** and **user.js** in folder **api/models**. A model named **BlogEditor** would be defined in a file named **api/models/blog-editor.js**.  
:::


### Defining in Server-Side Code

:::tip  
In most cases you should stick with support for [defining models in filesystem](#defining-in-filesystem).  
:::

In selected situations you might want to define models in server-side code programmatically. This is possible by using static method `define` included with Hitchy ODM's Model API which is [exposed as a service component of Hitchy's API](https://hitchyjs.github.io/core/internals/components.html#exposure-at-runtime) named `Model`.

```javascript
const { Model } = api.runtime.services;
```

:::warning Compatibility
`Model` gets exposed as a Hitchy service component since version 0.5.0 of Hitchy ODM. In previous version you need to `require()` the plugin:

```javascript
const { Model } = require( "hitchy-plugin-odem" );
```
:::

Provided method `Model.define()` is accepting these arguments:

* First there is the name of the desired model. 

  When defining models via filesystem those models are [discovered by Hitchy](https://hitchyjs.github.io/core/internals/components.html#models) and [exposed just like any other component](https://hitchyjs.github.io/core/internals/components.html#exposure-at-runtime). The resulting name of either model as a component will be used for naming the model by default.
  
  When defining in code you are responsible for applying any such derivations as desired. In this case the model's name isn't used in any sort of registry implicitly and thus might be ignored as well.
  
  ::: tip Reminder  
  The definition in second argument might contain property [`name`](./defining-models-filesystem.md#naming-models) to define a different name explicitly. This information is always used in favour of the name provided in first argument here.  
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
const { Model } = api.runtime.services;

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
const { Model } = api.runtime.services;

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

* **options** provides model-related options adjusting its behaviour in certain situations.

* **indices** (or **indexes**) provides index definitions used to improve performance on searching and sorting items.

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
 
In addition to _actual_ properties a model may include computed properties. Every such computed property has a _unique_ name in scope of its model and an implementation actually computing its value.

Computed properties are defined in section **computed**. This section is a regular object consisting of named methods. Every method in this section defines another computed property. 

Either computed property's function is invoked in scope of an instance of its model. When reading computed property, the function is invoked without any argument. It is possible to assign values to computed properties, as well. This results in its function being invoked with provided value as sole argument.

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

#### Selecting Type Handler <Badge type="info">0.3.0+</Badge>

Computed properties can be indexed and it's possible to use them for searching instances - with or without index. Discovering matches strongly depends on selected search operation, such as **eq** or **lte** testing for records with property's value equal or less than a given value.

Any such operation depends on selected property's type of value in turn. For actual properties you already know how to define a particular type of values. 

:::tip
A computed property doesn't need to be bound to a particular type of values unless using it for searching matches.
:::

For a computed property it is possible to select an assumed type of result value by appending type's name to the computed property's name separated by a single colon.

```javascript
{
    props: {
        ageInSeconds: { type: "integer" }
    },
    computed: {
        "ageInDays:number"() { return this.ageInSeconds / 86400; }
    }
}
```

In this example the name `ageInDays` has been extended by some type selection: `ageInDays:number`. The quotation marks are required to have the colon considered part of name. 

:::warning
The suffix `:number` is not a part of resulting property's name. It is still called `ageInDays` and is used just like before.
:::


#### Extended Definition <Badge type="info">0.3.0+</Badge>

A definition of computed properties as presented before is considered the simple and usual way. However, on processing such a concise definition a more complex format is created to firmly expose all information related to the computed property. 

When inspecting a resulting model's schema for defined computed properties there will be an object instead of a function. 

* In its property `code` there is the actually given function implementing the computed property. 
* The optionally [defined result type to be assumed](#selecting-type-handler-0-3-0) is named in property `type` and the according _type handler_ is exposed as `$type`. Either property may be `undefined` in case of omitting definition of particular result type.

In addition the name of computed property as used in model's schema is stripped off any appended type information.

For example, a definition like

```javascript
computed: {
    fullName() { return this.lastName + ", " + this.firstName; },
    "ageInDays:number"() { return this.ageInSeconds / 86400; }
}
```

will be exposed in schema like this:

```javascript
computed: {
    fullName: {
        code() { return this.lastName + ", " + this.firstName; },
    },
    ageInDays: {
        code() { return this.ageInSeconds / 86400; },
        type: "number",
        $type: { ... API of type handler for numbers ... },
    },
},
```

This resulting format for defining a computed property may be used in the first place instead of that simple approach described before, as well.

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

### Options

A schema definition may include options for customizing the resulting model's behaviour in selected situations. These options are given in a separate section of schema named `options`.

These options are supported currently:

* **onUnsaved** controls value exposed as [property `onUnsaved` of resulting model](../api/model.md#model-onunsaved).

```javascript
{
    props: {
        someProp: {}
    },
    options: {
        onUnsaved: "ignore"
    }
}
```


### Indices

Defining a model basically does not require definition of any index. However, managing large amounts of items strongly benefits from indices that support operations frequently used to search and sort instances by a property either index is covering. 

Indices result in redundantly stored information and thus shouldn't be created for each and every property and operation probably used for searching instances some day. Managing indices has a negative impact on saving data, too. In addition, temporary indices result in Hitchy applications taking more time to start. That's why you should always explicitly define as many indices as required and as little indices as needed.

There are two opportunities for defining indices to be described below.

#### Defining Per Actual Property

Indices may be defined in conjunction with either property just like its type and optional constraints. A property's indices are defined in another definition property named `index` there. This definition property is listing types of indices each usually related to some test operation used on searching items by this particular property. The resulting index is meant to improve that related operation's performance.

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

In case of `firstName` an index of type `eq` is defined, which is an abbreviation for _equality_. This index is meant to improve searching items exactly matching some given value.

:::tip Equality is sufficient
By design, an _equality_ index is suitable for improving additional search operations as well. That's why you would stick with equality indices in most cases and it is why Odem currently isn't supporting any other type of index.
:::

The second case of `age` is illustrating opportunity to define separate indices suitable for improving search by `age` being **g**reater **t**han (thus `gt`) or **l**ess **t**han (thus `lt`) some given value. 

When defining single index per property the index type may be given as string, too. Using `true` instead of an index type name is identical to using `"eq"`.

Multiple indices may be defined per property. This requires use of an array listing type of either index. Alternatively an object may be used to map either type of index into some truthy value. This organisation is adopted by schema of resulting model. See the [section on index reducers](#index-reducer) below for some examples.


#### Defining Index in Separate Section <Badge type="info" text="0.2.8+"></Badge>

Some use cases can't be defined in context of an actual property's definition. That's why defining indices in a dedicated section of your schema definition is supported as well.

Section **indices** (or **indexes** or **index** which are checked in this order as fallback, only) of your schema definition may provide an object mapping either name of an index into its definition. The latter is given as another object.

```javascript
{
    indices: {
        firstName: { ... },
        age: { ... },
    }
}
```

In this example two indices named `firstName` and `age` are defined. The names must be unique in context of defined model. 

The index options are customizing the kind of index. There is a default for every supported option. If you just want to rely on all defaults you might provide `true` instead of the options object.

```javascript
{
    indices: {
        firstName: true,
        age: true,
    }
}
```

Here come the commonly supported options per index definition:

* The **type** of index is usually `"eq"` selecting definition of an equality index. It is the default type and as of now it is the only supported one as well.
* The index **reducer** is a function to be invoked on every value that's passed to the index e.g. for tracking its containing item on change of indexed property's value or for searching items by indexed property.

When defining a property-related index here (instead of doing so in context of property as described before) another option **property** selects the model's property which is to be covered by resulting index. This may name may address an actual or a computed property.

When defining an index for a computed property there is no reliable information on what type of values the computed property will return for indexing. Thus you should provide a particular type in option **propertyType**. Its value works equivalent to the **type** option provided on defining actual properties. However, when omitted the default isn't `"string"` but some abstract base type which is slightly more capable of handling different types of values than string type handler.

```javascript
{
    props: {
        firstName: {},
        lastName: {},    
    },
    computed: {
        fullName() { 
            return this.lastName + ", " + this.firstName;
        },
        searchable() {
            return ( this.lastName + ", " + this.firstName ).toLowerCase();
        },
    }, 
    indices: {
        lastName: true,
        fullName: true,
        searchable: {
            propertyType: "string"
        },
    }
}
```

In this example three indices of type _equality_ are defined for covering the actual property **lastName** and the computed properties **fullName** and **searchable**. Definition of the latter includes declaration of assuming string values, only.

:::warning Important
A schema must not define multiple indices of same type for the same property. This holds true even when defining some indices in context of properties and some in context of this dedicated section.
::: 



#### Index Reducer <Badge type="info" text="0.2.7+"></Badge>

By default any index is created using selected property's values as-is. In several cases this isn't desired, though.

* String-based indices work case-sensitive by default. Often it is sufficient to work case-insensitively. An index reducer can be used to establish this.

* When defining index for a property of type **date** there might be different values for every item due to creating another item every second. This would result in a very inefficient index tree. Probably the application doesn't need to find values of that property for every second, but is satisfied with searching all items of a day.

* When defining index on a string property this property might have arbitrarily long string values resulting in a huge waste of memory when redundantly using either string for indexing in full. The related application might be okay with distinguishing between given string values when focusing on first 20 characters per string. In this case saving more than 20 characters per string value doesn't make sense.

In either situation an _index reducer_ may be defined. This is a function invoked to derive a value for use in declared index from either actual value of related property. When defining index reducer for single equality index you may provide a definition property **index** which is a function. Just replace:

```javascript
module.exports = {
    props: {
        firstName: {
            index: "eq"
        },
    },
};
```

with 

```javascript
module.exports = {
    props: {
        firstName: {
            index: value => value.substr( 0, 20 ), 
        },
    },
};
```

to declare index reducer for equality index that is causing index to always cover first 20 characters per string value at most.

:::warning Important!
Any index reducer is invoked if related value is set, only. Thus index reducers are never invoked with `null` or `undefined`.
:::

The definition property **index** must be given as object when declaring index reducer for other types of indices or when defining multiple indices with one or more of them using index reducer. The following example is equivalent to the previous one:

```javascript
module.exports = {
    props: {
        firstName: {
            index: {
                eq: value => value.substr( 0, 20 ),
            },
        },
    },
};
```

You can declare different reducers per type of index this way:

```javascript
module.exports = {
    props: {
        firstName: {
            index: {
                eq: value => value.substr( 0, 20 ),
                gt: value => value.substr( 0, 3 ),
            },
        },
    },
};
```

Reducers are always invoked of context of related item. That's why any reducer can access full API of that item when using regular function instead of arrow-function:

```javascript
module.exports = {
    props: {
        firstName: {
            index: {
                eq( value ) { return this.scrumble( value ); },
            },
        },
    },
};
```

When combining definition of multiple indices you may provide `true` instead of a reducer function to define related type of index without custom index reducer:

```javascript
module.exports = {
    props: {
        firstName: {
            index: {
                eq( value ) { return this.scrumble( value ); },
                gt: true,
            },
        },
    },
};
```

When searching a model for property value with index using index reducer the search value is passed through either index reducer as well.


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

When putting this in a file **api/models/public-holiday.js** the resulting model won't be implicitly named **PublicHoliday**, but **MyCustomName**.


## Property Processing

A model's properties are passing separate stages in different situations of interacting with a model's instance. In general, those stages are:

### Serialisation

A property's value is serialised when writing it to persistent data storage through some adapter. Values are converted into a format which is basically just describing the original value and is suitable for being written into a data storage for later recovery.

### Deserialisation

A property's value is deserialised when reading it back from persistent data storage through some adapter. This is the counterpart to serialisation and recovers the original value of a property from its description resulting from previous serialisation.

### Coercion

A property's value is [_coerced_](https://en.wikipedia.org/wiki/Type_conversion)

  * when assigning a value as in `instance.myProp = newValue`,
  * after deserializing its value read from record in persistent data storage and
  * when comparing it with another value (applying coercion to either value).
  
Coercion is meant to assure that a property's value always complies with the property's declared type. A type's implementation of any other stage should assume a provided value's type. That's why coercion is applied whenever trying to adjust a property's value or when trying to compare it with other values.

### Validation

A property's value is tested for complying with defined constraints.

### Comparison

A value is tested for satisfying some given comparison operation probably involving one or more additional values.

### Chronology of Stages

When interacting with a model's item described stages are passed in different combinations. When you load it from data storage its properties are _deserialized_ and _coerced_. After that you can adjust the properties which results in another _coercion_ of either assigned value. When saving changes to data storage _validation_ occurs right before _serializing_ properties' values.

### Stage-Related Options

Properties are processed using separate components each suitable for handling a particular type of values. Those _type handler_ provide implementations for either stage described before. 

Implementations for stages **coercion** and **validation** may be customized using special options in either property's definition. Supported options are described for every type of property below. Badges <Badge>coercion</Badge> and <Badge type="warning">validation</Badge> are used there to indicate whether some option is obeyed in either stage of processing a related property.


## Property Types

As described before every property is bound to one out of several supported types. Properties not picking any type explicitly are bound to type _string_ by default.

:::tip
`null` or `undefined` are supported by either type of property. They are used to indicate that there is no actual property value.
::: 

The following example defines two properties of type _string_.
 
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

In property definitions the `type` option selects a _type handler_ which is affecting the [property's processing as described before](#property-processing).

Every type of property comes with a set of definition properties or _constraints_ that can be optionally applied when defining the model. There are some commonly supported constraints to be listed here. Type-specific constraints are listed below in combination with introducing either type.

### Commonalities

#### required <Badge type="warning">validation</Badge>

This boolean options applies constraint controlling whether this property requires a non-null value or not. When set `true` instances of the model mustn't be saved without providing non-null value for this property.

#### default <Badge type="info">coercion</Badge> <Badge type="info">0.4.3+</Badge>

This optional definition property selects a value to assigned implicitly on creating new instances.

:::tip Example  
```javascript
module.exports = {
    name: "MyModel",
    props: {
        type: { default: "foo" },
        score: {},
    },
};
```  

This results in a model with properties named `type` and `score`. Creating new instance of this model will assign any provided default alue implicitly:

```javascript
const instance = new MyModel();
console.log( instance.type );     // "foo"
console.log( instance.score );    // undefined
```
:::


### Strings

Strings are declared with `type: "string"` or by omitting the declaration property `type` altogether.

Properties of type `string` are capable of holding a sequence of arbitrary characters. The following options customize the way either string property gets processed and validated. 

#### trim <Badge>coercion</Badge>

This boolean declares whether values should be trimmed implicitly or not. By trimming a string value all leading and trailing whitespace gets removed.

#### reduceSpace <Badge>coercion</Badge>

This boolean option declares whether whitespace should be normalized or not. Normalization refers to replacing all sequences of multiple whitespaces by a single SPC character.

#### upperCase <Badge>coercion</Badge>

This boolean option demands to replace any lowercase letter in value by its uppercase counterpart.

#### lowerCase <Badge>coercion</Badge>

This boolean option demands to replace any uppercase letter in value by its lowercase counterpart.

#### minLength <Badge type="warning">validation</Badge>

This integer option applies constraint requiring minimum number of characters in a non-null value.

#### maxLength <Badge type="warning">validation</Badge>

This integer option applies constraint requiring maximum number of characters in a non-null value.

#### pattern <Badge type="warning">validation</Badge>

This regular expression applies constraint requiring any non-null value to match this pattern. Provided pattern might be literal regular expression like `/^some-pattern$/` or some string containing it, e.g. `"^some-pattern$"`.


### Numbers

Numbers are declared with `type: "number"`. Aliases are `type: "numeric"`, `type: "decimal"` or `type: "float"`.

Properties of type number are capable of holding numeric values with decimal digits.

#### step <Badge>coercion</Badge>

This numeric value results in snapping numbers to multitudes of this value related to configured minimum value in declaration property `min` or to 0 on omitting that declaration property.

::: tip
Declaring step size `1.0` while having integer minimum value constraint in `min` limits values to be integers, though they are still handled as fractional numbers without decimal digits.
:::

#### min <Badge>coercion</Badge> <Badge type="warning">validation</Badge>

This numeric value applies constraint requiring any non-null value to be greater than this value or equal it.

In coercion this option declares base value of optionally configured step size.

:::tip
Declaring `min: 4.2` and `step: 5.3` results in numeric values snapped to values `4.2`, `9.5`, `14.8`, ...
:::

#### max <Badge type="warning">validation</Badge>

This numeric value applies constraint requiring any non-null value to be less than this value or equal it.


### Integers

A separate type handler is provided to particularly handle _integers_. This type handler is used when declaring a property with `type: "integer"`.

The type handler provides the same options as the more common type handler for numbers though working with any constraint value limited to integer values as well.


### Booleans

Booleans are declared with `type: "boolean"`.

Boolean values are `true` and `false`. 

Starting with version v0.4.3 it is possible to assign certain keywords to be coerced to supported values given above.

* Supported keywords resulting in `true` are `"yes"`, `"y"`, `"true"`, `"t"`, `"set"` and `"on"`. 
* Supported keywords resulting in `false` are `"no"`, `"n"`, `"false"`, `"f"`, `"unset"` and `"off"`. 

Either keyword is supported case-insensitively.

#### isSet <Badge type="warning">validation</Badge>

This boolean option applies constraint requiring any provided value to be `true`.


### Timestamps

Timestamps are declared with `type: "date"`. A supported alias is `type: "time"`.

Values are represented using instance of Javascript's native class for `Date`. Due to supported coercion it's possible to assign strings as well using a limited set of formats.

#### time <Badge>coercion</Badge>

This boolean option results in timestamps being stripped off their time of day information. It must be set `false` explicitly to achieve that.

#### step <Badge>coercion</Badge>

This numeric value is a number of milliseconds timestamp values are snapped to. The snapping occurs related to a given minimum timestamp declared in `min`.

#### min <Badge>coercion</Badge> <Badge type="warning">validation</Badge>

This timestamp applies constraint requiring any value to be greater than this timestamp or equal it.

The value might be given as string complying with a limited set of formats, as a string or numeric value representing number of milliseconds since midnight of January 1st, 1970 or as an instance of Javascript's natively supported class `Date`.

#### max <Badge type="warning">validation</Badge>

This timestamp applies constraint requiring any value to be less than this timestamp or equal it.

The value might be given as string complying with a limited set of formats, as a string or numeric value representing number of milliseconds since midnight of January 1st, 1970 or as an instance of Javascript's natively supported class `Date`.


### UUIDs

UUIDs are supported to track references on associated instances of same or any other model. 

:::tip
A relational database like MySQL supports referencing instances of same or different model(s). This includes fetching referenced instances or aggregating information on such related instances as part of a query.

In Hitchy Odem - for being an ODM instead of an ORM - relations between instances are not supported implicitly. Instead it is up to your application to handle relations between instances. This property type is meant to save references on other instances you can use to indicate relations and handle those indicators as you like. 
:::
 
UUIDs are declared with `type: "uuid"`. A supported alias is `type: "key"`.

Values are represented as instances of `Buffer` containing 16 bytes. Due to supported coercion it's possible to assign strings as well using the common format of UUIDs like `12345678-1234-1234-1234-123456789012`. 

On assigning any incompatible value it is coerced to `null`. This includes buffers with more or less than 16 bytes.



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

See the [Model API regarding hooks](../api/models#hooks) for a full list of supported life cycle events.
