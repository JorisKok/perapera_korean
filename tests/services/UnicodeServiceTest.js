import UnicodeService from "../../src/services/UnicodeService.js";

describe("UnicodeService", () => {
  it("We can convert a Korean word to a unicode string", () => {
    expect(UnicodeService.toHexadecimal("한국")).toEqual("d55cad6d");
  });

  it("We can convert a unicode string back to a Korean word", () => {
    expect(UnicodeService.toString("d55cad6d")).toEqual("한국");
  });

  it("We can hash a Korean word for better searching in the database", () => {
    expect(UnicodeService.toHexadecimal("ᄒ")).toEqual("1112");
    expect(UnicodeService.toHexadecimal("ᅡ")).toEqual("1161");
    expect(UnicodeService.toHexadecimal("ᆫ")).toEqual("11ab");
    expect(UnicodeService.encode("한")).toEqual("1112116111ab");
  });

  it("We can find the decimal value for a Korean character", () => {
    expect(UnicodeService.toDecimal("한")).toEqual(54620);
  });

  it("We can get the initial value from a Korean character", () => {
    expect(UnicodeService.toInitial("한")).toEqual("ᄒ");
  });

  it("We can get the medial value from a Korean character", () => {
    expect(UnicodeService.toMedial("한")).toEqual("ᅡ");
  });

  it("We can get the final value from a Korean character", () => {
    expect(UnicodeService.toFinal("한")).toEqual("ᆫ");
  });

  it("We can get the initial decimal value from a Korean character", () => {
    expect(UnicodeService.toInitialDecimal("한")).toEqual(18);
  });

  it("We can get the medial decimal value from a Korean character", () => {
    expect(UnicodeService.toMedialDecimal("한")).toEqual(0);
  });

  it("We can get the final decimal value from a Korean character", () => {
    expect(UnicodeService.toFinalDecimal("한")).toEqual(4);
  });
});
