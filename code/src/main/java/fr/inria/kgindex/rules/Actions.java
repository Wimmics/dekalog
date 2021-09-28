package fr.inria.kgindex.rules;

import java.util.Comparator;
import java.util.TreeSet;

public class Actions extends TreeSet<Action> {

    public Actions() {
        super(new Comparator<Action>() {
            @Override
            public int compare(Action o1, Action o2) {
                return o2.getPriority() - o1.getPriority();
            }
        });
    }
}
