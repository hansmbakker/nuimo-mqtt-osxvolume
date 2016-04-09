import jsonfile = require("jsonfile");
import fs = require("fs");

// configuration file
jsonfile.spaces = 4;
let configurationFile = "./configuration.json";

if (!fs.existsSync(configurationFile)) {
    setupInitialConfig();
}

export function setupInitialConfig(): void {
    let emptyConfig = {
        mqtt: {
            host: "ws://broker.mqttdashboard.com:8000"
        }
    };
    jsonfile.writeFileSync(configurationFile, emptyConfig);
};

export function getConfig(): OsxVolumeControllerConfiguration {
    let config = jsonfile.readFileSync(configurationFile);
    return config || {};
};

export function getMqttConfig(): MqttBrokerConfiguration {
    let config = jsonfile.readFileSync(configurationFile);
    return config.mqtt || {};
};

export function saveMqttConfig(mqttConfig: MqttBrokerConfiguration) {
    let config = jsonfile.readFileSync(configurationFile);
    config.mqtt = mqttConfig;
    jsonfile.writeFileSync(configurationFile, config);
};

export interface OsxVolumeControllerConfiguration {
    mqtt: MqttBrokerConfiguration;
}

export interface MqttBrokerConfiguration {
    host: string;
}