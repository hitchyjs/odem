(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{47:function(t,e,a){"use strict";a.r(e);var s=a(0),i=Object(s.a)({},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"about-hitchy-s-odm"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#about-hitchy-s-odm","aria-hidden":"true"}},[t._v("#")]),t._v(" About Hitchy's ODM")]),t._v(" "),a("p",[t._v("Hitchy is a server-side framework purely written in Javascript. It consists of a core which comes with limited abilities as it is basically capable of essentially handling requests via HTTP and discovering extensions to provide some actual request handlers.")]),t._v(" "),a("p",[t._v("Hitchy's ODM is an "),a("em",[t._v("object document manager")]),t._v(" integrating with Hitchy as a discoverable extension. It doesn't provide actual request handlers, but provides an API for managing structured data. It")]),t._v(" "),a("ul",[a("li",[t._v("focuses on non-relational data,")]),t._v(" "),a("li",[t._v("intends to provide a simple way for defining data structures,")]),t._v(" "),a("li",[t._v("supports an API to adopt database APIs for persistently storing structured data and")]),t._v(" "),a("li",[t._v("offers another API for accessing structured data using server-side code.")])]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("Using Hitchy's ODM")]),t._v(" "),a("p",[t._v("If you intend to access your data via HTTP requests you should have a look at another extension to Hitchy called "),a("a",{attrs:{href:"https://www.npmjs.com/package/hitchy-plugin-odem-rest",target:"_blank",rel:"noopener noreferrer"}},[t._v("hitchy-plugin-odem-rest"),a("OutboundLink")],1),t._v(". Your application should depend on that one instead as it will add this extension in turn thus offering all the benefits this extension is providing.")])]),t._v(" "),a("h2",{attrs:{id:"structured-data"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#structured-data","aria-hidden":"true"}},[t._v("#")]),t._v(" Structured Data?")]),t._v(" "),a("p",[t._v("In an ODM you define types of data or "),a("em",[t._v("classes")]),t._v(" or "),a("em",[t._v("models")]),t._v(". Every model describes "),a("em",[t._v("instances")]),t._v(" or records of actual data each complying with a certain structure. This structure is part of a model's definition. It is a set of "),a("em",[t._v("actual properties")]),t._v(", each of a certain "),a("em",[t._v("type")]),t._v(" of information and optionally attached with certain "),a("em",[t._v("constraints")]),t._v(". On handling instances of a model every property of that model may have an individual value for either instance.")]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("Example")]),t._v(" "),a("p",[t._v("The common use case for starting a web application is a blog. A blog has "),a("em",[t._v("posts")]),t._v(", "),a("em",[t._v("comments")]),t._v(" and "),a("em",[t._v("users")]),t._v(" that act in different "),a("em",[t._v("roles")]),t._v(". These all are "),a("strong",[t._v("models")]),t._v(" of that application.")]),t._v(" "),a("p",[t._v("Every model consists of common "),a("strong",[t._v("properties")]),t._v(". A blog is always having a "),a("em",[t._v("title")]),t._v(" and some "),a("em",[t._v("content")]),t._v(", a "),a("em",[t._v("time of creation")]),t._v(" and an "),a("em",[t._v("author")]),t._v(". In opposition to that a comment "),a("em",[t._v("belongs to a post")]),t._v(", but has an "),a("em",[t._v("author")]),t._v(", some "),a("em",[t._v("content")]),t._v(" and a "),a("em",[t._v("time of creation")]),t._v(" as well. Users have a unique "),a("em",[t._v("login name")]),t._v(", a secret "),a("em",[t._v("password")]),t._v(" and some "),a("em",[t._v("mail address")]),t._v(".")]),t._v(" "),a("p",[t._v("Some attributes are meant to be "),a("em",[t._v("unique")]),t._v(" or to be "),a("em",[t._v("always")]),t._v(" there. Such keywords indicate "),a("strong",[t._v("constraints")]),t._v(" that might apply on a property. Constraints are rules to be met by either instance of a model prior to saving it in a database or similar. This helps assuring the integrity of data.")]),t._v(" "),a("p",[t._v("All this describes similarities in records of actual data. It doesn't describe any actual data of your application, though, such as a user named Bob or Alice or any of either user's posts in particular. Information describing Bob and Alice as users are instances of the model "),a("em",[t._v("user")]),t._v(".")])])])},[],!1,null,null,null);e.default=i.exports}}]);