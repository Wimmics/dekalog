package fr.inria.kgindex.step;

import java.util.ArrayList;
import java.util.List;

public class Actions {

    private List<String> _actions = new ArrayList<>();
    private String _endpointUrl = "";

    public Actions(List<String> actionQueries, String endpointUrl) {
        this._actions = actionQueries;
        this._endpointUrl = endpointUrl;
    }

    public String getEndpointUrl() {
        return this._endpointUrl;
    }

    public void setEndpointUrl(String url) {
        this._endpointUrl = url;
    }

    public List<String> getActions() {
        return this._actions;
    }
}
