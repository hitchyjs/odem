# Defining a Hierarchy of Models

Adopting aspects of the object-oriented programming models can be derived from each other. By relying on this kind of inheritance it is possible to declare similar models deriving from a common base model without repeating equivalent parts of either model.

## Deriving In Code

```javascript
const { Model } = require( "hitchy-odem" );

const Root = Model.define( "root", {
    props: {
        rootName: {},
        name: {},
    },
    computed: {
        rootConverted() { return `root: ${item.rootName}`; },
        converted() { return `root: ${item.rootName}`; },
    },
} );

const Sub = Model.define( "sub", {
    props: {
        subName: {},
        name: { type: "integer" },
    },
    computed: {
        subConverted() { return `sub: ${item.rootName}`; },
        converted() { return `sub: ${item.subName}`; },
    },
}, Root );
```

This example is defining two separate models with the second model providing three instead of two arguments when invoking `Model.define()`. The third argument is selecting some previously defined model to be used as _parent_ of model to be defined. This results in defined model automatically exposing same properties, methods and hooks as the selected parent model at least. It might add properties or methods missing in parent model as well as replacing them.

:::tip Information
When deriving model from an existing model the definition must not contain at least one property.  
:::

In methods of a model it is possible to access a method with same name in parent class:

```javascript
const Base = Model.define( "Base", {
    props: {
        info: {},
    },
    methods: {
        fetch() { return "base"; },
    },
} );

const Replacing = Model.define( "Replacing", {
    methods: {
        fetch() { return `sub: ${this.$super.fetch.call( this )}`; },
    },
}, Base );
```

:::warning Important  
This approach does not work for computed properties.  
:::

A similar approach works for static methods as well:

```javascript
Replacing.createRecord = function() {
	const record = this.derivesFrom.createRecord();

    // add your code here

    return record;
};
```

## Deriving in Hitchy-Compliant Definition File

When defining model using definition file in folder **api/model** of your project you can use special root-level definition property `parent` to name the model to derive from. 

:::tip
The convention assumes files to use kebab-case file names converted into PascalCase model names. You should stick with this naming pattern when using `parent` as well by using either kebab-case or PascalCase value there.
:::

```javascript
module.exports = {
    parent: "base",
    methods: {
        fetch() { return "base"; },
    },
};
```
