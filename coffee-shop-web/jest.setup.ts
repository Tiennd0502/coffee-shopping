import '@testing-library/jest-dom'

// Base UI Switch dispatches `PointerEvent` on a hidden input; Node/jsdom omit it globally.
if (typeof globalThis.PointerEvent === 'undefined') {
  globalThis.PointerEvent = class extends MouseEvent {
    constructor(type: string, eventInitDict?: PointerEventInit) {
      super(type, eventInitDict)
    }
  } as typeof PointerEvent
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
