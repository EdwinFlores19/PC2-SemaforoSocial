import '@testing-library/jest-dom';

// Mock scrollIntoView for JSDOM testing environment
window.HTMLElement.prototype.scrollIntoView = function () {};
