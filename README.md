# Welcome to Gecko!

This is a tool that uses the citation relations between scientific papers to help researchers find interesting and relevant papers.

The user specifies several 'seed' papers which define the specific area of the scientific landscape they are interested in.

The tool then searches several databases to find the papers that cite or are cited-by the seed papers.

Papers that are cited by a lot of the seed papers are likely to be important foundational papers in the field (or certaintly worth being aware of at least).

Papers that cite a lot of the seed papers are likely to be more recent papers in the same area that might be worth reading.

The tool allows the user to view these highly connected papers either in a table or in the context of the network.

For a demo of Gecko in action go to http://citationgecko.com. Alternatively, follow the instructions below to set it up to run locally.

## Setting up Gecko to run locally

1. Clone the repo (or just download as a zip)

```
git clone https://github.com/bjw49/citation-network-explorer.git

```

2. To be able to use the Microsoft Academic Graph you'll need an API key for the Microsoft Academic Knowledge API from [here](https://azure.microsoft.com/en-gb/try/cognitive-services/?api=academic-knowledge-api). You can use the tool without one but the title search functionality won't work and the coverage of the Open Citation Corpus isn't as good yet (though it is growing every day).

2. If you have an API key, open the file `microsoft.js` in a text editor and paste the API key into the line below (making the obvious substitution):

```javascript

MICROSFT_API_KEY = "YOUR API KEY GOES HERE"

```

## Instructions for use

1. Go to http://citationgecko.com or for running locally open GeckoApp.html (in the /public folder)
2. To get started add some seed papers by clicking the big green plus in the seed papers panel.
2. There are three ways of choosing seed papers to start with:
    1. Add directly by DOI
    2. Upload a bibTex file (NOTE: currently only entries with a DOI will be added)
        * There is an example BibTex in the repository (exampleBibTex.bib) which you can try importing as a test case.
    3. Search for seed papers by title
        * Papers with titles containing the query words are displayed in a table.
        * Choose which papers to add as seeds by clicking the Add buttons at the end of each row.
3. The seed papers added appear in the Seed Papers panel.
4. The papers connected to these seed papers in the citation network appear in the 'Connected Papers' panel. There are two ways of viewing the connected papers:
    1. In the network view the links between them are shown graphically.
        * In order to hide less well connected papers from the Network View use the Threshold Slide to select the minimum number of connections to be displayed.
        * You can switch between viewing a graph showing only references of the seed papers and a graph showing only the papers that cite the seed papers by clicking the toggle between 'Papers Cited-By Seed Papers' and 'Papers Citing Seed Papers' that also acts as a key.
    2. In the table view papers can sorted by "Seeds Cited" or "Seeds Cited-By" in order to find highly connected papers.
6. If one of the connected papers seems highly relevant you can add it as a seed paper either from the table or network view, expanding the network in order to uncover more papers.


