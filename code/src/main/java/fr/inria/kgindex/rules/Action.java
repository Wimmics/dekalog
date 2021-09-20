package fr.inria.kgindex.rules;

import org.apache.jena.rdf.model.RDFNode;

public class Action {

    public enum TYPE {
        SPARQL,
        Manifest,
        UNKNOWN
    }

    private String _endpointUrl = "";
    private RDFNode _actionNode = null;
    private TYPE _type = TYPE.UNKNOWN;
    private int _priority = 0;

    public Action(RDFNode actionNode, String url, TYPE type) {
        this._endpointUrl = url;
        this._actionNode = actionNode;
        this._type = type;
    }

    public String getEndpointUrl() {
        return this._endpointUrl;
    }

    public void setEndpointUrl(String url) {
        this._endpointUrl = url;
    }

    public RDFNode getActionNode() {
        return _actionNode;
    }

    public TYPE getType() {
        return _type;
    }

    public void setType(TYPE _type) {
        this._type = _type;
    }

    public int getPriority() {
        return _priority;
    }

    public void setPriority(int priority) {
        this._priority = priority;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(this.getType());
        builder.append(" ");
        builder.append(this.getEndpointUrl());
        builder.append(" ");
        builder.append(this.getActionNode().toString());
        return builder.toString();
    }
}
