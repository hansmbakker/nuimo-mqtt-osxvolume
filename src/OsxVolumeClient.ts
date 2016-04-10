import { NuimoMQTTClient, NuimoGestureEvent, NuimoGesture, NuimoProgressBarStyle } from "./NuimoMQTTClient";
import osxVol = require("osx-vol");
import settings = require("./settings");

export default class OsxVolumeClient extends NuimoMQTTClient {

    lastVol: number;

    constructor(config: settings.OsxVolumeControllerConfiguration) {
        super("osxVolume", "OSX Volume", "            .   .   .. .  .....  . .....  . .....  . .  .. .  .   .   .          ");

        super.connectToBroker(config.mqtt.host);
        (async function() {
            this.lastVol = await osxVol.get();
        })();
    }

    handleNuimoEvent(nuimoUuid: string, event: NuimoGestureEvent) {

        switch (event.gesture) {
            case NuimoGesture.RotateLeft:
            case NuimoGesture.RotateRight:

                console.log("leftright");
                this.changeVolume(nuimoUuid, event);

                break;
            case NuimoGesture.ButtonPress:
                this.toggleMute(nuimoUuid, event);

                break;
            default:
                break;
        }
    }

    changeVolume = async function(nuimoUuid: string, event: NuimoGestureEvent) {
        let oldVol = await osxVol.get();
        let deltaVol = event.value / 1000;
        let newVol = oldVol + deltaVol;

        // cap the volume between 0 and 1
        newVol = Math.max(0, newVol);
        newVol = Math.min(newVol, 1);

        this.sendProgressBarIcon(nuimoUuid, newVol, NuimoProgressBarStyle.VolumeBar, 1, 0.5);

        this.lastVol = newVol;
        await osxVol.set(newVol);
    };

    toggleMute = async function(nuimoUuid: string, event: NuimoGestureEvent) {
        let isMuted = (await osxVol.get() === 0);
        if (isMuted) {
            this.sendNamedIcon(nuimoUuid, "speaker", 1, 0.5);
            await osxVol.set(this.lastVol);
        }
        else {
            this.sendNamedIcon(nuimoUuid, "mutedSpeaker", 1, 0.5);
            await osxVol.set(0);
        }
    };
}