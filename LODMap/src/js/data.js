
/*
const endpointLists = [
        {
            name:"Experiment dataset",
            endpoints: [
                "https://data.ordnancesurvey.co.uk/datasets/os-linked-data/apis/sparql",
                "http://genome.microbedb.jp/sparql",
                "https://opendata.mfcr.cz/lod/sparql",
                "https://data.europa.eu/euodp/sparqlep",
                "http://dbtune.org/musicbrainz/sparql",
                "http://datos.bne.es/sparql",
                "http://rdf.disgenet.org/sparql/",
                "http://linkeddata.econstor.eu/beta/snorql/",
                "http://lod.openaire.eu/sparql",
                "https://sophox.org/sparql",
                "https://data.epo.org/linked-data/query",
                "http://factforge.net/repositories/ff-news",
                "http://data.cervantesvirtual.com/bvmc-lod/repositories/data",
                "https://zbw.eu/beta/sparql/econ_pers/query",
                "http://data.americanartcollaborative.org/sparql",
                "http://patho.phenomebrowser.net/sparql/",
                "https://zbw.eu/beta/sparql/pm20/query",
                "https://query.wikidata.org",
                "http://ontology.irstea.fr/weather",
                "https://yago-knowledge.org/sparql",
                "https://labs.onb.ac.at/en/tool/sparql/",
                "http://lod.kipo.kr/data/thesaurus/sparql",
                "http://id.nlm.nih.gov/mesh/sparql",
                "http://data.fondazionezeri.unibo.it/sparql/",
                "http://collection.britishart.yale.edu/sparql/",
                "https://zbw.eu/beta/sparql/gnd/query",
                "http://sparql.europeana.eu/",
                "http://147.100.179.235:8082/blazegraph/namespace/undefined/sparql",
                "http://sparql.archives-ouvertes.fr/sparql",
                "http://dati.camera.it/sparql",
                "https://lov.linkeddata.es/dataset/lov/sparql",
                "http://sparql.bioontology.org/sparql",
                "http://www.europeandataportal.eu/sparql",
                "https://datos-abertos.galiciana.gal/pt/sparql",
                "http://ldf.fi/SERVICE/sparql",
                "https://lod.abes.fr/sparql",
                "https://rdf.pathwaycommons.org/sparql/",
                "http://lov.okfn.org/dataset/lov/sparql",
                "https://semantic.eea.europa.eu/sparql",
                "https://cs.dbpedia.org/sparql",
                "http://db.artsdata.ca/repositories/artsdata",
                "https://linkedlifedata.com/sparql",
                "https://api.parliament.uk/sparql",
                "https://xn--slovnk-7va.gov.cz/sparql",
                "http://ldf.fi/kirjasampo/sparql",
                "http://vocabs.ands.org.au/repository/api/sparql/ga_geologic-unit-type_v0-1",
                "https://data.ordnancesurvey.co.uk/datasets/code-point-open/apis/sparql",
                "http://lod.kipo.kr/data/oversea_patent/sparql",
                "http://www.genome.jp/sparql/linkdb",
                "https://vocabs.ands.org.au/repository/api/sparql/",
                "https://www.orpha.net/sparql",
                "http://vulcan.cs.uga.edu/sparql",
                "http://collection.britishmuseum.org/sparql",
                "https://slod.fiz-karlsruhe.de/sparql",
                "https://sparql.uniprot.org/sparql",
                "https://isidore.science/sparql",
                "http://tadirah.dariah.eu/vocab/sparql.php",
                "http://wifo5-04.informatik.uni-mannheim.de/drugbank/snorql/",
                "https://zbw.eu/beta/sparql/econ_corp/query",
                "http://data.allie.dbcls.jp/sparql",
                "http://wordnet.rkbexplorer.com/sparql/",
                "http://zbw.eu/beta/sparql/stw/query",
                "https://ld.cultural.jp/sparql",
                "http://virhp07.libris.kb.se/sparql/",
                "http://agrovoc.uniroma2.it/sparql",
                "http://data.culture.fr/thesaurus/sparql",
                "http://nomisma.org/query",
                "http://ldf.fi/folklore/sparql",
                "http://geco.ecophytopic.fr:8890/sparql",
                "http://lod.kipo.kr/data/classification/sparql",
                "http://dbtune.org/jamendo/sparql",
                "https://identifiers.org/services/sparql",
                "https://data.ordnancesurvey.co.uk/datasets/50k-gazetteer/apis/sparql",
                "http://linkedgeodata.org/sparql",
                "http://dblp.l3s.de/d2r/sparql",
                "https://data.escr.fr/sparql",
                "http://sparql.kpath.khaos.uma.es/",
                "https://data.nationallibrary.fi/bib/sparql",
                "https://ldf.fi/mufi/sparql",
                "https://triplestore.sireneld.io/sirene/sparql",
                "http://data.bnf.fr/sparql/",
                "https://io.datascience-paris-saclay.fr/sparql",
                "http://vocab.getty.edu/sparql",
                "http://lod.nl.go.kr/sparql",
                "https://www.dictionnairedesfrancophones.org/sparql",
                "http://dati.beniculturali.it/",
                "http://digital-agenda-data.eu/data/sparql",
                "http://ieee.rkbexplorer.com/sparql/",
                "https://linkedwiki.com/sparql",
                "http://www.scholarlydata.org/sparql",
                "https://sparql.nextprot.org/",
                "https://digits2.mainzed.org/covid19/sparql",
                "http://uriburner.com/sparql/",
                "http://rdf.pathwaycommons.org/sparql/",
                "http://data.mimo-db.eu/sparql",
                "http://www.scholarlydata.org/sparql/",
                "https://colil.dbcls.jp/sparql",
                "http://vocabs.ands.org.au/repository/api/sparql/anzsrc-for",
                "http://zbw.eu/beta/sparql/gnd/query",
                "https://dati.camera.it/sparql",
                "http://hkcan.julac.org/lod/sparql",
                "http://lod.kipo.kr/data/patent/sparql",
                "http://data.digitalculture.tw/taichung/sparql",
                "https://id.nlm.nih.gov/mesh/sparql",
                "https://www.genome.jp/sparql/linkdb",
                "https://www.europeandataportal.eu/sparql",
                "http://sparql.europeana.eu",
                "http://opencitations.net/sparql",
                "http://data.ordnancesurvey.co.uk/datasets/os-linked-data/apis/sparql",
                "http://data.nobelprize.org/sparql",
                "http://ontology.inrae.fr/frenchcropusage/query",
                "https://wcqs-beta.wmflabs.org/",
                "http://vocabs.ands.org.au/repository/api/sparql/csiro_international-chronostratigraphic-chart_international-chronostratigraphic-chart",
                "https://linkeddata.uriburner.com/sparql",
                "https://tora.entryscape.net/snorql",
                "http://de.dbpedia.org/sparql",
                "https://rdf.insee.fr/sparql",
                "https://opendatacommunities.org/sparql",
                "http://www4.wiwiss.fu-berlin.de/dailymed/sparql",
                "http://dbtune.org/bbc/peel/sparql",
                "http://collection.britishart.yale.edu/openrdf-sesame/repositories/ycba",
                "http://data.archaeologydataservice.ac.uk/sparql/repositories/archives",
                "http://opendatacommunities.org/sparql",
                "https://bnb.data.bl.uk/sparql",
                "https://www.govdata.de/sparql",
                "http://ja.dbpedia.org/sparql",
                "https://zbw.eu/beta/sparql/stwv/query",
                "http://data.archiveshub.ac.uk/sparql",
                "http://statistics.data.gov.uk/sparql",
                "https://jpsearch.go.jp/rdf/sparql/",
                "http://publications.europa.eu/webapi/rdf/sparql",
                "http://landregistry.data.gov.uk/landregistry/query",
                "http://bnb.data.bl.uk/sparql",
                "https://query.inventaire.io",
                "http://sparql.wikipathways.org/sparql",
                "https://idsm.elixir-czech.cz/sparql/",
                "https://lod.nl.go.kr/sparql",
                "https://w3id.org/oc/sparql",
                "https://data.ordnancesurvey.co.uk/datasets/opennames/apis/sparql",
                "https://query.wikidata.org/sparql",
                "https://datos.gob.es/virtuoso/sparql",
                "http://vocabs.ands.org.au/repository/api/sparql/csiro_international-chronostratigraphic-chart_2018",
                "http://agrold.southgreen.fr/sparql",
                "https://lingualibre.org/bigdata/namespace/wdq/sparql",
                "http://sparql.kupkb.org/sparql",
                "http://data.nationallibrary.fi/bib/sparql",
                "http://fr.dbpedia.org/sparql",
                "https://data.idref.fr/sparql",
                "https://rpp-opendata.egon.gov.cz/odrpp/sparql",
                "http://citeseer.rkbexplorer.com/sparql/",
                "https://ico.iate.inra.fr/fuseki/annotation/query",
                "https://sparql.rhea-db.org/sparql",
                "https://opendata.mfcr.cz/pages/sparql",
                "https://ico.iate.inra.fr/fuseki/ontology/query",
                "http://dbtune.org/magnatune/sparql",
                "http://ma-graph.org/sparql",
                "https://linkeddata1.calcul.u-psud.fr/sparql",
                "https://edh-www.adw.uni-heidelberg.de/data/query",
                "https://www.orkg.org/orkg/triplestore",
                "http://semantic.eea.europa.eu/sparql",
                "http://lod.kipo.kr/data/admin_processes/sparql",
                "http://lod.kipo.kr/data/sparql",
                "http://vocabulary.curriculum.edu.au/PoolParty/sparql/scot",
                "http://id.sgcb.mcu.es/sparql",
                "https://bgee.org/sparql",
                "https://zbw.eu/beta/sparql/stw/query",
                "http://bio2rdf.org/sparql",
                "http://data.odw.tw/sparql",
                "https://lingualibre.fr/bigdata/namespace/wdq/sparql",
                "https://data.cssz.cz/sparql",
                "http://data.cervantesvirtual.com/openrdf-sesame/repositories/data",
                "http://dbpedia.org/sparql",
                "http://bfs.270a.info/sparql",
                "https://es.dbpedia.org/sparql",
                "https://www.ebi.ac.uk/rdf/services/sparql",
                "http://sparql.odw.tw/",
                "http://collection.britishart.yale.edu/sparql",
                "http://quantum.agroparistech.fr/graphdb/repositories/Composite_making_process",
                "https://sparql.orthodb.org/sparql",
                "https://data.ordnancesurvey.co.uk/datasets/boundary-line/apis/sparql",
                "https://data.gov.cz/sparql",
                "https://sparql.proconsortium.org/virtuoso/sparql",
                "http://data.persee.fr/sparql",
                "http://api.finto.fi/sparql",
                "https://cedropendata.mfcr.cz/c3lod/cedr/sparql",
                "https://www.data.gouv.fr/catalog.rdf",
                "http://bbc.openlinksw.com/sparql",
                "http://sparql.agroportal.lirmm.fr/sparql/",
                "http://edan.si.edu/saam/sparql",
                "https://datos.gob.es/es/sparql",
                "https://fuseki.gwascentral.org/gc/query",
                "https://opendata.aragon.es/sparql"
            ]
        } ,
        {
            name: "D2KAB",
            endpoints: [
                "http://147.100.179.235:8082/blazegraph/namespace/AnaEE_sites/sparql",
                "https://ico.iate.inra.fr/fuseki/annotation/query",
                "https://ico.iate.inra.fr/fuseki/ontology/query",
                "http://taxref-graphdb.i3s.unice.fr/repositories/geco",
                "http://quantum.agroparistech.fr/graphdb/repositories/Composite_making_process",
                "http://ontology.irstea.fr/ppdo/sparql",
                "https://opendata.inra.fr/openrdf-sesame/repositories/Ahol",
                "http://agrold.southgreen.fr/sparql",
                "http://ontology.inrae.fr/frenchcropusage/sparql",
                "http://ontology.inrae.fr/bsv_test/sparql",
                "http://ontology.irstea.fr/bsv/sparql",
                "http://ontology.irstea.fr/weather/sparql",
                "http://sparql.agroportal.lirmm.fr/sparql/",
                "http://geco.ecophytopic.fr:8890/sparql"
            ]
        },
        {
            name:"LODCloud",
            endpoints:[

            ]
        }
];
*/
const graphLists = [
    {
        name:"Experiment dataset",
        graphs:[
            "http://ns.inria.fr/indegx#Experiment_20211203",
            "http://ns.inria.fr/indegx#Experiment_20211129",
            "http://ns.inria.fr/indegx#Experiment_20211206",
            "http://ns.inria.fr/indegx#Experiment_20211209",
            "http://ns.inria.fr/indegx#Experiment_20211118"
        ]
    }/*,
    {
        name:"D2KAB",
        graphs:[

        ]
    },
    {
        name:"LODCloud",
        graphs:[

        ]
    }*/
]

