package fr.inria.kgindex.step;

import java.util.ArrayList;
import java.util.List;

public class Actions {

    private List<Action> _actions = new ArrayList<>();

    public Actions(List<Action> actionQueries) {
        this._actions = actionQueries;
    }

    public List<Action> getActions() {
        return this._actions;
    }
}
