import * as DataCache from './DataCaching';
import * as Logger from './LogUtils';
import * as EChartsChache from './EChartsDataCaching';

DataCache.runsetList.then(runsetObjectList =>
    Promise.allSettled(
        runsetObjectList.map((runsetObject) => {
            return Promise.allSettled([
                DataCache.endpointMapfill(runsetObject),

                DataCache.tripleDataFill(runsetObject).then(() =>
                    EChartsChache.triplesEchartsOption(runsetObject.id)
                ),
                DataCache.classDataFill(runsetObject).then(() =>
                    EChartsChache.classesEchartsOption(runsetObject.id)
                ),
                DataCache.propertyDataFill(runsetObject).then(() =>
                    EChartsChache.propertiesEchartsOption(runsetObject.id)
                ),
                DataCache.shortUrisDataFill(runsetObject).then(() =>
                    EChartsChache.shortUrisEchartsOption(runsetObject.id)
                ),
                DataCache.rdfDataStructureDataFill(runsetObject).then(() =>
                    EChartsChache.rdfDataStructuresEchartsOption(runsetObject.id)
                ),
                DataCache.readableLabelsDataFill(runsetObject).then(() =>
                    EChartsChache.readableLabelsEchartsOption(runsetObject.id)
                ),
                DataCache.blankNodeDataFill(runsetObject).then(() =>
                    EChartsChache.blankNodesEchartsOption(runsetObject.id)
                ),
                DataCache.SPARQLCoverageFill(runsetObject).then(() =>
                    EChartsChache.sparqlCoverageEchartsOption(runsetObject.id)
                ),
                DataCache.vocabFill(runsetObject).then(() =>
                    EChartsChache.vocabGraphEchartsOption(runsetObject.id)
                ),
                DataCache.datasetDescriptionDataFill(runsetObject).then(() =>
                    EChartsChache.datasetDescriptionEchartsOption(runsetObject.id)
                ),

                // DataCache.classAndPropertiesDataFill(runsetObject), // Pas de charts et très long

                // DataCache.totalRuntimeDataFill(runsetObject), // A supprimer du site
                // DataCache.averageRuntimeDataFill(), // A supprimer du site

                // DataCache.categoryTestCountFill(), // Pas OK
                // DataCache.totalCategoryTestCountFill(), // Pas OK
                // DataCache.endpointTestsDataFill(),
            ])
                .catch(error => {
                    Logger.error(error)
                })
        })
    )
);