import { getDownloadFilename } from "@/utils/http/contentDisposition";

it("prefers UTF-8 Content-Disposition names and sanitizes filesystem separators", () => {
    expect(getDownloadFilename("attachment; filename*=UTF-8''relat%C3%B3rio%20m%C3%A9dico.pdf", "fallback.pdf"))
        .toBe("relatório médico.pdf");
    expect(getDownloadFilename('attachment; filename="../dados.csv"', "fallback.csv"))
        .toBe("_dados.csv");
});

it("uses quoted fallback names and the supplied name when the header is absent or malformed", () => {
    expect(getDownloadFilename('attachment; filename="users.csv"', "fallback.csv")).toBe("users.csv");
    expect(getDownloadFilename("attachment; filename*=UTF-8''bad%ZZ", "fallback.pdf")).toBe("fallback.pdf");
    expect(getDownloadFilename(undefined, "fallback.pdf")).toBe("fallback.pdf");
});
