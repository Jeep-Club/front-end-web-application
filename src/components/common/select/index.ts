import { Select as DefaultSelect} from "./select";
import { SelectRegister } from "./select-register";

export const Select = Object.assign(SelectRegister, {
    Unregister: DefaultSelect
});

export default Select;