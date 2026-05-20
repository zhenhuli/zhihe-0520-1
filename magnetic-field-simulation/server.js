const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function findAvailablePort(startPort = 8000) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                findAvailablePort(startPort + 1).then(resolve).catch(reject);
            } else {
                reject(err);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(startPort);
        });
        server.listen(startPort, '127.0.0.1');
    });
}

function startServer(port) {
    const server = http.createServer((req, res) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`服务器错误: ${error.code}`, 'utf-8');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });

    server.listen(port, '127.0.0.1', () => {
        console.log('\n' + '='.repeat(50));
        console.log('🧲  二维磁场作用力可视化模拟器已启动');
        console.log('='.repeat(50));
        console.log(`📍 本地访问地址: http://127.0.0.1:${port}`);
        console.log(`📍 局域网地址: http://localhost:${port}`);
        console.log('='.repeat(50));
        console.log('💡 按 Ctrl+C 停止服务器');
        console.log('='.repeat(50) + '\n');
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 已被占用，正在尝试下一个端口...`);
            startServer(port + 1);
        } else {
            console.error('服务器错误:', err);
        }
    });

    return server;
}

const startPort = 8000;
console.log(`正在查找可用端口（从 ${startPort} 开始）...`);

findAvailablePort(startPort)
    .then((port) => {
        console.log(`找到可用端口: ${port}`);
        startServer(port);
    })
    .catch((err) => {
        console.error('无法找到可用端口:', err);
        process.exit(1);
    });
