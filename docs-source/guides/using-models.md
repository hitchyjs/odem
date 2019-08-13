---
prev: ./defining-models.md
next: false
---

# Using Models

## Server-Side Code

When implementing code in your Hitchy-based project you might have defined models using `Model.define()`. Any model defined that way is returned from invoked `Model.define()` and can be used right away. However, when defining models via filesystem by placing model definition files in folder **api/model** of your Hitchy-based project those models are exposed via Hitchy's runtime API. This API is available in context of dispatched requests and therefore can be used in policy and route handlers.

Let's pretend there is a file **api/model/user.js** like this one:

```javascript
module.exports = {
	props: {
		loginName: {},
		password: {},
	},
};
```  

This would establish prerequisites for using a controller file **api/controller/user.js** like this one:

```javascript
module.exports = {
	getByLoginNameAction( req, res ) {
		const { User } = this.api.runtime.models;
		
		User.find( { eq: { name: "loginName", value: req.params.name } } )
			.then( matches => res.json );
	},
};
```  

The name of controller file doesn't matter here, though. The essential part is how the code is accessing the runtime API in context of a controller function. The same applies to policy handlers. Arrow functions don't work here due to using `this` for accessing the model.

The [common API of models](../api/model.md) is providing additional information for use in server-side code.

## Client-Side Code

Accessing models from client-side code is beyond the scope of this extension. Exposing models over the network is a job you need to implement yourself using server-side code. 

As an option you might add an existing plugin that implements particular API for accessing models over the network. One of those plugins is [hitch-plugin-odem-rest](https://www.npmjs.com/package/hitchy-plugin-odem-rest) and you should start with adding that one as a dependency right away for it will implicitly install this extension, too.

