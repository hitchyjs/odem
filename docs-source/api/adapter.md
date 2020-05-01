---
prev: model.md
next: false
---

# Adapters

Models are relying on _adapters_ for accessing its data in a connected data storage. When defining a model an adapter may be provided to use for all instances of resulting model instead of some default adapter.

This document is about those adapters, how to use them and how to create one yourself.

## Available Adapters

There are two adapters distributed as part of hitchy-plugin-odem and exposed as service components:

* [**OdemAdapterMemory**](#storing-data-in-volatile-memory) is storing data in volatile memory
* [**OdemAdapterFile**](#storing-data-in-local-filesystem) is storing data in local filesystem

In addition, separate plugins are capable of providing additional adapters, just like:

* [hitchy-plugin-odem-etcd](#storing-data-in-etcd-cluster) us adding support for storing data in an etcd-based cluster.

Adapters are exposing an API very similar to the one of LevelDB. That's why it is possible to write your own adapter for saving records in a key-value-store like LevelDB.

### Storing Data in Volatile Memory

The service component **OdemAdapterMemory** of Hitchy's ODM is an adapter most useful for developing and testing applications as it doesn't actually save any data but manages records in volatile memory, only.

Creating instances doesn't take any options. Different instances manage different sets of records, so it's even possible to have different sets of data separately managed in volatile memory.
 
 ```javascript
const adapter = new api.runtime.services.OdemAdapterMemory();
```

This adapter may be provided on calling `Model.define()` explicitly. In a default setup it is also used whenever omitting provision of adapter on calling that function.

### Storing Data in Local Filesystem

This adapter is meant to implement a very basic opportunity to persistently save records without relying on any additional software. It is thus suitable for smaller, single-node applications e.g. desktop software based on [Electron](https://www.electronjs.org/).

When using it all records are saved in a folder of your local filesystem. That's why you should provide the path name of folder to contain all those files as option on creating instances of **OdemAdapterFile**:
 
 ```javascript
const adapter = new api.runtime.services.OdemAdapterFile( {
    dataSource: "/path/name/of/a/folder"
} );
```

### Storing Data in Etcd Cluster

Separate plugin [hitchy-plugin-odem-etcd](https://www.npmjs.com/package/hitchy-plugin-odem-etcd) enables data being persisted in an etcd cluster, too. This option is intended for use with production setups running in a cluster enabling horizontal scaling of your Hitchy application.

See the plugin's documentation for up-to-date information on how to integrate it with your application. The following excerpt is meant to demonstrate the ease of integrating Odem with etcd cluster instead of some local filesystem, only:

```javascript
const adapter = new api.runtime.services.OdemAdapterEtcd( {
    hosts: [
        "https://etcd1:2379",
        "https://etcd2:2379",
        "https://etcd3:2379",
    ],
    // optional: share single etcd cluster with multiple apps
    prefix: "/apps/my-app",
    auth: {
        username: "etcd-login-user",
        password: "secret-pw",
    },
    // optional: authenticate server and client on encrypted connections
    credentials: {
        rootCertificate: require( "fs" ).readFileSync( "path/to/ca.pem" ),
        certChain: require( "fs" ).readFileSync( "path/to/cert.pem" ),
        privateKey: require( "fs" ).readFileSync( "path/to/key.pem" ),
    }
} );
```

## Configuring Default Adapter

In compliance with Hitchy's conventions you may create a file **config/database.js** in your Hitchy-based project's folder with content like this:

```javascript
const File = require( "fs" );

module.exports = function() {
    return {
        database: {
            default : new this.runtime.services.OdemAdapterFile( {
                dataSource: "/path/name/of/a/folder"
            } ),
        },
    };
};
```

This example is replacing the default adapter storing all data in volatile memory with another adapter storing all data in a folder of your local filesystem.
