---
prev: false
next: glossary.md
---

# About Hitchy's ODM

[Hitchy](https://hitchyjs.github.io/core/) is a server-side framework purely written in Javascript. It consists of a core which comes with limited abilities as it is basically capable of essentially handling requests via HTTP and discovering plugins to provide some actual request handlers.

Hitchy's ODM is an _object document manager_ integrating with Hitchy as a discoverable plugin. It doesn't provide actual request handlers, but provides an API for managing structured data. It 

* focuses on non-relational data, 
* intends to provide a simple way for defining data structures,
* supports an API to adopt database APIs for persistently storing structured data and
* offers another API for accessing structured data using server-side code.

:::tip Using Hitchy's ODM
If you intend to access your data via HTTP requests you might be interested in another plugin called [hitchy-plugin-odem-rest](https://www.npmjs.com/package/hitchy-plugin-odem-rest).
:::

## Structured Data?

In an ODM you define types of data or _classes_ or _models_. Every model describes _instances_ or records of actual data each complying with a certain structure. This structure is part of a model's definition. It is a set of _actual properties_, each of a certain _type_ of information and optionally attached with certain _constraints_. On handling instances of a model every property of that model may have an individual value for either instance. 

::: tip Example
The common use case for starting a web application is a blog. A blog has _posts_, _comments_ and _users_ that act in different _roles_. These all are **models** of that application. 

Every model consists of common **properties**. A blog is always having a _title_ and some _content_, a _time of creation_ and an _author_. In opposition to that a comment _belongs to a post_, but has an _author_, some _content_ and a _time of creation_ as well. Users have a unique _login name_, a secret _password_ and some _mail address_. 

Some properties are meant to be _unique_ or to be _always_ there. Such keywords indicate **constraints** that might apply on a property. Constraints are rules to be met by either instance of a model prior to saving it in a database or similar. This helps assuring the integrity of data.

All this describes similarities in records of actual data. It doesn't describe any actual data of your application, though, such as a user named Bob or Alice or any of either user's posts in particular. Information describing Bob and Alice as users are instances of the model _user_.
:::
