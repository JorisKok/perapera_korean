/**
 * More information can be found here:
 * https://en.wikipedia.org/wiki/Korean_language_and_computers#Hangul_in_Unicode
 */
export default class UnicodeService {
  /**
   * Encode a Korean word for searching
   *
   * @param {string} korean
   * @return {string}
   */
  static encode(korean) {
    let result = "";

    for (let codePoint of korean) {
      result += this.toHexadecimal(this.toInitial(korean));
      result += this.toHexadecimal(this.toMedial(korean));
      result += this.toHexadecimal(this.toFinal(korean));
    }

    return result;
  }

  /**
   * Create a hexadecimal representation of a Korean word
   *
   * @param {string} korean
   * @return {string}
   */
  static toHexadecimal(korean) {
    let result = "";

    for (let codePoint of korean) {
      result += codePoint.codePointAt(0).toString(16);
    }

    return result;
  }

  /**
   * Create a string from a hexadecimal representation
   *
   * @param {string} hexadecimal
   * @return {string}
   */
  static toString(hexadecimal) {
    let result = "";

    for (let codePoint of hexadecimal.match(/.{4}/g)) {
      result += String.fromCodePoint(parseInt(codePoint, 16));
    }

    return result;
  }

  /**
   * @param {string} korean
   * @return {int}
   */
  static toDecimal(korean) {
    return parseInt(korean.codePointAt(0).toString(10), 10);
  }

  /**
   * Get the initial value
   *
   * @param {string} korean
   * @return {string}
   */
  static toInitial(korean) {
    return this.toString((this.toInitialDecimal(korean) + 4352).toString(16));
  }
  /**
   * Get the initial decimal value
   *
   * @param {string} korean
   * @return {int}
   */
  static toInitialDecimal(korean) {
    return Math.floor((this.toDecimal(korean) - 44032) / 588);
  }

  /**
   * Get the medial value
   *
   * @param {string} korean
   * @return {string}
   */
  static toMedial(korean) {
    return this.toString((this.toMedialDecimal(korean) + 4449).toString(16));
  }

  /**
   * Get the medial decimal value
   *
   * @param {string} korean
   * @return {int}
   */
  static toMedialDecimal(korean) {
    const value = Math.floor((this.toDecimal(korean) - 44032) % 588);

    return Math.floor(value / 28);
  }

  /**
   * Get the final value
   *
   * @param {string} korean
   * @return {string}
   */
  static toFinal(korean) {
    return this.toString((this.toFinalDecimal(korean) + 4519).toString(16));
  }
  /**
   * Get the final decimal value
   *
   * @param {string} korean
   * @return {int}
   */
  static toFinalDecimal(korean) {
    let value = Math.floor((this.toDecimal(korean) - 44032) % 588);

    return Math.floor(value % 28);
  }
}
