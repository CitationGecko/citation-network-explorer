#!/bin/bash python
# -*- coding: utf-8

import os
import time
import click
import requests

CROSSREF_API = "https://api.crossref.org/"


@click.command()
@click.option('-d', '--date', 'inputdate', type=str,
              multiple=False, help='Date in the format: year-month-day', )
@click.option('-o', '--output', 'outputfile', type=str,
              multiple=False, help='Path to outpufile.')
def cli(inputdate, outputfile):
    """Fetch data from CROSSREF API into an appropriate output format.
    """
    if inputdate is None or outputfile is None:
        print("Run python %s --help for more information." %
              (os.path.basename(__file__)))
        return
    return get_crossref_data(inputdate, outputfile)


def get_crossref_data(inputdate, outputfile):
    """
    :param inputdate: (str) basic date in the format: year-month-day
        e.g. 2018-05-11
    :param outputfile: (str) path to outpufile; does not test the filte
        is writable
    :return: (side-effects) writes to an output file.
    """

    # url parts
    url_root = CROSSREF_API + "works/?"
    nrows = 1000

    # TODO check if the inputdate is valid
    pars = ["filter=from-index-date:%s,reference-visibility:open" % inputdate,
            "rows=%s" % str(nrows)]

    # TODO check the filepath is valid
    # emptying the file if it had something
    out = open(outputfile, "w")
    out.close()

    fetching = True
    icount = 0
    # next_cursor = ""
    offset = 0

    while fetching:
        # handling the first vs next-cursor signals
        # if icount > 0 and next_cursor != "":
        #     url = url_root + "&".join(pars) + "&cursor=%s" % next_cursor
        # else:
        #     url = url_root + "&".join(pars) + "&cursor=*"

        # using offset instead of cursor for now
        url = url_root + "&".join(pars) + "&offset=%s" % str(offset)

        # fetching the data
        print(url)
        data = fetch_from_url_or_retry(url, json=True)

        citeFrom = []
        citeTo = []
        try:
            data = data.json()
        except Exception:
            print("Request failed...")
            print(url)
            return

        if data["status"] == "ok":
            if "message" in data and "items" in data["message"]:
                nitems = int(data["message"]["items-per-page"])
                assert nitems == nrows
                nentries = 0
                for entry in data["message"]["items"]:
                    nentries += 1
                    if int(entry["reference-count"]) > 0:
                        if "reference" in entry:
                            for subentry in entry["reference"]:
                                if "DOI" in subentry:
                                    # print(entry["DOI"], subentry["DOI"])
                                    citeFrom.append(entry["DOI"])
                                    citeTo.append(subentry["DOI"])
                if nentries < nitems:
                    fetching = False

            # if "next-cursor" in data["message"]:
            #     next_cursor = data["message"]["next-cursor"]
            # if next_cursor == "":
            #     fetching = False

        # increase the offset for the next query
        offset += nrows

        # write (append) to output
        assert len(citeFrom) == len(citeTo)
        with open(outputfile, "a") as outfile:
            lines = ["%s\t%s" % (i, j) for i, j in zip(citeFrom, citeTo)]
            outfile.write("\n".join(lines))

        icount += 1
        print("Fetching data: iteration number %s done..." % str(icount))
    return


def fetch_from_url_or_retry(url, json=True, header=None, post=False, data=None,
                            retry_in=None, wait=1, n_retries=10, stream=False, **params):
    """
    Fetch an url using Requests or retry fetching it if the server is
    complaining with retry_in error. There is a limit to the number of retries.

    Retry code examples: 429, 500 and 503

    :param url: url to be fetched as a string
    :param json: json output
    :param header: dictionary
    :param post: boolean
    :param data: dictionary: only if post is True
    :param retry_in: http codes for retrying
    :param wait: sleeping between tries in seconds
    :param n_retries: number of retry attempts
    :param stream: boolean
    :param params: request.get kwargs.
    :return: url content
    """

    if retry_in is None:
        retry_in = ()
    else:
        assert type(retry_in) is tuple or type(retry_in) is list

    if header is None:
        header = {}
    else:
        assert type(header) is dict

    if json:
        header.update({"Content-Type": "application/json"})
    else:
        if "Content-Type" not in header:
            header.update({"Content-Type": "text/plain"})

    if post:
        if data is not None:
            assert type(data) is dict or type(data) is str
            response = requests.post(url, headers=header, data=data)
        else:
            return None
    else:
        response = requests.get(url, headers=header, params=params, stream=stream)

    if response.ok:
        return response
    elif response.status_code in retry_in and n_retries >= 0:
        time.sleep(wait)
        return fetch_from_url_or_retry(url, json, header, post, data, retry_in, wait,
                                       (n_retries - 1), stream, **params)
    else:
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print('%s: Unable to retrieve %s for %s',
                  response.status_code, url, e)


if __name__ == '__main__':
    cli()
