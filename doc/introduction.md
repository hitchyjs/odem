# About Hitchy's ODM

Hitchy is a server-side framework purely written in Javascript. It consists of a core which comes with limited abilities as it is basically capable of generically handling requests via HTTP and discovering extensions to provide some actual request handlers.

Hitchy's ODM is an object document manager integrating with Hitchy as a discoverable extension. It doesn't provide actual request handlers, but provides an API for managing structured data. It 

* focuses on non-relational data, 
* intends to provide a simple way for declaring data structures,
* provides API for adopting database APIs for storing structured data and
* offers API for accessing structured data using server-side code.

If you intend to access your data via HTTP requests you should have a look at another extension to Hitchy called [hitchy-plugin-odem-rest](https://www.npmjs.com/package/hitchy-plugin-odem-rest). Your application should depend on that one instead as it will add this extension in turn thus offering all the benefits this extension is providing.

## Structured Data?

In an ODM you declare types of data or _classes_ or _models_. Every model describes _instances_ or records of actual data each complying with a certain structure. This structure is part of a model's declaration. It is a set of _attributes_, each of a certain _type_ of information and optionally attached with certain _constraints_. On handling instances of a model every attribute of that model result in a _property_ of an instance. 

::: tip Example
The common use case for starting a web application is a blog. A blog has _posts_, _comments_ and _users_ that act in different _roles_. These all are **models** of that application. 

Every model consists of common **attributes**. A blog is always having a _title_ and some _content_, a _time of creation_ and an _author_. In opposition to that a comment _belongs to a post_, comes with an _author_, its _content_ and a _time of creation_. Users have a unique _login name_, a secret _password_ and some _mail address_. 

Some attributes are meant to be _unique_ or to be _always_ there. Such keywords indicate **constraints** that might apply to either property. Constraints are rules required to apply to either instance of a model prior to saving it in a database or similar. This helps assuring the integrity of data.

All this describes similarities in records of actual data. It doesn't describe any actual data of your application, though, that is a user named Bob or Alice or any of either user's posts in particular.
:::

* [How To Declare Models](guides/declaring-models.md)
