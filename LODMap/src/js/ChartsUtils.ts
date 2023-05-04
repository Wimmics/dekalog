import { EChartOption } from "echarts";

export function getForceGraphOption(title, legendData, dataNodes, dataLinks): EChartOption {
    let categories: EChartOption.SeriesGraph.CategoryObject[] = [];
    legendData.forEach((item, i) => {
        categories.push({ name: item });
    });
    return {
        title: {
            text: title,
            top: 'top',
            left: 'center'
        },
        tooltip: {
            show: true,
            confine: true,
        },
        legend: {
                data: legendData,
                top: 'bottom',
            } ,
        series: [
            {
                type: 'graph',
                layout: 'force',
                data: dataNodes,
                links: dataLinks,
                categories: categories,
                roam: true,
                draggable: true,
                label: {
                    show: false
                },
                force: {
                    repulsion: 50
                }
            }
        ]
    };
}

export function getCircularGraphOption(title, legendData, dataNodes, dataLinks): EChartOption {
    let categories: EChartOption.SeriesGraph.CategoryObject[] = [];
    legendData.forEach((item, i) => {
        categories.push({ name: item });
    });
    return {
        title: {
            text: title,
            top: 'top',
            left: 'center'
        },
        tooltip: {
            show: true,
            confine: true,
        },
        legend: {
                data: legendData,
                top: 'bottom',
            } ,
        series: [
            {
                type: 'graph',
                layout: 'circular',
                circular: {
                    rotateLabel: true
                },
                data: dataNodes,
                links: dataLinks,
                categories: categories,
                roam: true,
                draggable: true,
                label: {
                    position: 'right',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.3
                }
            }
        ]
    };
}

export function getCategoryScatterOption(title, categories, series): EChartOption {
    return {
        title: {
            left: 'center',
            text: title,
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                show: true,
                interval: 0,
                rotate: 27
            }
        },
        yAxis: {
        },
        series: series,
        tooltip: {
            show: true
        }
    };
}

export function getTimeScatterOption(title, series): EChartOption {
    return {
        title: {
            left: 'center',
            text: title,
        },
        xAxis: {
            type: 'time',
            axisLabel: {
                show: true,
                interval: 0,
                rotate: 27
            }
        },
        yAxis: {
        },
        series: series,
        tooltip: {
            show: true
        }
    };
}

export function getScatterDataSeriesFromMap(dataMap: Map<string, string[]>): EChartOption.SeriesScatter[] {
    let series: EChartOption.SeriesScatter[] = [];
    dataMap.forEach((value, key, map) => {
        let chartSerie: EChartOption.SeriesScatter = {
            name: key,
            label: { show: true },
            symbolSize: 5,
            data: [...new Set(value)].sort((a, b) => a[0].localeCompare(b[0])),
            type: 'line'
        };

        series.push(chartSerie);
    });
    return series;
}