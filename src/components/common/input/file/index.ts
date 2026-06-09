import { InputFile as BaseInputFile } from "./input-file";
import { InputFileImage } from "./input-file-image";
import { InputFileImage2 } from "./input-file-image2";

export const InputFile = Object.assign(BaseInputFile, {
    Image: InputFileImage,
    Image2: InputFileImage2,
    // outros tipos de InputFile
})

export default InputFile;