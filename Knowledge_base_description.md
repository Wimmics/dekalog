# Knowledge base description

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Knowledge base description](#knowledge-base-description)
	- [Vocabularies](#vocabularies)
		- [VoID](#void)
		- [DCAT](#dcat)
		- [SPARQL-SD](#sparql-sd)
	- [Features](#features)
		- [Terminology for this document](#terminology-for-this-document)
		- [Knowledge base description resources](#knowledge-base-description-resources)
			- [SPARQL-SD](#sparql-sd)
			- [VoID/DCAT](#voiddcat)
		- [Label and description](#label-and-description)
		- [Provenance](#provenance)
		- [SPARQL endpoint](#sparql-endpoint)
		- [Description of vocabularies used](#description-of-vocabularies-used)
		- [Population count](#population-count)
		- [Class population count](#class-population-count)
		- [Namespaces](#namespaces)
		- [Links to other resources](#links-to-other-resources)
		- [Others](#others)
	- [Examples of descriptions](#examples-of-descriptions)
		- [Trace of the extraction](#trace-of-the-extraction)
		- [Generation of error report](#generation-of-error-report)
		- [DBpedia <!-- [DBPedia](http://dbpedia.org/sparql) -->](#dbpedia-dbpediahttpdbpediaorgsparql-)
			- [Extraction of the SPARQL endpoint description](#extraction-of-the-sparql-endpoint-description)
			- [Extraction of the void/dcat description](#extraction-of-the-voiddcat-description)
			- [Generation of metadata](#generation-of-metadata)
				- [Check and generation of population statistics](#check-and-generation-of-population-statistics)
				- [Check of the linkset statistics](#check-of-the-linkset-statistics)
				- [Addition of basic provenance metadata](#addition-of-basic-provenance-metadata)
				- [Class population count](#class-population-count)
			- [Extraction of vocabularies](#extraction-of-vocabularies)
		- [Wasabi](#wasabi)
			- [Generation of metadata](#generation-of-metadata)
				- [Generation of basic SPARQL-SD description](#generation-of-basic-sparql-sd-description)
				- [Check of the dataset description properties](#check-of-the-dataset-description-properties)
				- [Check of the population count](#check-of-the-population-count)
				- [Generation of basic provenance metadata](#generation-of-basic-provenance-metadata)
				- [Generation of class population counts](#generation-of-class-population-counts)
				- [Extraction of linkset descriptions](#extraction-of-linkset-descriptions)
		- [British National Bibliography](#british-national-bibliography)
			- [Generation of metadata](#generation-of-metadata)
				- [Generation of endpoint description](#generation-of-endpoint-description)
				- [Checks of the vocabularies](#checks-of-the-vocabularies)
				- [Checks of the triple count and generation of population counts](#checks-of-the-triple-count-and-generation-of-population-counts)
				- [Generation of linksets descriptions](#generation-of-linksets-descriptions)
				- [Addition of basic provenance metadata](#addition-of-basic-provenance-metadata)

<!-- /TOC -->

<!--- NOTE: Le document est rédigé en Markdown pour rapidité d'écriture, trivialité de la conversion vers LateX et compatibilité avec Github --->

The goal of this document is to present the desired features in a dataset description. To do this, we will present the different vocabularies to use to describe each feature. We will give examples of the extraction and re-generation of descriptions as desired.

## Vocabularies

There are three major vocabularies for the description of knowledge bases. Other vocabularies of more general use, such as [Dublin Core](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/2010-10-11/) or [Friend of a Friend](http://xmlns.com/foaf/spec/20100809.html), complement each of those three major ones. The three major vocabularies are also used to complete each other in a description. We give here a succinct description of the scope of each vocabulary.

### VoID
<!-- https://www.w3.org/TR/void/ -->
VoID is the most used vocabulary to write metadata about KBs. This vocabulary is tailored to create simple descriptions of a KB, its access, and its links to others. It describes the links with other KBs by giving the properties used to linked resources of different datasets.

### DCAT
<!-- https://www.w3.org/TR/vocab-dcat-3/ -->
The DCAT vocabulary is used for the description of a catalog of KBs. It can describe datasets and their means of distribution or access. Compared to VoID, it contains properties and classes to make more in-depth descriptions of endpoints and data dumps.

### SPARQL-SD
<!-- http://www.w3.org/TR/sparql11-service-description/ -->
The SPARQL-SD vocabulary is specialized for the detailed description of SPARQL endpoints. Among others, It gives classes and properties for the description of the named graphs, the result formats, which SPARQL standard the endpoint conforms to, etc.

## Features
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
| dcelem   | http://purl.org/dc/elements/1.1/                 |
| foaf:    | http://xmlns.com/foaf/0.1/                       |
| skos:    | http://www.w3.org/2004/02/skos/core#             |
| prov:    | http://www.w3.org/ns/prov#                       |
| formats: | http://www.w3.org/ns/formats/                    |
| schema:  | http://schema.org/                               |
| earl:    | http://www.w3.org/ns/earl#                       |
| http:    | http://www.w3.org/2011/http#                     |
| sp:      | http://spinrdf.org/sp#                           |

All the following examples are redacted in [turtle](https://www.w3.org/TR/turtle/) format.

### Terminology for this document
In this document, we name as *knowledge base* (KB) a collection of triples published, maintained, and aggregated by a single provider. For practical reasons, a knowledge base is associated with a SPARQL endpoint. A knowledge graph, also called a *dataset* in the different vocabularies, can also contain graphs, viewed as compartments of triples. A knowledge base can be a set of graphs associated with an endpoint.

We name the *description* of a resource as in-going and out-going triple containing the resource.


### Knowledge base description resources
Each knowledge base description is centered around two resources. The first resource is the description of the SPARQL endpoint. The second resource represent a dataset. The description of the resources typed with classes from the VoID/DCAT vocabularies is called the knowledge base description. The description of the resources identified with the SPARQL-SD vocabulary is called the endpoint description.

During the extraction of descriptions, we may not find either the endpoint description or the knowledge base description. If there is an endpoint description but no knowledge base description, by default that the knowledge base consists of all the triples and graphs accessible through the endpoint. If there is a knowledge base description but no endpoint description, the knowledge base is associated with the endpoint that allowed to query the knowledge base description. In both cases, the missing descriptions have to be generated.

#### SPARQL-SD
The resource at the center of the description of the endpoint is not identified by its class. The endpoint description resource should be linked as subject to its endpoint URL, as a URI, by the property `sd:endpoint`.
The endpoint description resource should be retrievable by the query:
```
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
SELECT DISTINCT ?endpoint WHERE {
    ?endpoint sd:endpoint ?endpointUrl.
}
```

#### VoID/DCAT
In the VoID vocabulary, the class `void:Dataset` represents a knowledge base, as defined in the precedent section. In the DCAT vocabulary, the class `dcat:Dataset` represents any collection of data, not limited to RDF, published or curated by a single agent, and available for access or download in one or more representations.
Hence, a description of a KB should begin with the definition of a resource typed by those two classes.

As an example:
```
:exampleDataset a void:Dataset, dcat:Dataset.
```
The URL of the SPARQL endpoint should be linked to the knowledge base resource with the property `void:endpointUrl` as an URI.

A knowledge base resource for the description of a KB should be retrievable by the query:
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

### Label and description
The description of a KB should the best practices for data publication and offer labels and descriptions.

The knowledge base resource should have at least a name linked to it by one of the properties `rdfs:label`, `dcterms:title`, `foaf:name`, `skos:prefLabel`, `schema:name` may be used. Properties such as `dcterms:description` or `rdfs:comment` may be used to give a more detailed human-readable description of the KB. Each resource of the description of a KB should have a label if possible.

As an example:
```
:exampleDataset rdfs:label "Example Dataset"@en ;
    rdfs:comment "This is a fictional dataset used in the examples of this document"@en .
```
Other elements of description, such as the themes or keywords may be used.
```
:exampleDataset dcterms:subject :metadata,
        :example,
        "vocabulary",
        "SPARQL" ;
    schema:keywords
        :metadata,
        :example,
        "vocabulary",
        "SPARQL" .

:metadata a skos:Concept ;
    skos:prefLabel "Metadata" .
    rdfs:label "Metadata" .

:example a skos:Concept ;
    rdfs:label "Example" .
    skos:prefLabel "Example" .
```

The properties given here are not an exhaustive list of possible labelling properties. There are other properties defined in domain-specific vocabularies.

### Provenance
The provenance of the data of a KB must be given to ensure its reusability. The vocabulary used to describe provenance is most often Dublin Core. The [PROV ontology](http://www.w3.org/TR/prov-o/) gives properties an classes to create detailed descriptions of the provenance. There are mapping between the elements of the Dublin Core and PROV ontology. In this ontology, the datasets are instances of the `prov:Entity` class. Any description of the generation of the data should be typed with `prov:Activity` and softwares and peoples involved should be typed with `prov:Agent`.

As presented in the PROV ontology recommandation, the provenance can be reduced to the answers to three questions: Who ? What ? How ?
THe following tables present a non-exhaustive list of the properties to be used to describe a KB. Those that should be used for a description that gives the minimal provenance information are shown in italics.

| Who ?                   |
|-------------------------|
| _`dcterms:creator`_     |
| `dcterms:contributor`   |
| `dcterms:publisher`     |
| `prov:wasAttributedTo`  |

| What ?                 |
|---------               |
| _`dcterms:license`_    |
| `dcterms:conformsTo`   |

| How ?                     |
|---------------------------|
| _`dcterms:created`_       |
| _`dcterms:modified`_      |
| `prov:wasGeneratedAtTime` |
| `dcterms:issued`          |
| `dcterms:source`          |
| `prov:wasDerivedFrom`     |
| `dcterms:format`          |

As an example:
```
:exampleDataset a prov:Entity ;
    dcterms:creator <https://dblp.org/pid/143/6275> ;
    prov:wasAttributedTo <https://dblp.org/pid/143/6275> ;
    dcterms:license <https://cecill.info/licences/Licence_CeCILL_V2.1-fr> ;
    dcterms:created "08-02-2021"^^xsd:date ;
    prov:wasGeneratedAtTime "08-02-2021"^^xsd:date .
    dcterms:modified "09-02-2021"^^xsd:date .

<https://dblp.org/pid/143/6275> a foaf:Person , prov:Agent ;
    rdfs:label "Pierre Maillot"@en .

<https://cecill.info/licences/Licence_CeCILL_V2.1-fr> a dcterms:LicenseDocument ;
    rdfs:label "License CeCILL"@fr .
    rdfs:label "French CeCILL Licence"@en .
```

### SPARQL endpoint
The description of the endpoint has to contain the elements related to the accessibility of the endpoint. The metadata must give the particularities of the SPARQL engine and of the graphs of the KB.

The endpoint metadata should at least give its URL, which version of SPARQL it accepts, the results formats it can return, and the named graphs of the KB.

As an example, the endpoint of our example KB supports SPARQL1.1 Query and Update. It can return XML, JSON, Turtle, N3, and CSV.
```
:exampleSparqlService a sd:Service ;
    sd:endpoint <http://www.example.com/sparql> ;
    sd:supportedLanguage sd:SPARQL10Query, sd:SPARQL11Update ;
    sd:resultFormat formats:N3 ,
        formats:RDF_XML ,
        formats:SPARQL_Results_CSV ,
        formats:SPARQL_Results_JSON ,
        formats:SPARQL_Results_XML ,
        formats:Turtle .
```

The example KB has one default graphs and one named graph, named `:ng1`.

```
:exampleSparqlService sd:availableGraphs [
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

The link between a `sd:DataService` and a `dcat:Dataset` should be represented by the relation `dcat:servesDataset`. In our example, the example dataset is contained in the `:ng1` graph. The final minimal SPARQL-SD description of our example should be:

```
:exampleSparqlService sd:endpoint <http://www.example.com/sparql> ;
    a sd:Service, dcat:DataService, prov:Entity ;
    sd:supportedLanguage sd:SPARQL10Query, sd:SPARQL10Update ;
    sd:resultFormat formats:N3 ,
        formats:RDF_XML ,
        formats:SPARQL_Results_CSV ,
        formats:SPARQL_Results_JSON ,
        formats:SPARQL_Results_XML ,
        formats:Turtle ;
    sd:availableGraphs [
        a sd:Dataset ;
        sd:defaultGraph [
            a sd:Graph .
        ] ;
        sd:namedGraph [
            a sd:NamedGraph ;
            sd:name :ng1 .
        ]
    ] ;
    dcat:servesDataset :exampleDataset .
```

The dataset description resource should also be linked to the endpoint descriptino resource by the property `dcat:accessService`. This property links instances of `dcat:Dataset` and `dcat:DataService`. As an example:
```
:exampleDataset a void:Dataset, dcat:Dataset, prov:Entity ;
  dcat:accessService :exampleSparqlService .
```

### Description of vocabularies used
The description of the dataset should contain the list of the vocabularies used in it. This list should be given using the property `void:vocabulary` with the URIs of the vocabularies as objects.

The URI of a vocabulary is also its namespace. It is possible to check the presence of vocabulary in a dataset by sending a query to check the apparition of the namespace in properties or classes.
For example, checking the usage of the Schema vocabulary would be checked with the following query:
```
ASK {
    { ?s ?elem ?o } UNION { ?s a ?elem }
    FILTER(REGEX(?elem, "http://schema.org/"))
}
```

In our example, the description of the ontology used would be as such:
```
:exampleDataset void:vocabulary <http://rdfs.org/ns/void#> ,
        <http://www.w3.org/ns/dcat#>  ,
        <http://www.w3.org/ns/sparql-service-description#> ,
        <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ,
        <http://www.w3.org/2000/01/rdf-schema#> ,
        <http://purl.org/dc/terms/> ,
        <http://www.w3.org/2004/02/skos/core#> ,
        <http://www.w3.org/ns/prov#> ,
        <http://schema.org/> ,
        <http://www.w3.org/ns/earl#>
```


If they are not given, we can extract the vocabularies used in the dataset. The vocabularies are generally identified by their namespaces. In the same namespace, the name of a resource appears after the final `/` of `#` of its URI. While this is not standard, most namespaces follow this convention. As such, we can extract the list of namespaces used in properties or classes using the following query:

```
SELECT DISTINCT ?ns
WHERE {
    { ?s ?elem ?o . }
    UNION { ?x a ?elem . }
    BIND( REPLACE( str(?elem), "(#|/)[^#/]*$", "$1" ) AS ?ns )
}
```
This query has the disadvantage to be quite complex and uses advanced features of SPARQL1.1 that are not implemented in all SPARQL endpoints.

### Population count
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
:exampleSparqlService
    sd:defaultDataset [
        a sd:Dataset ;
        sd:defaultGraph [
            a sd:Graph ;
            void:triples 987 .
        ] ;
        sd:namedGraph [
            a sd:NamedGraph ;
            sd:name :ng1 ;
            void:triples 1234 .
        ]
    ] .
```
The VoID/DCAT metadata can contain other population counts, such as the classes, the properties, the sujects of objets.

The number of classes can be retrieved by the query:
```
SELECT (count(?s) AS ?c)
WHERE {
    SELECT DISTINCT ?s WHERE {
        { ?s a owl:Class }
        UNION { ?s a rdfs:Class }
        UNION { ?whatever a ?s }
    }
}
```
The number of classes must be linked to the knowledge base resource by the property `void:classes`.

The number of properties can be retrieved by the query:
```
SELECT (count(?p) AS ?c)
WHERE {
    SELECT DISTINCT ?p WHERE  {
        ?s ?p ?o
    }
}
```
The number of properties must be linked to the knowledge base resource by the property `void:properties`.

The number of distinct subjects can be retrieved by the query:
```
SELECT (count(?p) AS ?c)
WHERE {
    SELECT DISTINCT ?s WHERE  {
        ?s ?p ?o
    }
}
```
The number of distinct subjects must be linked to the knowledge base resource by the property `void:distinctSubjects`.

The number of distinct objects can be retrieved by the query:
```
SELECT DISTINCT (count(?o) AS ?c)
WHERE {
    SELECT DISTINCT ?o WHERE  {
        ?s ?p ?o
    }
}
```
The number of distinct objects must be linked to the knowledge base resource by the property `void:distinctObjects`.

In our example, with arbitrary populations, the description would be:
```
:exampleDataset void:triples 1234 ;
    void:classes 8 ;
    void:properties 11 ;
    void:distinctSubjects 96 ;
    void:distinctObjects 458 ;
```

### Class population count
To give an idea of the repartition of instances among classes to end-users, it is possible to give the population of each class in a dataset. The VoID vocabulary gives a property called `void:classPartition` which allows writing the properties of the instances of a class. The same mechanism is also available for properties using `void:propertyPartition`.

The list of class population can be retrieved using the following query:
```
SELECT ?class (count(?instance) AS ?count) WHERE {
    SELECT DISTINCT ?class ?instance
    WHERE {
        ?instance a ?class  
    }
}
```
The object of the property `void:classPartition` must be the subject of the property `void:class`. In our example with arbitrary population, the class population count appears as follows in the metadata:
```
:exampleDataset void:classPartition [
        void:class :exampleClass1 ;
        void:entities 789
    ] ;
    void:classPartition [
        void:class :exampleClass2 ;
        void:entities 456
    ] .
```

### Namespaces
The descriptions should contain the namespaces of the dataset.
We can use the dataset namespaces to identify the resources and graphs of the dataset. They can be defined by two properties `void:uriSpace` and `void:uriPattern`. `void:uriSpace` gives the start of all the dataset resources URIs. `void:uriPattern` gives a regular expression matching all the datasets resources URIs. The dataset namespace should be described using one of those two properties, if possible.

### Links to other resources

Equivalences and links between resources of other datasets are important for the usage of external sources. If the description does not give the namespace of the dataset or the vocabulary used, the identification of resources from another dataset is difficult. The links are generally described by the property `owl:sameAs`, describing an equivalence between two different resources. They are sometimes also defined by the property `rdfs:seeAlso`, describing that the description of another resource gives further information.

In a dataset description based on the VoID vocabulary, the notion of linksets is a set of triples linking resources of the dataset to resources from others, represented as an instance of `void:Linkset`. The VoID vocabulary defines the linksets as subsets of the dataset, they are linked to the dataset by the relation `void:subset`. Giving the URI of the other datasets concerned by the links with the `void:target` improves the description of a linkset. It is also useful to give the number of triples in the dataset.

In our example, a set of 24 links to resources in DBpedia would be described as in the following triples:
```
:example_dbpedia a void:Linkset ;
    void:linkPredicate owl:sameAs ;
    void:target <http://dbpedia.org> ;
    void:subset :exampleDataset ;
    void:triples 24 .
```

### Others

<!--- Qu'est ce qui a été oublié ? --->

## Examples of descriptions

In this section, we try first to extract the descriptions of three KB, detailing each step. We then try to generate a description corresponding to the standards we have defined in the previous sections. The goal of this section is to identify the eventual limitations and problems coming from our previous statements when confronted with real-life examples.

In the generated data, we will use the `dkg:missingValue` resource to represent elements that should have to appear in the examples but could not be retrieved at the moment of reading. This resource should not be used outside this documentation.

We also add provenance statements about our generated description. This provenance information concerns only the new description resources we have created. It also contains reports of the extraction and generation operation that could not do due to errors or limitations.

### Trace of the extraction
During the following examples, we send different SPARQL queries to build and check the description of datasets. Those queries can be separated into two categories:
- Extraction queries, made to identify and extract the triples of the description from the dataset. Those queries are SELECT queries used to identify the resources relevant to the description.
- Check queries, made to verify the consistency of the description. Those queries compare the values of the description with values extracted from the content of the dataset.
We can say that extraction queries can have no results, in which case we will generate a minimal description, while check queries must have the expected results.

We describe each of the different queries in a file associated with each example. The actual construction of the triples of the generated description can be made with a variety of approaches, e.g. with CONSTRUCT, SELECT, or DESCRIBE when it is implemented. For this reason, we do not describe this part of the extraction, we focus on the preliminary queries searching for the description resources. This allows us to also describe the behavior of the endpoint when confronted with different keywords in our queries.

The queries described as pure EARL assertion are extraction queries. They fail when the SPARQL endpoint returns an error during their evaluation. The queries described with a test formalized in a SHACL constraint are check queries. Their results depend on the validation of the constraint by the data.

### Generation of error report

**WIP**

SPARQL endpoints have limitations on the time allocated to the resolution of queries and on the keyword supported by the SPARQL engine. Those limitations make some operations of metadata extraction impossible. We keep a trace of the errors obtained during the process of extraction using the [EARL](https://www.w3.org/TR/EARL10-Schema/) vocabulary. The EARL vocabulary allows the description of assertions and the results of their tests. For our needs, a query sent for metadata retrieval is an assertion that passes its test if it receives results from a SPARQL endpoint. This set of reports can be used to identify the limitations of the server that can not be described in RDF.

<!-- We add some properties to the EARL vocabulary to link the reports to descriptions features. We use the property `dkg:featureProperty` to state which property the results should have been the object of. -->

For our need, each endpoint is an instance of `earl:TestSubject`, and each report is an instance of `earl:Assertion`. For each `earl:Assertion` we give:
<!-- -  The description property that the results of the query should have filled, with `dkg:featureProperty`. -->
-  The object of the property `earl:test` is either a SHACL shape or a test of a query, instance of the class `dkg:TestQuery` that we define.
-  The results of the test are given by the property `earl:result` with an instance of `earl:TestResult`, generally a blank node, with the following properties:
    -  `earl:outcome` gives the result of the test. The results can be instances of the `earl:OutcomeValue` with the following instance defined by the EARL vocabulary: `earl:passed`, `earl:failed`, `earl:cantTell`, `earl:inapplicable` and `earl:untested` or with any instance of the `earl:Pass`, `earl:Fail`, `earl:NotTested`, `earl:NotApplicable` or `earl:CannotTell` classes. In the case of a failure because of a HTTP error sent by the SPARQL endpoint, it is advised to create an instance of `earl:Fail` linked to a partial description of the HTTP response with the property `dkg:httpResponse`.
    -  `earl:info` gives comments on the outcome if possible.
    - The time of the test with `prov:generatedAtTime`

There are dependancies between test, for example every test must be done after the reachability have been tested, or the search for description resources connected to the endpoint is a refinement of the search for any description resource in the dataset. To define the dependancies between tests, we use the relation `dcterms:requires`.

As examples, we detail several different types of queries sent during our extraction and refinment process.

The first query to be sent to a server is the simple query:
```
SELECT * WHERE {
    ?s ?p ?o
}
LIMIT 1
```
We use it to verify the reachability of the SPARQL endpoint. We are not interested in the results of this query, we are only interested in the fact that the SPARQL endpoint accepts it and returns an answer to it.

We first define a test to check the HTTP status of the response to or query. In this test we give an RDF representation of the query and a constraint on its HTTP response from the server:
```
:reachabilityTest a earl:TestCase ,
        dkg:TestQuery ; # Class of tests similar to a lower-level SHACL shape where we precise the query and the expected HTTP response.
    dcterms:title "Reachability test" ;
    dcterms:description "Reachability is tested with a simple query" ;
    dkg:query [
        a sp:Select ;
        sp:resultVariable () ;
        sp:where (
                [
                    sp:subject [ sp:varName "s"^^xsd:string ] ;
                    sp:predicate [ sp:varName "p"^^xsd:string ] ;
                    sp:object [ sp:varName "o"^^xsd:string ]
                ]
            ) ;
        sp:limit 1
    ] ;
    dkg:httpResponse dkg:statusOK .
    # dkg:statusOk represents a HTTP response described with  [ a http:Response ; http:statusCodeValue 200 ] .
```
This test is validated if the server accepts the SPARQL query and returned an answer without error.

The result of the test is represented as an EARL assertion linked to the test.
```
:reachExampleEndpoint rdf:type earl:Assertion ,
        prov:Activity ;
    dcterms:title "Reachability test for the example endpoint" ;
    earl:subject <http://www.example.com/sparql> ;
    earl:test :reachabilityTest ;
    dkg:sentQuery "SELECT * WHERE { ?s ?p ?o } LIMIT 1" ;
    earl:result [
        earl:outcome earl:passed ;
        prov:generatedAtTime "2021-03-23T16:15:52"^^xsd:datetime ;
        earl:info "The endpoint is reachable and answer to a basic SPARQL SELECT query"@en
    ] .
```
This report shows that we could send a basic SPARQL query to the server at some point.
The reachability test has to be done at least once at the start of the extraction of descriptions from any SPARQL endpoint. Its definition can be used as it is in all their descriptions.

If the test fails, the result should contain a description of the response that failed our test. We indicate the values that differed from our test and the reason phrase given. For traceability, we find useful to add the header values describing the type of server of the endpoint.
```
:reachExampleEndpoint rdf:type earl:Assertion ,
        prov:Activity ;
    dcterms:title "Reachability test for the example endpoint" ;
    earl:subject <http://www.example.com/sparql> ;
    earl:test :reachabilityTest ;
    dkg:sentQuery "SELECT * WHERE { ?s ?p ?o } LIMIT 1" ;
    earl:result [
        a earl:TestResult ;
        earl:outcome [
            a earl:Fail ;
            dkg:httpResponse [
                a http:Response ;
                http:statusCodeValue 504 ;
                http:reasonPhrase "server returned timeout error" ;
                http:headers [
                    a http:ResponseHeader ;
                    http:params [
                        a http:HeaderElement ;
                        http:paramName "server" ;
                        http:paramValue "Virtuoso"
                    ]
                ]
            ]
        ] ;
        earl:info "Error 504 - server returned timeout error"
    ] .
```

Other tests have to be done for every SPARQL endpoint but need adaptations. Those adaptations can be done using pre-defined variables. As an example, the query used to look for endpoint descriptions connected to the SPARQL endpoint needs to be connected to a different URI for each endpoint. As there is no endpoint description at this point of the extraction, we are looking for it, the subject of the test is the endpoint URI. We define the pre-bound variable `$subject` as the value of the `earl:subject` property of an assertion. We define a test looking for the resources subject of the property sd:endpoint connected to the endpoint URI :
```
:connectedEndpointDescResourceExtract a dkg:TestQuery ;
    dcterms:title "Extraction of endpoint description resources" ;
    dcterms:description "Extraction of the endpoint description resource the example endpoint, if there are any. The resources are the subject of the property sd:endpoint." ;
    dcterms:requires :reachabilityTest ;
    dkg:query [
        a sp:Select ;
        sp:resultVariable ([ sp:varName "res"^^xsd:string ]) ;
        sp:where (
                [
                    sp:subject [ sp:varName "res"^^xsd:string ] ;
                    sp:predicate sd:endpoint ;
                    sp:object $subject
                    # $subject is a pre-bound variable for the subject of the report, i.e. object of the earl:subject property.
                ]
            )
    ] .
```

At the execution of this test on an endpoint, the interpeter replaces `$subject` by the endpoint URI, here `<http://www.example.com/sparql>`. In case of success, we obtain the following `earl:Assertion`:
```
:connectedEndpointDescResourceExample rdf:type earl:Assertion ,
        prov:Activity ;
    dcterms:title "Extraction of the endpoint description resource the example endpoint, if there are any." ;
    earl:subject <http://www.example.com/sparql> ;
    earl:test :connectedEndpointDescResourceExtract ;
    dkg:sentQuery """SELECT ?res WHERE {
        ?res sd:endpoint <http://www.example.com/sparql> .
    }""" ;
    earl:result [
        earl:outcome earl:passed ;
        prov:generatedAtTime "2021-03-23T16:15:52"^^xsd:datetime ;
        earl:info "The server returned an answer for this query"@en
    ] .
```

In other cases, we need to modify more the query. For example, in a dataset where we have to add `FROM` clauses to our queries, we need to insert a clause for each graph in the dataset. To be able to do that it is preferable to not use blank nodes for the representation of the query, as we have shown before.

For our example, we describe the test used to check the presence of dataset description resources:
```
:datasetDescResourceExtract a dkg:TestQuery ;
    dcterms:title "Extraction of dataset description resources" ;
    dcterms:description "Extraction of the dataset description resource the example endpoint, if there are any. The resources are instances of dcat: or void: Dataset." ;
    dcterms:requires :reachabilityTest ;
    dkg:query :datasetDescResourceExtractQuery .
```
We take care to describe the query with its own URI:
```
:datasetDescResourceExtractQuery a sp:Select ;
    sp:resultVariable ([ sp:varName "res"^^xsd:string ]) ;
    sp:where (
            [
                a sp:Union ;
                sp:elements (
                    ([
                        sp:subject [ sp:varName "res"^^xsd:string ] ;
                        sp:predicate rdf:type ;
                        sp:object dcat:Dataset
                    ])
                    ([
                        sp:subject [ sp:varName "res"^^xsd:string ] ;
                        sp:predicate rdf:type ;
                        sp:object void:Dataset
                    ])
                )
            ]
        ) .
```
For our example dataset, we need to add FROM clauses for 3 graphs, `:graph1`, `:graph2`, `:graph3`. As the test query is described by RDF triples, we describe its modification using a SPARQL UPDATE query.
We insert the clauses in the test query, as an INSERT DATA query, with the following triples:

```
:datasetDescResourceExtractExample dkg:testUpdate [
    a sp:InsertData ;
    sp:data ([
            sp:subject :datasetDescResourceExtractQuery ;
            sp:predicate sp:from ;
            sp:object :graph1
        ]
        [
            sp:subject :datasetDescResourceExtractQuery ;
            sp:predicate sp:from ;
            sp:object :graph2
        ]
        [
            sp:subject :datasetDescResourceExtractQuery ;
            sp:predicate sp:from ;
            sp:object :graph3
        ])
    ] .
```
The `earl:Assertion` is defined as follows:
```
:datasetDescResourceExtractExample rdf:type earl:Assertion ,
        prov:Activity ;
    dcterms:title "Extraction of the dataset description resource the example endpoint, if there are any." ;
    earl:subject <http://www.example.com/sparql> ;
    earl:test :datasetDescResourceExtract ;
    dkg:sentQuery """SELECT ?res
        FROM :graph1
        FROM :graph2
        FROM :graph3
        WHERE {
            { ?res a dcat:Dataset }
            UNION { ?res a void:Dataset }
        }""" ;
    earl:result [
        earl:outcome earl:passed ;
        prov:generatedAtTime "2021-03-23T16:15:52"^^xsd:datetime ;
        earl:info "The server returned an answer for this query"@en
    ] .
```
Note the value of `dkg:sentQuery` taking into account our update of the query.

During the phase when we check the retrieved values of the description against values computed from the data, we use SHACL shapes to define the tests.

*The following examples are based on SHACL advanced features.*

We define a shape to check that the number of triples is the value expected. As we have to adapt the shape for the count found in each description, we use `dkg:missingValue` to facilitate the modification of the shape.
```
:CountEqualityShape a sh:NodeShape ;
    sh:target [
    	rdf:type sh:SPARQLTarget ;
    	sh:prefixes ex: ;
    	sh:select """SELECT (count(*) AS ?this) WHERE {
                SELECT DISTINCT ?s ?p ?o WHERE {
                   ?s ?p ?o .
                }
            }"""
        ] ;
    sh:hasValue dkg:missingValue .
```

In the assertion `dkg:triplesCountExtraction`, representing the application of this shape on our example dataset, we add the following modification of the shape. The modification set the expected number of triples to 54.
```
:datasetDescResourceExtractExample
    dkg:testUpdate [
           a sp:Modify ;
           sp:deletePattern ([
                   sp:subject :CountEqualityShape ;
                   sp:predicate sh:hasValue ;
                   sp:object dkg:missingValue
               ]) ;
            sp:insertPattern ([
                    sp:subject :CountEqualityShape ;
                    sp:predicate sh:hasValue ;
                    sp:object 54
                ])
        ] .
```
After adapatation to the dataset, the shape can be applied and the validation report is added to the outcome of the test.
```
dkg:triplesCountExtraction rdf:type earl:Assertion ,
        prov:Activity ;
    earl:subject :exampleDataset ;
    dcterms:requires dkg:reachableEndpoint ;
    earl:test dkg:CountEqualityShape ;
    earl:result [
        earl:outcome [
            rdf:type earl:Pass , sh:ValidationReport ;
            sh:conforms true ;
        ] ;
        prov:generatedAtTime "2021-03-31T16:15:52"^^xsd:datetime
    ] .
```

<!---
TODO:
- Acceptation de la requête et nombre de résultats, Différence acceptation de la requête / Contrainte de résultats -> 2 types de rapports ? => Pas dans le sémantique de EARL, pour plus tard
- Transformation des templates selon la cible -> Variable pré-bound ou pseudo SPARQL UPDATE
--->

---
**EDIT:**
This document will be edited to reflect what we learned here:

1. The notion of ONE knowledge base resource does not hold in practice.
4. Look for connexions between descriptions and known endpoint or graph URIs, using `rdfs:seeAlso` for example.
5. If the feature `sd:requiresDataset` is defined on the endpoint, datasets should be defined too.
6. To identify description resources, look for resources linked to the endpoint URL.
7. If `void:uriSpace` is given, look for Datasets/Vocabularies/Graphs within the namespace.
8. Endpoint description will have to be rebuilt from scratch (including result format, etc.).
9. Endpoint URIs should be searched both with HTTP and HTTPS.
10. Retrieve the named graph of the metadata we extract: `SELECT ?g ?s ?p ?o WHERE { GRAPH ?g { ?s ?p ?o . ?s a void:Dataset  } }`
11. Search for resources typed by DCAT/SPARQL-SD/VoID classes linked to the description resource.
12. Search for equivalent resources for the description resources using owl:sameAs

For now, the method of extraction and generation is planned as follows:
1. Extract the existing descriptions.
   1. Search for resources linked to the endpoint URL by the property `sd:endpoint`. Extract their descriptions.
   2. Search for resources typed by `void:Dataset` or `dcat:Dataset` that are linked to the endpoint URL.
     * If there is none, extract the descriptions of all resources typed by `void:Dataset` or `dcat:Dataset` for later reconnection.
2. Try to reconnect the existing descriptions with the known SPARQL endpoint URL and between themselves and with the existing graphs.
   * If an endpoint description, and at least a VoID/DCAT description are connected to the endpoint URL, and the endpoint description indicate a graph connected to the VoID/DCAT description, then the descriptions are connected and nothing has to be done.
   * If only an endpoint description is connected to the endpoint URL and there is no graph described, extract the graphs present in the dataset.
      * If one of the graphs URIs is connected to a VoID/DCAT description, then add a graph description to the VoID description to connect them.
   * If there is no endpoint description connected to the endpoint URL, extract the descriptions of all resources subject of a triple with the property `sd:endpoint`.
      * If one of the existing description is connected to the URI of a VoID/DCAT description of the dataset, then the endpoint description should be considered as the potential endpoint description of the dataset.
   * If there is a knowledge base description but no endpoint description and the knowledge base description give a value to the property `void:uriSpace` and there are named graphs in this URI space, then the endpoint description should be generated and include those graphs.
3. Check the veracity of existing data.
  * If their are population statistics values, re-calculate those values using SPARQL queries.
4. Generate missing data.
---

### DBpedia <!-- [DBPedia](http://dbpedia.org/sparql) -->
We suppose that we only know the name of the base "DBpedia" and its endpoint URL.

We check the availability of the endpoint using `SELECT * WHERE { ?s ?p ?o } LIMIT 1` sent to http://dbpedia.org/sparql, which returns a result. The endpoint is reachable.

#### Extraction of the SPARQL endpoint description
First, we retrieve the list of SPARQL-SD description in the KB, if there are any, using the query:
```
@prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
SELECT DISTINCT ?endpoint WHERE {
    ?endpoint sd:endpoint ?endpointUrl.
}
```
This query returns 4 resources.

| endpoint                       |
|--------------------------------|
| `http://localhost:8890/sparql` |
| `nodeID://b10251`              |
| `nodeID://b50122`              |
| `http://dbpedia.org/sparql-sd` |

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


| g                                             |
|-----------------------------------------------|
| `b3sifp`                                      |
| `b3sonto`                                     |
| `dbprdf-label`                                |
| `facets`                                      |
| `http://DBPedia.org/sparql-sd`                |
| `http://DBpedia.org/sparql-sd`                |
| `http://dbpedia.org`                          |
| `http://dbpedia.org/resource/classes#`        |
| `http://dbpedia.org/schema/property_rules#`   |
| `http://dbpedia.org/sparql-sd`                |
| `http://dbpedia.org/void/`                    |
| `http://localhost:8890/DAV/`                  |
| `http://localhost:8890/sparql`                |
| `http://pivot_test_data/campsites`            |
| `http://pivot_test_data/ski_resorts`          |
| `http://query.wikidata.org/sparql`            |
| `http://www.openlinksw.com/schemas/oplweb#`   |
| `http://www.openlinksw.com/schemas/virtcxml#` |
| `http://www.openlinksw.com/schemas/virtpivot` |
| `http://www.openlinksw.com/schemas/virtrdf#`  |
| `http://www.openlinksw.com/virtpivot/icons`   |
| `http://www.w3.org/2002/07/owl#`              |
| `http://www.w3.org/ns/ldp#`                   |
| `https://DBpedia.org/sparql-sd`               |
| `https://dbpedia.org/sparql-sd`               |
| `https://query.wikidata.org/sparql`           |
| `urn:activitystreams-owl:map`                 |
| `urn:rules.skos`                              |
| `urn:virtuoso:val:acl:schema`                 |
| `virtpivot-icon-test`                         |
| `virtpivot-rules`                             |
| `virtrdf-label`                               |


The feature `sd:RequiresDataset`, given line 18 of [retrieved_endpoint_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_endpoint_dbpedia.ttl), indicates that the SPARQL service requires an explicit dataset declaration. Each of those named graphs should be detailed in the endpoint description. Yet, in practice, we have access to each graph's data without indicating which one we are targeting in a SPARQL query. We can assume that this feature is wrong.

#### Extraction of the void/dcat description
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

| Knowledge base resources          |
|-----------------------------------|
| `http://dbpedia.org/void/Dataset` |
| `nodeID://b10252`                 |
| `nodeID://b50123`                 |

Retrieval of data about each knowledge base resources using 2 queries:

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

The results of those queries are one resource `dbv:Dataset` and two blank nodes. We note that the relation `rdfs:seeAlso` links the dataset `dbv:Dataset`  to the graph `<http://dbpedia.org>`. The relation `rdfs:seeAlso` indicates that the object resource can give further information about the subject resource. So, we can infer that the `dbv:Dataset` resource describes the `<http://dbpedia.org>` graph.

The results are presented in the file [retrieved_dataset_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_dbpedia.ttl), line 7 to 17.

This dataset description contains several pieces of information that we must check. The object of the property `void:sparqlEndpoint` is not the endpoint URL that we used but a local address, unusable for us. We should replace the object with the URL we used to retrieve the data.

The property `void:inDataset` has as object a resource that describes elements in a `void:Dataset`. Two resources are linked to the DBpedia dataset description. Those two resources are at the center of the description of linksets, typed by `void:Linkset`, for both `rdfs:seeAlso` and `owl:sameAs` properties. Those linksets are part of the dataset description and should also be included in it.

There is a set of VoID properties describing population statistics. The values of each of those properties should be checked, and corrected, before being added to the generated metadata.

#### Generation of metadata
From the existing metadata about DBpedia, we can gather a partial endpoint description. The link between the `dbv:Dataset` description and the graph `<http://dbpedia.org>` can link the endpoint metadata and the content metadata. We could not get provenance information about `<http://dbpedia.org>`. The SPARQL-SD description of the DBPedia endpoint can be reused as it is, with the addition of the only graph description we could retrieve.

We use two new description resources to regroup our generated metadata. In our generated metadata, the resource `dkg:DBPedia` is the center of the dataset description, and the resource `dkg:DBPedia-service` is the center of the endpoint description. We add to them the retrieved metadata after a check and correction if necessary.

By studying the headers of the response to our HTTP request while sending SPARQL queries, we see that the endpoint is using a "Virtuoso/08.03.3319 (Linux) x86_64-centos_6-linux-glibc2.12  VDB" server.

##### Check and generation of population statistics
For the dataset description, as we know the name of the endpoint we have been querying, we can add a label to the knowledge base resource. Some of the population statistics properties, values can be checked using the queries given in previous sections. The generated values for triples, classes and properties are different but close to the retrieved ones, given in the following table. We add the generated values to the generated metadata.

| Property          | Retrieved value | Generated value |
|-------------------|----------------:|----------------:|
| `void:triples`    | 859 801 816     | 859 801 816     |
| `void:classes`    | 483 621         | 483 912         |
| `void:properties` | 54 155          | 54 364          |

The generated values of the other properties give values very different from the retrieved ones. The properties `void:distinctSubjects` and `void:distinctObjects` describe the number of distinct URI of blank node subject of a triple and the number of distinct URI, blank node, or literal object of a triple, respectively.
The number of distinct subjects is retrived with the following query:
```
SELECT (count(?s) AS ?c)
WHERE {
    SELECT DISTINCT ?s
    WHERE {
        ?s ?p ?o
    }
}
```
The number of distinct objects is obtained by a trivial modification of this query.
The property `void:entities` described the number of distinct URIs or blank nodes present in the base. It can be extracted with the following query:
```
SELECT (count(?u) AS ?c)
WHERE {
    SELECT DISTINCT ?u
    WHERE {
        { ?u ?p ?o }
        UNION { ?s ?p ?u }
        FILTER( isIRI(?u) || isBlank(?u) )
    }
}
```
The values retrieved from the metadata and from the endpoint for those three properties are given in the following table.

| Property                | Retrieved value | Generated value |
|-------------------------|----------------:|----------------:|
| `void:distinctObjects`  | 231 116 566     | 82 137 793      |
| `void:distinctSubjects` | 43 070 161      | 10 741 240      |
| `void:entities`         | 30 127 028      | 7 835 229       |

The difference of value between our data and the retrieved metadata can be explained either by a limitation of the endpoint capacity to give a full count or by outdated metadata. In this example, we choose to keep the retrieved metadata values over our generated ones, in the hypothesis that the provider of those values had fewer limitations during their generation.
<!--- NOTE Lequel choisir ? celui donné ou celui re-calculé --->

##### Check of the linkset statistics
In a similar fashion to the population statistics, we can check the count given in the two linksets description retrieved. The count of the sameAs relations in the dataset is retrived by the following query:
```
SELECT (count(*) AS ?c)
WHERE {
    ?s owl:sameAs ?o
}
```

| Property       | Retrieved value | Generated value |
|----------------|----------------:|----------------:|
| `owl:sameAs`   | 49 127 463      | 49 127 465      |
| `rdfs:seeAlso` | 254 347         | 254 354         |

The generated values are very close to the ones retrieved from the metadata, we can use them in our generated metadata.

The retrieved endpoint description elements cannot be checked using SPARQL queries and will be checked using other methods at a later date. As written in previous sections, we add to the endpoint description the list of all graphs we could extract. We also add the link between the endpoint description and the dataset description with the property `dcat:servesDataset`.

##### Addition of basic provenance metadata
We add some provenance information to describe our generated data. We had a few lines of provenance information describing the sources and time of generation of the generated metadata.
```
dkg:DBpedia prov:wasDerivedFrom dbp:sparql ;
    prov:wasAttributedTo "Pierre Maillot"@en ;
    prov:generatedAtTime "2021-03-22"^^xsd:date ;
    prov:actedOnBehalfOf <http://www.inria.fr> .
dkg:DBpedia-service prov:wasDerivedFrom dbp:sparql ;
    prov:wasAttributedTo "Pierre Maillot"@en ;
    prov:generatedAtTime "2021-03-22"^^xsd:date ;
    prov:actedOnBehalfOf <http://www.inria.fr> .
```

A first version of the metadata about DBPedia would be as presented in file [generated_metadata_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/generated_metadata_dbpedia.ttl). Until line 144, the file contains metadata retrieved from the endpoint and checked when possible.

##### Class population count
We extract the population count for each class in the dataset. But, because of the size of the dataset and the number of classes used in it, we can only get partial results with the query written in the previous section. To get the full list of classes and their population counts, we use the limit and offset of the query to limit the charge on the SPARQL server.
For example, at the fourth iteration, the query would be:
```
SELECT ?class (count(?instance) AS ?count) WHERE {
    SELECT DISTINCT ?class ?instance
    WHERE {
        ?instance a ?class  
    }
}
LIMIT 100
OFFSET 300
```
For our example, we limited ourselves to the classes part of the `http://dbpedia.org/ontology` namespace. We constructed directly the metadata using the following query. The results of this query are shown in [generated_metadata_dbpedia.ttl](https://github.com/Wimmics/dekalog/blob/master/generated_metadata_dbpedia.ttl) between line 157 and 1056.
```
CONSTRUCT {
    <https://dekalog.univ-nantes.fr/DBpedia> void:classPartition [
        void:class ?class ;
        void:entities ?count
    ]
} WHERE {
    SELECT DISTINCT ?class (count(?instance) AS ?count) WHERE {
        SELECT DISTINCT ?class ?instance
        WHERE {
            ?instance a ?class
            FILTER(REGEX(?class, "http://dbpedia.org/ontology") )
        }
    }
    ORDER BY ?count
}
```

#### Extraction of vocabularies
We extract the namespaces used in the dataset. Technically, the query presented in the previous sections extract the beginnings of the URIs of the classes and properties. The results need to be refined by removing results containing other shorter results.

We obtain the following list of vocabularies

| Vocabularies |
|----------------------------------------------------------|
| rdf:                                                     |
| rdfs:                                                    |
| owl:                                                     |
| foaf:                                                    |
| schema:	                                               |
| <http://dbpedia.org/class/>                              |
| <http://dbpedia.org/ontology/>                           |
| <http://dbpedia.org/property/>                           |
| <http://dbpedia.org/resource/>                           |
| <http://umbel.org/umbel/rc/>                             |
| <http://vocab.org/frbr/core#>                            |
| <http://www.wikidata.org/entity/>                        |
| <http://purl.org/ontology/bibo/>                         |
| <http://www.w3.org/2004/02/skos/core#>                   |
| <http://www.w3.org/2003/01/geo/wgs84_pos#>               |
| <http://www.ontologydesignpatterns.org/ont/d0.owl#>      |
| <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> |
| <http://www.openlinksw.com/virtrdf-data-formats#>        |
| <http://linkedopencommerce.com/schemas/icecat/v1/>       |
| <http://www.openlinksw.com/schemas/virtrdf#>             |
| <http://www.openlinksw.com/schemas/oplweb#>              |

*WIP*

### Wasabi
<!-- [Wasabi](http://wasabi.inria.fr/sparql) -->
We suppose that we only know the name "Wasabi" and its endpoint's URL `http://wasabi.inria.fr/sparql`.

The retrieval of the SPARQL-SD description resource returns only one resource named `http://localhost:8890/sparql`.
The description of the resource is given in the file [retrieved_endpoint_wasabi.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_endpoint_wasabi.ttl). This is a short description of an endpoint, but no connection to the known URL of the WASABI SPARQL endpoint is found.
From this retrieved data alone, we cannot generate a description of the WASABI base.

The retrieval of knowledge base resource connected to the endpoint URI returns 1 result `http://ns.inria.fr/wasabi/wasabi-1-0`.

The file [retrieved_dataset_wasabi.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_wasabi.ttl) gives the descriptions of each resource. Two of the resources are at the center of exhaustive descriptions of datasets. Only one of the resources is linked to the known URL of WASABI's endpoint by the property `void:sparqlEndpoint`. From this fact, we can assume that the triples between line 116 to 192, centered around the resource `<http://ns.inria.fr/wasabi/wasabi-1-0>` are the description of the WASABI dataset.

#### Generation of metadata

The VoID/DCAT description centered around `<http://ns.inria.fr/wasabi/wasabi-1-0>` contains almost all the information it should contains. It is well typed, labelled and described, although not by `rdfs:label`, and contains provenance information. It also contains a count of its triples.

##### Generation of basic SPARQL-SD description
A SPARQL-SD description of the endpoint we used is missing, as no element allows us to connect this description to the only SPARQL-SD description available.

Extracting the list of named graphs returns 74 results. Of those 74, only 4 a connected to the knowledge base resource by the property `void:vocabulary`. So, they are not graphs of data that we aim to describe in priority.
Yet, the VoID/DCAT description contains the value `"http://ns.inria.fr/wasabi/"` for the property `void:uriSpace` which gives the namespace of the resources of the WASABI base. The extraction of the graph in the WASABI namespace with a SPARQL query returns an error. We document the error by adding the following report in the description.

 ```
dkg:Wasabi-service a earl:TestSubject .
:namespaceExtraction earl:subject dkg:Wasabi-service ;
    earl:test """SELECT DISTINCT ?g WHERE {
        GRAPH ?g {
            ?s ?p ?o
        }
        FILTER(REGEX(?g, "http://ns.inria.fr/wasabi/wasabi-1-0") )
    }
    ORDER BY ?g""" ;
    earl:result [
        earl:outcome "proxy error" ;
        earl:info """Proxy Error
            The proxy server received an invalid response from an upstream server.
            The proxy server could not handle the request

            Reason: Error reading from remote server"""
    ] .
 ```
By checking amnually the urls of the graphs, we can identify 8 graphs within this namespaces, given in the following table:

| Graphs URIs within the WASABI namespace                   |
|-----------------------------------------------------------|
| `http://ns.inria.fr/wasabi/graph/albums`                  |
| `http://ns.inria.fr/wasabi/graph/artists`                 |
| `http://ns.inria.fr/wasabi/graph/metadata`                |
| `http://ns.inria.fr/wasabi/graph/songs`                   |
| `http://ns.inria.fr/wasabi/ontology/`                     |
| `http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38392c` |
| `http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38393b` |
| `http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee386ee8` |

From this, we can consider that WASABI is a datasets composed of several graphs.

##### Check of the dataset description properties
There are several properties used in the dataset description. Among those properties, there are several that we cannot check. Those properties are given in the following tables, they concern the human-readable description of the dataset, its authorship, its license, and its provenance.

| Labels                |
|-----------------------|
| `dcterms:title`       |
| `schema:name`         |
| `dcterms:description` |

| Authorship         |
|--------------------|
| `dcterms:creator`  |
| `dcelem:publisher` |
| `schema:author`    |
| `schema:publisher` |

| Licence           |
|-------------------|
| `dcterms:licence` |
| `schema:licence`  |

| Content description |
|---------------------|
| `schema:keywords`   |
| `schema:subjectOf`  |
| `dcterms:subject`   |

| Provenance                |
|---------------------------|
| `dcterms:issued`          |
| `schema:datePublished`    |
| `prov:wasGeneratedAtTime` |
| `prov:wasGeneratedBy`     |
| `owl:versionInfo`         |

The following properties describe the access to the endpoint and can be checked by sending SPARQL queries or by accessing the file URL.

| Access                |
|-----------------------|
| `void:dataDump`       |
| `void:sparqlEndpoint` |

The last properties describe the content of the dataset. As said before, the property `void:uriSpace` helped us identify the graphs relevant to the dataset. The presence of properties or classes in the namespace defined by each vocabulary by the following example.

| Vocabulary description |
|------------------------|
| `void:vocabulary`      |
| `void:uriSpace`        |

As the dataset description gives its namespace, we could identify the graphs composing the dataset. As an example, to check the presence of properties and classes from the `<http://purl.org/ontology/chord/>` ontology, we use the following query:

```
ASK {
    FROM <http://ns.inria.fr/wasabi/ontology/>
    FROM <http://ns.inria.fr/wasabi/graph/albums>
    FROM <http://ns.inria.fr/wasabi/graph/artists>
    FROM <http://ns.inria.fr/wasabi/graph/metadata>
    FROM <http://ns.inria.fr/wasabi/graph/songs>
    FROM <http://ns.inria.fr/wasabi/graph/albums>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38392c>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38393b>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee386ee8>
    {
        { ?s ?elem ?o  } UNION { ?s a ?elem }
    }
    FILTER( REGEX(?elem, "http://purl.org/ontology/chord/") )
}
```

We do not have to check the properties and classes from vocabularies that are used in the description itself. The results of the checks of the other vocabularies are given in the following table:

| Vocabulary                         | Result  |
|------------------------------------|---------|
| `http://dbpedia.org/ontology/`     | `true`  |
| `http://purl.org/ontology/af/`     | `true`  |
| `http://purl.org/ontology/chord/`  | `true`  |
| `http://purl.org/ontology/mo/`     | `true`  |
| `http://purl.org/vocab/frbr/core#` | `false` |
| `http://www.wikidata.org/entity/`  | `false` |

The results show that the dataset does not contain classes or properties from the vocabularies `http://purl.org/vocab/frbr/core#` and `http://www.wikidata.org/entity/`. We can remove those two values from the property `void:vocabulary`.

##### Check of the population count
We can extract the number of triples of the dataset by restricting the query to the dataset named graphs, in the following query:

```
SELECT (count(*) AS ?c)
    FROM <http://ns.inria.fr/wasabi/ontology/>
    FROM <http://ns.inria.fr/wasabi/graph/albums>
    FROM <http://ns.inria.fr/wasabi/graph/artists>
    FROM <http://ns.inria.fr/wasabi/graph/metadata>
    FROM <http://ns.inria.fr/wasabi/graph/songs>
    FROM <http://ns.inria.fr/wasabi/graph/albums>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38392c>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38393b>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee386ee8>
WHERE {
    ?s ?p ?o
}
```
As a result, we get 55 544 763 triples in the graphs combined, which is close to the 55 542 555 triples in the retrieved data with `void:triples`.

##### Generation of basic provenance metadata
As for DBpedia, we add provenance information about the generation of this metadata. The file [generated_metadata_wasabi.ttl](https://github.com/Wimmics/dekalog/blob/master/generated_metadata_wasabi.ttl) contains the generated descriptions until the line 133.

In the next paragraphs, we move on to the generation of new metadata.

##### Generation of class population counts
We extract the population count of each class using the following query:
```
SELECT DISTINCT ?class (count(?instance) AS ?count)
WHERE {
    SELECT DISTINCT ?class ?instance
        FROM <http://ns.inria.fr/wasabi/ontology/>
        FROM <http://ns.inria.fr/wasabi/graph/albums>
        FROM <http://ns.inria.fr/wasabi/graph/artists>
        FROM <http://ns.inria.fr/wasabi/graph/metadata>
        FROM <http://ns.inria.fr/wasabi/graph/songs>
        FROM <http://ns.inria.fr/wasabi/graph/albums>
        FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38392c>
        FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38393b>
        FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee386ee8>
    WHERE {
        ?instance a ?class
    }
}
```
The resulting metadata is shown in [generated_metadata_wasabi](https://github.com/Wimmics/dekalog/blob/master/generated_metadata_wasabi.ttl) between line 141 and 231. We give here an excerpt of the data for the classes defined in the WASABI namespace:

| Class               | Count   |
|---------------------|--------:|
| `wsb:Song`          | 2099287 |
| `wsb:Album`         | 208743  |
| `wsb:Artist_Group`  | 29806   |
| `wsb:Artist_Person` | 24264   |
| `wsb:Classic_Song`  | 10864   |
| `wsb:Choir`         | 44      |
| `wsb:Orchestra`     | 30      |

##### Extraction of linkset descriptions
We extracted the descriptions of the linksets for owl:sameAs and rdfs:seeAlso. We found 204775 sameAs relations, there was no triple containing `rdfs:seeAlso`.
```
SELECT (count(*) AS ?c)
    FROM <http://ns.inria.fr/wasabi/ontology/>
    FROM <http://ns.inria.fr/wasabi/graph/albums>
    FROM <http://ns.inria.fr/wasabi/graph/artists>
    FROM <http://ns.inria.fr/wasabi/graph/metadata>
    FROM <http://ns.inria.fr/wasabi/graph/songs>
    FROM <http://ns.inria.fr/wasabi/graph/albums>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38392c>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee38393b>
    FROM <http://ns.inria.fr/wasabi/song/5714dec325ac0d8aee386ee8>
WHERE {
    ?s owl:sameAs ?o
}
```
From those results, we generated the following triples, shown in [generated_metadata_wasabi.ttl](https://github.com/Wimmics/dekalog/blob/master/generated_metadata_wasabi.ttl) between line 135 and 139.

*WIP*

### British National Bibliography
<!-- [British National Bibliography](http://bnb.data.bl.uk/sparql) -->
We suppose that we know the name "British National Library" and the endpoint URL `http://bnb.data.bl.uk/sparql`.

The extraction of endpoint description returns no results. The extraction of the dataset descriptions returns 4 results connected to the endpoint URL. The results are shown in the file [retrieved_dataset_bnb.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_bnb.ttl) from line 20 to 189.
OF the 4 results, 3 are subsets of the dataset `bnbdata:BNB`.

The retrieved dataset descriptions are rather complete. The human-readable descriptions, provenance information and vocabularies are described for the main dataset and its subsets. The population counts are partly missing.

#### Generation of metadata
Now, we ceck the content of the retrieved metadata and we generate a basic endpoint description and we extend the dataset description.

##### Generation of endpoint description
We extract the graphs of the dataset to generate a basic endpoint description. We notice that the names of the graphs are the same as the dataset description resources. We decide to not rename the description resources as we did for the precedent datasets, to keep this connection between graphs and descriptions.

By studying the headers of the response to our HTTP request while sending SPARQL queries, we see that the endpoint is using a "Virtuoso/07.20.3217 (Linux) x86_64-unknown-linux-gnu" server.

##### Checks of the vocabularies
We test the 11 vocabularies that are listed in the descrption without being used in it. The query to check the presence of properties or classes from each vocabulary returns an error. From this, we generate 11 error reports at the end of the file [retrieved_dataset_bnb.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_bnb.ttl).

##### Checks of the triple count and generation of population counts
We received an error while trying to obtain a count of the triples and the count of the classes. However, we count obtain results at a later attempt.
The original description described 205 479 749 triples in the dataset, we obtained 205 482 468 with our queries, which is close.

We also received errors while trying to obtain the population counts of each class, added to the previous ones at the end of the file.

##### Generation of linksets descriptions
We extract the linksts descriptions for the `owl:sameAs` and `rdfs:seeAlso` properties. There are only links using `owl:sameAs` with 13 091 837 links.

##### Addition of basic provenance metadata
We add basic provenance informations to our generated description. As we did not generate the resources used to describe each of the 4 datasets, we use the property `prov:wasQuotedFrom` to link them to the endpoint. This relation indicates that the resource was used to generate new data around it but was not created by the author of the metadata. The provenance information are shown in file [retrieved_dataset_bnb.ttl](https://github.com/Wimmics/dekalog/blob/master/retrieved_dataset_bnb.ttl) from line 216 to 236.

<!--- TODO Extraction des namespaces --->
