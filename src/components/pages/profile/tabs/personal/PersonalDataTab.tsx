import { PersonalDataCard } from "./PersonalDataCard";

export function PersonalDataTab() {
    return (
        <div className="grid w-full gap-5 lg:grid-cols-[320px_1fr]">
            <PersonalDataCard />
        </div>
    );
}

export default PersonalDataTab;