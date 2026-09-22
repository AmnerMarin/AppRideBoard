//Concepto de closure
//Archivo para acortar la ruta
export function debounce(fn, delay = 400) {
    let timerId;

    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    }

}

export function shortenAddress(address, parts = 2) {
    return String(address?? '')
    .split(",")
    .slice(0,parts)
    .map((part)=>part.trim())
    .join(', ')
}

export const $ = (selector) => document.querySelector(selector);