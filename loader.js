function gameEntryPoint() {
    console.debug('[LOADER] Starting game');
    // !G.import('game.js')
}

if (window.qrgames && false) {
    window.qrgames.onload = gameEntryPoint;
} else {
    let interval = setInterval(() => {
        if (typeof GRenderer !== 'undefined') {
            clearInterval(interval);
            gameEntryPoint();
        }
    }, 100);
    // window.addEventListener('load', gameEntryPoint);
}
