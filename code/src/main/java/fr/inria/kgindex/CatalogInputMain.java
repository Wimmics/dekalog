package fr.inria.kgindex;

import fr.inria.kgindex.util.Utils;
import org.apache.commons.cli.*;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class CatalogInputMain {

    private static final Logger logger = LogManager.getLogger(CatalogInputMain.class);

    public static void main(String[] args) {
        Options options = new Options();
        options.addOption(Option.builder("help")
                .required(false)
                .desc("Print this message.")
                .build());
        OptionGroup inputGroup = new OptionGroup();
        inputGroup.addOption(Option.builder("catalogFile")
                .required(false)
                .desc("File containing a DCAT catalog of knowledge bases.")
                .hasArg()
                .build());
        inputGroup.addOption(Option.builder("catalogEndpoint")
                .required(false)
                .desc("Endpoint giving access to a DCAT catalog of knowledge bases.")
                .hasArg()
                .build());
        inputGroup.setRequired(true);
        options.addOptionGroup(inputGroup);
        options.addOption(Option.builder("output")
                .required(false)
                .hasArg()
                .desc("Output filename. Default is 'output.rdf'.")
                .build());
        CommandLineParser parser = new DefaultParser();
        try {
            CommandLine cmd = parser.parse( options, args);
            if(cmd.hasOption("help")) {
                HelpFormatter formatter = new HelpFormatter();
                formatter.printHelp( "kgindex", options );
            }

            String outputFilename = "output.ttl";
            if(cmd.hasOption("output")) {
                outputFilename = cmd.getOptionValue("output", "output.ttl");
            }

            RDFConnection catalogConnexion = null;
            if(cmd.hasOption("catalogFile")) {
                // Créer connexion locale
            }
            if(cmd.hasOption("catalogEndpoint")) {
                // Créer connexion distante
            }
            // Envoyer les requêtes d'extraction des descriptions de dataset
            // Faire l'extraction de description selon nos regles

        } catch (ParseException e1) {
            HelpFormatter formatter = new HelpFormatter();
            formatter.printHelp( "kgindex", options );
        }
    }
}
