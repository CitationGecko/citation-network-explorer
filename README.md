# Welcome to Citation Gecko!

[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

This is a tool that uses the citation relations between scientific papers to help researchers find interesting and relevant papers.

The user specifies several 'seed' papers which define the specific area of the scientific landscape they are interested in.

The tool then searches several databases to find the papers that cite or are cited-by the seed papers.

Papers that are cited by a lot of the seed papers are likely to be important foundational papers in the field (or certainly worth being aware of at least).

Papers that cite a lot of the seed papers are likely to be more recent papers in the same area that might be worth reading.

The tool allows the user to view these highly connected papers either in a table or in the context of the network.

## Live demo

[citationgecko.com](http://citationgecko.com)

## Running Citation Gecko locally

1. Clone the git repo:
`git clone https://github.com/CitationGecko/citation-network-explorer.git`
2. If you don't have it already install Node.js from https://nodejs.org/en/.
3. Open a terminal and navigate to the repository folder.
4. Run `npm install` from the command line to install all the package dependancies.
5. Run `npm run build` from the command line to build the app. 
6. Run `node server.js` to launch the server.
7. The application will start at http://localhost:3000

## Instructions for use

1. Go to [citationgecko.com](http://citationgecko.com) or [localhost:3000](http://localhost:3000) if you're running application locally
2. Add some seed papers by clicking 'Add more seed papers' button in the left-hand panel.
2. There are several ways of choosing seed papers to start with:
    1. Add directly by entering a DOI
    2. Upload a bibTex file (NOTE: currently only entries with a DOI will be added)
        * There is an example BibTex in the repository (exampleBibTex.bib) which you can try importing as a test case.
    3. Search for seed papers by title
        * Papers with titles containing the query words are displayed in a table.
        * Choose which papers to add as seeds by clicking the Add buttons at the end of each row.
    4. Import from Zotero
        * This will redirect you to Zotero in order to authenticate the app allow you to add papers in your zotero collections. 
3. The seed papers added are listed in the left-hand panel and connections between them shown graphically in the right hand panel.
4. For a list of the papers connected to these seed papers click the 'Connected' tab in the left-hand panel. Papers can sorted by "Seeds Cited" or "Seeds Cited-By" in order to find highly connected papers.
5. In order to hide less well connected papers from the Network View use the Threshold Slide to select the minimum number of connections to be displayed.
6. You can switch between viewing a graph showing only references of the seed papers and a graph showing only the papers that cite the seed papers by clicking the toggle between 'Papers Cited-By Seed Papers' and 'Papers Citing Seed Papers' that also acts as a key.
6. If one of the connected papers seems highly relevant you can add it as a seed paper either from the list view or network view, expanding the network in order to uncover more papers.
