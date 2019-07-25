---
prev: introduction.md
next: guides/defining-models.md
---

# Glossary

The documentation _tries to_ stick with certain terminology. This glossary is provided to help with understanding those terms.

::: tip Revisions Welcome!
We don't claim this glossary to represent ultimate truth. This glossary is open for discussion and correction.
:::

The glossary isn't sorted alphabetically to help with reading it top to bottom, though some aspects might be given redundantly to understand every term individually.

## Model

A model combines a defined set of _structured information_ with associated _behaviour_ and applies a somewhat unique _label_ to this combination. It is used to describe a certain _type of item_ to be handled in code. Models can be derived by means of extending an existing model by adding or replacing information and/or behaviour resulting in a different, but related model.

For every model there may be a set of instances sharing that model as a description of their common structure and behaviour.

A model in ODM is very similar to a class in object-oriented programming.

::: tip Example
When creating an address book application it is going to handle records each describing a particular _person_. In this scenario _person_ is a model. 

It might define to have a name and some mail address for contacting this particular person. This is the _structured information_ common to all the records and thus also known as _a person's data_. 

The model will expose a method for sending mail to a particular person. This is the _behaviour_ associated with a person's data.

The address book might support different kinds of persons, such as _friends_ and _colleagues_. Either kind may be considered a derived model and it might adjust information structure and associated behaviour, e.g. adding birthday per friend to what is managed by common _person_ model.
:::

### Schema

When using a model's API the definition of properties and behaviour per model is exposed as the model's schema.

### Properties

In context of a model properties are used to describe the common structure of information found in instances of that model.

A definition of a property includes 

 * its name for identifying related information in context of instances of the model, 
 * its type of information used in every instance,
 * constraints to be applied to detect valid/invalid information and
 * indices used to improve performance on searching for/sorting by this property.

::: tip Example
One property of model _person_ in the address book application will declare to have a _last name_ (which is the identifying name of some information) as a _string of characters_ (that's the type of information) and that _providing a last name is required_ (which is a constraint applied to this information). 
:::

### Computed Properties

A model might define virtual properties that won't be stored persistently but will derive their information from other information of an instance on demand.

::: tip Example
When having actual properties _last name_ and _first name_ there might be a computed property _full name_ that is combining the former two attributes.
:::

### Methods

A method is a piece of code defined in context of a model. However, there are two types of methods with regards to context when running:

* A static or model-related method is running bound to the model, thus basically incapable of processing a particular instance of that model.

* An instance method is running bound to a particular instance of the model it was defined in. This method is capable of processing the particular instance as well as accessing its model and use static methods defined there.

::: tip Example
Searching a person by its name is an operation to be run in context of whole model rather than a single instance of it. Thus this method is a static method of model _person_.

Sending mail to a particular person requires information of that particular person as context and thus is defined as an instance method.
:::


## Item _or_ Instance

A single set of values complying with the structure of a particular model may be called an item or instance of that model.

In code, instances aren't just _complying_ with one of the models, but have a strong relationship with the model instead for the model's API is used to actually access and manage some of its instances.

::: tip Example
The address book application will be populated with information on several actual persons. Each particular person's individual data is an instance or item of the model.
:::

### Property Values

Every instance of a model is grouping values for the properties defined for the model. Either value has to comply with the type and constraints as defined.

::: tip Example
In address book application there might be a record for a person named "John Doe". This record will have a value "Doe" for the property named _last name_ which is a _string of characters_ and _is present_, thus complying with the definition of this property.
:::
