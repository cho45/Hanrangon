/**
 * Base class for all post-processors.
 */
export class BaseProcessor {
  static appliesRegexp = null;

  constructor() {
    this.loaded = false;
  }

  /**
   * Returns true if this processor should handle the given DOM.
   * This check should be lightweight (e.g., using querySelector).
   * @param {HTMLElement} dom - JSDOM document body
   * @returns {boolean}
   */
  applies(dom) {
    return false;
  }

  /**
   * Loads heavy dependencies. Called only once if run() is called.
   * @returns {Promise<void>}
   */
  async prepare() {
    // To be implemented by subclasses: await import(...)
  }

  /**
   * Performs the actual processing.
   * @param {HTMLElement} dom - JSDOM document body
   * @param {string} baseURL - Base URL for resolving relative links
   * @returns {Promise<void>}
   */
  async process(dom, baseURL) {
    // To be implemented by subclasses
  }

  /**
   * Performs prepare (if needed) and process.
   * @param {HTMLElement} dom - JSDOM document body
   * @param {string} baseURL - Base URL for resolving relative links
   */
  async run(dom, baseURL) {
    if (!this.loaded) {
      await this.prepare();
      this.loaded = true;
    }
    await this.process(dom, baseURL);
  }
}
