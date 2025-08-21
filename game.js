// 像素消消乐游戏 - MVP版本
const app = document.getElementById('app');
const btn = document.getElementById('btn');
const testEffectBtn = document.getElementById('test-effect');
const scoreBoard = document.getElementById('score-board');
const scoreElement = document.getElementById('score');
const comboElement = document.getElementById('combo');
const highScoreElement = document.getElementById('high-score');
const timerElement = document.getElementById('timer');
const emojis = [
    'assets/xiangsu_aixin.svg',
    'assets/xiangsu_meiguihua.svg',
    'assets/xiangsu_yaoshui.svg',
    'assets/xiangsu-hanbao.svg',
    'assets/xiangsu-pisa.svg'
];
let cells = [];
let score = 0;
let combo = 0;
let highScore = localStorage.getItem('highScore') || 0;
let timeLeft = 60;
let gameTimer = null;
let isGameActive = true;
let isSwapping = false;
let isDragging = false;
let dragCell = null;
let dragStartX = 0;
let dragStartY = 0;
let cellStartX = 0;
let cellStartY = 0;

// 创建消除动画
function createEliminateAnimation(cell) {
    const size = gameMap.size;
    const left = parseInt(cell.instance.style.left);
    const top = parseInt(cell.instance.style.top);
    
    // 创建消除效果元素
    const effect = document.createElement('div');
    effect.className = 'eliminate-effect';
    effect.style.width = size + 'px';
    effect.style.height = size + 'px';
    effect.style.left = left + 'px';
    effect.style.top = top + 'px';
    
    // 添加到游戏区域
    app.appendChild(effect);
    
    // 创建像素爆炸效果
    createPixelExplosion(left + size / 2, top + size / 2);
    
    // 动画结束后移除元素
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 500);
}

// 创建像素爆炸效果
function createPixelExplosion(centerX, centerY) {
    const pixelCount = 12;
    
    // 根据连击次数确定颜色
    let colors;
    if (combo >= 5) {
        // 五次以上连击：红色系
        colors = ['#ff0000', '#ff3333', '#ff6666', '#ff9999'];
    } else if (combo >= 3) {
        // 三次连击：金色系
        colors = ['#ffcc00', '#ffdd33', '#ffee66', '#ffff99'];
    } else {
        // 单次消除：白色系
        colors = ['#ffffff', '#dddddd', '#bbbbbb', '#999999'];
    }
    
    // 增加粒子数量和爆炸范围，根据连击次数
    const multiplier = Math.min(combo, 5);
    const enhancedPixelCount = pixelCount + (multiplier * 4);
    const maxDistance = 40 + (multiplier * 10);
    
    for (let i = 0; i < enhancedPixelCount; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel-explosion';
        pixel.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机角度和距离
        const angle = (Math.PI * 2 * i) / enhancedPixelCount;
        const distance = 20 + Math.random() * maxDistance;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        
        // 随机大小 - 方块粒子
        const size = 4 + Math.floor(Math.random() * 4); // 使用整数大小，更符合像素风格
        pixel.style.width = size + 'px';
        pixel.style.height = size + 'px';
        
        // 初始位置在中心
        pixel.style.left = centerX + 'px';
        pixel.style.top = centerY + 'px';
        
        // 设置目标位置（相对移动距离）
        pixel.style.setProperty('--target-x', targetX + 'px');
        pixel.style.setProperty('--target-y', targetY + 'px');
        
        // 随机动画延迟，创造更自然的爆炸效果
        const delay = Math.random() * 0.2;
        pixel.style.animationDelay = delay + 's';
        
        // 添加到游戏区域
        app.appendChild(pixel);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (pixel.parentNode) {
                pixel.parentNode.removeChild(pixel);
            }
        }, 600 + delay * 1000);
    }
}

// 创建像素烟花效果
function createPixelFirework(x, y, color) {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'pixel-particle';
        particle.style.backgroundColor = color;
        
        // 随机角度
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 30 + Math.random() * 20;
        
        // 初始位置
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // 随机大小
        const size = 6 + Math.floor(Math.random() * 4); // 使用整数大小，更符合像素风格
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 添加动画
        const duration = 0.6 + Math.random() * 0.4;
        particle.style.animation = `pixelFirework ${duration}s ease-out forwards`;
        
        // 添加到游戏区域
        app.appendChild(particle);
        
        // 动画结束后移除
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }
}

