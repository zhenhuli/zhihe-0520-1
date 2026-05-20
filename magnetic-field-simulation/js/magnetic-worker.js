let params = {
    width: 800,
    height: 600,
    strength: 1.0,
    lineDensity: 24,
    maxLineLength: 500
};

let poles = [];

self.onmessage = function(e) {
    const data = e.data;
    
    if (data.type === 'params') {
        params = { ...params, ...data.params };
    } else if (data.type === 'calculate') {
        poles = data.poles;
        calculateField();
    }
};

function calculateField() {
    if (poles.length === 0) {
        self.postMessage({ type: 'fieldLines', lines: [] });
        self.postMessage({ type: 'fieldGrid', grid: null });
        return;
    }

    const lines = calculateFieldLines();
    self.postMessage({ type: 'fieldLines', lines: lines });

    const grid = calculateFieldGrid();
    self.postMessage({ type: 'fieldGrid', grid: grid });
}

function calculateFieldAt(x, y) {
    let bx = 0;
    let by = 0;

    for (const pole of poles) {
        const dx = x - pole.x;
        const dy = y - pole.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < 5) continue;

        const fieldStrength = (pole.strength * params.strength * 1000) / (distSq + 100);
        bx += fieldStrength * (dx / dist);
        by += fieldStrength * (dy / dist);
    }

    const magnitude = Math.sqrt(bx * bx + by * by);
    return { bx, by, magnitude };
}

function calculateFieldLines() {
    const lines = [];
    const northPoles = poles.filter(p => p.type === 'north');

    for (const pole of northPoles) {
        const numLines = params.lineDensity;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const startX = pole.x + Math.cos(angle) * 25;
            const startY = pole.y + Math.sin(angle) * 25;
            
            const line = traceFieldLine(startX, startY, 1);
            if (line.points.length > 10) {
                lines.push(line);
            }
        }
    }

    return lines;
}

function traceFieldLine(startX, startY, direction) {
    const points = [];
    let x = startX;
    let y = startY;
    const stepSize = 3;
    const maxSteps = params.maxLineLength / stepSize;

    points.push({ x, y });

    for (let i = 0; i < maxSteps; i++) {
        const field = calculateFieldAt(x, y);
        
        if (field.magnitude < 0.01) break;

        const dx = (field.bx / field.magnitude) * stepSize * direction;
        const dy = (field.by / field.magnitude) * stepSize * direction;

        x += dx;
        y += dy;

        if (x < 0 || x > params.width || y < 0 || y > params.height) break;

        let nearPole = false;
        for (const pole of poles) {
            const dist = Math.sqrt((x - pole.x) ** 2 + (y - pole.y) ** 2);
            if (dist < 20) {
                nearPole = true;
                if (pole.type === 'south') {
                    points.push({ x: pole.x, y: pole.y });
                }
                break;
            }
        }

        if (nearPole) break;

        if (i % 2 === 0) {
            points.push({ x, y });
        }
    }

    return { points };
}

function calculateFieldGrid() {
    const grid = new Float32Array(params.width * params.height);
    const sampleRate = 3;

    for (let y = 0; y < params.height; y += sampleRate) {
        for (let x = 0; x < params.width; x += sampleRate) {
            const field = calculateFieldAt(x, y);
            const value = Math.min(field.magnitude, 10);
            
            for (let dy = 0; dy < sampleRate && y + dy < params.height; dy++) {
                for (let dx = 0; dx < sampleRate && x + dx < params.width; dx++) {
                    const idx = (y + dy) * params.width + (x + dx);
                    grid[idx] = value;
                }
            }
        }
    }

    return grid;
}
