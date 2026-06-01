import { Dropzone as BaseDropZone } from "./dropzone";
import { DropzoneImage } from "./dropzone-image";

export const DropZone = Object.assign(BaseDropZone, {
    Image: DropzoneImage,
    // outros tipos de dropzone
})

export default DropZone;