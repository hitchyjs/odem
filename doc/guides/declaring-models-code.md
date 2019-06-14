# Declaring Models In Code

The preferred way of defining models in a Hitchy application is [via Filesystem](./declaring-models-filesystem.md). For sure, there is code reading and processing those files. That code is using API to be described in this chapter. You might want to use this API in testing your code e.g. to mock models your code is relying on.

The main module of hitchy-odem library exposes several classes. One of them is `Model`.

```javascript
const { Model } = require( "hitchy-odem" );
```

This class is providing static method `Model.define()` accepting these arguments:

* First there is the name of the desired model. 

  When [declaring models via filesystem](./declaring-models-filesystem.md) this name is derived from the file's basename without extension and it is converted from kebab-case to PascalCase there. Here you are responsible for applying any such derivation.
  
  ::: tip Reminder
  The definition in second argument might contain [`$name`](./declaring-models-filesystem.md#naming-models) to define a different name. This information is always used in favour of the name provided in first argument here. 
  :::
  
  The model's name is used to expose it as part of Hitchy's runtime API. It might be used to name the related set in datasource available via some adapter, as well.

* Second argument provides the definition as it is exported by the declaring file.

* An optional third argument may be provided to choose a particular base class the defined model is deriving from. That base class still needs to be derived from `Model`, though.

* A fourth argument might be given to select an adapter to be explicitly used with the resulting model instead of using some default adapter.

Basically it is okay to stick with the first two arguments:

```javascript
const { Model } = require( "hitchy-odem" );

const Person = Model.define( "person", {
	lastName: {},
	firstName: {},
	age: {}
} );
```

Third argument can be used to create a hierarchy of models:

```javascript
const { Model } = require( "hitchy-odem" );

const Person = Model.define( "person", {
	lastName: {},
	firstName: {},
	age: { type: "number" }
} );

const Employee = Model.define( "employee", {
	employedSince: { type: "date" }
}, Person );
```
