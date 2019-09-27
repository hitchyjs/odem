# Hitchy's Odem [![Build Status](https://travis-ci.org/hitchyjs/plugin-odem.svg?branch=master)](https://travis-ci.org/hitchyjs/plugin-odem)

_an object document management for hitchy_

## License

MIT

## About

[Hitchy](https://www.npmjs.com/package/hitchy) is a fast server-side framework focusing on these features:

* Easily discovering plugins.
* Fastly dispatching incoming requests to handlers of discovered plugins.

Thus, Hitchy starts lean and requires some plugin to help with conveniently managing data. That's the job this package is made for: It is an object document management system for Hitchy.
 
 This package is designed to work on top of a key-value store like LevelDB. Any such store is used via some backend API. Two backends are supported out of the box but neither of them is for LevelDB to keep the number of dependencies as little as possible.
 
 * A MemoryAdapter is included mostly for developing and testing an application. It is used by default.
 * A FileAdapter is storing all data in a controllable folder of your local filesystem. This backend is suitable for persistently storing data.
 
### Is It Ready For Production?
 
Starting with v0.1.0 hitchy-plugin-odem includes index-backed searching. This indexing is fixing one of the most severe bottlenecks of its FileAdapter by strongly improving performance on searching instances by indexed properties. Thus we believe that hitchy and hitchy-plugin-odem are ready for use in real-world applications. 
 
Of course, hitchy-plugin-odem isn't meant to compete with established database engines like MySQL or MongoDB. However, most applications don't require the performance provided by those engines either. Those applications might benefit from a lot easier setup. Just imagine running real-world applications out of the box on any server you like. The only requirement is support for Node.js. That's following one of the core-principles of Hitchy: getting rid of dependencies as good as possible.

## Documentation

The latest documentation is available at https://hitchyjs.github.io/plugin-odem/. 
