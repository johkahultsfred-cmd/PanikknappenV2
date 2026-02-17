button.addEventListener("mousedown", (e)=>{
    if(isLocked) return;
    isDragging=false;

    // Rätt offset
    const rect = button.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    
});

function updateTextPosition() {
    text.style.left = (button.offsetLeft + button.offsetWidth/2 - text.offsetWidth/2) + "px";
    text.style.top = (button.offsetTop - text.offsetHeight - 10) + "px"; // ovanför knappen
}

// Kör direkt vid load
updateTextPosition();
window.addEventListener("resize", updateTextPosition);