const endpointIpMap = [
    {
        "key": "http://147.100.179.235:8082/blazegraph/namespace/undefined/sparql",
        "value": {
            "ip": "147.100.179.235",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Jouy-en-Josas",
                "zip": "78350",
                "lat": 48.7644,
                "lon": 2.18486,
                "timezone": "Europe/Paris",
                "isp": "Institut National de Recherches Agronomiques",
                "org": "",
                "as": "AS2200 Renater",
                "query": "147.100.179.235"
            }
        }
    },
    {
        "key": "http://geco.ecophytopic.fr:8890/sparql",
        "value": {
            "ip": "193.70.80.105",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "HDF",
                "regionName": "Hauts-de-France",
                "city": "Gravelines",
                "zip": "59820",
                "lat": 50.9871,
                "lon": 2.12554,
                "timezone": "Europe/Paris",
                "isp": "OVH SAS",
                "org": "OVH",
                "as": "AS16276 OVH SAS",
                "query": "193.70.80.105"
            }
        }
    },
    {
        "key": "http://ontology.inrae.fr/frenchcropusage/query",
        "value": {
            "ip": "195.221.117.193",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Sucy-en-Brie",
                "zip": "94370",
                "lat": 48.7619,
                "lon": 2.5408,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "Irstea",
                "as": "AS2200 Renater",
                "query": "195.221.117.193"
            }
        }
    },
    {
        "key": "http://ontology.irstea.fr/weather",
        "value": {
            "ip": "195.221.117.193",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Sucy-en-Brie",
                "zip": "94370",
                "lat": 48.7619,
                "lon": 2.5408,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "Irstea",
                "as": "AS2200 Renater",
                "query": "195.221.117.193"
            }
        }
    },
    {
        "key": "http://quantum.agroparistech.fr/graphdb/repositories/Composite_making_process",
        "value": {
            "ip": "193.54.111.249",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75015",
                "lat": 48.8323,
                "lon": 2.4075,
                "timezone": "Europe/Paris",
                "isp": "RENATER",
                "org": "AgroParisTech",
                "as": "AS2200 Renater",
                "query": "193.54.111.249"
            }
        }
    },
    {
        "key": "http://sparql.agroportal.lirmm.fr/sparql/",
        "value": {
            "ip": "193.49.110.47",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "OCC",
                "regionName": "Occitanie",
                "city": "Montpellier",
                "zip": "34000",
                "lat": 43.6107,
                "lon": 3.8809,
                "timezone": "Europe/Paris",
                "isp": "RENATER",
                "org": "Laboratoire d'Informatique",
                "as": "AS2200 Renater",
                "query": "193.49.110.47"
            }
        }
    },
    {
        "key": "https://ico.iate.inra.fr/fuseki/annotation/query",
        "value": {
            "ip": "138.102.159.29",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75116",
                "lat": 48.8639,
                "lon": 2.2646,
                "timezone": "Europe/Paris",
                "isp": "INRA-ILE",
                "org": "",
                "as": "AS2200 Renater",
                "query": "138.102.159.29"
            }
        }
    },
    {
        "key": "https://www.orkg.org/orkg/triplestore",
        "value": {
            "ip": "194.95.114.12",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "TH",
                "regionName": "Thuringia",
                "city": "Erfurt",
                "zip": "99089",
                "lat": 50.9965,
                "lon": 11.0144,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "Technische Informationsbibliothek, Hannover",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "194.95.114.12"
            }
        }
    },
    {
        "key": "http://data.allie.dbcls.jp/sparql",
        "value": {
            "ip": "133.39.78.111",
            "geoloc": {
                "status": "success",
                "country": "Japan",
                "countryCode": "JP",
                "region": "13",
                "regionName": "Tokyo",
                "city": "Chiyoda",
                "zip": "100-0001",
                "lat": 35.694,
                "lon": 139.754,
                "timezone": "Asia/Tokyo",
                "isp": "Research Organization of Information and Systems, National Institute of Informa",
                "org": "",
                "as": "AS2907 Research Organization of Information and Systems, National Institute of Informatics",
                "query": "133.39.78.111"
            }
        }
    },
    {
        "key": "http://agrold.southgreen.fr/sparql",
        "value": {
            "ip": "193.51.117.74",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "OCC",
                "regionName": "Occitanie",
                "city": "Montpellier",
                "zip": "34000",
                "lat": 43.6107,
                "lon": 3.8809,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "Fnet Cirad13",
                "as": "AS2200 Renater",
                "query": "193.51.117.74"
            }
        }
    },
    {
        "key": "https://ico.iate.inra.fr/fuseki/ontology/query",
        "value": {
            "ip": "138.102.159.29",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75116",
                "lat": 48.8639,
                "lon": 2.2646,
                "timezone": "Europe/Paris",
                "isp": "INRA-ILE",
                "org": "",
                "as": "AS2200 Renater",
                "query": "138.102.159.29"
            }
        }
    },
    {
        "key": "http://publications.europa.eu/webapi/rdf/sparql",
        "value": {
            "ip": "34.249.251.179",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon Technologies Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "34.249.251.179"
            }
        }
    },
    {
        "key": "http://sparql.europeana.eu",
        "value": {
            "ip": "138.201.64.226",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SN",
                "regionName": "Saxony",
                "city": "Falkenstein",
                "zip": "08223",
                "lat": 50.475,
                "lon": 12.365,
                "timezone": "Europe/Berlin",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "138.201.64.226"
            }
        }
    },
    {
        "key": "http://ma-graph.org/sparql",
        "value": {
            "ip": "132.230.150.16",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BW",
                "regionName": "Baden-Württemberg",
                "city": "Freiburg im Breisgau",
                "zip": "79104",
                "lat": 48.0036,
                "lon": 7.84823,
                "timezone": "Europe/Berlin",
                "isp": "Albert-Ludwigs-Universitaet Freiburg",
                "org": "UNI-FREIBURG",
                "as": "AS553 Universitaet Stuttgart",
                "query": "132.230.150.16"
            }
        }
    },
    {
        "key": "http://sparql.wikipathways.org/sparql",
        "value": {
            "ip": "81.169.200.64",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BW",
                "regionName": "Baden-Württemberg",
                "city": "Bruchsal",
                "zip": "76646",
                "lat": 49.1231,
                "lon": 8.6011,
                "timezone": "Europe/Berlin",
                "isp": "Strato AG",
                "org": "Strato AG",
                "as": "AS6724 Strato AG",
                "query": "81.169.200.64"
            }
        }
    },
    {
        "key": "http://rdf.disgenet.org/sparql/",
        "value": {
            "ip": "84.89.134.141",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "CT",
                "regionName": "Catalonia",
                "city": "Barcelona",
                "zip": "08018",
                "lat": 41.387,
                "lon": 2.1701,
                "timezone": "Europe/Madrid",
                "isp": "Anella Cientifica",
                "org": "",
                "as": "AS13041 Consorci de Serveis Universitaris de Catalunya",
                "query": "84.89.134.141"
            }
        }
    },
    {
        "key": "http://rdf.pathwaycommons.org/sparql/",
        "value": {
            "ip": "142.150.84.100",
            "geoloc": {
                "status": "success",
                "country": "Canada",
                "countryCode": "CA",
                "region": "ON",
                "regionName": "Ontario",
                "city": "Toronto",
                "zip": "M6G",
                "lat": 43.6655,
                "lon": -79.4204,
                "timezone": "America/Toronto",
                "isp": "University of Toronto",
                "org": "University of Toronto",
                "as": "AS239 University of Toronto",
                "query": "142.150.84.100"
            }
        }
    },
    {
        "key": "http://vulcan.cs.uga.edu/sparql",
        "value": {
            "ip": "128.192.76.150",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "GA",
                "regionName": "Georgia",
                "city": "Athens",
                "zip": "30602",
                "lat": 33.9452,
                "lon": -83.3718,
                "timezone": "America/New_York",
                "isp": "University of Georgia",
                "org": "University of Georgia",
                "as": "AS36441 University of Georgia",
                "query": "128.192.76.150"
            }
        }
    },
    {
        "key": "http://www.genome.jp/sparql/linkdb",
        "value": {
            "ip": "133.103.200.20",
            "geoloc": {
                "status": "success",
                "country": "Japan",
                "countryCode": "JP",
                "region": "26",
                "regionName": "Kyoto",
                "city": "Gokasho",
                "zip": "611-0011",
                "lat": 34.9101,
                "lon": 135.8,
                "timezone": "Asia/Tokyo",
                "isp": "Research Organization of Information and Systems, National Institute of Informa",
                "org": "Genome Research Network",
                "as": "AS2907 Research Organization of Information and Systems, National Institute of Informatics",
                "query": "133.103.200.20"
            }
        }
    },
    {
        "key": "https://bgee.org/sparql",
        "value": {
            "ip": "130.223.50.57",
            "geoloc": {
                "status": "success",
                "country": "Switzerland",
                "countryCode": "CH",
                "region": "VD",
                "regionName": "Vaud",
                "city": "Lausanne",
                "zip": "1004",
                "lat": 46.5267,
                "lon": 6.6243,
                "timezone": "Europe/Zurich",
                "isp": "SWITCH",
                "org": "University of Lausanne",
                "as": "AS559 SWITCH",
                "query": "130.223.50.57"
            }
        }
    },
    {
        "key": "https://query.wikidata.org/sparql",
        "value": {
            "ip": "91.198.174.192",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1012",
                "lat": 52.3702,
                "lon": 4.89517,
                "timezone": "Europe/Amsterdam",
                "isp": "Wikimedia Europe network",
                "org": "Wikimedia Foundation, Inc.",
                "as": "AS14907 Wikimedia Foundation Inc.",
                "query": "91.198.174.192"
            }
        }
    },
    {
        "key": "https://sparql.nextprot.org/",
        "value": {
            "ip": "192.33.215.50",
            "geoloc": {
                "status": "success",
                "country": "Switzerland",
                "countryCode": "CH",
                "region": "GE",
                "regionName": "Geneva",
                "city": "Geneva",
                "zip": "1211",
                "lat": 46.1986,
                "lon": 6.14277,
                "timezone": "Europe/Zurich",
                "isp": "UniGE",
                "org": "Universite de Geneve",
                "as": "AS559 SWITCH",
                "query": "192.33.215.50"
            }
        }
    },
    {
        "key": "https://sparql.proconsortium.org/virtuoso/sparql",
        "value": {
            "ip": "128.175.240.210",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "DE",
                "regionName": "Delaware",
                "city": "Newark",
                "zip": "19717",
                "lat": 39.6876,
                "lon": -75.7482,
                "timezone": "America/New_York",
                "isp": "University of Delaware",
                "org": "University of Delaware",
                "as": "AS34 University of Delaware",
                "query": "128.175.240.210"
            }
        }
    },
    {
        "key": "https://sparql.rhea-db.org/sparql",
        "value": {
            "ip": "192.33.215.66",
            "geoloc": {
                "status": "success",
                "country": "Switzerland",
                "countryCode": "CH",
                "region": "GE",
                "regionName": "Geneva",
                "city": "Geneva",
                "zip": "1211",
                "lat": 46.1986,
                "lon": 6.14277,
                "timezone": "Europe/Zurich",
                "isp": "UniGE",
                "org": "Universite de Geneve",
                "as": "AS559 SWITCH",
                "query": "192.33.215.66"
            }
        }
    },
    {
        "key": "http://sparql.europeana.eu/",
        "value": {
            "ip": "138.201.64.226",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SN",
                "regionName": "Saxony",
                "city": "Falkenstein",
                "zip": "08223",
                "lat": 50.475,
                "lon": 12.365,
                "timezone": "Europe/Berlin",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "138.201.64.226"
            }
        }
    },
    {
        "key": "https://sparql.uniprot.org/sparql",
        "value": {
            "ip": "192.33.215.68",
            "geoloc": {
                "status": "success",
                "country": "Switzerland",
                "countryCode": "CH",
                "region": "GE",
                "regionName": "Geneva",
                "city": "Geneva",
                "zip": "1211",
                "lat": 46.1986,
                "lon": 6.14277,
                "timezone": "Europe/Zurich",
                "isp": "UniGE",
                "org": "Universite de Geneve",
                "as": "AS559 SWITCH",
                "query": "192.33.215.68"
            }
        }
    },
    {
        "key": "http://agrovoc.uniroma2.it/sparql",
        "value": {
            "ip": "160.80.84.139",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "62",
                "regionName": "Latium",
                "city": "Rome",
                "zip": "00187",
                "lat": 41.8491,
                "lon": 12.5976,
                "timezone": "Europe/Rome",
                "isp": "ROMA-UTOV",
                "org": "Universita' degli Studi di Roma Tor Vergata",
                "as": "AS137 Consortium GARR",
                "query": "160.80.84.139"
            }
        }
    },
    {
        "key": "http://bbc.openlinksw.com/sparql",
        "value": {
            "ip": "194.109.117.212",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1012",
                "lat": 52.3676,
                "lon": 4.90414,
                "timezone": "Europe/Amsterdam",
                "isp": "Xs4all Internet BV",
                "org": "OpenLink Software UK Ltd",
                "as": "AS3265 Xs4all Internet BV",
                "query": "194.109.117.212"
            }
        }
    },
    {
        "key": "http://data.archaeologydataservice.ac.uk/sparql/repositories/archives",
        "value": {
            "ip": "144.32.123.41",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "York",
                "zip": "YO19",
                "lat": 53.9089,
                "lon": -1.0242,
                "timezone": "Europe/London",
                "isp": "University of York",
                "org": "IT Services, University of York",
                "as": "AS786 Jisc Services Limited",
                "query": "144.32.123.41"
            }
        }
    },
    {
        "key": "http://data.culture.fr/thesaurus/sparql",
        "value": {
            "ip": "143.126.211.70",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75001",
                "lat": 48.8624,
                "lon": 2.33881,
                "timezone": "Europe/Paris",
                "isp": "Direction Interministerielle du Numerique et du Systeme d'Information et de Com",
                "org": "Ministere de la Culture",
                "as": "AS60855 Direction Interministerielle du Numerique et du Systeme d'Information et de Communication de l'Etat",
                "query": "143.126.211.70"
            }
        }
    },
    {
        "key": "http://data.digitalculture.tw/taichung/sparql",
        "value": {
            "ip": "185.53.177.51",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BY",
                "regionName": "Bavaria",
                "city": "Munich",
                "zip": "80336",
                "lat": 48.1446,
                "lon": 11.5895,
                "timezone": "Europe/Berlin",
                "isp": "Team Internet AG",
                "org": "TEAM-INTERNET",
                "as": "AS61969 Team Internet AG",
                "query": "185.53.177.51"
            }
        }
    },
    {
        "key": "http://data.mimo-db.eu/sparql",
        "value": {
            "ip": "194.254.239.14",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75019",
                "lat": 48.8323,
                "lon": 2.4075,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "Cite Musique Paris",
                "as": "AS2200 Renater",
                "query": "194.254.239.14"
            }
        }
    },
    {
        "key": "http://data.nobelprize.org/sparql",
        "value": {
            "ip": "65.21.108.114",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "18",
                "regionName": "Uusimaa",
                "city": "Helsinki",
                "zip": "00100",
                "lat": 60.1719,
                "lon": 24.9347,
                "timezone": "Europe/Helsinki",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "65.21.108.114"
            }
        }
    },
    {
        "key": "http://dati.beniculturali.it/",
        "value": {
            "ip": "2.42.229.47",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "62",
                "regionName": "Latium",
                "city": "Rome",
                "zip": "00199",
                "lat": 41.8904,
                "lon": 12.5126,
                "timezone": "Europe/Rome",
                "isp": "Vodafone Italia S.p.A.",
                "org": "Vodafone",
                "as": "AS30722 Vodafone Italia S.p.A.",
                "query": "2.42.229.47"
            }
        }
    },
    {
        "key": "http://datos.bne.es/sparql",
        "value": {
            "ip": "212.128.118.30",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "MD",
                "regionName": "Madrid",
                "city": "Madrid",
                "zip": "28040",
                "lat": 40.4163,
                "lon": -3.6934,
                "timezone": "Europe/Madrid",
                "isp": "Ministerio de Asuntos Economicos y Transformacion Digital",
                "org": "BNE",
                "as": "AS200521 Ministerio de Asuntos Economicos y Transformacion Digital",
                "query": "212.128.118.30"
            }
        }
    },
    {
        "key": "http://db.artsdata.ca/repositories/artsdata",
        "value": {
            "ip": "3.97.160.147",
            "geoloc": {
                "status": "success",
                "country": "Canada",
                "countryCode": "CA",
                "region": "ON",
                "regionName": "Ontario",
                "city": "Toronto",
                "zip": "",
                "lat": 43.6532,
                "lon": -79.3832,
                "timezone": "America/Toronto",
                "isp": "Amazon Technologies Inc.",
                "org": "AWS EC2 (ca-central-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "3.97.160.147"
            }
        }
    },
    {
        "key": "http://factforge.net/repositories/ff-news",
        "value": {
            "ip": "138.201.85.206",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SN",
                "regionName": "Saxony",
                "city": "Falkenstein",
                "zip": "08223",
                "lat": 50.475,
                "lon": 12.365,
                "timezone": "Europe/Berlin",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "138.201.85.206"
            }
        }
    },
    {
        "key": "http://id.sgcb.mcu.es/sparql",
        "value": {
            "ip": "212.128.117.22",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "MD",
                "regionName": "Madrid",
                "city": "Madrid",
                "zip": "28040",
                "lat": 40.4163,
                "lon": -3.6934,
                "timezone": "Europe/Madrid",
                "isp": "Ministerio de Asuntos Economicos y Transformacion Digital",
                "org": "Mecd",
                "as": "AS200521 Ministerio de Asuntos Economicos y Transformacion Digital",
                "query": "212.128.117.22"
            }
        }
    },
    {
        "key": "http://ldf.fi/folklore/sparql",
        "value": {
            "ip": "193.167.189.101",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "15",
                "regionName": "North Savo",
                "city": "Kuopio",
                "zip": "70300",
                "lat": 62.9038,
                "lon": 27.6865,
                "timezone": "Europe/Helsinki",
                "isp": "FUNET",
                "org": "Cloud services",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "193.167.189.101"
            }
        }
    },
    {
        "key": "http://linkeddata.econstor.eu/beta/snorql/",
        "value": {
            "ip": "134.245.92.42",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24105",
                "lat": 54.3308,
                "lon": 10.1368,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.92.42"
            }
        }
    },
    {
        "key": "http://linkedgeodata.org/sparql",
        "value": {
            "ip": "139.18.2.37",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SN",
                "regionName": "Saxony",
                "city": "Leipzig",
                "zip": "04179",
                "lat": 51.3272,
                "lon": 12.3141,
                "timezone": "Europe/Berlin",
                "isp": "UNILEI",
                "org": "Universitaet Leipzig",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "139.18.2.37"
            }
        }
    },
    {
        "key": "http://lod.kipo.kr/data/admin_processes/sparql",
        "value": {
            "ip": "203.242.169.10",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Yongsan-dong",
                "zip": "06333",
                "lat": 37.5046,
                "lon": 127.049,
                "timezone": "Asia/Seoul",
                "isp": "Korea Institute of Patent Information",
                "org": "Korea Trade Network",
                "as": "AS131801 Korea Institute of Patent Information",
                "query": "203.242.169.10"
            }
        }
    },
    {
        "key": "http://lod.openaire.eu/sparql",
        "value": {
            "ip": "213.135.60.179",
            "geoloc": {
                "status": "success",
                "country": "Poland",
                "countryCode": "PL",
                "region": "14",
                "regionName": "Mazovia",
                "city": "Warsaw",
                "zip": "00-325",
                "lat": 52.2403,
                "lon": 21.0186,
                "timezone": "Europe/Warsaw",
                "isp": "University of Warsaw",
                "org": "ICM",
                "as": "AS8664 University of Warsaw",
                "query": "213.135.60.179"
            }
        }
    },
    {
        "key": "http://sparql.archives-ouvertes.fr/sparql",
        "value": {
            "ip": "193.48.96.88",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "ARA",
                "regionName": "Auvergne-Rhone-Alpes",
                "city": "Villeurbanne",
                "zip": "69100",
                "lat": 45.7827,
                "lon": 4.86528,
                "timezone": "Europe/Paris",
                "isp": "Institut National de Physique Nucleaire et de Physique des Particules",
                "org": "",
                "as": "AS2200 Renater",
                "query": "193.48.96.88"
            }
        }
    },
    {
        "key": "http://sparql.odw.tw/",
        "value": {
            "ip": "140.109.23.193",
            "geoloc": {
                "status": "success",
                "country": "Taiwan",
                "countryCode": "TW",
                "region": "",
                "regionName": "Taiwan",
                "city": "Nangangzi",
                "zip": "",
                "lat": 25.0422,
                "lon": 121.615,
                "timezone": "Asia/Taipei",
                "isp": "Academia Sinica",
                "org": "",
                "as": "AS9264 Academia Sinica",
                "query": "140.109.23.193"
            }
        }
    },
    {
        "key": "http://vocab.getty.edu/sparql",
        "value": {
            "ip": "153.10.241.27",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "CA",
                "regionName": "California",
                "city": "Los Angeles",
                "zip": "90049",
                "lat": 34.0887,
                "lon": -118.475,
                "timezone": "America/Los_Angeles",
                "isp": "Reserved AS",
                "org": "The J. Paul Getty Trust",
                "as": "AS22063",
                "query": "153.10.241.27"
            }
        }
    },
    {
        "key": "http://vocabs.ands.org.au/repository/api/sparql/csiro_international-chronostratigraphic-chart_2018",
        "value": {
            "ip": "130.56.60.68",
            "geoloc": {
                "status": "success",
                "country": "Australia",
                "countryCode": "AU",
                "region": "ACT",
                "regionName": "Australian Capital Territory",
                "city": "Canberra",
                "zip": "2601",
                "lat": -35.2828,
                "lon": 149.1283,
                "timezone": "Australia/Sydney",
                "isp": "Australian Academic and Research Network",
                "org": "Anunet",
                "as": "AS7575 Australian Academic and Research Network (AARNet)",
                "query": "130.56.60.68"
            }
        }
    },
    {
        "key": "http://vocabulary.curriculum.edu.au/PoolParty/sparql/scot",
        "value": {
            "ip": "103.251.171.144",
            "geoloc": {
                "status": "success",
                "country": "Australia",
                "countryCode": "AU",
                "region": "VIC",
                "regionName": "Victoria",
                "city": "Melbourne",
                "zip": "3001",
                "lat": -37.8171,
                "lon": 144.96,
                "timezone": "Australia/Melbourne",
                "isp": "Education Services Australia Limited",
                "org": "Education Services Australia Limited",
                "as": "AS133053 Education Services Australia Limited",
                "query": "103.251.171.144"
            }
        }
    },
    {
        "key": "http://wifo5-04.informatik.uni-mannheim.de/drugbank/snorql/",
        "value": {
            "ip": "134.155.95.15",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BW",
                "regionName": "Baden-Württemberg",
                "city": "Mannheim",
                "zip": "68161",
                "lat": 49.4933,
                "lon": 8.4742,
                "timezone": "Europe/Berlin",
                "isp": "Universitaet Mannheim",
                "org": "UNI-MANNHEIM",
                "as": "AS553 Universitaet Stuttgart",
                "query": "134.155.95.15"
            }
        }
    },
    {
        "key": "http://www.scholarlydata.org/sparql/",
        "value": {
            "ip": "89.46.104.36",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "52",
                "regionName": "Tuscany",
                "city": "Arezzo",
                "zip": "52100",
                "lat": 43.4631,
                "lon": 11.8783,
                "timezone": "Europe/Rome",
                "isp": "Aruba S.p.A. Network",
                "org": "Aruba S.p.A.",
                "as": "AS31034 Aruba S.p.A.",
                "query": "89.46.104.36"
            }
        }
    },
    {
        "key": "https://colil.dbcls.jp/sparql",
        "value": {
            "ip": "133.39.78.111",
            "geoloc": {
                "status": "success",
                "country": "Japan",
                "countryCode": "JP",
                "region": "13",
                "regionName": "Tokyo",
                "city": "Chiyoda",
                "zip": "100-0001",
                "lat": 35.694,
                "lon": 139.754,
                "timezone": "Asia/Tokyo",
                "isp": "Research Organization of Information and Systems, National Institute of Informa",
                "org": "",
                "as": "AS2907 Research Organization of Information and Systems, National Institute of Informatics",
                "query": "133.39.78.111"
            }
        }
    },
    {
        "key": "https://cs.dbpedia.org/sparql",
        "value": {
            "ip": "146.102.18.71",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "130 00",
                "lat": 50.0832,
                "lon": 14.4418,
                "timezone": "Europe/Prague",
                "isp": "CESNET z.s.p.o.",
                "org": "University of Economics, Prague",
                "as": "AS2852 CESNET z.s.p.o.",
                "query": "146.102.18.71"
            }
        }
    },
    {
        "key": "https://data.ordnancesurvey.co.uk/datasets/50k-gazetteer/apis/sparql",
        "value": {
            "ip": "54.77.104.71",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.77.104.71"
            }
        }
    },
    {
        "key": "https://rdf.pathwaycommons.org/sparql/",
        "value": {
            "ip": "142.150.84.100",
            "geoloc": {
                "status": "success",
                "country": "Canada",
                "countryCode": "CA",
                "region": "ON",
                "regionName": "Ontario",
                "city": "Toronto",
                "zip": "M6G",
                "lat": 43.6655,
                "lon": -79.4204,
                "timezone": "America/Toronto",
                "isp": "University of Toronto",
                "org": "University of Toronto",
                "as": "AS239 University of Toronto",
                "query": "142.150.84.100"
            }
        }
    },
    {
        "key": "https://www.genome.jp/sparql/linkdb",
        "value": {
            "ip": "133.103.200.20",
            "geoloc": {
                "status": "success",
                "country": "Japan",
                "countryCode": "JP",
                "region": "26",
                "regionName": "Kyoto",
                "city": "Gokasho",
                "zip": "611-0011",
                "lat": 34.9101,
                "lon": 135.8,
                "timezone": "Asia/Tokyo",
                "isp": "Research Organization of Information and Systems, National Institute of Informa",
                "org": "Genome Research Network",
                "as": "AS2907 Research Organization of Information and Systems, National Institute of Informatics",
                "query": "133.103.200.20"
            }
        }
    },
    {
        "key": "https://vocabs.ands.org.au/repository/api/sparql/",
        "value": {
            "ip": "130.56.60.68",
            "geoloc": {
                "status": "success",
                "country": "Australia",
                "countryCode": "AU",
                "region": "ACT",
                "regionName": "Australian Capital Territory",
                "city": "Canberra",
                "zip": "2601",
                "lat": -35.2828,
                "lon": 149.1283,
                "timezone": "Australia/Sydney",
                "isp": "Australian Academic and Research Network",
                "org": "Anunet",
                "as": "AS7575 Australian Academic and Research Network (AARNet)",
                "query": "130.56.60.68"
            }
        }
    },
    {
        "key": "https://data.escr.fr/sparql",
        "value": {
            "ip": "92.243.9.229",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75013",
                "lat": 48.8219,
                "lon": 2.3709,
                "timezone": "Europe/Paris",
                "isp": "GANDI is an ICANN accredited registrar",
                "org": "",
                "as": "AS203476 GANDI SAS",
                "query": "92.243.9.229"
            }
        }
    },
    {
        "key": "https://data.idref.fr/sparql",
        "value": {
            "ip": "193.52.26.77",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "OCC",
                "regionName": "Occitanie",
                "city": "Montpellier",
                "zip": "34000",
                "lat": 43.6107,
                "lon": 3.8809,
                "timezone": "Europe/Paris",
                "isp": "RENATER",
                "org": "The French bibliographic university agency",
                "as": "AS2200 Renater",
                "query": "193.52.26.77"
            }
        }
    },
    {
        "key": "https://datos-abertos.galiciana.gal/pt/sparql",
        "value": {
            "ip": "85.91.64.77",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "GA",
                "regionName": "Galicia",
                "city": "Pontedeume",
                "zip": "15600",
                "lat": 43.4094,
                "lon": -8.1682,
                "timezone": "Europe/Madrid",
                "isp": "Xunta de Galicia",
                "org": "",
                "as": "AS3352 TELEFONICA DE ESPANA",
                "query": "85.91.64.77"
            }
        }
    },
    {
        "key": "https://datos.gob.es/virtuoso/sparql",
        "value": {
            "ip": "194.69.254.91",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "MD",
                "regionName": "Madrid",
                "city": "Madrid",
                "zip": "28020",
                "lat": 40.4479,
                "lon": -3.69409,
                "timezone": "Europe/Madrid",
                "isp": "Entidad Publica Empresarial Red.es",
                "org": "Entidad Publica Empresarial Red.es",
                "as": "AS25354 Entidad Publica Empresarial Red.es",
                "query": "194.69.254.91"
            }
        }
    },
    {
        "key": "https://digits2.mainzed.org/covid19/sparql",
        "value": {
            "ip": "77.111.240.63",
            "geoloc": {
                "status": "success",
                "country": "Denmark",
                "countryCode": "DK",
                "region": "84",
                "regionName": "Capital Region",
                "city": "Copenhagen",
                "zip": "1310",
                "lat": 55.6761,
                "lon": 12.5683,
                "timezone": "Europe/Copenhagen",
                "isp": "One.com A/S",
                "org": "Onecom Infra",
                "as": "AS51468 One.com A/S",
                "query": "77.111.240.63"
            }
        }
    },
    {
        "key": "https://edh-www.adw.uni-heidelberg.de/data/query",
        "value": {
            "ip": "147.142.186.155",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BW",
                "regionName": "Baden-Württemberg",
                "city": "Heidelberg",
                "zip": "69118",
                "lat": 49.4193,
                "lon": 8.7318,
                "timezone": "Europe/Berlin",
                "isp": "Universitaet Heidelberg",
                "org": "UNI-HEIDELBERG",
                "as": "AS553 Universitaet Stuttgart",
                "query": "147.142.186.155"
            }
        }
    },
    {
        "key": "https://fuseki.gwascentral.org/gc/query",
        "value": {
            "ip": "143.210.56.21",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "Leicester",
                "zip": "LE2",
                "lat": 52.6049,
                "lon": -1.1488,
                "timezone": "Europe/London",
                "isp": "University of Leicester",
                "org": "IT Services, University of Leicester",
                "as": "AS786 Jisc Services Limited",
                "query": "143.210.56.21"
            }
        }
    },
    {
        "key": "https://io.datascience-paris-saclay.fr/sparql",
        "value": {
            "ip": "134.158.74.160",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Les Ulis",
                "zip": "91940",
                "lat": 48.6888,
                "lon": 2.1697,
                "timezone": "Europe/Paris",
                "isp": "Institut National de Physique Nucleaire",
                "org": "CNRS Centre de Calcul de l'IN2P3",
                "as": "AS789 Renater",
                "query": "134.158.74.160"
            }
        }
    },
    {
        "key": "https://isidore.science/sparql",
        "value": {
            "ip": "134.158.33.23",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "ARA",
                "regionName": "Auvergne-Rhone-Alpes",
                "city": "Villeurbanne",
                "zip": "69100",
                "lat": 45.7719,
                "lon": 4.89017,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "CNRS Centre de Calcul de l'IN2P3",
                "as": "AS789 Renater",
                "query": "134.158.33.23"
            }
        }
    },
    {
        "key": "https://linkeddata.uriburner.com/sparql",
        "value": {
            "ip": "194.109.117.211",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1012",
                "lat": 52.3676,
                "lon": 4.90414,
                "timezone": "Europe/Amsterdam",
                "isp": "Xs4all Internet BV",
                "org": "OpenLink Software UK Ltd",
                "as": "AS3265 Xs4all Internet BV",
                "query": "194.109.117.211"
            }
        }
    },
    {
        "key": "http://ldf.fi/SERVICE/sparql",
        "value": {
            "ip": "193.167.189.101",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "15",
                "regionName": "North Savo",
                "city": "Kuopio",
                "zip": "70300",
                "lat": 62.9038,
                "lon": 27.6865,
                "timezone": "Europe/Helsinki",
                "isp": "FUNET",
                "org": "Cloud services",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "193.167.189.101"
            }
        }
    },
    {
        "key": "http://data.cervantesvirtual.com/bvmc-lod/repositories/data",
        "value": {
            "ip": "46.24.172.11",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "AS",
                "regionName": "Principality of Asturias",
                "city": "Salinas",
                "zip": "33405",
                "lat": 43.5582,
                "lon": -5.922,
                "timezone": "Europe/Madrid",
                "isp": "Vodafone-BB Global",
                "org": "Asac Comunicaciones S.L.",
                "as": "AS12430 VODAFONE ESPANA S.A.U.",
                "query": "46.24.172.11"
            }
        }
    },
    {
        "key": "http://data.persee.fr/sparql",
        "value": {
            "ip": "140.77.166.115",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "ARA",
                "regionName": "Auvergne-Rhone-Alpes",
                "city": "La Mulatiere",
                "zip": "69350",
                "lat": 45.7272,
                "lon": 4.8072,
                "timezone": "Europe/Paris",
                "isp": "ENS-LYON",
                "org": "Ecole Normale Superieure De Lyon",
                "as": "AS1945 Renater",
                "query": "140.77.166.115"
            }
        }
    },
    {
        "key": "https://data.europa.eu/euodp/sparqlep",
        "value": {
            "ip": "52.85.3.2",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PAC",
                "regionName": "Provence-Alpes-Côte d'Azur",
                "city": "Marseille",
                "zip": "13000",
                "lat": 43.2965,
                "lon": 5.36978,
                "timezone": "Europe/Paris",
                "isp": "Amazon Technologies Inc.",
                "org": "AWS CloudFront (GLOBAL)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "52.85.3.2"
            }
        }
    },
    {
        "key": "https://dati.camera.it/sparql",
        "value": {
            "ip": "80.64.114.207",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "62",
                "regionName": "Latium",
                "city": "Rome",
                "zip": "00152",
                "lat": 41.8904,
                "lon": 12.5126,
                "timezone": "Europe/Rome",
                "isp": "Camera dei deputati",
                "org": "Camera dei deputati",
                "as": "AS35006 Camera dei deputati",
                "query": "80.64.114.207"
            }
        }
    },
    {
        "key": "http://patho.phenomebrowser.net/sparql/",
        "value": {
            "ip": "45.223.22.138",
            "geoloc": {
                "status": "success",
                "country": "Singapore",
                "countryCode": "SG",
                "region": "",
                "regionName": "",
                "city": "Singapore",
                "zip": "",
                "lat": 1.35208,
                "lon": 103.82,
                "timezone": "Asia/Singapore",
                "isp": "Incapsula Inc",
                "org": "Incapsula Inc",
                "as": "AS19551 Incapsula Inc",
                "query": "45.223.22.138"
            }
        }
    },
    {
        "key": "http://sparql.bioontology.org/sparql",
        "value": {
            "ip": "171.67.213.189",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "CA",
                "regionName": "California",
                "city": "Stanford",
                "zip": "94305",
                "lat": 37.4295,
                "lon": -122.178,
                "timezone": "America/Los_Angeles",
                "isp": "Stanford University",
                "org": "Stanford University",
                "as": "AS32 Stanford University",
                "query": "171.67.213.189"
            }
        }
    },
    {
        "key": "http://landregistry.data.gov.uk/landregistry/query",
        "value": {
            "ip": "52.209.59.53",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "52.209.59.53"
            }
        }
    },
    {
        "key": "http://statistics.data.gov.uk/sparql",
        "value": {
            "ip": "35.242.136.176",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "",
                "lat": 51.5123,
                "lon": -0.0909,
                "timezone": "Europe/London",
                "isp": "Google LLC",
                "org": "Google Cloud (europe-west2)",
                "as": "AS396982 Google LLC",
                "query": "35.242.136.176"
            }
        }
    },
    {
        "key": "https://bnb.data.bl.uk/sparql",
        "value": {
            "ip": "54.229.104.86",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.229.104.86"
            }
        }
    },
    {
        "key": "https://data.ordnancesurvey.co.uk/datasets/boundary-line/apis/sparql",
        "value": {
            "ip": "54.77.104.71",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.77.104.71"
            }
        }
    },
    {
        "key": "http://lod.kipo.kr/data/classification/sparql",
        "value": {
            "ip": "203.242.169.10",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Yongsan-dong",
                "zip": "06333",
                "lat": 37.5046,
                "lon": 127.049,
                "timezone": "Asia/Seoul",
                "isp": "Korea Institute of Patent Information",
                "org": "Korea Trade Network",
                "as": "AS131801 Korea Institute of Patent Information",
                "query": "203.242.169.10"
            }
        }
    },
    {
        "key": "http://vocabs.ands.org.au/repository/api/sparql/anzsrc-for",
        "value": {
            "ip": "130.56.60.68",
            "geoloc": {
                "status": "success",
                "country": "Australia",
                "countryCode": "AU",
                "region": "ACT",
                "regionName": "Australian Capital Territory",
                "city": "Canberra",
                "zip": "2601",
                "lat": -35.2828,
                "lon": 149.1283,
                "timezone": "Australia/Sydney",
                "isp": "Australian Academic and Research Network",
                "org": "Anunet",
                "as": "AS7575 Australian Academic and Research Network (AARNet)",
                "query": "130.56.60.68"
            }
        }
    },
    {
        "key": "https://opendatacommunities.org/sparql",
        "value": {
            "ip": "34.89.55.242",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "",
                "lat": 51.5123,
                "lon": -0.0909,
                "timezone": "Europe/London",
                "isp": "Google LLC",
                "org": "Google Cloud (europe-west2)",
                "as": "AS396982 Google LLC",
                "query": "34.89.55.242"
            }
        }
    },
    {
        "key": "https://data.epo.org/linked-data/query",
        "value": {
            "ip": "195.6.57.68",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PDL",
                "regionName": "Pays de la Loire",
                "city": "Mayenne",
                "zip": "53100",
                "lat": 48.3068,
                "lon": -0.613113,
                "timezone": "Europe/Paris",
                "isp": "RAIN",
                "org": "JOUVE",
                "as": "AS3215 Orange S.A.",
                "query": "195.6.57.68"
            }
        }
    },
    {
        "key": "https://linkeddata1.calcul.u-psud.fr/sparql",
        "value": {
            "ip": "129.175.35.4",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Montlhery",
                "zip": "91310",
                "lat": 48.6378,
                "lon": 2.2793,
                "timezone": "Europe/Paris",
                "isp": "RENATER",
                "org": "Centre de Ressources Informatique",
                "as": "AS2269 Renater",
                "query": "129.175.35.4"
            }
        }
    },
    {
        "key": "https://linkedlifedata.com/sparql",
        "value": {
            "ip": "93.123.21.122",
            "geoloc": {
                "status": "success",
                "country": "Bulgaria",
                "countryCode": "BG",
                "region": "22",
                "regionName": "Sofia-Capital",
                "city": "Sofia",
                "zip": "1000",
                "lat": 42.6977,
                "lon": 23.3219,
                "timezone": "Europe/Sofia",
                "isp": "Daticum JSC",
                "org": "Daticum Colo",
                "as": "AS47748 Daticum AD",
                "query": "93.123.21.122"
            }
        }
    },
    {
        "key": "https://lod.nl.go.kr/sparql",
        "value": {
            "ip": "124.137.58.19",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Seoul",
                "zip": "04625",
                "lat": 37.561,
                "lon": 126.995,
                "timezone": "Asia/Seoul",
                "isp": "The National Library of Korea",
                "org": "broadNnet",
                "as": "AS10050 The National Library of Korea",
                "query": "124.137.58.19"
            }
        }
    },
    {
        "key": "https://lov.linkeddata.es/dataset/lov/sparql",
        "value": {
            "ip": "138.100.15.128",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "MD",
                "regionName": "Madrid",
                "city": "Madrid",
                "zip": "28040",
                "lat": 40.4486,
                "lon": -3.71928,
                "timezone": "Europe/Madrid",
                "isp": "Entidad Publica Empresarial Red.es",
                "org": "UPM",
                "as": "AS766 Entidad Publica Empresarial Red.es",
                "query": "138.100.15.128"
            }
        }
    },
    {
        "key": "https://opendata.aragon.es/sparql",
        "value": {
            "ip": "188.244.81.91",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "AR",
                "regionName": "Aragon",
                "city": "Zaragoza",
                "zip": "50004",
                "lat": 41.6405,
                "lon": -0.8814,
                "timezone": "Europe/Madrid",
                "isp": "Aragonesa de Servicios Telematicos",
                "org": "AST network 81",
                "as": "AS49851 Aragonesa de Servicios Telematicos",
                "query": "188.244.81.91"
            }
        }
    },
    {
        "key": "https://opendata.mfcr.cz/lod/sparql",
        "value": {
            "ip": "5.145.104.96",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "170 00",
                "lat": 50.1113,
                "lon": 14.4063,
                "timezone": "Europe/Prague",
                "isp": "Statni pokladna Centrum sdilenych sluzeb, s.p.",
                "org": "",
                "as": "AS203165 Statni pokladna Centrum sdilenych sluzeb, s.p.",
                "query": "5.145.104.96"
            }
        }
    },
    {
        "key": "https://rdf.insee.fr/sparql",
        "value": {
            "ip": "194.254.37.102",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Bois-d'Arcy",
                "zip": "78390",
                "lat": 48.7997,
                "lon": 2.0192,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "Insee",
                "as": "AS2200 Renater",
                "query": "194.254.37.102"
            }
        }
    },
    {
        "key": "https://rpp-opendata.egon.gov.cz/odrpp/sparql",
        "value": {
            "ip": "185.17.214.213",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "120 00",
                "lat": 50.0755,
                "lon": 14.4378,
                "timezone": "Europe/Prague",
                "isp": "Ministerstvo Vnitra CR",
                "org": "CMS Cgn2",
                "as": "AS48298 MINISTERSTVO VNITRA CR",
                "query": "185.17.214.213"
            }
        }
    },
    {
        "key": "https://slod.fiz-karlsruhe.de/sparql",
        "value": {
            "ip": "141.66.193.117",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BW",
                "regionName": "Baden-Württemberg",
                "city": "Eggenstein-Leopoldshafen",
                "zip": "76344",
                "lat": 49.0917,
                "lon": 8.42838,
                "timezone": "Europe/Berlin",
                "isp": "FIZ Karlsruhe - Leibniz-Institut fuer Informationsinfrastruktur GmbH",
                "org": "FIZ Karlsruhe - Leibniz Institute Information Infrastructure",
                "as": "AS13040 FIZ Karlsruhe - Leibniz-Institut fuer Informationsinfrastruktur GmbH",
                "query": "141.66.193.117"
            }
        }
    },
    {
        "key": "http://lod.nl.go.kr/sparql",
        "value": {
            "ip": "124.137.58.19",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Seoul",
                "zip": "04625",
                "lat": 37.561,
                "lon": 126.995,
                "timezone": "Asia/Seoul",
                "isp": "The National Library of Korea",
                "org": "broadNnet",
                "as": "AS10050 The National Library of Korea",
                "query": "124.137.58.19"
            }
        }
    },
    {
        "key": "https://query.wikidata.org",
        "value": {
            "ip": "91.198.174.192",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1012",
                "lat": 52.3702,
                "lon": 4.89517,
                "timezone": "Europe/Amsterdam",
                "isp": "Wikimedia Europe network",
                "org": "Wikimedia Foundation, Inc.",
                "as": "AS14907 Wikimedia Foundation Inc.",
                "query": "91.198.174.192"
            }
        }
    },
    {
        "key": "https://yago-knowledge.org/sparql",
        "value": {
            "ip": "137.194.212.161",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Palaiseau",
                "zip": "91120",
                "lat": 48.7142,
                "lon": 2.20179,
                "timezone": "Europe/Paris",
                "isp": "ENST",
                "org": "Telecom Paris site de Palaiseau",
                "as": "AS1712 Renater",
                "query": "137.194.212.161"
            }
        }
    },
    {
        "key": "https://ldf.fi/mufi/sparql",
        "value": {
            "ip": "193.167.189.101",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "15",
                "regionName": "North Savo",
                "city": "Kuopio",
                "zip": "70300",
                "lat": 62.9038,
                "lon": 27.6865,
                "timezone": "Europe/Helsinki",
                "isp": "FUNET",
                "org": "Cloud services",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "193.167.189.101"
            }
        }
    },
    {
        "key": "https://zbw.eu/beta/sparql/econ_pers/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://data.cervantesvirtual.com/openrdf-sesame/repositories/data",
        "value": {
            "ip": "46.24.172.11",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "AS",
                "regionName": "Principality of Asturias",
                "city": "Salinas",
                "zip": "33405",
                "lat": 43.5582,
                "lon": -5.922,
                "timezone": "Europe/Madrid",
                "isp": "Vodafone-BB Global",
                "org": "Asac Comunicaciones S.L.",
                "as": "AS12430 VODAFONE ESPANA S.A.U.",
                "query": "46.24.172.11"
            }
        }
    },
    {
        "key": "http://www.scholarlydata.org/sparql",
        "value": {
            "ip": "89.46.104.36",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "52",
                "regionName": "Tuscany",
                "city": "Arezzo",
                "zip": "52100",
                "lat": 43.4631,
                "lon": 11.8783,
                "timezone": "Europe/Rome",
                "isp": "Aruba S.p.A. Network",
                "org": "Aruba S.p.A.",
                "as": "AS31034 Aruba S.p.A.",
                "query": "89.46.104.36"
            }
        }
    },
    {
        "key": "https://datos.gob.es/es/sparql",
        "value": {
            "ip": "194.69.254.91",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "MD",
                "regionName": "Madrid",
                "city": "Madrid",
                "zip": "28020",
                "lat": 40.4479,
                "lon": -3.69409,
                "timezone": "Europe/Madrid",
                "isp": "Entidad Publica Empresarial Red.es",
                "org": "Entidad Publica Empresarial Red.es",
                "as": "AS25354 Entidad Publica Empresarial Red.es",
                "query": "194.69.254.91"
            }
        }
    },
    {
        "key": "https://opendata.mfcr.cz/pages/sparql",
        "value": {
            "ip": "5.145.104.96",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "170 00",
                "lat": 50.1113,
                "lon": 14.4063,
                "timezone": "Europe/Prague",
                "isp": "Statni pokladna Centrum sdilenych sluzeb, s.p.",
                "org": "",
                "as": "AS203165 Statni pokladna Centrum sdilenych sluzeb, s.p.",
                "query": "5.145.104.96"
            }
        }
    },
    {
        "key": "http://dati.camera.it/sparql",
        "value": {
            "ip": "80.64.114.207",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "62",
                "regionName": "Latium",
                "city": "Rome",
                "zip": "00152",
                "lat": 41.8904,
                "lon": 12.5126,
                "timezone": "Europe/Rome",
                "isp": "Camera dei deputati",
                "org": "Camera dei deputati",
                "as": "AS35006 Camera dei deputati",
                "query": "80.64.114.207"
            }
        }
    },
    {
        "key": "http://bnb.data.bl.uk/sparql",
        "value": {
            "ip": "54.229.104.86",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.229.104.86"
            }
        }
    },
    {
        "key": "https://jpsearch.go.jp/rdf/sparql/",
        "value": {
            "ip": "52.84.45.103",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PAC",
                "regionName": "Provence-Alpes-Côte d'Azur",
                "city": "Marseille",
                "zip": "13000",
                "lat": 43.2965,
                "lon": 5.36978,
                "timezone": "Europe/Paris",
                "isp": "Amazon Technologies Inc.",
                "org": "AWS CloudFront (GLOBAL)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "52.84.45.103"
            }
        }
    },
    {
        "key": "https://data.nationallibrary.fi/bib/sparql",
        "value": {
            "ip": "128.214.171.142",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "18",
                "regionName": "Uusimaa",
                "city": "Vantaa",
                "zip": "01690",
                "lat": 60.2808,
                "lon": 24.9103,
                "timezone": "Europe/Helsinki",
                "isp": "CSC - Tieteen tietotekniikan keskus Oy",
                "org": "University of Helsinki",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "128.214.171.142"
            }
        }
    },
    {
        "key": "https://www.ebi.ac.uk/rdf/services/sparql",
        "value": {
            "ip": "193.62.193.80",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "Cambridge",
                "zip": "CB1",
                "lat": 52.1932,
                "lon": 0.1426,
                "timezone": "Europe/London",
                "isp": "Jisc Services Limited",
                "org": "European Bioinformatics Institute",
                "as": "AS786 Jisc Services Limited",
                "query": "193.62.193.80"
            }
        }
    },
    {
        "key": "https://linkedwiki.com/sparql",
        "value": {
            "ip": "92.243.1.180",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75013",
                "lat": 48.8219,
                "lon": 2.3709,
                "timezone": "Europe/Paris",
                "isp": "GANDI is an ICANN accredited registrar",
                "org": "",
                "as": "AS203476 GANDI SAS",
                "query": "92.243.1.180"
            }
        }
    },
    {
        "key": "http://dbtune.org/jamendo/sparql",
        "value": {
            "ip": "138.37.95.150",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "EC1M",
                "lat": 51.5074,
                "lon": -0.1196,
                "timezone": "Europe/London",
                "isp": "Queen Mary University of London",
                "org": "Queen Mary and Westfield College, University of London",
                "as": "AS198864 Queen Mary and Westfield College, University of London",
                "query": "138.37.95.150"
            }
        }
    },
    {
        "key": "http://de.dbpedia.org/sparql",
        "value": {
            "ip": "141.66.193.106",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BW",
                "regionName": "Baden-Württemberg",
                "city": "Eggenstein-Leopoldshafen",
                "zip": "76344",
                "lat": 49.0917,
                "lon": 8.42838,
                "timezone": "Europe/Berlin",
                "isp": "FIZ Karlsruhe - Leibniz-Institut fuer Informationsinfrastruktur GmbH",
                "org": "FIZ Karlsruhe - Leibniz Institute Information Infrastructure",
                "as": "AS13040 FIZ Karlsruhe - Leibniz-Institut fuer Informationsinfrastruktur GmbH",
                "query": "141.66.193.106"
            }
        }
    },
    {
        "key": "http://uriburner.com/sparql/",
        "value": {
            "ip": "194.109.117.211",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1012",
                "lat": 52.3676,
                "lon": 4.90414,
                "timezone": "Europe/Amsterdam",
                "isp": "Xs4all Internet BV",
                "org": "OpenLink Software UK Ltd",
                "as": "AS3265 Xs4all Internet BV",
                "query": "194.109.117.211"
            }
        }
    },
    {
        "key": "https://es.dbpedia.org/sparql",
        "value": {
            "ip": "138.100.11.52",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "MD",
                "regionName": "Madrid",
                "city": "Madrid",
                "zip": "28040",
                "lat": 40.4486,
                "lon": -3.71928,
                "timezone": "Europe/Madrid",
                "isp": "Entidad Publica Empresarial Red.es",
                "org": "UPM",
                "as": "AS766 Entidad Publica Empresarial Red.es",
                "query": "138.100.11.52"
            }
        }
    },
    {
        "key": "https://www.orpha.net/sparql",
        "value": {
            "ip": "194.167.41.5",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Noisy-le-Sec",
                "zip": "93130",
                "lat": 48.8921,
                "lon": 2.4673,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "",
                "as": "AS2200 Renater",
                "query": "194.167.41.5"
            }
        }
    },
    {
        "key": "http://collection.britishmuseum.org/sparql",
        "value": {
            "ip": "128.86.231.86",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "Holborn",
                "zip": "EC4A 1BW",
                "lat": 51.5153,
                "lon": -0.10931,
                "timezone": "Europe/London",
                "isp": "Jisc Services Limited",
                "org": "Jisc Services Limited",
                "as": "AS786 Jisc Services Limited",
                "query": "128.86.231.86"
            }
        }
    },
    {
        "key": "http://data.americanartcollaborative.org/sparql",
        "value": {
            "ip": "128.9.36.82",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "CA",
                "regionName": "California",
                "city": "Marina del Rey",
                "zip": "90292",
                "lat": 33.9779,
                "lon": -118.4525,
                "timezone": "America/Los_Angeles",
                "isp": "University of Southern California",
                "org": "Information Sciences Institute",
                "as": "AS4 University of Southern California",
                "query": "128.9.36.82"
            }
        }
    },
    {
        "key": "http://data.bnf.fr/sparql/",
        "value": {
            "ip": "194.199.8.147",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Paris",
                "zip": "75011",
                "lat": 48.8323,
                "lon": 2.4075,
                "timezone": "Europe/Paris",
                "isp": "RENATER",
                "org": "Bibliotheque Nationale de France",
                "as": "AS2200 Renater",
                "query": "194.199.8.147"
            }
        }
    },
    {
        "key": "http://data.fondazionezeri.unibo.it/sparql/",
        "value": {
            "ip": "137.204.21.117",
            "geoloc": {
                "status": "success",
                "country": "Italy",
                "countryCode": "IT",
                "region": "45",
                "regionName": "Emilia-Romagna",
                "city": "Bologna",
                "zip": "40126",
                "lat": 44.497,
                "lon": 11.3565,
                "timezone": "Europe/Rome",
                "isp": "BOLOGNA-ALMA",
                "org": "Alma Mater Studiorum Universita' di Bologna",
                "as": "AS137 Consortium GARR",
                "query": "137.204.21.117"
            }
        }
    },
    {
        "key": "http://data.odw.tw/sparql",
        "value": {
            "ip": "140.109.23.193",
            "geoloc": {
                "status": "success",
                "country": "Taiwan",
                "countryCode": "TW",
                "region": "",
                "regionName": "Taiwan",
                "city": "Nangangzi",
                "zip": "",
                "lat": 25.0422,
                "lon": 121.615,
                "timezone": "Asia/Taipei",
                "isp": "Academia Sinica",
                "org": "",
                "as": "AS9264 Academia Sinica",
                "query": "140.109.23.193"
            }
        }
    },
    {
        "key": "http://dblp.l3s.de/d2r/sparql",
        "value": {
            "ip": "130.75.87.29",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "NI",
                "regionName": "Lower Saxony",
                "city": "Hanover",
                "zip": "30419",
                "lat": 52.4112,
                "lon": 9.6491,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Hannover",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "130.75.87.29"
            }
        }
    },
    {
        "key": "http://digital-agenda-data.eu/data/sparql",
        "value": {
            "ip": "116.203.73.105",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BY",
                "regionName": "Bavaria",
                "city": "Nuremberg",
                "zip": "90403",
                "lat": 49.4521,
                "lon": 11.0767,
                "timezone": "Europe/Berlin",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "116.203.73.105"
            }
        }
    },
    {
        "key": "http://edan.si.edu/saam/sparql",
        "value": {
            "ip": "160.111.244.177",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "DC",
                "regionName": "District of Columbia",
                "city": "Washington",
                "zip": "20029",
                "lat": 38.8898,
                "lon": -77.0137,
                "timezone": "America/New_York",
                "isp": "Smithsonian Institution",
                "org": "Smithsonian Institution",
                "as": "AS25829 Smithsonian Institution",
                "query": "160.111.244.177"
            }
        }
    },
    {
        "key": "http://fr.dbpedia.org/sparql",
        "value": {
            "ip": "138.96.19.66",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Le Chesnay",
                "zip": "78150",
                "lat": 48.8254,
                "lon": 2.13054,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "",
                "as": "AS776 Renater",
                "query": "138.96.19.66"
            }
        }
    },
    {
        "key": "http://hkcan.julac.org/lod/sparql",
        "value": {
            "ip": "143.89.105.165",
            "geoloc": {
                "status": "success",
                "country": "Hong Kong",
                "countryCode": "HK",
                "region": "HWC",
                "regionName": "Wan Chai",
                "city": "Wanchai",
                "zip": "",
                "lat": 22.1668,
                "lon": 114.2475,
                "timezone": "Asia/Hong_Kong",
                "isp": "Hong Kong University of Science and Technology",
                "org": "Hong Kong University of Science and Technology",
                "as": "AS3363 Hong Kong University of Science and Technology",
                "query": "143.89.105.165"
            }
        }
    },
    {
        "key": "http://ja.dbpedia.org/sparql",
        "value": {
            "ip": "136.187.101.150",
            "geoloc": {
                "status": "success",
                "country": "Japan",
                "countryCode": "JP",
                "region": "13",
                "regionName": "Tokyo",
                "city": "Chiyoda",
                "zip": "100-8111",
                "lat": 35.6906,
                "lon": 139.77,
                "timezone": "Asia/Tokyo",
                "isp": "National Institute of Informatics",
                "org": "National Institute of Informatics",
                "as": "AS2907 Research Organization of Information and Systems, National Institute of Informatics",
                "query": "136.187.101.150"
            }
        }
    },
    {
        "key": "http://sparql.kpath.khaos.uma.es/",
        "value": {
            "ip": "150.214.214.3",
            "geoloc": {
                "status": "success",
                "country": "Spain",
                "countryCode": "ES",
                "region": "AN",
                "regionName": "Andalusia",
                "city": "Almería",
                "zip": "04009",
                "lat": 36.8316,
                "lon": -2.4646,
                "timezone": "Europe/Madrid",
                "isp": "Centro Informatico Cientifico de Andalucia - CICA",
                "org": "",
                "as": "AS198096 Junta de Andalucia",
                "query": "150.214.214.3"
            }
        }
    },
    {
        "key": "http://sparql.kupkb.org/sparql",
        "value": {
            "ip": "217.128.147.202",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "ARA",
                "regionName": "Auvergne-Rhone-Alpes",
                "city": "Lyon",
                "zip": "69000",
                "lat": 45.764,
                "lon": 4.83566,
                "timezone": "Europe/Paris",
                "isp": "RAIN",
                "org": "LNAUB153 Aubervilliers Bloc 1",
                "as": "AS3215 Orange S.A.",
                "query": "217.128.147.202"
            }
        }
    },
    {
        "key": "http://tadirah.dariah.eu/vocab/sparql.php",
        "value": {
            "ip": "134.76.9.14",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "NI",
                "regionName": "Lower Saxony",
                "city": "Göttingen",
                "zip": "37085",
                "lat": 51.5324,
                "lon": 9.942,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "Gesellschaft fuer wissenschaftliche Datenverarbeitung mbH",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.76.9.14"
            }
        }
    },
    {
        "key": "http://virhp07.libris.kb.se/sparql/",
        "value": {
            "ip": "193.10.75.74",
            "geoloc": {
                "status": "success",
                "country": "Sweden",
                "countryCode": "SE",
                "region": "C",
                "regionName": "Uppsala County",
                "city": "Uppsala",
                "zip": "751 08",
                "lat": 59.8509,
                "lon": 17.63,
                "timezone": "Europe/Stockholm",
                "isp": "SUNET C",
                "org": "",
                "as": "AS1653 Vetenskapsradet / SUNET",
                "query": "193.10.75.74"
            }
        }
    },
    {
        "key": "http://www4.wiwiss.fu-berlin.de/dailymed/sparql",
        "value": {
            "ip": "160.45.170.9",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BE",
                "regionName": "Land Berlin",
                "city": "Berlin",
                "zip": "12051",
                "lat": 52.4693,
                "lon": 13.4285,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "Freie Universitaet Berlin",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "160.45.170.9"
            }
        }
    },
    {
        "key": "https://cedropendata.mfcr.cz/c3lod/cedr/sparql",
        "value": {
            "ip": "185.16.182.241",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "190 00",
                "lat": 50.0892,
                "lon": 14.4072,
                "timezone": "Europe/Prague",
                "isp": "Ministerstvo financi",
                "org": "",
                "as": "AS199350 Ministerstvo financi",
                "query": "185.16.182.241"
            }
        }
    },
    {
        "key": "https://data.gov.cz/sparql",
        "value": {
            "ip": "185.17.214.226",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "120 00",
                "lat": 50.0755,
                "lon": 14.4378,
                "timezone": "Europe/Prague",
                "isp": "Ministerstvo Vnitra CR",
                "org": "CMS Cgn2",
                "as": "AS48298 MINISTERSTVO VNITRA CR",
                "query": "185.17.214.226"
            }
        }
    },
    {
        "key": "https://idsm.elixir-czech.cz/sparql/",
        "value": {
            "ip": "147.231.229.158",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "20",
                "regionName": "Central Bohemia",
                "city": "Dolni Brezany",
                "zip": "252 41",
                "lat": 49.9638,
                "lon": 14.4711,
                "timezone": "Europe/Prague",
                "isp": "TUL-TCZ + CAS-TCZ",
                "org": "Czech Academy of Sciences",
                "as": "AS2852 CESNET z.s.p.o.",
                "query": "147.231.229.158"
            }
        }
    },
    {
        "key": "https://labs.onb.ac.at/en/tool/sparql/",
        "value": {
            "ip": "193.170.113.242",
            "geoloc": {
                "status": "success",
                "country": "Austria",
                "countryCode": "AT",
                "region": "9",
                "regionName": "Vienna",
                "city": "Vienna",
                "zip": "1160",
                "lat": 48.2155,
                "lon": 16.3075,
                "timezone": "Europe/Vienna",
                "isp": "ACOnet",
                "org": "",
                "as": "AS1853 ACONET",
                "query": "193.170.113.242"
            }
        }
    },
    {
        "key": "https://lingualibre.fr/bigdata/namespace/wdq/sparql",
        "value": {
            "ip": "152.228.161.167",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "HDF",
                "regionName": "Hauts-de-France",
                "city": "Gravelines",
                "zip": "59820",
                "lat": 50.9871,
                "lon": 2.12554,
                "timezone": "Europe/Paris",
                "isp": "OVH SAS",
                "org": "OVH",
                "as": "AS16276 OVH SAS",
                "query": "152.228.161.167"
            }
        }
    },
    {
        "key": "https://lingualibre.org/bigdata/namespace/wdq/sparql",
        "value": {
            "ip": "152.228.161.167",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "HDF",
                "regionName": "Hauts-de-France",
                "city": "Gravelines",
                "zip": "59820",
                "lat": 50.9871,
                "lon": 2.12554,
                "timezone": "Europe/Paris",
                "isp": "OVH SAS",
                "org": "OVH",
                "as": "AS16276 OVH SAS",
                "query": "152.228.161.167"
            }
        }
    },
    {
        "key": "https://lod.abes.fr/sparql",
        "value": {
            "ip": "193.52.26.77",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "OCC",
                "regionName": "Occitanie",
                "city": "Montpellier",
                "zip": "34000",
                "lat": 43.6107,
                "lon": 3.8809,
                "timezone": "Europe/Paris",
                "isp": "RENATER",
                "org": "The French bibliographic university agency",
                "as": "AS2200 Renater",
                "query": "193.52.26.77"
            }
        }
    },
    {
        "key": "https://www.dictionnairedesfrancophones.org/sparql",
        "value": {
            "ip": "134.158.38.98",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "ARA",
                "regionName": "Auvergne-Rhone-Alpes",
                "city": "Villeurbanne",
                "zip": "69100",
                "lat": 45.7719,
                "lon": 4.89017,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "CNRS Centre de Calcul de l'IN2P3",
                "as": "AS789 Renater",
                "query": "134.158.38.98"
            }
        }
    },
    {
        "key": "https://www.govdata.de/sparql",
        "value": {
            "ip": "5.35.254.75",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "NW",
                "regionName": "North Rhine-Westphalia",
                "city": "Hürth",
                "zip": "50354",
                "lat": 50.8839,
                "lon": 6.90004,
                "timezone": "Europe/Berlin",
                "isp": "Host Europe GmbH",
                "org": "GD MASS Network",
                "as": "AS8972 Host Europe GmbH",
                "query": "5.35.254.75"
            }
        }
    },
    {
        "key": "https://xn--slovnk-7va.gov.cz/sparql",
        "value": {
            "ip": "94.199.44.143",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "20",
                "regionName": "Central Bohemia",
                "city": "Kytin",
                "zip": "252 10",
                "lat": 49.8497,
                "lon": 14.2111,
                "timezone": "Europe/Prague",
                "isp": "Ministerstvo Vnitra CR",
                "org": "",
                "as": "AS48298 MINISTERSTVO VNITRA CR",
                "query": "94.199.44.143"
            }
        }
    },
    {
        "key": "http://ldf.fi/kirjasampo/sparql",
        "value": {
            "ip": "193.167.189.101",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "15",
                "regionName": "North Savo",
                "city": "Kuopio",
                "zip": "70300",
                "lat": 62.9038,
                "lon": 27.6865,
                "timezone": "Europe/Helsinki",
                "isp": "FUNET",
                "org": "Cloud services",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "193.167.189.101"
            }
        }
    },
    {
        "key": "http://data.nationallibrary.fi/bib/sparql",
        "value": {
            "ip": "128.214.171.142",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "18",
                "regionName": "Uusimaa",
                "city": "Vantaa",
                "zip": "01690",
                "lat": 60.2808,
                "lon": 24.9103,
                "timezone": "Europe/Helsinki",
                "isp": "CSC - Tieteen tietotekniikan keskus Oy",
                "org": "University of Helsinki",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "128.214.171.142"
            }
        }
    },
    {
        "key": "http://lod.kipo.kr/data/oversea_patent/sparql",
        "value": {
            "ip": "203.242.169.10",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Yongsan-dong",
                "zip": "06333",
                "lat": 37.5046,
                "lon": 127.049,
                "timezone": "Asia/Seoul",
                "isp": "Korea Institute of Patent Information",
                "org": "Korea Trade Network",
                "as": "AS131801 Korea Institute of Patent Information",
                "query": "203.242.169.10"
            }
        }
    },
    {
        "key": "http://vocabs.ands.org.au/repository/api/sparql/ga_geologic-unit-type_v0-1",
        "value": {
            "ip": "130.56.60.68",
            "geoloc": {
                "status": "success",
                "country": "Australia",
                "countryCode": "AU",
                "region": "ACT",
                "regionName": "Australian Capital Territory",
                "city": "Canberra",
                "zip": "2601",
                "lat": -35.2828,
                "lon": 149.1283,
                "timezone": "Australia/Sydney",
                "isp": "Australian Academic and Research Network",
                "org": "Anunet",
                "as": "AS7575 Australian Academic and Research Network (AARNet)",
                "query": "130.56.60.68"
            }
        }
    },
    {
        "key": "https://data.ordnancesurvey.co.uk/datasets/code-point-open/apis/sparql",
        "value": {
            "ip": "54.77.104.71",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.77.104.71"
            }
        }
    },
    {
        "key": "http://opendatacommunities.org/sparql",
        "value": {
            "ip": "34.89.55.242",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "",
                "lat": 51.5123,
                "lon": -0.0909,
                "timezone": "Europe/London",
                "isp": "Google LLC",
                "org": "Google Cloud (europe-west2)",
                "as": "AS396982 Google LLC",
                "query": "34.89.55.242"
            }
        }
    },
    {
        "key": "https://semantic.eea.europa.eu/sparql",
        "value": {
            "ip": "87.54.7.178",
            "geoloc": {
                "status": "success",
                "country": "Denmark",
                "countryCode": "DK",
                "region": "84",
                "regionName": "Capital Region",
                "city": "Vaerlose",
                "zip": "3500",
                "lat": 55.777,
                "lon": 12.3579,
                "timezone": "Europe/Copenhagen",
                "isp": "TDC A/S",
                "org": "European Environment Agency",
                "as": "AS3292 TDC A/S",
                "query": "87.54.7.178"
            }
        }
    },
    {
        "key": "https://sophox.org/sparql",
        "value": {
            "ip": "35.232.199.71",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "IA",
                "regionName": "Iowa",
                "city": "Council Bluffs",
                "zip": "",
                "lat": 41.2619,
                "lon": -95.8608,
                "timezone": "America/Chicago",
                "isp": "Google LLC",
                "org": "Google Cloud (us-central1)",
                "as": "AS15169 Google LLC",
                "query": "35.232.199.71"
            }
        }
    },
    {
        "key": "http://dbtune.org/bbc/peel/sparql",
        "value": {
            "ip": "138.37.95.150",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "EC1M",
                "lat": 51.5074,
                "lon": -0.1196,
                "timezone": "Europe/London",
                "isp": "Queen Mary University of London",
                "org": "Queen Mary and Westfield College, University of London",
                "as": "AS198864 Queen Mary and Westfield College, University of London",
                "query": "138.37.95.150"
            }
        }
    },
    {
        "key": "http://semantic.eea.europa.eu/sparql",
        "value": {
            "ip": "87.54.7.178",
            "geoloc": {
                "status": "success",
                "country": "Denmark",
                "countryCode": "DK",
                "region": "84",
                "regionName": "Capital Region",
                "city": "Vaerlose",
                "zip": "3500",
                "lat": 55.777,
                "lon": 12.3579,
                "timezone": "Europe/Copenhagen",
                "isp": "TDC A/S",
                "org": "European Environment Agency",
                "as": "AS3292 TDC A/S",
                "query": "87.54.7.178"
            }
        }
    },
    {
        "key": "https://sparql.orthodb.org/sparql",
        "value": {
            "ip": "129.194.190.21",
            "geoloc": {
                "status": "success",
                "country": "Switzerland",
                "countryCode": "CH",
                "region": "GE",
                "regionName": "Geneva",
                "city": "Geneva",
                "zip": "1206",
                "lat": 46.1922,
                "lon": 6.1589,
                "timezone": "Europe/Zurich",
                "isp": "SWITCH.1",
                "org": "Universite de Geneve",
                "as": "AS559 SWITCH",
                "query": "129.194.190.21"
            }
        }
    },
    {
        "key": "https://tora.entryscape.net/snorql",
        "value": {
            "ip": "65.21.108.114",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "18",
                "regionName": "Uusimaa",
                "city": "Helsinki",
                "zip": "00100",
                "lat": 60.1719,
                "lon": 24.9347,
                "timezone": "Europe/Helsinki",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "65.21.108.114"
            }
        }
    },
    {
        "key": "https://triplestore.sireneld.io/sirene/sparql",
        "value": {
            "ip": "51.255.67.141",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PAC",
                "regionName": "Provence-Alpes-Côte d'Azur",
                "city": "Marseille",
                "zip": "13000",
                "lat": 43.2965,
                "lon": 5.36978,
                "timezone": "Europe/Paris",
                "isp": "OVH SAS",
                "org": "OVH",
                "as": "AS16276 OVH SAS",
                "query": "51.255.67.141"
            }
        }
    },
    {
        "key": "https://www.data.gouv.fr/catalog.rdf",
        "value": {
            "ip": "37.59.183.93",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "HDF",
                "regionName": "Hauts-de-France",
                "city": "Roubaix",
                "zip": "59100",
                "lat": 50.6917,
                "lon": 3.20014,
                "timezone": "Europe/Paris",
                "isp": "OVH ISP",
                "org": "OVH SAS",
                "as": "AS16276 OVH SAS",
                "query": "37.59.183.93"
            }
        }
    },
    {
        "key": "http://opencitations.net/sparql",
        "value": {
            "ip": "104.21.7.16",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "NJ",
                "regionName": "New Jersey",
                "city": "Newark",
                "zip": "07175",
                "lat": 40.7357,
                "lon": -74.1724,
                "timezone": "America/New_York",
                "isp": "Cloudflare, Inc.",
                "org": "Cloudflare, Inc.",
                "as": "AS13335 Cloudflare, Inc.",
                "query": "104.21.7.16"
            }
        }
    },
    {
        "key": "https://w3id.org/oc/sparql",
        "value": {
            "ip": "162.209.11.63",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "TX",
                "regionName": "Texas",
                "city": "San Antonio",
                "zip": "78218",
                "lat": 29.508,
                "lon": -98.3942,
                "timezone": "America/Chicago",
                "isp": "Rackspace Hosting",
                "org": "Rackspace Cloud Servers",
                "as": "AS19994 Rackspace Hosting",
                "query": "162.209.11.63"
            }
        }
    },
    {
        "key": "https://ld.cultural.jp/sparql",
        "value": {
            "ip": "52.44.222.56",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "VA",
                "regionName": "Virginia",
                "city": "Ashburn",
                "zip": "20149",
                "lat": 39.0438,
                "lon": -77.4874,
                "timezone": "America/New_York",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (us-east-1)",
                "as": "AS14618 Amazon.com, Inc.",
                "query": "52.44.222.56"
            }
        }
    },
    {
        "key": "http://nomisma.org/query",
        "value": {
            "ip": "161.47.117.67",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "TX",
                "regionName": "Texas",
                "city": "San Antonio",
                "zip": "78218",
                "lat": 29.508,
                "lon": -98.3942,
                "timezone": "America/Chicago",
                "isp": "Rackspace Hosting",
                "org": "The American Numismatic Society",
                "as": "AS19994 Rackspace Hosting",
                "query": "161.47.117.67"
            }
        }
    },
    {
        "key": "https://identifiers.org/services/sparql",
        "value": {
            "ip": "35.186.253.75",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "MO",
                "regionName": "Missouri",
                "city": "Kansas City",
                "zip": "",
                "lat": 39.0997,
                "lon": -94.5785,
                "timezone": "America/Chicago",
                "isp": "Google LLC",
                "org": "Google Cloud",
                "as": "AS15169 Google LLC",
                "query": "35.186.253.75"
            }
        }
    },
    {
        "key": "https://www.europeandataportal.eu/sparql",
        "value": {
            "ip": "52.84.45.95",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PAC",
                "regionName": "Provence-Alpes-Côte d'Azur",
                "city": "Marseille",
                "zip": "13000",
                "lat": 43.2965,
                "lon": 5.36978,
                "timezone": "Europe/Paris",
                "isp": "Amazon Technologies Inc.",
                "org": "AWS CloudFront (GLOBAL)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "52.84.45.95"
            }
        }
    },
    {
        "key": "https://data.cssz.cz/sparql",
        "value": {
            "ip": "91.195.106.153",
            "geoloc": {
                "status": "success",
                "country": "Czechia",
                "countryCode": "CZ",
                "region": "10",
                "regionName": "Hlavni mesto Praha",
                "city": "Prague",
                "zip": "150 00",
                "lat": 50.0571,
                "lon": 14.4059,
                "timezone": "Europe/Prague",
                "isp": "T-Mobile Czech Republic a.s.",
                "org": "Ceska Sprava Socialniho Zabezpeceni",
                "as": "AS5588 T-Mobile Czech Republic a.s.",
                "query": "91.195.106.153"
            }
        }
    },
    {
        "key": "https://zbw.eu/beta/sparql/econ_corp/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://dbtune.org/magnatune/sparql",
        "value": {
            "ip": "138.37.95.150",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "EC1M",
                "lat": 51.5074,
                "lon": -0.1196,
                "timezone": "Europe/London",
                "isp": "Queen Mary University of London",
                "org": "Queen Mary and Westfield College, University of London",
                "as": "AS198864 Queen Mary and Westfield College, University of London",
                "query": "138.37.95.150"
            }
        }
    },
    {
        "key": "https://query.inventaire.io",
        "value": {
            "ip": "78.47.243.145",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "BY",
                "regionName": "Bavaria",
                "city": "Nuremberg",
                "zip": "90403",
                "lat": 49.4521,
                "lon": 11.0767,
                "timezone": "Europe/Berlin",
                "isp": "Hetzner Online GmbH",
                "org": "Hetzner",
                "as": "AS24940 Hetzner Online GmbH",
                "query": "78.47.243.145"
            }
        }
    },
    {
        "key": "http://dbpedia.org/sparql",
        "value": {
            "ip": "194.109.129.58",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "UT",
                "regionName": "Utrecht",
                "city": "Amersfoort",
                "zip": "3821",
                "lat": 52.1738,
                "lon": 5.4224,
                "timezone": "Europe/Amsterdam",
                "isp": "XS4ALL Networking",
                "org": "OpenLink Software UK Ltd",
                "as": "AS3265 Xs4all Internet BV",
                "query": "194.109.129.58"
            }
        }
    },
    {
        "key": "http://lod.kipo.kr/data/patent/sparql",
        "value": {
            "ip": "203.242.169.10",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Yongsan-dong",
                "zip": "06333",
                "lat": 37.5046,
                "lon": 127.049,
                "timezone": "Asia/Seoul",
                "isp": "Korea Institute of Patent Information",
                "org": "Korea Trade Network",
                "as": "AS131801 Korea Institute of Patent Information",
                "query": "203.242.169.10"
            }
        }
    },
    {
        "key": "http://vocabs.ands.org.au/repository/api/sparql/csiro_international-chronostratigraphic-chart_international-chronostratigraphic-chart",
        "value": {
            "ip": "130.56.60.68",
            "geoloc": {
                "status": "success",
                "country": "Australia",
                "countryCode": "AU",
                "region": "ACT",
                "regionName": "Australian Capital Territory",
                "city": "Canberra",
                "zip": "2601",
                "lat": -35.2828,
                "lon": 149.1283,
                "timezone": "Australia/Sydney",
                "isp": "Australian Academic and Research Network",
                "org": "Anunet",
                "as": "AS7575 Australian Academic and Research Network (AARNet)",
                "query": "130.56.60.68"
            }
        }
    },
    {
        "key": "https://data.ordnancesurvey.co.uk/datasets/opennames/apis/sparql",
        "value": {
            "ip": "54.77.104.71",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.77.104.71"
            }
        }
    },
    {
        "key": "http://data.archiveshub.ac.uk/sparql",
        "value": {
            "ip": "54.72.154.243",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.72.154.243"
            }
        }
    },
    {
        "key": "http://www.europeandataportal.eu/sparql",
        "value": {
            "ip": "52.84.45.95",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PAC",
                "regionName": "Provence-Alpes-Côte d'Azur",
                "city": "Marseille",
                "zip": "13000",
                "lat": 43.2965,
                "lon": 5.36978,
                "timezone": "Europe/Paris",
                "isp": "Amazon Technologies Inc.",
                "org": "AWS CloudFront (GLOBAL)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "52.84.45.95"
            }
        }
    },
    {
        "key": "https://zbw.eu/beta/sparql/gnd/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://dbtune.org/musicbrainz/sparql",
        "value": {
            "ip": "138.37.95.150",
            "geoloc": {
                "status": "success",
                "country": "United Kingdom",
                "countryCode": "GB",
                "region": "ENG",
                "regionName": "England",
                "city": "London",
                "zip": "EC1M",
                "lat": 51.5074,
                "lon": -0.1196,
                "timezone": "Europe/London",
                "isp": "Queen Mary University of London",
                "org": "Queen Mary and Westfield College, University of London",
                "as": "AS198864 Queen Mary and Westfield College, University of London",
                "query": "138.37.95.150"
            }
        }
    },
    {
        "key": "http://lod.kipo.kr/data/thesaurus/sparql",
        "value": {
            "ip": "203.242.169.10",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Yongsan-dong",
                "zip": "06333",
                "lat": 37.5046,
                "lon": 127.049,
                "timezone": "Asia/Seoul",
                "isp": "Korea Institute of Patent Information",
                "org": "Korea Trade Network",
                "as": "AS131801 Korea Institute of Patent Information",
                "query": "203.242.169.10"
            }
        }
    },
    {
        "key": "https://data.ordnancesurvey.co.uk/datasets/os-linked-data/apis/sparql",
        "value": {
            "ip": "54.77.104.71",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.77.104.71"
            }
        }
    },
    {
        "key": "https://zbw.eu/beta/sparql/pm20/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://lod.kipo.kr/data/sparql",
        "value": {
            "ip": "203.242.169.10",
            "geoloc": {
                "status": "success",
                "country": "South Korea",
                "countryCode": "KR",
                "region": "11",
                "regionName": "Seoul",
                "city": "Yongsan-dong",
                "zip": "06333",
                "lat": 37.5046,
                "lon": 127.049,
                "timezone": "Asia/Seoul",
                "isp": "Korea Institute of Patent Information",
                "org": "Korea Trade Network",
                "as": "AS131801 Korea Institute of Patent Information",
                "query": "203.242.169.10"
            }
        }
    },
    {
        "key": "http://data.ordnancesurvey.co.uk/datasets/os-linked-data/apis/sparql",
        "value": {
            "ip": "54.77.104.71",
            "geoloc": {
                "status": "success",
                "country": "Ireland",
                "countryCode": "IE",
                "region": "L",
                "regionName": "Leinster",
                "city": "Dublin",
                "zip": "D02",
                "lat": 53.3498,
                "lon": -6.26031,
                "timezone": "Europe/Dublin",
                "isp": "Amazon.com, Inc.",
                "org": "AWS EC2 (eu-west-1)",
                "as": "AS16509 Amazon.com, Inc.",
                "query": "54.77.104.71"
            }
        }
    },
    {
        "key": "http://ontology.irstea.fr/weather/sparql",
        "value": {
            "ip": "195.221.117.193",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Sucy-en-Brie",
                "zip": "94370",
                "lat": 48.7619,
                "lon": 2.5408,
                "timezone": "Europe/Paris",
                "isp": "Renater",
                "org": "Irstea",
                "as": "AS2200 Renater",
                "query": "195.221.117.193"
            }
        }
    },
    {
        "key": "https://zbw.eu/beta/sparql/stw/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://api.finto.fi/sparql",
        "value": {
            "ip": "128.214.223.223",
            "geoloc": {
                "status": "success",
                "country": "Finland",
                "countryCode": "FI",
                "region": "18",
                "regionName": "Uusimaa",
                "city": "Helsinki",
                "zip": "00441",
                "lat": 60.1719,
                "lon": 24.9347,
                "timezone": "Europe/Helsinki",
                "isp": "CSC - Tieteen tietotekniikan keskus Oy",
                "org": "University of Helsinki",
                "as": "AS1741 CSC - Tieteen tietotekniikan keskus Oy",
                "query": "128.214.223.223"
            }
        }
    },
    {
        "key": "http://lov.okfn.org/dataset/lov/sparql",
        "value": {
            "ip": "142.250.200.243",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "PAC",
                "regionName": "Provence-Alpes-Côte d'Azur",
                "city": "Marseille",
                "zip": "13000",
                "lat": 43.2965,
                "lon": 5.36978,
                "timezone": "Europe/Paris",
                "isp": "Google LLC",
                "org": "Google LLC",
                "as": "AS15169 Google LLC",
                "query": "142.250.200.243"
            }
        }
    },
    {
        "key": "http://prod-dekalog.inria.fr/sparql",
        "value": {
            "ip": "128.93.164.34",
            "geoloc": {
                "status": "success",
                "country": "France",
                "countryCode": "FR",
                "region": "IDF",
                "regionName": "Île-de-France",
                "city": "Le Chesnay",
                "zip": "78150",
                "lat": 48.8254,
                "lon": 2.13054,
                "timezone": "Europe/Paris",
                "isp": "INRIA",
                "org": "",
                "as": "AS2200 Renater",
                "query": "128.93.164.34"
            }
        }
    },
    {
        "key": "https://zbw.eu/beta/sparql/stwv/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://zbw.eu/beta/sparql/gnd/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "http://zbw.eu/beta/sparql/stw/query",
        "value": {
            "ip": "134.245.10.101",
            "geoloc": {
                "status": "success",
                "country": "Germany",
                "countryCode": "DE",
                "region": "SH",
                "regionName": "Schleswig-Holstein",
                "city": "Kiel",
                "zip": "24106",
                "lat": 54.3483,
                "lon": 10.1203,
                "timezone": "Europe/Berlin",
                "isp": "Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "org": "UNI Kiel",
                "as": "AS680 Verein zur Foerderung eines Deutschen Forschungsnetzes e.V.",
                "query": "134.245.10.101"
            }
        }
    },
    {
        "key": "https://id.nlm.nih.gov/mesh/sparql",
        "value": {
            "ip": "130.14.16.63",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "MD",
                "regionName": "Maryland",
                "city": "Rockville",
                "zip": "20853",
                "lat": 39.085,
                "lon": -77.0932,
                "timezone": "America/New_York",
                "isp": "National Library of Medicine",
                "org": "National Library of Medicine",
                "as": "AS70 National Library of Medicine",
                "query": "130.14.16.63"
            }
        }
    },
    {
        "key": "http://id.nlm.nih.gov/mesh/sparql",
        "value": {
            "ip": "130.14.16.63",
            "geoloc": {
                "status": "success",
                "country": "United States",
                "countryCode": "US",
                "region": "MD",
                "regionName": "Maryland",
                "city": "Rockville",
                "zip": "20853",
                "lat": 39.085,
                "lon": -77.0932,
                "timezone": "America/New_York",
                "isp": "National Library of Medicine",
                "org": "National Library of Medicine",
                "as": "AS70 National Library of Medicine",
                "query": "130.14.16.63"
            }
        }
    },
    {
        "key": "https://api.parliament.uk/sparql",
        "value": {
            "ip": "51.137.96.34",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1011",
                "lat": 52.3667,
                "lon": 4.9,
                "timezone": "Europe/Amsterdam",
                "isp": "Microsoft Corporation",
                "org": "Microsoft Azure Cloud (westeurope)",
                "as": "AS8075 Microsoft Corporation",
                "query": "51.137.96.34"
            }
        }
    },
    {
        "key": "https://wcqs-beta.wmflabs.org/",
        "value": {
            "ip": "185.15.56.49",
            "geoloc": {
                "status": "success",
                "country": "Switzerland",
                "countryCode": "CH",
                "region": "ZH",
                "regionName": "Zurich",
                "city": "Zurich",
                "zip": "8000",
                "lat": 47.3769,
                "lon": 8.54169,
                "timezone": "Europe/Zurich",
                "isp": "Wikimedia Foundation Inc.",
                "org": "Wikimedia Cloud eqiad",
                "as": "AS14907 Wikimedia Foundation Inc.",
                "query": "185.15.56.49"
            }
        }
    },
    {
        "key": "http://genome.microbedb.jp/sparql",
        "value": {
            "ip": "133.39.116.113",
            "geoloc": {
                "status": "success",
                "country": "Japan",
                "countryCode": "JP",
                "region": "13",
                "regionName": "Tokyo",
                "city": "Chiyoda",
                "zip": "100-0001",
                "lat": 35.694,
                "lon": 139.754,
                "timezone": "Asia/Tokyo",
                "isp": "Research Organization of Information and Systems, National Institute of Informa",
                "org": "",
                "as": "AS2907 Research Organization of Information and Systems, National Institute of Informatics",
                "query": "133.39.116.113"
            }
        }
    },
    {
        "key": "http://bio2rdf.org/sparql",
        "value": {
            "ip": "137.120.31.101",
            "geoloc": {
                "status": "success",
                "country": "Netherlands",
                "countryCode": "NL",
                "region": "NH",
                "regionName": "North Holland",
                "city": "Amsterdam",
                "zip": "1012",
                "lat": 52.3667,
                "lon": 4.89454,
                "timezone": "Europe/Amsterdam",
                "isp": "Surf B.V.",
                "org": "Universiteit Maastricht",
                "as": "AS1103 SURF B.V.",
                "query": "137.120.31.101"
            }
        }
    }
];

