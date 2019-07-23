# Defining a Hierarchy of Models

Adopting aspects of the object-oriented programming models can be derived from each other. Using this kind of inheritance support it is possible to declare similar models deriving from a common base model without repeating equivalent parts of either model in code.

## Deriving In Code

```javascript
const { Model } = require( "hitchy-odem" );

const Root = Model.define( "root", {
    rootName: {},
    name: {},
    rootConverted: item => `root: ${item.rootName}`,
    converted: item => `root: ${item.rootName}`,
} );

const Intermittent = Model.define( "intermittent", {
    intermittentName: {},
    name: { type: "number" },
    intermittentConverted: item => `intermittent: ${item.rootName}`,
    converted: item => `intermittent: ${item.intermittentName}`,
}, Root );

const Sub = Model.define( "sub", {
    subName: {},
    name: { type: "integer" },
    subConverted: item => `sub: ${item.rootName}`,
    converted: item => `sub: ${item.subName}`,
}, Intermittent );
```

This example is defining three different models. All but the first model provide three instead of two arguments with the third argument selecting some previously defined model to be used as _parent_ of model to be defined. This results in defined model exposing same properties as the selected parent model. It might add properties missing in parent model as well as replacing properties exposed by parent.

## Deriving In Hitchy Model Definition

When defining model using definition file in compliance with hitchy's filesystem convention you create a file for every model in your project's folder **api/model**. Either file is exposing attributes and methods of desired model. Some special properties can be used to provide optional context information for the desired model such as its name in `$name` to be used explicitly instead of deriving model's name from used file's name. Another property is `$parent` selecting desired parent model by its name.

:::tip
The convention assumes files to use kebab-case on naming files resulting in PascalCase model names. You should stick with this naming pattern when using `$name` or `$parent` as well by using either kebab-case or PascalCase value there.
:::
