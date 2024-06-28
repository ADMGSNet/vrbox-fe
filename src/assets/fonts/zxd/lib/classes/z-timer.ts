export class ZTimer {
  //************************************************************************//
  // variables
  //************************************************************************//
  private t = 0;

  //************************************************************************//
  // public methods
  //************************************************************************//
  /**
   * Starts the timer
   *
   * @param fn - Function launched
   * @param period - Amount of time between two consecutive function calls
   */
  start(fn: (...args: any[]) => void, period: number) {
    clearInterval(this.t);
    this.t = window.setInterval(fn, period);
  }

  /**
   * Stops the timer
   */
  stop() {
    clearInterval(this.t);
  }
}
