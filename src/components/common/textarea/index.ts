import { Textarea as TextareaUnregister } from "./textarea";
import { TextareaRegister } from "./textarea-register";

export const Textarea = Object.assign(TextareaRegister,{
    Unregister: TextareaUnregister,
});

export default Textarea;