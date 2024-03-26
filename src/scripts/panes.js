const panes = document.querySelectorAll('.pane');
let isResizing = false;
let lastX = 0;

panes.forEach((pane, index) => {
    pane.addEventListener('mousedown', function (e) {
        isResizing = true;
        lastX = e.clientX;
    });

    pane.addEventListener('mousemove', function (e) {
        if (isResizing) {
            const delta = e.clientX - lastX;
            const newWidth = parseFloat(getComputedStyle(pane).width) + delta;
            pane.style.width = newWidth + 'px';
            lastX = e.clientX;
        }
    });

    pane.addEventListener('mouseup', function () {
        isResizing = false;
    });
});