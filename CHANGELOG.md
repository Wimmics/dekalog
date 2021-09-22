# DeKaloG changelog

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
