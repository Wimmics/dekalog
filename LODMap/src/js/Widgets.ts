import * as echarts from "echarts";

export type KartoChartConfig = {
    chartObject: echarts.ChartView,
    option: any,
    fillFunction: () => void ,
    redrawFunction: () => void ,
    clearFunction: () => void ,
    hideFunction: () => void ,
    showFunction: () => void ,
    divId: string,
    filled: boolean
}

export class KartoChart {
    chartObject: echarts.ChartView;
    option: any;

    constructor(config: KartoChartConfig) {
        this.chartObject = config.chartObject;
        this.option = config.option;
        this.fill = config.fillFunction;
        this.redraw = config.redrawFunction;
        this.clear = config.clearFunction;
        this.hide = config.hideFunction;
        this.show = config.showFunction;
    }

    fill() {
    }

    redraw() {
    }

    clear() {
    }

    hide() {
    }

    show() {
    }
};