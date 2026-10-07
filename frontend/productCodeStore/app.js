// Grab references to the elements we need
const counterEl = document.getElementById('counter');
const buttonEl = document.getElementById('clickMe');

// Keep the count in a variable
let clickCount = 0;

/**
 * Update the visible text that shows the number of clicks.
 */
function render() {
    counterEl.textContent = `You have clicked ${clickCount} ${clickCount === 1 ? 'time' : 'times'}.`;
}

/**
 * Event handler for the button
 */
function handleClick() {
    clickCount += 1;
    render();
}

/* Attach the click handler once the DOM is ready.
   Because the script is placed at the end of <body> we could
   skip DOMContentLoaded, but it’s a nice habit. */
document.addEventListener('DOMContentLoaded', () => {
    buttonEl.addEventListener('click', handleClick);
    render(); // show the initial “0 clicks”
});