// 创建像素火焰效果
function createPixelFlame(x, y) {
    const flameCount = 10;
    const colors = ['#ff6600', '#ff9900', '#ffcc00', '#ff3300', '#ff0000'];
    
    for (let i = 0; i < flameCount; i++) {
        const flame = document.createElement('div');
        flame.className = 'pixel-flame';
        flame.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机水平偏移
        const offsetX = (Math.random() - 0.5) * 30;
        
        // 初始位置
        flame.style.left = (x + offsetX) + 'px';
        flame.style.top = y + 'px';
        
        // 随机大小 - 使用整数大小，更符合像素风格
        const size = 4 + Math.floor(Math.random() * 4);
        flame.style.width = size + 'px';
        flame.style.height = size + 'px';
        
        // 添加动画
        const duration = 0.8 + Math.random() * 0.4;
        flame.style.animation = `pixelFlame ${duration}s ease-out forwards`;
        flame.style.animationDelay = Math.random() * 0.2 + 's';
        
        // 添加到游戏区域
        app.appendChild(flame);
        
        // 动画结束后移除
        setTimeout(() => {
            if (flame.parentNode) {
                flame.parentNode.removeChild(flame);
            }
        }, (duration + 0.2) * 1000);
    }
}

class GameMap {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.matrix = [];
        this.useSwap = false;
        this.handleable = true;
        this.types = emojis.length;
    }
    
    genMatrix() {
        const { x, y } = this;
        const row = new Array(x).fill(undefined);
        const matrix = new Array(y).fill(undefined).map(() => [...row]);
        this.matrix = matrix;
        return this;
    }
    
    genRandom() {
        const { x, y } = this;
        this.matrix = this.matrix.map(row => row.map(() => Math.floor(Math.random() * this.types)));
        return this;
    }
    
    init() {
        cells = [];
        const { x, y } = this;
        for (let i = 0; i < y; i++) {
            for (let j = 0; j < x; j++) {
                const type = this.matrix[i][j];
                const random = Math.floor(Math.random() * this.types);
                cells.push(new Cell({
                    type: type === undefined ? random : type,
                    position: [j, i],
                    status: type === undefined ? 'emerge' : 'common',
                    left: undefined,
                    top: undefined,
                    right: undefined,
                    bottom: undefined,
                    instance: undefined
                }));
            }
        }
        cells.forEach(cell => {
            const [row, col] = cell.position;
            cell.left = cells.find(_cell => {
                const [_row, _col] = _cell.position;
                return _row === row - 1 && _col === col;
            });
            cell.right = cells.find(_cell => {
                const [_row, _col] = _cell.position;
                return _row === row + 1 && _col === col;
            });
            cell.top = cells.find(_cell => {
                const [_row, _col] = _cell.position;
                return _row === row && _col === col - 1;
            });
            cell.bottom = cells.find(_cell => {
                const [_row, _col] = _cell.position;
                return _row === row && _col === col + 1;
            });
            cell.genCell();
        });
        return this;
    }
    
    genCellMap() {
        app.innerHTML = '';
        cells.forEach(cell => {
            app.append(cell.instance);
        });
        return this;
    }
    
    // 交换两个方块
    async genSwap(firstCell, secondCell) {
        return new Promise((resolve, reject) => {
            const { instance: c1, type: t1 } = firstCell;
            const { instance: c2, type: t2 } = secondCell;
            const { left: x1, top: y1 } = c1.style;
            const { left: x2, top: y2 } = c2.style;
            
            setTimeout(() => {
                c1.style.left = x2;
                c1.style.top = y2;
                c2.style.left = x1;
                c2.style.top = y1;
            }, 0);
            
            setTimeout(() => {
                // 交换实例引用（这是关键）
                firstCell.instance = c2;
                firstCell.type = t2;
                secondCell.instance = c1;
                secondCell.type = t1;
                resolve('ok');
            }, 300);
        });
    }
    
    // 检查是否有可消除的方块
    checkCollapse() {
        return cells.some(cell => cell.status === 'collapse');
    }
    
    // 标记需要消除的方块
    markCollapseCells() {
        // 重置所有方块状态
        cells.forEach(cell => {
            if (cell.status === 'collapse') {
                cell.status = 'common';
            }
        });
        
        cells.forEach(cell => {
            const { left, right, top, bottom, type } = cell;
            
            // 检查横向
            if (left?.type === type && right?.type === type) {
                left.status = 'collapse';
                cell.status = 'collapse';
                right.status = 'collapse';
            }
            
            // 检查纵向
            if (top?.type === type && bottom?.type === type) {
                top.status = 'collapse';
                cell.status = 'collapse';
                bottom.status = 'collapse';
            }
        });
        return this;
    }
    
    // 生成新方块
    genEmerge() {
        return new Promise((resolve, reject) => {
            this.regenCellMap();
            this.genCellMap();
            
            setTimeout(() => {
                cells.forEach(cell => {
                    if (cell.status === 'emerge') {
                        cell.instance.style.transform = 'scale(1)';
                    }
                });
            }, 100);
            
            setTimeout(() => { resolve('ok'); }, 300);
        });
    }
    
    // 消除方块
    genCollapse() {
        return new Promise((resolve, reject) => {
            this.handleable = false;
            this.markCollapseCells();
            
            let collapseCount = 0;
            setTimeout(() => {
                cells.forEach(cell => {
                    if (cell.status === 'collapse') {
                        // 创建消除动画
                        createEliminateAnimation(cell);
                        
                        // 延迟隐藏方块，让动画先播放
                        setTimeout(() => {
                            cell.instance.style.transform = 'scale(0)';
                        }, 200);
                        
                        collapseCount++;
                    }
                });
                
                // 更新分数
                if (collapseCount > 0) {
                    combo++;
                    score += collapseCount * 10 * combo;
                    updateScore();
                    
                    // 显示连击特效
                    if (combo > 1) {
                        showComboEffect(combo);
                    }
                } else {
                    combo = 0;
                }
            }, 0);
            
            setTimeout(() => {
                resolve('ok');
            }, 500);
        });
    }
    
    // 方块下落
    genDownfall() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                cells.forEach(cell => {
                    if (cell.status !== 'collapse') {
                        let downfallRange = 0;
                        let bottom = cell.bottom;
                        
                        while (bottom) {
                            if (bottom.status === 'collapse') {
                                downfallRange += 1;
                            }
                            bottom = bottom.bottom;
                        }
                        
                        if (downfallRange > 0) {
                            const currentTop = parseInt(cell.instance.style.top);
                            cell.instance.style.top = (currentTop + gameMap.size * downfallRange) + 'px';
                        }
                    }
                });
            }, 0);
            
            setTimeout(() => {
                resolve('ok');
            }, 300);
        });
    }
    
    // 洗牌功能
    genShuffle() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const len = this.x * this.y;
                const arr = new Array(len).fill(0).map((_, i) => i);
                const shuffle = arr => arr.sort(() => 0.5 - Math.random());
                const shuffleArray = shuffle(arr);
                
                cells.forEach((cell, index) => {
                    const newPosition = shuffleArray[index];
                    cell.instance.style.top = Math.floor(newPosition / this.x) * this.size + 'px';
                    cell.instance.style.left = newPosition % this.x * this.size + 'px';
                });
            }, 0);
            
            setTimeout(() => {
                this.regenCellMap();
                this.genCellMap();
                this.genLoop();
                resolve('ok');
            }, 300);
        });
    }
    
    // 游戏主循环
    async genLoop() {
        await gameMap.genCollapse();
        let status = cells.some(cell => cell.status === 'collapse');
        while (cells.some(cell => cell.status === 'collapse')) {
            await gameMap.genDownfall();
            await gameMap.genEmerge();
            await gameMap.genCollapse();
        }
        gameMap.handleable = true;
        return status;
    }
    
    // 重新生成单元格映射
    regenCellMap() {
        const size = gameMap.size;
        const findInstance = (x, y) => {
            return cells.find(item => {
                const { offsetLeft, offsetTop } = item.instance;
                return (item.status !== 'collapse' && (x === offsetLeft / size) && (y === offsetTop / size));
            })?.instance;
        };
        this.genMatrix();
        this.matrix = this.matrix.map((row, rowIndex) => row.map((item, itemIndex) => findInstance(itemIndex, rowIndex)?.type));

        this.init();
    }
}

