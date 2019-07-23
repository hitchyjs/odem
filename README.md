# Hitchy's Odem [![Build Status](https://travis-ci.org/hitchyjs/odem.svg?branch=master)](https://travis-ci.org/hitchyjs/odem)

_an object document management for hitchy_

## License

MIT

## Usage

Starting with version 0.1.0 the syntax for defining models has been revised. In opposition to earlier versions definitions **must be** separated into separate sections. Those sections have been renamed to comply with this list:

* The section **props** defines _actual properties_ per instance of resulting model. These props are the only information persistently stored in some connected data storage.

* The section **computed** lists methods used to implement getters (and setters) in addition to those properties defined in **props**. Such _computed properties_ are used like those actual properties. The method given in this section is invoked without passing any argument in case of reading the computed value or with one argument in case of writing it. Due to limitations of Javascript the latter case doesn't work with `undefined`, though.

* In section **methods** actual methods of model are listed. They are exposed as such in context of resulting model's every instance.

* A separate section **hooks** is supported to define lists of callbacks to invoke per supported life cycle event. Either list may contain of functions, only.

Static methods are explicitly applied to the resulting model class.

See the following example for illustration purposes:

```javascript
const { Model, FileAdapter } = require( "hitchy-odem" );
const fileBackend = new FileAdapter( "../my-data-store" );

const User = Model.define( "user", {
	// regular properties
	props: {
		name: { 
			type: "string",
			required: true,
			trim: true,
			minLength: 4,
			maxLength: 16,
		},
		secret: { 
			type: "string",
			required: true,
			process: value => createHash( value ),
		},
		level: { 
			type: "integer",
			default: 1,
			min: 1,
			max: 10,
		},
		lastLogin: { 
			type: "date",
		},
	},
	
	// computed properties
	computed: {
		hasLoggedInBefore() { return this.lastLogin != null; },
	},

	// life cycle hooks
	hooks: {
		beforeSave: [
			item => {
				item.secret = createHash( item.secret );
			},
		]
	},
}, { adapter: fileBackend } );

// static methods
User.create = function( name, secret ) {
	const user = new User();
	
	user.name = name;
	user.secret = secret;
	user.level = 0;

	return user.$save();
};


User.create( "John Doe", "very-secret" )
	.then( user => {
		user.level = 3;
		return user.$save();
	} )
	.then( () => User.findByAttribute( "level", 3 ) )
	.then( list => {
		// list[0].uuid === user.uuid
	} );
```
