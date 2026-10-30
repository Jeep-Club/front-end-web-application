import { Select as DefaultSelect} from "./select";
import { SelectRegister } from "./select-register";

export type { SelectOption, SelectProps } from "./select";

export const Select = Object.assign(SelectRegister, {
    Unregister: DefaultSelect
});

export default Select;
