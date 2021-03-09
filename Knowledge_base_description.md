# Knowledge base description

<!--- NOTE: Le document est rédigé en Markdown pour rapidité d'écriture, trivialité de la conversion vers LateX et compatibilité avec Github --->

The goal of this document is to present the desired features in a dataset description. To do this, we will present the different vocabularies to use to describe each feature and we give examples.

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
The description of the SPARQL endpoint should be linked to the central resource with the property `sd:endpoint`.

A central resource for the descrition of a KB should be retrievable by the query:
```
SELECT ?central WHERE {
  {
    ?central a void:dataset .
  }
  UNION {
    ?central a dcat:Dataset .
  }
}
```
The endpoint descrition should be retrievable by the query:
```
SELECT ?endpoint WHERE {
  ?central sd:endpoint ?endpoint.
}
```

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
  schema:keywords :metadata, :example, "vocabulary", "SPARQL" ;
:metadata a skos:Concept ;
  rdfs:label "Metadata" .
:example a skos:Concept ;
  rdfs:label "Example" .
```

The properties given here are not an exhaustive list of possible labelling properties. There are other properties defined in domain-specific vocabularies.

##### Provenance
<!--- Author, publisher, licence, date of publication, last date of modification  --->
The provenance of the data of a KB must be given to ensure its reusability. The vocabulary used to describe provenance is most often Dublin Core. The [PROV ontology](http://www.w3.org/TR/prov-o/) gives properties an classes to create detailed descriptions of the provenance. There are mapping between the elements of the Dublin Core and PROV ontology.

As presented in the PROV ontology recommandation, the provenance can be reduced to the answers to three questions: Who ? What ? How ?
THe following tables present a non-exhaustive list of the properties to be used to describe a KB. Those that should be used for a minimal description are shown in italics.

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

##### SPARQL endpoint
The description of the endpoint has to contain the elements related to the accessibility of the endpoint.

##### Namespaces
`void:uriSpace`

##### Links to other resources

##### Population count

##### Data dump

##### Ontology descriptions

### Examples of descriptions

#### DBPedia
