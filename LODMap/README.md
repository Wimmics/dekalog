# KartoGraphI

Compile with NodeJS and Parcel:
> npx parcel build src/index.html

Development server at localhost:1234 started with:
> npx parcel serve

Deployment is done with:
> rm -f dist/*
> 
> npx parcel build src/index.html
> 
> scp dist/* /wherever you need>

'dataCashing.js' is a node script to update from the index the static data files of the web site

# To cite this work
```
@inproceedings{maillot:hal-03652865,
    TITLE = {{KartoGraphI: Drawing a Map of Linked Data}},
    AUTHOR = {Maillot, Pierre and Corby, Olivier and Faron, Catherine and Gandon, Fabien and Michel, Franck},
    URL = {https://hal.archives-ouvertes.fr/hal-03652865},
    BOOKTITLE = {{ESWC 2022 - 19th European Semantic Web Conferences}},
    ADDRESS = {Hersonissos, Greece},
    PUBLISHER = {{Springer}},
    YEAR = {2022},
    MONTH = May,
    KEYWORDS = {linked data ; semantic web}
}
```
