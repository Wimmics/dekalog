# DeKaloG changelog

## [2.5] 2022-01-06
* Possibility to define a timeout for tests and actions
* Redone handling of the input catalog
* Security fix for LOG4J
* Multiple bug and rule fixes

## [2.4] 2021-10-21
* Generation of a proper DCAT catalog
* Addition of numerous example queries to the root of the catalog
* Multiple bug and rule fixes

## [2.3.1] 2021-10-11
* More bugfixes
* re-factoring for the index generation

## [2.3] 2021-10-05
* Multiple bugfixes
* SPARQLES tests to determine the SPARQL coverage of an endpoint have been implemented
* A new main class implement the reading of a file or an endpoint containing a DCAT catalog of data to extract the description of each of them
* Rules can use external sources, such as LOV, for their tests and actions

## [2.2] 2021-09-14
* Rules can now trigger action in case of success or failure of their test. It is also possible to trigger other rules in this manner.
* Rules that use a federation server need to use a specific resource as an endpoint (kgi:federation) which will be replaced by the URL given to the generation executable
* Reorganisation of the files
* Start of the definition of rules to determine the coverage of the SPARQL features of an endpoint.

## [2.1] 2021-08-31
* Usage of a secundary endpoint in rule possible. Conceived to interface with a local federation server (namely, a Corese server).
* Merging of the application and rules projects, reorganisation of the files.

## [2.0] 2021-07-28
* Implementation of pseudo-SHACL-based rules.

## [1.0] 2021-05-27
* First release. Basic functionalities (retrieval of SPARQL-based rules and their application).