const timezoneMap = [
    {
        "key": "Europe/Dublin",
        "value": {
            "abbreviation": "GMT",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T09:19:44.007273+00:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 0,
            "timezone": "Europe/Dublin",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.007273+00:00",
            "utc_offset": "+00:00",
            "week_number": 3
        }
    },
    {
        "key": "Asia/Tokyo",
        "value": {
            "abbreviation": "JST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T18:19:44.007460+09:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 32400,
            "timezone": "Asia/Tokyo",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.007460+00:00",
            "utc_offset": "+09:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Madrid",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.006408+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Madrid",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.006408+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Berlin",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.007529+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Berlin",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.007529+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Paris",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.006807+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Paris",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.006807+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "America/Toronto",
        "value": {
            "abbreviation": "EST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T04:19:44.007677-05:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": -18000,
            "timezone": "America/Toronto",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.007677+00:00",
            "utc_offset": "-05:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Zurich",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.034286+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Zurich",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.034286+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "America/New_York",
        "value": {
            "abbreviation": "EST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T04:19:44.034815-05:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": -18000,
            "timezone": "America/New_York",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.034815+00:00",
            "utc_offset": "-05:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Amsterdam",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.037359+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Amsterdam",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.037359+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Helsinki",
        "value": {
            "abbreviation": "EET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T11:19:44.038993+02:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 7200,
            "timezone": "Europe/Helsinki",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.038993+00:00",
            "utc_offset": "+02:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/London",
        "value": {
            "abbreviation": "GMT",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T09:19:44.038483+00:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 0,
            "timezone": "Europe/London",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.038483+00:00",
            "utc_offset": "+00:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Rome",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.043388+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Rome",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.043388+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Asia/Seoul",
        "value": {
            "abbreviation": "KST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T18:19:44.057782+09:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 32400,
            "timezone": "Asia/Seoul",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.057782+00:00",
            "utc_offset": "+09:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Warsaw",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.063490+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Warsaw",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.063490+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Asia/Taipei",
        "value": {
            "abbreviation": "CST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T17:19:44.063653+08:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 28800,
            "timezone": "Asia/Taipei",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.063653+00:00",
            "utc_offset": "+08:00",
            "week_number": 3
        }
    },
    {
        "key": "Australia/Sydney",
        "value": {
            "abbreviation": "AEDT",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T20:19:44.065675+11:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": true,
            "dst_from": "2021-10-02T16:00:00+00:00",
            "dst_offset": 3600,
            "dst_until": "2022-04-02T16:00:00+00:00",
            "raw_offset": 36000,
            "timezone": "Australia/Sydney",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.065675+00:00",
            "utc_offset": "+11:00",
            "week_number": 3
        }
    },
    {
        "key": "America/Los_Angeles",
        "value": {
            "abbreviation": "PST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T01:19:44.065585-08:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": -28800,
            "timezone": "America/Los_Angeles",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.065585+00:00",
            "utc_offset": "-08:00",
            "week_number": 3
        }
    },
    {
        "key": "Australia/Melbourne",
        "value": {
            "abbreviation": "AEDT",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T20:19:44.066294+11:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": true,
            "dst_from": "2021-10-02T16:00:00+00:00",
            "dst_offset": 3600,
            "dst_until": "2022-04-02T16:00:00+00:00",
            "raw_offset": 36000,
            "timezone": "Australia/Melbourne",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.066294+00:00",
            "utc_offset": "+11:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Copenhagen",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.091021+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Copenhagen",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.091021+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Sofia",
        "value": {
            "abbreviation": "EET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T11:19:44.092083+02:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 7200,
            "timezone": "Europe/Sofia",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.092083+00:00",
            "utc_offset": "+02:00",
            "week_number": 3
        }
    },
    {
        "key": "Asia/Singapore",
        "value": {
            "abbreviation": "+08",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T17:19:44.091390+08:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 28800,
            "timezone": "Asia/Singapore",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.091390+00:00",
            "utc_offset": "+08:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Prague",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.099124+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Prague",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.099124+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Vienna",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.116863+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Vienna",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.116863+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    },
    {
        "key": "America/Chicago",
        "value": {
            "abbreviation": "CST",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T03:19:44.116781-06:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": -21600,
            "timezone": "America/Chicago",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.116781+00:00",
            "utc_offset": "-06:00",
            "week_number": 3
        }
    },
    {
        "key": "Asia/Hong_Kong",
        "value": {
            "abbreviation": "HKT",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T17:19:44.099718+08:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 28800,
            "timezone": "Asia/Hong_Kong",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.099718+00:00",
            "utc_offset": "+08:00",
            "week_number": 3
        }
    },
    {
        "key": "Europe/Stockholm",
        "value": {
            "abbreviation": "CET",
            "client_ip": "2a01:cb1d:33e:5700:5c65:a05b:3884:e14c",
            "datetime": "2022-01-17T10:19:44.102024+01:00",
            "day_of_week": 1,
            "day_of_year": 17,
            "dst": false,
            "dst_from": null,
            "dst_offset": 0,
            "dst_until": null,
            "raw_offset": 3600,
            "timezone": "Europe/Stockholm",
            "unixtime": 1642411184,
            "utc_datetime": "2022-01-17T09:19:44.102024+00:00",
            "utc_offset": "+01:00",
            "week_number": 3
        }
    }
];

module.exports = {endpointIpMap, timezoneMap, graphLists};
