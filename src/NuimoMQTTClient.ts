// dependencies setup

import mqtt = require("mqtt");

export abstract class NuimoMQTTClient {

    id: string;
    displayName: string;
    iconString: string;

    mqttClient: mqtt.Client;
    topicRegex: RegExp;

    constructor(id: string, displayName: string, iconString: string) {

        this.id = id;
        this.displayName = displayName;
        this.iconString = iconString;

        this.topicRegex = this.getNuimoClientRegex(id);
    }

    private getNuimoClientRegex(id: string): RegExp {
        let regex = new RegExp("^nuimo\/(.{8}-?.{4}-?.{4}-?.{4}-?.{12})\/(" + id + ")$");
        return regex;
    }

    private getNuimoManagementTopic(): string {
        let topic = "nuimo";
        return topic;
    }

    private getNuimoClientTopic(nuimoUuid: string): string {
        let topic = "nuimo/" + nuimoUuid + "/" + this.id;
        return topic;
    }

    connectToBroker(brokerUrl: string, options?: mqtt.ClientOptions) {
        this.mqttClient = mqtt.connect(brokerUrl, options);

        let self = this;

        this.mqttClient.on("connect", function() {
            console.log("Connected to mqtt broker: " + brokerUrl);

            let topic = "nuimo/+/" + self.id;
            console.log("Subscribing to " + topic);

            this.subscribe(topic);
            self.registerOnNuimoMqttController();
        });

        this.mqttClient.on("close", function() {
            console.log("Disconnected from mqtt broker");
        });

        this.mqttClient.on("message", function(topic: string, message: string) {

            let nuimoUuid = self.topicRegex.exec(topic)[1];

            if (nuimoUuid !== null) {
                // message is Buffer 
                let parsedMessage = JSON.parse(message.toString());
                if (parsedMessage.command === "nuimoEvent") {
                    self.handleNuimoEvent(nuimoUuid, parsedMessage);
                }
            }
        });
    }

    registerOnNuimoMqttController() {
        let messageObject = {
            command: "register",
            id: this.id,
            name: this.displayName,
            icon: this.iconString
        };

        let topic = this.getNuimoManagementTopic();
        let message = JSON.stringify(messageObject);

        this.mqttClient.publish(topic, message);
    }

    abstract handleNuimoEvent(nuimoUuid: string, event: NuimoGestureEvent): void;

    sendIcon(nuimoUuid: string, iconString: string, duration?: number): void {
        let messageObject: any = {
            command: "showIcon",
            icon: iconString
        };
        if (duration) {
            messageObject.duration = duration;
        }

        this.sendNuimoMQTTClientMessage(nuimoUuid, messageObject);
    }

    sendProgressBarIcon(nuimoUuid: string, value: number, style: NuimoProgressBarStyle, brightness?: number, duration?: number): void {
        let messageObject: any = {
            command: "showProgressBarIcon",
            value: value,
            style: style
        };
        if (brightness) {
            messageObject.brightness = brightness;
        }
        if (duration) {
            messageObject.duration = duration;
        }

        this.sendNuimoMQTTClientMessage(nuimoUuid, messageObject);
    }

    sendNamedIcon(nuimoUuid: string, iconName: string, brightness?: number, duration?: number): void {
        let messageObject: any = {
            command: "showNamedIcon",
            iconName: iconName
        };
        if (brightness) {
            messageObject.brightness = brightness;
        }
        if (duration) {
            messageObject.duration = duration;
        }

        this.sendNuimoMQTTClientMessage(nuimoUuid, messageObject);
    }

    sendNuimoMQTTClientMessage(nuimoUuid: string, messageObject: any): void {
        let topic = this.getNuimoClientTopic(nuimoUuid);
        let message = JSON.stringify(messageObject);

        console.log("sending icon on topic " + topic);
        console.log(message);

        this.mqttClient.publish(topic, message);
    }
}

export interface NuimoGestureEvent {
    gesture: NuimoGesture;
    value: number;
}

export enum NuimoProgressBarStyle {
    "VerticalBar",
    "VolumeBar"
}

export enum NuimoGesture {
    Undefined = <any>"Undefined", // TODO: Do we really need this enum value? We don"t need to handle an "undefined" gesture
    ButtonPress = <any>"ButtonPress",
    ButtonDoublePress = <any>"ButtonDoublePress",
    ButtonRelease = <any>"ButtonRelease",
    RotateLeft = <any>"RotateLeft",
    RotateRight = <any>"RotateRight",
    TouchLeftDown = <any>"TouchLeftDown",
    TouchLeftRelease = <any>"TouchLeftRelease",
    TouchRightDown = <any>"TouchRightDown",
    TouchRightRelease = <any>"TouchRightRelease",
    TouchTopDown = <any>"TouchTopDown",
    TouchTopRelease = <any>"TouchTopRelease",
    TouchBottomDown = <any>"TouchBottomDown",
    TouchBottomRelease = <any>"TouchBottomRelease",
    SwipeLeft = <any>"SwipeLeft",
    SwipeRight = <any>"SwipeRight",
    SwipeUp = <any>"SwipeUp",
    SwipeDown = <any>"SwipeDown",
    FlyLeft = <any>"FlyLeft",
    FlyRight = <any>"FlyRight",
    FlyBackwards = <any>"FlyBackwards",
    FlyTowards = <any>"FlyTowards",
    FlyUp = <any>"FlyUp",
    FlyDown = <any>"FlyDown"
}