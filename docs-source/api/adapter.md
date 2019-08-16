---
prev: model.md
next: false
---

# Adapter API

Models are relying on _adapters_ to access data in a persistent data storage. This document is about those adapters, how to use them and how to create one yourself.

## Available Adapters

There are two adapters that ship with hitchy-plugin-odem:

* MemoryAdapter
* FileAdapter

The first one is a useful adapter for developing applications for it doesn't actually save any data but manages records in volatile memory. The second one is meant to implement a very basic opportunity to persistently save records without relying on any additional software.

Either adapter is exposing an API which is very similar to the API of LevelDB. That's why it is possible to write your own adapter for saving records in a key-value-store like LevelDB.

## MemoryAdapter

If you intend to save records in volatile memory you might want to use an instance of MemoryAdapter. Simply create an instance of it. There are no options required to customize its behaviour.
 
 ```javascript
const adapter = new MemoryAdapter();
```

This adapter may be provided on calling `Model.define()` or on constructing an instance of your defined model afterwards.

## FileAdapter

Using file adapter all records are saved in a folder of your local filesystem. That's why you should pass option on creating FileAdapter instance selecting that folder by its path name:
 
 ```javascript
const adapter = new FileAdapter( {
    dataSource: "/path/name/of/a/folder"
} );
```


