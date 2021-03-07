## [LOUPE](http://loupe.linkeddata.es/loupe/methods.html)

### A list of classes
This query extracts all used classes from the instances present in the dataset with a type declaration. LIMIT and OFFSET are used because most of the SPARQL endpoint put an upperbound to the results.

```
select  distinct ?class where
{
?s a ?class .
}
LIMIT ?limit
OFFSET ?offset
```
### Count of individuals
Extracts the count of the individuals of a given class. The ?class parameter is dynamically bound to each of class in extracted class list.

```
select (count (distinct ?s) as ?count) where
{
   ?s a ?class .
}
```

### Properties of individuals of a given class
This query extracts all the properties associated with any of the individuals of a given class. The ?class parameter is dynamically bound to each of class in extracted class list.

```
select ?property (count (distinct ?s) as ?count) where
{
   ?s a ?class;
      ?property ?o .
} group by ?property
order by desc(?count)
```

### Classes with common individuals
This query extracts looks at individuals of a given class and extracts other classes those individuals belong to. The ?class parameter is dynamically bound to each of class in the extracted class list.

```
select ?anotherClass (count (distinct ?s) as ?count) where
{
   ?s a ?class;
      a ?anotherClass .
   FILTER (?anotherClass != ?class)
} group by ?anotherClass
order by desc(?count)
```

### Classes with common individuals
This query extracts looks at individuals of a given class and extracts other classes those individuals belong to. The ?class parameter is dynamically bound to each of class in the extracted class list.

```
select ?anotherClass (count (distinct ?s) as ?count) where
{
   ?s a ?class;
      a ?anotherClass .
   FILTER (?anotherClass != ?class)
} group by ?anotherClass
order by desc(?count)
```

### A list of properties
This query extracts all used properties in the triples of the dataset. LIMIT and OFFSET are used because most of the SPARQL endpoint put an upperbound to the results.

```
select distinct ?p where
{
   ?s ?p ?o .
}
LIMIT ?limit
OFFSET ?offset
```

### Count of triples with a property
Extracts the count of triples that contain a given property. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?o
}
```

### Count of URI subjects
This query extracts the number of URI subjects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?o
 FILTER (isUri(?s))
}
```

### Count of blank node subjects
This query extracts the number of blank node subjects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?class
 FILTER (isBlank(?s))
}
```

### Type of subjects
This query looks at the subjects of all the triples that have the given property as the predicate and extracts their type if there is a type definition available. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (?s) as ?c) ?class where {
 ?s ?property ?o ;
    a ?class .
} group by ?class
order by desc(?c)
```

### Count of URI objects
This query extracts the number of URI objects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?o
 FILTER (isUri(?o))
}
```

### Count of blank node objects
This query extracts the number of blank node objects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?o
 FILTER (isBlank(?o))
}
```

### Count of literal objects
This query extracts the number of literal objects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?o
 FILTER (isLiteral(?o))
}
```

### Count of numeric objects
This query extracts the number of numeric objects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
select (count (*) as ?c) where {
 ?s ?property ?o
 FILTER (isNumeric(?o))
}
```

### Count of integers
This query extracts the number of integer objects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
PREFIX  xsd:  <http://www.w3.org/2001/XMLSchema#>

select (count (?o) as ?c) where {
 ?s ?property ?o
 filter ( datatype(?o) = xsd:integer )
}
```

### Count of doubles
This query extracts the number of objects of double data type of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
PREFIX  xsd:  <http://www.w3.org/2001/XMLSchema#>

select ?o where {
 ?s ?property ?o
 filter ( datatype(?o) = xsd:double )
}
```

### Count of datatime objects
This query extracts the number of datatime objects of a given property in a dataset. The ?property parameter is dynamically bound to each of properties in the extracted property list.

```
PREFIX  xsd:  <http://www.w3.org/2001/XMLSchema#>

select (count (?o) as ?c) where {
 ?s ?property ?o
 FILTER ( (datatype(?o)) = xsd:dateTime )
}
```

## [SPARQLES](https://sparqles.ai.wu.ac.at/endpoint?uri=http%3A%2F%2Fdbpedia.org%2Fsparql)