class Cell {
    constructor(options) {
        const { position, status, type, left, top, right, bottom, instance } = options;
        this.type = type;
        this.position = position;
        this.status = status;
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
        this.instance = instance;
    }
    
    genCell() {
        const cell = document.createElement('div');
        const size = gameMap.size;
        const [x, y] = this.position;
        cell.type = this.type;
        cell.style.cssText = `
            width:${size}px;
            height:${size}px;
            left:${size * x}px;
            top:${size * y}px;
            box-sizing:border-box;
            border:5px solid #888;
            transition:0.3s;
            position:absolute;
            transform:scale(${this.status === 'emerge' ? '0' : '1'});
            display:flex;
            justify-content:center;
            align-items:center;
            cursor:pointer;
            z-index:1;
            background-color: #555;
            background-image: linear-gradient(45deg, #555 25%, #666 25%, #555 50%);
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        `;
        
        // 创建SVG图像元素
        const svg = document.createElement('img');
        svg.src = emojis[this.type];
        svg.style.cssText = `
            width: ${size * 0.8}px;
            height: ${size * 0.8}px;
            object-fit: contain;
        `;
        
        cell.appendChild(svg);
        this.instance = cell;
    }
    
    updateDisplay() {
        // 清除现有内容
        this.instance.innerHTML = '';
        
        // 创建新的SVG图像元素
        const svg = document.createElement('img');
        svg.src = emojis[this.type];
        svg.style.cssText = `
            width: ${gameMap.size * 0.8}px;
            height: ${gameMap.size * 0.8}px;
            object-fit: contain;
        `;
        
        this.instance.appendChild(svg);
    }
    
