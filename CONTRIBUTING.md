# Installation

1. Clone the git repo:`git clone https://github.com/CitationGecko/citation-network-explorer.git`
2. If you don't have it already install Node.js from https://nodejs.org/en/.
3. Open a terminal and navigate to the repository folder.
4. Run `npm install` from the command line to install all the package dependancies.
5. Run `npm run build` from the command line to build the app. 
6. Run `node server.js` to launch the server.

# Understanding the structure of the repo

`public` contains all the files that can be delivered by the server to the end-user namely: the core webpage `GeckoApp.html`, the javascript that powers the app `main.js` and the stylesheet that makes it look pretty `stlyes.css`, along with various images and logos and an example bibtex file for the demo.

`main.js` and `styles.css` are compiled together from the source code in `src` using (Webpack)[https://webpack.js.org/].

The source code is split into several folders representing various modules which work together to form the client-side app.

`data-sources` contains modules which find metadata for papers, including their references and citations.
`integrations` contains modules to allow users to pull in seed papers from different sources i.e. zotero,mendeley, bibtex.
`ui` contains all code related to the user interface including the various visualisation modules.
`vendor` contains code from various third-party sources used by the app. 

The `routes` and `lib` folders contain code used by the server.

# Core

At the core of the app are two arrays `Papers` and `Edges`.

`Papers` is an array of objects with the following properties:

```
{
    doi: 
    title:
    year:
    author:
    year:
    journal:
}
```
Other metadata may be stored in each papers object by the different data-source modules. There is no mechanism for preventing namespace clashes yet so just be careful... 

`Edges` is an array of objects with the following properties:

```
{
    source: {} // the paper object of the citing paper
    target: {} // the paper object of the cited paper
}
```
Other metadata may be stored in each edge object by the different data-source modules. here is no mechanism for preventing namespace clashes yet so just be careful... 

The `core.js` does three things:

1. Provides functions for adding and removing papers and edges from the Papers and Edges arrays, handling things like checking if the paper already exists, merging if so and removing edges/papers no longer connected to anything.
2. Lists functions for calculating various metrics for each paper based on the network. These are stored as properties in each paper object.
3. Provides functions for defining events, adding responses to events and triggering events.

Events are used to allow modules to broadcast when something interesting is happening (i.e. a new seed paper has been added), so that other modules can listen for the event and do their thing (i.e. querying some database to find citations), without the broadcasting module having to know which other modules might be interested. 

The core events defined by default are:
```
'newSeed' //Event triggered when a new seed is added.
'seedUpdate' //Event triggered when more info is found on a seed i.e. title or doi.
'newPaper' //Event triggered when a new (non-seed) paper is added.
'paperUpdate' //Event trigger when non-seed paper is updated with more info. 
'newEdges' //Event triggered when new edges are added.
'seedDeleted' // Event triggered when a seed paper is deleted
```

# Adding a module

To add a new module just put the javascript and css files into the src folder and they will be transpiled automatically into the app.

Currently webpack is configured to use all `.js` files in the `src` folder as entry points. This means that any code in the `.js` file not contained in a function will be run automatically on load. I will probably look at a more gracefull way of doing this in the future.

Currently the `.css` files are just stiched together in one long list by `gulp`. Looking to use webpack loaders to deal with `css` properly in the future.

# Importing code form other modules

To use a function exported by another module use:

`import { nameOfExportedFunction } from 'moduleX'`

I've configured webpack so that it will looks in the `src` folder for either `moduleX.js` or a directory called `moduleX` which contains `moduleX.js`.

If `moduleX` is in a sub-folder use:

`import { nameOfExportedFunction } from 'path/to/folder/moduleX'`

To export functions for use in other modules use:

```
export function someFunctionToBeExported(){
    //code goes here
}
```







