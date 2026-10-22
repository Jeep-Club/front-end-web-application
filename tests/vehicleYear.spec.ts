import { vehicleYearSchema } from "@/schemas/vehicles/year";

describe("vehicle year validation", () => {
    afterEach(() => jest.useRealTimers());

    it.each(["", "2", "999", "1899", "02020", "2e03", "20.0", "abcd", " 2020"])("rejects invalid year %s", (value) => {
        expect(vehicleYearSchema.safeParse(value).success).toBe(false);
    });

    it("accepts the inclusive limits and rejects future years", () => {
        const currentYear = new Date().getFullYear();
        expect(vehicleYearSchema.parse("1900")).toBe(1900);
        expect(vehicleYearSchema.parse(String(currentYear))).toBe(currentYear);
        expect(vehicleYearSchema.safeParse(String(currentYear + 1)).success).toBe(false);
    });

    it("updates the maximum when the calendar year changes", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 5, 1));
        expect(vehicleYearSchema.safeParse("2027").success).toBe(false);
        jest.setSystemTime(new Date(2027, 5, 1));
        expect(vehicleYearSchema.parse("2027")).toBe(2027);
    });
});
