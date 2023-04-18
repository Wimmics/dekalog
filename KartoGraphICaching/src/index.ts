import * as DataCache from './DataCaching';
import * as Logger from './LogUtils';
import * as EChartsChache from './EChartsDataCaching';

Promise.allSettled([
    // DataCache.whiteListFill(),
    // DataCache.endpointMapfill(),
    // DataCache.SPARQLCoverageFill().then(() =>
    //     EChartsChache.sparqlCoverageEchartsOption()
    // ),
    // DataCache.vocabFill().then(() =>
    //     EChartsChache.vocabGraphEchartsOption()
    // ),
    // DataCache.tripleDataFill().then(() =>
    //     EChartsChache.triplesEchartsOption()
    // ),
    // DataCache.classDataFill(),
    // DataCache.propertyDataFill(),
    // DataCache.categoryTestCountFill(), // Pas OK
    // DataCache.totalCategoryTestCountFill(), // Pas OK
    DataCache.endpointTestsDataFill(),
    // DataCache.totalRuntimeDataFill(),
    // DataCache.averageRuntimeDataFill(),
    // DataCache.classAndPropertiesDataFill(),
    // DataCache.datasetDescriptionDataFill(),
    // DataCache.shortUrisDataFill(),
    // DataCache.rdfDataStructureDataFill(),
    // DataCache.readableLabelsDataFill(),
    // DataCache.blankNodeDataFill()
])
    .catch(error => {
        Logger.error(error)
    });