# Example Request

For web page + data:

http://www.citationgecko.com/?doi=10.10241frg23,10.102ngbsg324g,10.129r1bg2f,10.10033nf2yubg,10.10c2eg4gbgy344

For data only:

http://www.citationgecko.com/api/v1/?doi=10.10241frg23,10.102ngbsg324g,10.129r1bg2f,10.10033nf2yubg,10.10c2eg4gbgy344


# Example Response 

```
{
  papers: [
    {
      id: '1',
      doi: '10.12j13523',
      title: 'A Paper',
      authors: [
        {
          firstName:'John',
          lastName:'Smith',
          ORCID:'120191312341'
        }
      ],
      journal: 'Nature',
      pubDate: '2018-08-14',
      isSeed: true,     
    }
    
    
  ]

}
