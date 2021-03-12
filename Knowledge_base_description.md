# Knowledge base description

<!--- NOTE: Le document est rédigé en Markdown pour rapidité d'écriture, trivialité de la conversion vers LateX et compatibilité avec Github --->

The goal of this document is to present the desired features in a dataset description. To do this, we will present the different vocabularies to use to describe each feature. We will give examples of the extraction and re-generation of descriptions as desired.

### Vocabularies

There are three major vocabularies for the description of knowledge bases. Other vocabularies of more general use, such as [Dublin Core](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/2010-10-11/) or [Friend of a Friend](http://xmlns.com/foaf/spec/20100809.html), complement each of those three major ones. The three major vocabularies are also used to complete each other in a description. We give here a succinct description of the scope of each vocabulary.

##### [VoID](https://www.w3.org/TR/void/)
VoID is the most used vocabulary to write metadata about KBs. This vocabulary is tailored to create simple descriptions of a KB, its access, and its links to others. It describes the links with other KBs by giving the properties used to linked resources of different datasets.

##### [DCAT](https://www.w3.org/TR/vocab-dcat-3/)
The DCAT vocabulary is used for the description of a catalog of KBs. It can describe datasets and their means of distribution or access. Compared to VoID, it contains properties and classes to make more in-depth descriptions of endpoints and data dumps.

##### [SPARQL-SD](http://www.w3.org/TR/sparql11-service-description/)
The SPARQL-SD vocabulary is specialized for the detailed description of SPARQL endpoints. Among others, It gives classes and properties for the description of the named graphs, the result formats, which SPARQL standard the endpoint conforms to, etc.

### Features
The goals of a KB's description should be to give a minimal description of the KB, such as the entry in a catalog, with human-readable data. It should also contain enough data to describe as many elements about the KB as possible, such as its provenance, its links to other KBs, its internal structure, its licenses, the technical capacity of its endpoint, etc.

To cover as many features of a KB as possible, a KB description should describe the content of the KB using both VoID and DCAT elements. This description should be linked to a SPARQL-SD description of its endpoint. The content of the KB's description may contain duplicate pieces of information, using different properties. This redundancy could help the extraction of the description by queries from agents without knowledge of the description's ontology.

| Prefix   | Namepace                                         |
|----------|--------------------------------------------------|
| void:    | http://rdfs.org/ns/void#                         |
| dcat:    | http://www.w3.org/ns/dcat#                       |
| sd:      | http://www.w3.org/ns/sparql-service-description# |
| rdf:     | http://www.w3.org/1999/02/22-rdf-syntax-ns#      |
| rdfs:    | http://www.w3.org/2000/01/rdf-schema#            |
| owl:     | http://www.w3.org/2002/07/owl#                   |
| xsd:     | http://www.w3.org/2001/XMLSchema#                |
| dcterms: | http://purl.org/dc/terms/                        |
| foaf:    | http://xmlns.com/foaf/0.1/                       |
| skos:    | http://www.w3.org/2004/02/skos/core#	            |
| prov:    | http://www.w3.org/ns/prov#                       |
| formats: | http://www.w3.org/ns/formats/                    |
| schema:  | http://schema.org/                               |

All the following examples are redacted in [turtle](https://www.w3.org/TR/turtle/) format.

##### Central resources
Each description is centered around one resource, typed by the class representing a dataset from the different vocabularies.
For VoID, the class is `void:Dataset`, for DCAT, it is `dcat:Dataset`.
Hence, a description of a KB should begin with the definition of a resource typed by those two classes.

As an example:
```
:exampleDataset a void:Dataset, dcat:Dataset.
```
The URL of the SPARQL endpoint should be linked to the central resource with the property `void:endpointUrl` as an URI.

A central resource for the descrition of a KB should be retrievable by the query:
```
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
SELECT DISTINCT ?central WHERE {
  {
    ?central a void:Dataset .
  } UNION {
    ?central a dcat:Dataset .
  }
}
```
The endpoint description should be linked as subject to its endpoint URL, as an URI, by the property `sd:endpoint`.
The endpoint description resource should be retrievable by the query:
```
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
SELECT DISTINCT ?endpoint WHERE {
  ?endpoint sd:endpoint ?endpointUrl.
}
```
The descriptions present in the dataset should be present around the resources retrieved by the two previous queries.

##### Label and description
The description of a KB should the best practices for data publication and offer labels and descriptions.

The central resource for the KB should have at least a name linked to it by the property `rdfs:label`. Other properties such as `dcterms:title`, `foaf:name`, `skos:prefLabel` may be used. Properties such as `dcterms:description` or `rdfs:comment` may be used to give a more detailed human-readable description of the KB. Each resource of the description of a KB should have a label if possible.

As an example:
```
:exampleDataset rdfs:label "Example Dataset"@en ;
  rdfs:comment "This is a fictional dataset used in the examples of this document"@en .
```
Other elements of description, such as the themes or keywords may be used.
```
:exampleDataset dcterms:subject :metadata, :example, "vocabulary", "SPARQL" ;
  schema:keywords :metadata, :example, "vocabulary", "SPARQL" .

:metadata a skos:Concept ;
  rdfs:label "Metadata" .

:example a skos:Concept ;
  rdfs:label "Example" .
```

The properties given here are not an exhaustive list of possible labelling properties. There are other properties defined in domain-specific vocabularies.

##### Provenance
The provenance of the data of a KB must be given to ensure its reusability. The vocabulary used to describe provenance is most often Dublin Core. The [PROV ontology](http://www.w3.org/TR/prov-o/) gives properties an classes to create detailed descriptions of the provenance. There are mapping between the elements of the Dublin Core and PROV ontology.

As presented in the PROV ontology recommandation, the provenance can be reduced to the answers to three questions: Who ? What ? How ?
THe following tables present a non-exhaustive list of the properties to be used to describe a KB. Those that should be used for a description that gives the minimal provenance information are shown in italics.

| Who ?                   |
|-------------------------|
| _`dcterms:creator`_     |
| `dcterms:contributor`   |
| `dcterms:publisher`     |

| What ?                 |
|---------               |
| _`dcterms:license`_    |
| `dcterms:conformsTo`   |

| How ?                |
|----------------------|
| _`dcterms:created`_  |
| _`dcterms:modified`_ |
| `dcterms:issued`     |
| `dcterms:source`     |
| `dcterms:format`     |

As an example:
```
:exampleDataset dcterms:creator <https://dblp.org/pid/143/6275> ;
  dcterms:license <https://cecill.info/licences/Licence_CeCILL_V2.1-fr> ;
  dcterms:created "08-02-2021"^^xsd:date ;
  dcterms:modified "09-02-2021"^^xsd:date .

<https://dblp.org/pid/143/6275> a foaf:Person ;
  rdfs:label "Pierre Maillot"@en .

<https://cecill.info/licences/Licence_CeCILL_V2.1-fr> a dcterms:LicenseDocument ;
  rdfs:label "License CeCILL"@fr .
  rdfs:label "French CeCILL Licence"@en .
```

##### SPARQL endpoint
The description of the endpoint has to contain the elements related to the accessibility of the endpoint. The metadata must give the particularities of the SPARQL engine and of the graphs of the KB.

The endpoint metadata should at least give its URL, which version of SPARQL it accepts, the results formats it can return, and the named graphs of the KB.

As an example, the endpoint of our example KB supports SPARQL1.1 Query and Update. It can return XML, JSON, Turtle, N3, and CSV.
```
:exampleSparqlService a sd:Service ;
  sd:endpoint <http://www.example.com/sparql> ;
  sd:supportedLanguage sd:SPARQL10Query, sd:SPARQL10Update ;
  sd:resultFormat formats:N3 , formats:RDF_XML , formats:SPARQL_Results_CSV , formats:SPARQL_Results_JSON , formats:SPARQL_Results_XML , formats:Turtle .
```

The example KB has one default graphs and one named graph, named `:ng1`.

```
:exampleSparqlService sd:defaultDataset [
a sd:Dataset ;
   sd:defaultGraph [
    a sd:Graph .
   ] ;
   sd:namedGraph [
    a sd:NamedGraph ;
      sd:name :ng1 .
   ]
  ]
```
Other features of the endpoint can be added to the description such as the non-standard function proposed or the default treatment of the namedGraph data. The functions offered by the endpoint are given by the property `sd:extensionFunction`, with the function as subject, same for the aggregates with `sd:extensionAggregate`.
Other features are given by the property `sd:features`. The SPARQL-SD standard defines five features: `sd:DereferencesURIs`, `sd:UnionDefaultGraph`, `sd:RequiresDataset`, `sd:EmptyGraphs`, and `sd:BasicFederatedQuery`. `sd:DereferencesURIs`

The link between a `sd:Graph` and a `dcat:Dataset` should be represented by the relation `dcat:servesDataset`. In our example, the example dataset is contained in the `:ng1` graph. The final minimal SPARQL-SD description of our example should be:

```
:exampleSparqlService sd:endpoint <http://www.example.com/sparql> ;
  sd:supportedLanguage sd:SPARQL10Query, sd:SPARQL10Update ;
  sd:resultFormat formats:N3 , formats:RDF_XML , formats:SPARQL_Results_CSV , formats:SPARQL_Results_JSON , formats:SPARQL_Results_XML , formats:Turtle ;
  sd:defaultDataset [
    a sd:Dataset ;
    sd:defaultGraph [
      a sd:Graph ;
     ] ;
   sd:namedGraph [
    a sd:NamedGraph ;
      sd:name :ng1 ;
      dcat:servesDataset :exampleDataset .
    ]
  ] .
```

##### Ontology descriptions


##### Population count
Each graph should indicates its number of triples. If possible, simple population counts should also be given such as the number of classes, properties and instances.
The number of triples must appear in the SPARQL-SD metadata, as part of the graph description, and in the VoID/DCAT metadata. Both cases use the property `void:triples`.

The number of triples can be retrieved by the query:
```
SELECT count(*) WHERE {
  ?s ?p ?o
}
```
In our example, the default graph contains 987 triples and the graph `:ng1`, also described by `:exampleDataset`, contains 1234 triples. The count of triples should be used as such:
```
:exampleSparqlService sd:defaultDataset [
  a sd:Dataset ;
  sd:defaultGraph [
    a sd:Graph ;
    void:triples 987 .
  ] ;
  sd:namedGraph [
    a sd:NamedGraph ;
    sd:name :ng1 ;
    dcat:servesDataset :exampleDataset ;
    void:triples 1234 .
  ]
] .
:exampleDataset void:triples 1234 .
```
The VoID/DCAT metadata can contain other population counts, such as the classes, the properties, the sujects of objets.

The number of classes can be retrieved by the query:
```
SELECT DISTINCT (count(?s) AS ?c)
FROM <http://dbpedia.org> WHERE {
  SELECT DISTINCT ?s WHERE {
    { ?s a owl:Class }
    UNION { ?s a rdfs:Class }
    UNION { ?whatever a ?s }
  }
}
```
The number of classes must be linked to the VoID/DCAT description by the property `void:classes`.

The number of properties can be retrieved by the query:
```
SELECT DISTINCT (count(?p) AS ?c)
WHERE {
    SELECT DISTINCT ?p WHERE  {
    ?s ?p ?o
  }
}
```
The number of properties must be linked to the VoID/DCAT description by the property `void:properties`.

The number of distinct subjects can be retrieved by the query:
```
SELECT DISTINCT (count(?p) AS ?c)
WHERE {
  SELECT DISTINCT ?s WHERE  {
    ?s ?p ?o
  }
}
```
The number of distinct subjects must be linked to the VoID/DCAT description by the property `void:distinctSubjects`.

The number of distinct objects can be retrieved by the query:
```
SELECT DISTINCT (count(?o) AS ?c)
WHERE {
  SELECT DISTINCT ?o WHERE  {
    ?s ?p ?o
  }
}
```
The number of distinct objects must be linked to the VoID/DCAT description by the property `void:distinctObjects`.

In our example, with arbitrary populations, the description would be:
```
:exampleDataset void:triples 1234 ;
  void:classes 8 ;
  void:properties 11 ;
  void:distinctSubjects 96 ;
  void:distinctObjects 458 ;
```

##### Namespaces

<!--- Trop de namespaces dans DBpedia à cause d'URI mal formée, ERROR dans WASABI --->
<!--- NOTE Parler du fait que la presence de void:uriPattern défini ce qui est accepté en tant que sujet/objet dans les comptes de population --->
```
SELECT DISTINCT ?ns WHERE {
  ?s ?p ?o .
  BIND( REPLACE( str(?p), "(#|/)[^#/]*$", "$1" ) AS ?ns )
}
```

##### Links to other resources

##### Others

<!--- Qu'est ce qui a été oublié ? --->

### Examples of descriptions

In this section, we try first to extract the descriptions of three KB, detailing each step. We then try to generate a description corresponding to the standards we have defined in the previous sections. The goal of this section is to identify the eventual limitations and problems coming from our previous statements when confronted with real-life examples.

---
**EDIT:**
This document will be edited to reflect what we learned here:

1. The notion of ONE central resource does not hold in practice.
2. Better to treat separately void/dcat and sparql-sd descriptions.
3. Better to start with retrieval of the endpoint description.
4. Look for connexions between descriptions and known enddpoint or graph URIs, using `rdfs:seeAlso` for example.
5. If the feature `sd:requiresDataset` is defined on the endpoint, datasets should be defined too.
6. If `void:uriSpace` is given, look for Datasets/Vocabularies/Graphs within the namespace.
7. Endpoint description will have to be rebuilt from scratch (including result format, etc.)
---

#### [DBPedia](http://dbpedia.org/sparql)
We suppose that we only know the name of the base "DBpedia" and its endpoint URL.

We check the availability of the endpoint using `SELECT * WHERE { ?s ?p ?o } LIMIT 1` sent to http://dbpedia.org/sparql, which returns a result. The endpoint is reachable.

##### Extraction of the SPARQL endpoint description
First, we retrieve the list of SPARQL-SD description in the KB, if there are any, using the query:
```
SELECT DISTINCT ?endpoint WHERE {
  ?endpoint sd:endpoint ?endpointUrl.
}
```
This query returns 4 resources.

| endpoint                     |
|------------------------------|
| http://localhost:8890/sparql |
| nodeID://b10251              |
| nodeID://b50122              |
| http://dbpedia.org/sparql-sd |

We retrieve the descriptions of each of these resources, using the query:
```
CONSTRUCT {
   ?endpoint ?p ?o .
} WHERE {
    ?endpoint sd:endpoint ?endpointUrl .
    ?endpoint ?p ?o .
}
```
The results are presented in the file [retrieved_endpoint_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_endpoint_dbpedia.ttl).

Of the three descriptions, only the resource `dbp:sparql-sd`, line 15 to 74, describes an endpoint with the same URL we used to query the base. The other endpoints will be analyzed separately, we focus on the description of the endpoint we have interrogated, `dbp:sparql-sd`.

The description linked to `dbp:sparql-sd` contains a good description of the particularities of the SPARQL engine of the endpoint. It describes its two URLs, the result formats it returns, its supported versions of SPARQL, and other information. It does not describe the named graphs contained in the KB.
We can retrieve the named graphs present in the KB by using the query:
```
SELECT DISTINCT ?g WHERE {
 GRAPH ?g { ?s ?p ?o }
}
ORDER BY ?g
```
This query returns 32 named graphs, including 5 different spellings of the URI `dbp:sparql-sd` with different capitalizations and HTTP protocols.


| g                                           |
|---------------------------------------------|
| b3sifp                                      |
| b3sonto                                     |
| dbprdf-label                                |
| facets                                      |
| http://DBPedia.org/sparql-sd                |
| http://DBpedia.org/sparql-sd                |
| http://dbpedia.org                          |
| http://dbpedia.org/resource/classes#        |
| http://dbpedia.org/schema/property_rules#   |
| http://dbpedia.org/sparql-sd                |
| http://dbpedia.org/void/                    |
| http://localhost:8890/DAV/                  |
| http://localhost:8890/sparql                |
| http://pivot_test_data/campsites            |
| http://pivot_test_data/ski_resorts          |
| http://query.wikidata.org/sparql            |
| http://www.openlinksw.com/schemas/oplweb#   |
| http://www.openlinksw.com/schemas/virtcxml# |
| http://www.openlinksw.com/schemas/virtpivot |
| http://www.openlinksw.com/schemas/virtrdf#  |
| http://www.openlinksw.com/virtpivot/icons   |
| http://www.w3.org/2002/07/owl#              |
| http://www.w3.org/ns/ldp#                   |
| https://DBpedia.org/sparql-sd               |
| https://dbpedia.org/sparql-sd               |
| https://query.wikidata.org/sparql           |
| urn:activitystreams-owl:map                 |
| urn:rules.skos                              |
| urn:virtuoso:val:acl:schema                 |
| virtpivot-icon-test                         |
| virtpivot-rules                             |
| virtrdf-label                               |


The feature `sd:RequiresDataset`, given line 18 of [retrieved_endpoint_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_endpoint_dbpedia.ttl), indicates that the SPARQL service requires an explicit dataset declaration. Each of those named graphs should be detailed in the endpoint description.

##### Extraction of the void/dcat description
We first check if their are at least one resource representing a DCAT or VoID description, using the query:
```
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
SELECT DISTINCT ?central WHERE {
    {
      ?central a void:Dataset .
    } UNION {
      ?central a dcat:Dataset .
    }
}
```
Results:

| central                         |
|---------------------------------|
| http://dbpedia.org/void/Dataset |
| nodeID://b10252                 |
| nodeID://b50123                 |

Retrieval of data about each DCAT/VoID description resource using 2 queries:

Outgoing properties:
```
CONSTRUCT {
  ?central ?p ?o
} WHERE {
  {
    ?central a void:Dataset .
  } UNION {
    ?central a dcat:Dataset .
  }
  ?central ?p ?o
}
```
Ingoing properties:
```
CONSTRUCT {
  ?s ?p ?central
} WHERE {
  {
    ?central a void:Dataset .
  } UNION {
    ?central a dcat:Dataset .
  }
  ?s ?p ?central
}
```
The results are presented in the file [retrieved_dataset_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_dbpedia.ttl), line 19 to 91. There are 3 datasets described, none of which are linked to the endpoint URL. Only 2 contain labels and none contain provenance information.

But, we note that the relation `rdfs:seeAlso` links the dataset `dbv:Dataset`  to the graph `<http://dbpedia.org>`. The relation `rdfs:seeAlso` indicates that the object resource can give further information about the subject resource. So, we can infer that the `dbv:Dataset` describes the `<http://dbpedia.org>` graph.


##### Generation of metadata
From the existing metadata about DBpedia, we can gather a partial endpoint description. The link between the `dbv:Dataset` description and the graph `<http://dbpedia.org>` can link the endpoint metadata and the content metadata. We could not get provenance information about `<http://dbpedia.org>`. The SPARQL-SD description of the DBPedia endpoint can be reused as it is, with the addition of the only graph description we could retrieve. AS we know the name of the endpoint we have been querying, we can add a label to the VoID/DCAT description resource.

A first version of the metadata about DBPedia would be as presented in file [generated_metadata_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/generated_metadata_dbpedia.ttl)

*WIP*
<!---  Extraction de RDFa depuis DBpedia.org ne donne pas de donées RDF viables --->
<!--- TODO: Vérification des données + génération des données manquantes sur possible --->

#### [Wasabi](http://wasabi.inria.fr/sparql)
We suppose that we only know the name "Wasabi" and its endpoint's URL `http://wasabi.inria.fr/sparql`.

The retrieval of the SPARQL-SD description resource returns only one resource named `http://localhost:8890/sparql`.
The description of the resource is given in the file [retrieved_endpoint_wasabi.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_endpoint_wasabi.ttl). This is a short description of an endpoint, but no connection to the known URL of the WASABI SPARQL endpoint is found.
From this retrieved data alone, we cannot generate a description of the WASABI base.

The retrieval of VoID/DCAT description resources returns 7 different results.

| VoID/DCAT description resource               |
|----------------------------------------------|
| http://ns.inria.fr/covid19/DBpedia           |
| http://ns.inria.fr/covid19/Wikidata          |
| http://ns.inria.fr/covid19/UMLS              |
| http://ns.inria.fr/covid19/covidontheweb-1-2 |
| http://ns.inria.fr/wasabi/Wikidata           |
| http://ns.inria.fr/wasabi/wasabi-1-0         |
| http://ns.inria.fr/covid19/cord19v47         |

The file [retrieved_dataset_wasabi.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_wasabi.ttl) gives the descriptions of each resource. Two of the resources are at the center of exhaustive descriptions of datasets. Only one of the resources is linked to the known URL of WASABI's endpoint by the property `void:sparqlEndpoint`. From this fact, we can assume that the triples between line 116 to 192, centered around the resource `<http://ns.inria.fr/wasabi/wasabi-1-0>` are the description of the WASABI dataset.

##### Generation of metadata

The VoID/DCAT description centered around `<http://ns.inria.fr/wasabi/wasabi-1-0>` contains almost all the information it should contains. It is well typed, labelled and described, although not by `rdfs:label`, and contains provenance information. It also contains a count of its triples.

A SPARQL-SD description of the endpoint we used is missing, as no element allows us to connect this description to the only SPARQL-SD description available.

Extracting the list of named graphs returns 74 results. Of those 74, only 4 a connected to the VoID/DCAT description resource by the property `void:vocabulary`. So, they are not graphs of data that we aim to describe in priority.

<!--- 74 graphes dans le endpoint
```
SELECT DISTINCT ?g WHERE {
  <http://ns.inria.fr/wasabi/wasabi-1-0> ?p2 ?g .
 GRAPH ?g { ?s ?p ?o }
}
ORDER BY ?g
```

| g |
|---|
| http://purl.org/dc/terms/ |
| http://purl.org/ontology/chord/ |
| http://purl.org/ontology/mo/ |
| http://xmlns.com/foaf/0.1/ |
 --->

Yet, the VoID/DCAT description contains the value `"http://ns.inria.fr/wasabi/"` for the property `void:uriSpace` which gives the namespace of the resources of the WASABI base. We can identify 8 graphs within this namespaces, given in the following table:

| Graphs URIs within the WASABI namespace                  |
|---------------------------------------------------------|
| http://ns.inria.fr/wasabi/graph/albums                  |
| http://ns.inria.fr/wasabi/graph/artists                 |
| http://ns.inria.fr/wasabi/graph/metadata                |
| http://ns.inria.fr/wasabi/graph/songs                   |
| http://ns.inria.fr/wasabi/ontology/                     |
| http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38392c |
| http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38393b |
| http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee386ee8 |

 *WIP*

<!--- #### ORKG
**Candidate**

[fichier](https://github.com/Wimmics/dekalog/blob/master/retrieved_orkg.ttl)

Only query with answers:
```
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>

DESCRIBE ?endpoint WHERE {
  ?endpoint sd:endpoint ?endpointUrl.
}
```

#### BNF
**Candidate**

[fichier](https://github.com/Wimmics/dekalog/blob/master/retrieved_bnf.ttl)

Only query with answers:
```
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
DESCRIBE ?endpoint WHERE {
  ?endpoint sd:endpoint ?endpointUrl.
}
```

#### Bioportal (?)
--->