    // 开始拖动
    startDrag(clientX, clientY) {
        isDragging = true;
        dragCell = this;
        dragStartX = clientX;
        dragStartY = clientY;
        cellStartX = parseInt(this.instance.style.left);
        cellStartY = parseInt(this.instance.style.top);
        
        // 高亮当前方块并添加拖动样式
        this.instance.style.border = '5px solid yellow';
        this.instance.style.zIndex = '10';
        this.instance.classList.add('dragging');
        
        // 初始化拖动方向
        this.dragDirection = null;
    }
    
    // 拖动中
    drag(clientX, clientY) {
        if (!isDragging || dragCell !== this) return;
        
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;
        
        // 确定拖动方向（只在第一次拖动时确定）
        if (this.dragDirection === null) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平拖动
                this.dragDirection = deltaX > 0 ? 'right' : 'left';
            } else {
                // 垂直拖动
                this.dragDirection = deltaY > 0 ? 'down' : 'up';
            }
        }
        
        // 检查是否往回拖（取消预览）
        let cancelPreview = false;
        if (this.dragDirection === 'right' && deltaX < gameMap.size / 3) {
            cancelPreview = true;
        } else if (this.dragDirection === 'left' && deltaX > -gameMap.size / 3) {
            cancelPreview = true;
        } else if (this.dragDirection === 'down' && deltaY < gameMap.size / 3) {
            cancelPreview = true;
        } else if (this.dragDirection === 'up' && deltaY > -gameMap.size / 3) {
            cancelPreview = true;
        }
        
        // 根据拖动方向确定目标方块
        let targetCell = null;
        if (!cancelPreview) {
            if (this.dragDirection === 'right' && this.right) {
                targetCell = this.right;
            } else if (this.dragDirection === 'left' && this.left) {
                targetCell = this.left;
            } else if (this.dragDirection === 'down' && this.bottom) {
                targetCell = this.bottom;
            } else if (this.dragDirection === 'up' && this.top) {
                targetCell = this.top;
            }
        }
        
        // 高亮目标方块
        if (this.targetCell !== targetCell) {
            // 清除之前的高亮
            if (this.targetCell) {
                this.targetCell.instance.style.border = '5px solid #888';
                // 恢复之前的目标方块位置
                this.targetCell.instance.style.left = this.targetCellOriginalLeft + 'px';
                this.targetCell.instance.style.top = this.targetCellOriginalTop + 'px';
                // 恢复透明度
                this.targetCell.instance.style.opacity = '1';
            }
            
            this.targetCell = targetCell;
            
            // 高亮新的目标方块
            if (targetCell) {
                targetCell.instance.style.border = '5px solid #ff9900';
                
                // 保存目标方块的原始位置
                this.targetCellOriginalLeft = parseInt(targetCell.instance.style.left);
                this.targetCellOriginalTop = parseInt(targetCell.instance.style.top);
                
                // 计算移动距离
                let moveX = 0;
                let moveY = 0;
                
                if (this.dragDirection === 'right') {
                    moveX = gameMap.size;
                } else if (this.dragDirection === 'left') {
                    moveX = -gameMap.size;
                } else if (this.dragDirection === 'down') {
                    moveY = gameMap.size;
                } else if (this.dragDirection === 'up') {
                    moveY = -gameMap.size;
                }
                
                // 移动当前方块
                this.instance.style.left = (cellStartX + moveX) + 'px';
                this.instance.style.top = (cellStartY + moveY) + 'px';
                
                // 移动目标方块（预览效果）
                targetCell.instance.style.left = (this.targetCellOriginalLeft - moveX) + 'px';
                targetCell.instance.style.top = (this.targetCellOriginalTop - moveY) + 'px';
                
                // 降低目标方块的透明度，增强预览效果
                targetCell.instance.style.opacity = '0.7';
            } else {
                // 没有目标方块，恢复当前方块位置
                this.instance.style.left = cellStartX + 'px';
                this.instance.style.top = cellStartY + 'px';
            }
        }
    }
    
    // 结束拖动
    endDrag() {
        if (!isDragging || dragCell !== this) return;
        
        isDragging = false;
        
        // 恢复边框和z-index
        this.instance.style.border = '5px solid #888';
        this.instance.style.zIndex = '1';
        
        // 移除拖动样式
        this.instance.classList.remove('dragging');
        
        // 清除目标方块的高亮和恢复状态
        if (this.targetCell) {
            this.targetCell.instance.style.border = '5px solid #888';
            this.targetCell.instance.style.opacity = '1';
            
            // 恢复目标方块位置
            if (this.targetCellOriginalLeft !== undefined && this.targetCellOriginalTop !== undefined) {
                this.targetCell.instance.style.left = this.targetCellOriginalLeft + 'px';
                this.targetCell.instance.style.top = this.targetCellOriginalTop + 'px';
            }
        }
        
        // 恢复当前方块位置
        this.instance.style.left = cellStartX + 'px';
        this.instance.style.top = cellStartY + 'px';
        
        // 如果有目标方块，尝试交换
        if (this.targetCell && gameMap.handleable) {
            const targetCell = this.targetCell;
            
            (async () => {
                // 交换方块
                await gameMap.genSwap(this, targetCell);
                
                // 检查是否形成消除
                gameMap.markCollapseCells();
                const hasCollapse = gameMap.checkCollapse();
                
                if (hasCollapse) {
                    // 有消除，执行游戏循环
                    await gameMap.genLoop();
                } else {
                    // 没有消除，交换回来
                    await gameMap.genSwap(this, targetCell);
                }
            })();
        }
        
        // 重置状态
        this.targetCell = null;
        this.targetCellOriginalLeft = undefined;
        this.targetCellOriginalTop = undefined;
        this.dragDirection = null;
        dragCell = null;
    }
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
    
    // 更新连击显示
    if (combo >= 3) {
        comboElement.textContent = `COMBO x${combo}`;
        comboElement.style.color = '#ff6600';
        
        // 连击特效
        const comboDisplay = document.querySelector('.combo-display');
        createComboEffect(comboDisplay, combo);
        
        // 添加火焰特效
        if (combo >= 5) {
            scoreBoard.classList.add('score-flame');
            setTimeout(() => {
                scoreBoard.classList.remove('score-flame');
            }, 800);
        }
    } else {
        comboElement.textContent = combo;
        comboElement.style.color = '#ffcc00';
    }
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    // 加分时的分数抖动效果
    if (score > 0 && score % 100 === 0) {
        scoreElement.classList.add('score-shake');
        setTimeout(() => {
            scoreElement.classList.remove('score-shake');
        }, 300);
    }
}

