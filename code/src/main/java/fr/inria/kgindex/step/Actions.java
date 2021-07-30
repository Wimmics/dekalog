package fr.inria.kgindex.step;

import java.util.ArrayList;
import java.util.List;

public class Actions {

    private List<String> _actions = new ArrayList<>();

    public Actions(List<String> actionQueries) {
        this._actions = actionQueries;
    }

    public List<String> getActions() {
        return this._actions;
    }
}
