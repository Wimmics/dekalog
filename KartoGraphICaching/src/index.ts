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

                // DataCache.categoryTestCountFill(), // Pas OK
                // DataCache.totalCategoryTestCountFill(), // Pas OK
                // DataCache.endpointTestsDataFill(),
                // DataCache.totalRuntimeDataFill(),
                // DataCache.averageRuntimeDataFill(),
                // DataCache.classAndPropertiesDataFill(),
                // DataCache.datasetDescriptionDataFill(),
                // DataCache.vocabFill().then(() =>
                //     EChartsChache.vocabGraphEchartsOption()
                // ),
                DataCache.SPARQLCoverageFill(runsetObject).then(() =>
                    EChartsChache.sparqlCoverageEchartsOption(runsetObject.id)
                )
            ])
                .catch(error => {
                    Logger.error(error)
                })
        })
    )
);