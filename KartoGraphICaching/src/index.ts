import * as DataCache from './DataCaching';
import * as Logger from './LogUtils';
import * as EChartsChache from './EChartsDataCaching';

Promise.allSettled([
    // DataCache.whiteListFill(),
    // DataCache.endpointMapfill(),
    DataCache.SPARQLCoverageFill().then(() => 
        EChartsChache.sparqlCoverageEchartsOption()
        ),
    // DataCache.vocabFill(),
    // DataCache.tripleDataFill(),
    // DataCache.classDataFill(),
    // DataCache.propertyDataFill(),
    // DataCache.categoryTestCountFill(),
    // DataCache.totalCategoryTestCountFill(),
    // DataCache.endpointTestsDataFill(),
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