// 创建连击计数特效
function createComboEffect(element, comboCount) {
    // 获取元素位置
    const rect = element.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();
    
    // 计算相对于游戏区域的位置 - 在计分板底部
    const x = rect.left - appRect.left + rect.width / 2;
    const y = rect.bottom - appRect.top; // 从元素底部开始
    
    // 根据连击次数创建不同的特效
    if (comboCount >= 5) {
        // 五次以上连击：红色系火焰
        createComboParticles(x, y, ['#ff0000', '#ff3300', '#ff6600', '#ff9900'], 15);
    } else if (comboCount >= 3) {
        // 三次连击：金色系粒子
        createComboParticles(x, y, ['#ffcc00', '#ffdd33', '#ffee66', '#ffff99'], 10);
    } else if (comboCount >= 2) {
        // 两次连击：白色系粒子
        createComboParticles(x, y, ['#ffffff', '#dddddd', '#bbbbbb', '#999999'], 6);
    }
}

// 创建连击粒子特效
function createComboParticles(x, y, colors, count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'pixel-particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机水平偏移
        const offsetX = (Math.random() - 0.5) * 30;
        
        // 初始位置
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = y + 'px';
        
        // 随机大小 - 使用整数大小，更符合像素风格
        const size = 4 + Math.floor(Math.random() * 4);
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 添加动画 - 使用像素火焰动画，从底部向上喷射
        const duration = 0.8 + Math.random() * 0.4;
        particle.style.animation = `pixelFlame ${duration}s ease-out forwards`;
        particle.style.animationDelay = Math.random() * 0.2 + 's';
        
        // 添加到游戏区域
        app.appendChild(particle);
        
        // 动画结束后移除
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + 0.2) * 1000);
    }
}

