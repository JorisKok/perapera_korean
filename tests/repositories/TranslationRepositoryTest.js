import TranslationRepository from "../../src/repositories/TranslationRepository.js";

describe("TranslationRepository", () => {
  it("We can insert a translation and search for it", () => {
    TranslationRepository.insert("한국", "Korea");

    let translation = TranslationRepository.search("한국");
    expect(translation.korean).toEqual("한국");
    expect(translation.translations).toEqual("Korea");
  });
});
