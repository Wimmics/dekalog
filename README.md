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
To cover as many features of a KB as possible, a KB description should describe the content of the KB using both VoID and DCAT elements. This description should be linked to a SPARQL-SD description of its endpoint.

##### Labels and description

label, description, title, themes, keywords

##### Provenance

Author, publisher, licence, date of publication, last date of modification

##### Namespaces

##### SPARQL service description

##### Links to other KBs

##### Population count

##### Data dump

##### Ontology descriptions