// 显示连击特效
function showComboEffect(comboCount) {
    // 获取计分板位置
    const scoreBoardRect = scoreBoard.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();
    
    // 计算相对于游戏区域的位置
    const relativeX = scoreBoardRect.left - appRect.left + scoreBoardRect.width / 2;
    const relativeY = scoreBoardRect.top - appRect.top;
    
    // 创建像素烟花效果
    createPixelFirework(relativeX, relativeY, '#ffcc00');
    
    // 创建像素火焰效果
    if (comboCount >= 3) {
        // 在计分板底部创建多个火焰
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createPixelFlame(
                    relativeX + (Math.random() - 0.5) * scoreBoardRect.width,
                    relativeY + scoreBoardRect.height,
                    '#ff6600'
                );
            }, i * 100);
        }
    }
    
    // 创建连击文字效果
    const comboEffect = document.createElement('div');
    comboEffect.className = 'combo-effect';
    comboEffect.textContent = `${comboCount}连击!`;
    comboEffect.style.left = '50%';
    comboEffect.style.top = '30%';
    comboEffect.style.transform = 'translate(-50%, -50%)';
    comboEffect.style.fontSize = '24px';
    comboEffect.style.fontWeight = 'bold';
    comboEffect.style.fontFamily = "'Press Start 2P', 'Microsoft YaHei', sans-serif";
    comboEffect.style.textShadow = '2px 2px 0 #000';
    comboEffect.style.zIndex = '150';
    app.appendChild(comboEffect);
    
    setTimeout(() => {
        if (comboEffect.parentNode) {
            app.removeChild(comboEffect);
        }
    }, 1500);
}

// 初始化游戏
let gameMap = new GameMap(6, 8, 80);
gameMap.genMatrix().genRandom();
gameMap.init().genCellMap();

// 初始化最高分显示
highScoreElement.textContent = highScore;

// 初始化后立即检查并消除已有的匹配
(async () => {
    await gameMap.genLoop();
})();

updateScore();

// 开始游戏计时器
function startGameTimer() {
    gameTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        // 时间少于10秒时，计时器变红
        if (timeLeft <= 10) {
            timerElement.style.color = '#ff0000';
        }
        
        // 时间结束
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            isGameActive = false;
            endGame();
        }
    }, 1000);
}

