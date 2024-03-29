package fr.inria.kgindex.main.rules;

import java.util.Comparator;
import java.util.TreeSet;

public class Actions extends TreeSet<Action> {

    public Actions() {
        super(new Comparator<Action>() {
            @Override
            public int compare(Action o1, Action o2) {
                return o1.getPriority() - o2.getPriority();
            }
        });
    }
}
