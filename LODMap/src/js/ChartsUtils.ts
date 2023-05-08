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
