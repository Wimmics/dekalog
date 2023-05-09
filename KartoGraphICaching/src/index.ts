import * as DataCache from './DataCaching';
import * as Logger from './LogUtils';
import * as EChartsCache from './EChartsDataCaching';

DataCache.runsetList.then(runsetObjectList => {
    return DataCache.retrieveKnownVocabularies().then(() => {
        return DataCache.allVocabFill().then(() => {
            return Promise.allSettled(
                runsetObjectList.map((runsetObject) => {
                    return Promise.allSettled([
                        DataCache.endpointMapfill(runsetObject),

                        DataCache.tripleDataFill(runsetObject).then(() =>
                            EChartsCache.triplesEchartsOption(runsetObject.id)
                        ),
                        DataCache.classDataFill(runsetObject).then(() =>
                            EChartsCache.classesEchartsOption(runsetObject.id)
                        ),
                        DataCache.propertyDataFill(runsetObject).then(() =>
                            EChartsCache.propertiesEchartsOption(runsetObject.id)
                        ),
                        DataCache.shortUrisDataFill(runsetObject).then(() =>
                            EChartsCache.shortUrisEchartsOption(runsetObject.id)
                        ),
                        DataCache.rdfDataStructureDataFill(runsetObject).then(() =>
                            EChartsCache.rdfDataStructuresEchartsOption(runsetObject.id)
                        ),
                        DataCache.readableLabelsDataFill(runsetObject).then(() =>
                            EChartsCache.readableLabelsEchartsOption(runsetObject.id)
                        ),
                        DataCache.blankNodeDataFill(runsetObject).then(() =>
                            EChartsCache.blankNodesEchartsOption(runsetObject.id)
                        ),
                        DataCache.SPARQLCoverageFill(runsetObject).then(() =>
                            EChartsCache.sparqlCoverageEchartsOption(runsetObject.id)
                        ),
                        DataCache.vocabFill(runsetObject).then(() =>
                            Promise.allSettled([
                                EChartsCache.endpointVocabsGraphEchartsOption(runsetObject.id),
                                EChartsCache.endpointKeywordsGraphEchartsOption(runsetObject.id),
                                EChartsCache.endpointStandardVocabulariesGraphEchartsOption(runsetObject.id)
                            ])
                        ),
                        DataCache.datasetDescriptionDataFill(runsetObject).then(() =>
                            EChartsCache.datasetDescriptionEchartsOption(runsetObject.id)
                        ),

                        // DataCache.classAndPropertiesDataFill(runsetObject), // Pas de charts et très long

                        // DataCache.totalRuntimeDataFill(runsetObject), // A supprimer du site
                        // DataCache.averageRuntimeDataFill(), // A supprimer du site

                        // DataCache.categoryTestCountFill(), // A supprimer du site // Pas OK
                        // DataCache.totalCategoryTestCountFill(), // A supprimer du site // Pas OK
                        // DataCache.endpointTestsDataFill(), // A supprimer du site
                    ])
                })
            )
        })
    })
})
    .catch(error => {
        Logger.error(error)
    });