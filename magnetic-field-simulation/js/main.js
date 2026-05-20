class MagneticFieldSimulator {
    constructor() {
        this.canvas = document.getElementById('magneticCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.poles = [];
        this.mode = 'select';
        this.selectedPole = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.fieldLines = [];
        this.fieldGrid = null;
        
        this.params = {
            strength: 1.0,
            lineDensity: 24,
            maxLineLength: 500,
            showLines: true,
            showField: true,
            showArrows: true
        };

        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;

        this.worker = new Worker('js/magnetic-worker.js');
        this.worker.onmessage = (e) => this.handleWorkerMessage(e);

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.updatePoleCount();
        this.animate();
        
        this.sendParamsToWorker();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.sendParamsToWorker();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('contextmenu', (e) => this.onRightClick(e));

        document.getElementById('addNorthBtn').addEventListener('click', () => {
            this.setMode('north');
        });

        document.getElementById('addSouthBtn').addEventListener('click', () => {
            this.setMode('south');
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearPoles();
        });

        document.getElementById('strengthSlider').addEventListener('input', (e) => {
            this.params.strength = parseFloat(e.target.value);
            document.getElementById('strengthValue').textContent = this.params.strength.toFixed(1);
            this.sendParamsToWorker();
            this.requestFieldCalculation();
        });

        document.getElementById('densitySlider').addEventListener('input', (e) => {
            this.params.lineDensity = parseInt(e.target.value);
            document.getElementById('densityValue').textContent = this.params.lineDensity;
            this.sendParamsToWorker();
            this.requestFieldCalculation();
        });

        document.getElementById('lengthSlider').addEventListener('input', (e) => {
            this.params.maxLineLength = parseInt(e.target.value);
            document.getElementById('lengthValue').textContent = this.params.maxLineLength;
            this.sendParamsToWorker();
            this.requestFieldCalculation();
        });

        document.getElementById('showLines').addEventListener('change', (e) => {
            this.params.showLines = e.target.checked;
        });

        document.getElementById('showField').addEventListener('change', (e) => {
            this.params.showField = e.target.checked;
        });

        document.getElementById('showArrows').addEventListener('change', (e) => {
            this.params.showArrows = e.target.checked;
        });
    }

    setMode(mode) {
        this.mode = mode;
        const indicator = document.getElementById('modeIndicator');
        indicator.className = 'mode-indicator ' + mode;
        
        if (mode === 'north') {
            indicator.textContent = '🔴 放置 N极 (点击画布)';
        } else if (mode === 'south') {
            indicator.textContent = '🔵 放置 S极 (点击画布)';
        } else {
            indicator.textContent = '选择模式';
        }

        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        if (mode === 'north') {
            document.getElementById('addNorthBtn').classList.add('active');
        } else if (mode === 'south') {
            document.getElementById('addSouthBtn').classList.add('active');
        }
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (e.button === 0) {
            const clickedPole = this.findPoleAt(x, y);
            
            if (clickedPole) {
                this.selectedPole = clickedPole;
                this.isDragging = true;
                this.dragOffset.x = x - clickedPole.x;
                this.dragOffset.y = y - clickedPole.y;
            } else if (this.mode === 'north' || this.mode === 'south') {
                this.addPole(x, y, this.mode);
            }
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isDragging && this.selectedPole) {
            this.selectedPole.x = x - this.dragOffset.x;
            this.selectedPole.y = y - this.dragOffset.y;
            this.requestFieldCalculation();
        }
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onRightClick(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pole = this.findPoleAt(x, y);
        if (pole) {
            this.removePole(pole);
        }
    }

    findPoleAt(x, y) {
        for (let i = this.poles.length - 1; i >= 0; i--) {
            const pole = this.poles[i];
            const dist = Math.sqrt((x - pole.x) ** 2 + (y - pole.y) ** 2);
            if (dist < 25) {
                return pole;
            }
        }
        return null;
    }

    addPole(x, y, type) {
        const pole = {
            id: Date.now() + Math.random(),
            x: x,
            y: y,
            type: type,
            strength: type === 'north' ? 1 : -1
        };
        this.poles.push(pole);
        this.updatePoleCount();
        this.requestFieldCalculation();
    }

    removePole(pole) {
        const index = this.poles.indexOf(pole);
        if (index > -1) {
            this.poles.splice(index, 1);
            this.updatePoleCount();
            this.requestFieldCalculation();
        }
    }

    clearPoles() {
        this.poles = [];
        this.fieldLines = [];
        this.fieldGrid = null;
        this.updatePoleCount();
        this.requestFieldCalculation();
    }

    updatePoleCount() {
        const northCount = this.poles.filter(p => p.type === 'north').length;
        const southCount = this.poles.filter(p => p.type === 'south').length;
        document.getElementById('northCount').textContent = northCount;
        document.getElementById('southCount').textContent = southCount;
    }

    sendParamsToWorker() {
        this.worker.postMessage({
            type: 'params',
            params: {
                width: this.canvas.width,
                height: this.canvas.height,
                strength: this.params.strength,
                lineDensity: this.params.lineDensity,
                maxLineLength: this.params.maxLineLength
            }
        });
    }

    requestFieldCalculation() {
        if (this.poles.length === 0) {
            this.fieldLines = [];
            this.fieldGrid = null;
            return;
        }

        this.worker.postMessage({
            type: 'calculate',
            poles: this.poles
        });
    }

    handleWorkerMessage(e) {
        const data = e.data;
        if (data.type === 'fieldLines') {
            this.fieldLines = data.lines;
        } else if (data.type === 'fieldGrid') {
            this.fieldGrid = data.grid;
        }
    }

    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
        }
    }

    animate() {
        this.updateFPS();
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.params.showField && this.fieldGrid) {
            this.renderFieldGrid();
        }

        if (this.params.showLines) {
            this.renderFieldLines();
        }

        this.renderPoles();
    }

    renderFieldGrid() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const idx = (y * this.canvas.width + x);
                const strength = this.fieldGrid[idx] || 0;
                
                const pixelIdx = idx * 4;
                const intensity = Math.min(strength * 0.3, 1);
                
                data[pixelIdx] = Math.floor(intensity * 30);
                data[pixelIdx + 1] = Math.floor(intensity * 50);
                data[pixelIdx + 2] = Math.floor(intensity * 80 + 20);
                data[pixelIdx + 3] = 180;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    renderFieldLines() {
        this.ctx.lineWidth = 1.5;

        for (const line of this.fieldLines) {
            if (line.points.length < 2) continue;

            const gradient = this.ctx.createLinearGradient(
                line.points[0].x, line.points[0].y,
                line.points[line.points.length - 1].x, line.points[line.points.length - 1].y
            );

            gradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
            gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(78, 205, 196, 0.8)');

            this.ctx.strokeStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(line.points[0].x, line.points[0].y);

            for (let i = 1; i < line.points.length; i++) {
                this.ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            this.ctx.stroke();

            if (this.params.showArrows && line.points.length > 10) {
                const arrowInterval = Math.floor(line.points.length / 4);
                for (let i = arrowInterval; i < line.points.length - 5; i += arrowInterval) {
                    this.drawArrow(line.points[i], line.points[i + 3]);
                }
            }
        }
    }

    drawArrow(p1, p2) {
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const headLen = 8;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(p2.x, p2.y);
        this.ctx.lineTo(
            p2.x - headLen * Math.cos(angle - Math.PI / 6),
            p2.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            p2.x - headLen * Math.cos(angle + Math.PI / 6),
            p2.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    renderPoles() {
        for (const pole of this.poles) {
            const isSelected = pole === this.selectedPole;
            const radius = isSelected ? 22 : 18;

            const glowGradient = this.ctx.createRadialGradient(
                pole.x, pole.y, 0,
                pole.x, pole.y, radius * 2
            );

            if (pole.type === 'north') {
                glowGradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
                glowGradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.3)');
                glowGradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
            } else {
                glowGradient.addColorStop(0, 'rgba(78, 205, 196, 0.8)');
                glowGradient.addColorStop(0.5, 'rgba(78, 205, 196, 0.3)');
                glowGradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
            }

            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(pole.x, pole.y, radius * 2, 0, Math.PI * 2);
            this.ctx.fill();

            const bodyGradient = this.ctx.createRadialGradient(
                pole.x - radius * 0.3, pole.y - radius * 0.3, 0,
                pole.x, pole.y, radius
            );

            if (pole.type === 'north') {
                bodyGradient.addColorStop(0, '#ff8a8a');
                bodyGradient.addColorStop(1, '#ff6b6b');
            } else {
                bodyGradient.addColorStop(0, '#6ee7df');
                bodyGradient.addColorStop(1, '#4ecdc4');
            }

            this.ctx.fillStyle = bodyGradient;
            this.ctx.beginPath();
            this.ctx.arc(pole.x, pole.y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            if (isSelected) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `bold ${radius}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(pole.type === 'north' ? 'N' : 'S', pole.x, pole.y);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MagneticFieldSimulator();
});
