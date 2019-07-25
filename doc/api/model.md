# Model API

## Static Methods

### Model.define( name, schema, baseClass, adapter )

This method is available to create a new model class according to provided definition. See the related documentation for defining models for additional information.

### Model.list()

This method promises an (excerpt from) unconditional list of current model's instances.

### Model.findByAttribute()

This method promises a list of model instances matching condition described in arguments.


## Static Properties

The abstract `Model` does not expose any static properties itself. But there static properties exposed by model classes compiled from a definition using `Model.define()`. The following description refers to `Model.*` to reflect this commonality between all compiled models that always derive from `Model`.
 
### Model.name

The name of model selected on defining it is exposed in context of model.

### Model.adapter

This property exposes the adapter selected to persistently store instances of the model.

### Model.schema

The qualified definition of model is exposed as its _schema_.

### Model.indices

This array is a concise list of indices defined in context of current model. Every item in this list provides the property either index is used for and the type of index or comparison operation. Every item looks like this one.

```javascript
{ property: "loginName", type: "eq" }
```

The exposed list is empty if there was no index defined for any of current model's properties.


### Model.derivesFrom

This property refers to the class current model is derived from. The resulting class is always `Model` or some class derived from `Model`.


## Instance Methods

### instance.load()

Promises properties of current instance loaded from persistent data storage.

### instance.save()

Promises properties of current instance persistently saved in data storage.

### instance.validate()

Validates values of every property in current instance promising a list of encountered validation errors. Validation is successful if promised list is empty, only.

### instance.remove()

Promises removal of current instance from data storage.

### instance.toObject( omitComputed )

Extracts values of all properties of current instance. By default, this includes values of computed properties. You might pass `true` as an argument to omit computed properties, though.


## Instance Properties

Basically, an instance of a model exposes every actual or computed property according to the model's definition. Those properties' names must not start with a `$` by intention to prevent naming conflicts with any implicitly available property described here.

:::warning Note!
There is one exclusion from this rule of prefixing implicit properties with `$`.

Every instance of a model is assumed to have a unique UUID for safely addressing it. This property is exposed as `instance.uuid`. A model's definition mustn't use this name for any element in turn.
:::

### instance.$properties

The current instance's actual properties are managed in a monitored object which is exposed as `instance.$properties`. 

For example, if you have defined a property `name` for your model then there is a property `instance.name` suitable for reading or writing related value of either instance of model. The actual value is managed as `instance.$properties.name` internally.

It does not matter which way you access properties, but for the sake of simplicity and to create future-proof code you should use the exposed properties instead of `instance.$properties`.

### instance.$adapter

This property exposes adapter used to persistently store this instance of model. It might be different from the adapter defined for use with the model as a whole, though it won't be different in most cases.

### instance.$isNew

This property indicates whether current instance has been freshly created. This is assumed in case of missing UUID associated with current instance.

### instance.$exists

This property exposes promise for indicator whether data storage contains representation of instance currently.

### instance.$super

This property exposes object sharing prototype with the the class this model's class is derived from. Thus, it exposes that one's instance-related methods and properties.

### instance.$hooks

For every supported life cycle event the model definition might provide a particular callback to be used whenever the related event is emitted. Those _hooks_ are exposed concisely via this property of every model's instance. Accessing any hook by name results in a function returned so it is safe to blindly invoke any hook you like. If you need to know whether some hook has been defined, though, you could inspect the schema via `Model.schema.hooks` or use `in` operator here like this:

```javascript
if ( "beforeCreate" in this.$hooks ) {
	// implement your code here
}
``` 