// 游戏结束
function endGame() {
    // 显示游戏结束信息
    const gameOverMessage = document.createElement('div');
    gameOverMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        font-family: 'Press Start 2P', cursive;
        z-index: 1000;
    `;
    gameOverMessage.innerHTML = `
        <h2>游戏结束!</h2>
        <p>最终得分: ${score}</p>
        <button id="restart-btn" style="
            margin-top: 10px;
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            background-color: #ff6600;
            border: 2px solid #ff9900;
            color: #fff;
            border-radius: 5px;
            font-family: 'Press Start 2P', cursive;
        ">重新开始</button>
    `;
    app.appendChild(gameOverMessage);
    
    // 添加重新开始按钮事件
    document.getElementById('restart-btn').addEventListener('click', () => {
        // 重置游戏
        score = 0;
        combo = 0;
        timeLeft = 60;
        isGameActive = true;
        updateScore();
        
        // 移除游戏结束消息
        app.removeChild(gameOverMessage);
        
        // 重新开始游戏
        gameMap.genShuffle();
        startGameTimer();
    });
}

// 启动游戏计时器
startGameTimer();

// 处理方块点击
let firstCell = null;
let secondCell = null;

app.addEventListener('click', (event) => {
    // 如果正在拖动，不处理点击事件
    if (isDragging) return;
    
    if (!gameMap.handleable || isSwapping) return;
    
    const target = event.target.closest('div');
    if (!target) return;
    
    const clickedCell = cells.find(cell => cell.instance === target);
    if (!clickedCell) return;
    
    if (!firstCell) {
        // 选择第一个方块
        firstCell = clickedCell;
        target.style.border = '5px solid yellow';
    } else if (firstCell === clickedCell) {
        // 取消选择
        firstCell.instance.style.border = '5px solid #888';
        firstCell = null;
    } else {
        // 选择第二个方块，尝试交换
        secondCell = clickedCell;
        
        // 检查是否相邻
        const isAdjacent = [
            firstCell.left, firstCell.right,
            firstCell.top, firstCell.bottom
        ].includes(secondCell);
        
        if (isAdjacent) {
            isSwapping = true;
            firstCell.instance.style.border = '5px solid #888';
            
            (async () => {
                // 交换方块
                await gameMap.genSwap(firstCell, secondCell);
                
                // 检查是否形成消除
                gameMap.markCollapseCells();
                const hasCollapse = gameMap.checkCollapse();
                
                if (hasCollapse) {
                    // 有消除，执行游戏循环
                    await gameMap.genLoop();
                } else {
                    // 没有消除，交换回来
                    await gameMap.genSwap(firstCell, secondCell);
                }
                
                firstCell = null;
                secondCell = null;
                isSwapping = false;
            })();
        } else {
            // 不相邻，重新选择
            firstCell.instance.style.border = '5px solid #888';
            firstCell = clickedCell;
            clickedCell.instance.style.border = '5px solid yellow';
        }
    }
});

// 添加鼠标事件监听器来处理拖动
app.addEventListener('mousedown', (event) => {
    if (!gameMap.handleable || isSwapping) return;
    
    const target = event.target.closest('div');
    if (!target) return;
    
    const clickedCell = cells.find(cell => cell.instance === target);
    if (!clickedCell) return;
    
    // 开始拖动
    clickedCell.startDrag(event.clientX, event.clientY);
    event.preventDefault();
});

document.addEventListener('mousemove', (event) => {
    if (isDragging && dragCell) {
        dragCell.drag(event.clientX, event.clientY);
        event.preventDefault();
    }
});

document.addEventListener('mouseup', (event) => {
    if (isDragging && dragCell) {
        dragCell.endDrag();
        event.preventDefault();
    }
});

// 洗牌按钮
btn.onclick = () => {
    if (!gameMap.handleable || !isGameActive) return;
    
    // 重置游戏状态
    score = 0;
    combo = 0;
    timeLeft = 60;
    updateScore();
    
    // 清除并重新设置计时器
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    startGameTimer();
    
    // 洗牌
    gameMap.genShuffle();
};

// 测试特效按钮
testEffectBtn.onclick = () => {
    // 模拟高连击
    const testCombo = 2 + Math.floor(Math.random() * 4); // 2-5连击
    combo = testCombo;
    
    // 更新计分板显示
    updateScore();
    
    // 重置连击数
    setTimeout(() => {
        combo = 0;
        updateScore();
    }, 2000);
};