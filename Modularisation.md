# Outline of Plan for Modularizing Code

## Problem

* Need to trigger MAG queries once title is obtained from CrossRef without coupling code.
* Need to trigger OADOI queries once papers are added by other data-sources.

## Solution

* When a seed paper is updated by one data-source i.e. with a title or with a DOI it triggers a 'Seed Updated' event.
* Modules can add listeners for 'seed updated' events and if the update adds new information relevant to them they can send a new query. 
* When a non-seed paper is added it triggers an event. 
* Modules (like OADOI) can listen for those events and send queries.