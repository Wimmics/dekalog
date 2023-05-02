import * as DataCache from './DataCaching';
import * as Logger from './LogUtils';
import * as EChartsChache from './EChartsDataCaching';

Promise.allSettled([
    // DataCache.whiteListFill(),
    // DataCache.endpointMapfill(),

    DataCache.tripleDataFill().then(() =>
        EChartsChache.triplesEchartsOption()
    ),
    DataCache.classDataFill().then(() =>
        EChartsChache.classesEchartsOption()
    ),
    DataCache.propertyDataFill().then(() =>
        EChartsChache.propertiesEchartsOption()
    ),
    DataCache.shortUrisDataFill().then(() =>
        EChartsChache.shortUrisEchartsOption()
    ),
    DataCache.rdfDataStructureDataFill().then(() =>
        EChartsChache.rdfDataStructuresEchartsOption()
    ),
    DataCache.readableLabelsDataFill().then(() =>
        EChartsChache.readableLabelsEchartsOption()
    ),
    DataCache.blankNodeDataFill().then(() =>
        EChartsChache.blankNodesEchartsOption()
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
    // DataCache.SPARQLCoverageFill().then(() =>
    //     EChartsChache.sparqlCoverageEchartsOption()
    // ),
])
    .catch(error => {
        Logger.error(error)
    });