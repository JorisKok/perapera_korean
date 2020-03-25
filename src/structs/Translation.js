export default class Translation {
  /**
   * @param {string} korean
   * @param {[]} translations
   */
  constructor(korean, translations) {
    this._korean = korean;
    this._translations = translations;
  }

  /**
   * Get the Korean character
   *
   * @return {string}
   */
  get korean() {
    return this._korean;
  }

  /**
   * Get the translations
   *
   * @return {*[]}
   */
  get translations() {
    return this._translations;
  }
}
