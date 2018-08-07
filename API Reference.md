# Example Request

For web page + data:

http://www.citationgecko.com/?doi=10.10241frg23,10.102ngbsg324g,10.129r1bg2f,10.10033nf2yubg,10.10c2eg4gbgy344

For data only:

http://www.citationgecko.com/api/v1/?doi=10.10241frg23,10.102ngbsg324g,10.129r1bg2f,10.10033nf2yubg,10.10c2eg4gbgy344


# Example Response 

```
{
  success: true,
  data: {
    papers: [
      {
        id: "d01ff5c61eb0466f8f6ee50c8115b409",
        doi: "10.1126/science.1222901",
        microsoftId: "1234567890",

        isSeed: true,
        title: "Type 6 Secretion Dynamics Within and Between Bacterial Cells",
        authors: [
          {
            firstName: "M.",
            lastName: "Basler",
            orcid: "123456"
          },
          {
            firstName: "J. J.",
            lastName: "Mekalanos",
            orcid: "654321"
          }
        ],
        pubDate: "2012-08-17T00:00:00.000Z",
        journal: "Science", // maybe parentProduct ?
        publisher: "American Association for the Advancement of Science",

        references: ["f15df7ca1eb0466f8f6ee50c8115b413", "10def5c61eb0466f8f6ee50c8115b882"],
        citationCount: 20,
        openaccess: false,
        url: "http://science.sciencemag.org/content/337/6096/815"
      }
    ], 
    edges: [
      {
        source: "d01ff5c61eb0466f8f6ee50c8115b409"
        target: "d01ff5c61eb0466f8f6ee50c8115b409"
      }
    ]
  }
}
