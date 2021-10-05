package fr.inria.kgindex.main.rules;

import fr.inria.kgindex.main.util.Utils;

import java.net.http.HttpClient;
import java.time.Duration;

public class RulesUtils {

    private static HttpClient __client = null;

    public static HttpClient getHttpClient() {
        if(__client == null) {
            __client = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .connectTimeout(Duration.ofMillis(Utils.queryTimeout))
                    .build();
        }
        return __client;
    }
}
