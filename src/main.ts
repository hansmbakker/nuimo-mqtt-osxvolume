import settings = require("./Settings");
import { default as OsxVolumeClient } from "./OsxVolumeClient";

let controllerSettings = settings.getConfig();
let osxVolume = new OsxVolumeClient(controllerSettings);
