import { maskCEP } from "@/utils/masks";

describe("maskCEP", () => {
  it("applies the hyphen after the fifth digit", () => {
    expect(maskCEP("01310100")).toBe("01310-100");
  });

  it("formats partial values progressively", () => {
    expect(maskCEP("013101")).toBe("01310-1");
  });

  it("removes non-digits and limits the value to eight digits", () => {
    expect(maskCEP("01310a100999")).toBe("01310-100");
  });
});
