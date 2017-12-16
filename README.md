# Local Citation Network Explorer

This is a tool that uses the citation relations between scientific papers to help researchers find interesting and relevant papers.

The user specifies several 'seed' papers which define the specific area of the scientific landscape they are interested in.

The tool then searches several databases to find the papers that cite or are cited-by the seed papers.

Papers that are cited by a lot of the seed papers are likely to be important foundational papers in the field (or certaintly worth being aware of at least).

Papers that cite a lot of the seed papers are likely to be more recent papers in the same area that might be worth reading.

The tool allows the user to view these highly connected papers either in a table or in the context of the network.


## Getting Set Up

1. Clone the repo.

```
git clone https://github.com/bjw49/citation-network-explorer.git

```

2. To be able to use the Microsoft Academic Graph you'll need an API key for the Microsoft Academic Knowledge API from [here](https://azure.microsoft.com/en-gb/try/cognitive-services/?api=academic-knowledge-api). You can use the tool without one but the title search functionality won't work and the coverage of the Open Citation Corpus isn't as good yet (though it is growing every day).

2. If you have an API key, make a file called `apikeys.js`, save into your directory, and add the following line:

```javascript

MICROSFT_API_KEY = "YOUR API KEY GOES HERE"

```

3. If you're going to be pushing back to the server make sure to add `apikeys.js` to your .gitignore file



## Instructions for use

1. Open citationExplorer.html
2. There are three ways of choosing seed papers to start with:
    1. Add directly by DOI
    2. Upload a bibTex file (NOTE: currently only entries with a DOI will be added)
    3. Search for seed papers by title
        * Papers with titles containing the query words are displayed in the Search Results table.
        * Choose which papers to add as seeds by clicking the Add buttons at the end of each row.
3. The seed papers added appear in the table in the 'My Seed Papers' tab
4. The papers connected to these seed papers in the network appear in the 'Connected Papers' tab. This can be sorted by "Seeds Cited" or "Seeds Cited-By" in order to find highly connected papers.
5. The network can be viewed graphically in the Network Viewer tab.
6. If one of the connected papers seems highly relevant you can add it as a seed paper either from the table or network view, expanding the network in order to uncover more papers.
7. In order to hide less well connected papers from the Network View use the Threshold Slide to select the minimum number of connections to be displayed.
8. You can switch between viewing the graph with references of the seed papers and a graph with the papers that cite the seed papers by clicking the 'Cited-By' and 'References' buttons.

## Test Case

There is an example BibTex in the repository (exampleBibTex.bib) which you can try importing as a test case.