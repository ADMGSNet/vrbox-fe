/**
 * Events
 */
export enum ZEvent {
  // mouse events
  Click = 'click',
  DoubleClick = 'dblclick',
  MouseDown = 'mousedown',
  MouseEnter = 'mouseenter',
  MouseLeave = 'mouseleave',
  MouseMove = 'mousemove',
  MouseOut = 'mouseout',
  MouseOver = 'mouseover',
  MouseUp = 'mouseup',
  // touch events
  Touch = 'touch',
  TouchCancel = 'touchcancel',
  TouchStart = 'touchstart',
  TouchMove = 'touchmove',
  TouchEnd = 'touchend',
  // keyboard events
  BeforeInput = 'beforeinput',
  KeyDown = 'keydown',
  KeyUp = 'keyup',
  // more events
  FocusIn = 'focusin',
  Focus = 'focus',
  Blur = 'blur',
  Input = 'input',
  Paste = 'paste',
  Resize = 'resize',
  Scroll = 'scroll',
  Wheel = 'wheel',
}
