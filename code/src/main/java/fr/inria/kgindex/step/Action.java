package fr.inria.kgindex.step;

public class Action {

    public enum TYPE {
        SPARQL,
        Manifest,
        UNKNOWN
    }

    private String _endpointUrl = "";
    private String _query = "";
    private TYPE _type = TYPE.UNKNOWN;

    public Action(String query, String url, TYPE type) {
        this._endpointUrl = url;
        this._query = query;
        this._type = type;
    }

    public String getEndpointUrl() {
        return this._endpointUrl;
    }

    public void setEndpointUrl(String url) {
        this._endpointUrl = url;
    }

    public String getQuery() {
        return _query;
    }

    public TYPE getType() {
        return _type;
    }

    public void setType(TYPE _type) {
        this._type = _type;
    }
}
