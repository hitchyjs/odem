# Accessing Models in Code

Just to be clear: this chapter is about accessing some model like the one declared before in _server-side code_. If you want to have access from client-side code you probably still want to stick with this chapter first and head over to the manual for extension **hitchy-plugin-odem-rest** or some related guide on this site later.

When discovered by Hitchy's core **hitchy-odem** is scanning the files in folder **api/model** of your project. It is compiling another model-controlling class for every file in that folder exposing [declaration of a model](defining-models.md). It is then exposing every compiled class in a collection of Hitchy's API named `models`. The naming of either class exposed there is matching the explicitly declared name of the model or - if explicit declaration of name is missing - is derived from the found file's name by converting it to lowercase first, then changing from kebab-case to PascalCase in compliance with Hitchy's conventions on naming files. 

::: tip Example
When defining a model in file **api/model/blog-post.js** without defining its name explicitly a class called **BlogPost** is created and exposed by **hitch-odem**. This class is accessible via Hitchy's API as `this.models.BlogPost`.
:::
