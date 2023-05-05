import * as echarts from "echarts";

export type KartoChartConfig = {
    chartObject?: echarts.ChartView | L.Map,
    option?: any,
    fillFunction: () => Promise<void>,
    redrawFunction?: () => void ,
    clearFunction?: () => void ,
    hideFunction?: () => void ,
    showFunction?: () => void ,
    divId?: string,
    filled?: boolean
}

export class KartoChart {
    chartObject?: echarts.ChartView | L.Map;
    option: any;
    filled?: boolean;


    constructor(config: KartoChartConfig) {
        this.chartObject = config.chartObject;
        this.option = config.option;
        this.fill = () => {return Promise.resolve();}
        if(config.fillFunction !== undefined) {
            this.fill = config.fillFunction;
        }
        this.redraw = () => {};
        if(config.redrawFunction !== undefined) {
            this.redraw = config.redrawFunction;
        }
        this.clear = () => {};
        if(config.clearFunction !== undefined) {
            this.clear = config.clearFunction;
        }
        this.hide = () => {};
        if(config.hideFunction !== undefined) {
            this.hide = config.hideFunction;
        }
        this.show = () => {};
        if(config.showFunction !== undefined) {
            this.show = config.showFunction;
        }
        if(config.filled !== undefined) {
            this.filled = config.filled;
        }
    }

    fill: () => Promise<void>;

    redraw: () => void;

    clear: () => void;

    hide: () => void;

    show: () => void;
};