var maxDist;
var mouse = { x: 0, y: 0 };
var cursor = {
    x: window.innerWidth,
    y: window.innerHeight
};

Math.dist = function(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

window.addEventListener("mousemove", function(e) {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});

window.addEventListener("touchmove", function(e) {
    var t = e.touches[0];
    cursor.x = t.clientX;
    cursor.y = t.clientY;
}, {
    passive: false
});

var Char = function(container, char) {
    var span = document.createElement("span");
    span.setAttribute('data-char', char);
    span.innerText = char;
    container.appendChild(span);
    this.getDist = function() {
        this.pos = span.getBoundingClientRect();
        return Math.dist(mouse, {
            x: this.pos.x + (this.pos.width / 1.75),
            y: this.pos.y
        });
    }
    this.getAttr = function(dist, min, max) {
        var wght = max - Math.abs((max * dist / maxDist));
        return Math.max(min, wght + min);
    }
    this.update = function(args) {
        var dist = this.getDist();
        this.wdth = args.wdth ? ~~this.getAttr(dist, 50, 200) : 100; // 调整最小宽度为50，避免过窄
        this.wght = args.wght ? ~~this.getAttr(dist, 100, 1000) : 400;
        this.alpha = args.alpha ? this.getAttr(dist, 0, 1).toFixed(2) : 1;
        this.ital = args.ital ? this.getAttr(dist, 0, 1).toFixed(2) : 0;
        this.draw();
    }
    this.draw = function() {
        var style = "";
        style += "opacity: " + this.alpha + ";";
        style += "font-variation-settings: 'wght' " + this.wght + ", 'wdth' " + this.wdth + ", 'ital' " + this.ital + ";";
        span.style = style;
    }
    return this;
}

var VFont = function() {
    this.scale = false;
    this.flex = true;
    this.alpha = false;
    this.stroke = false;
    this.width = true;
    this.weight = true;
    this.italic = false;
    this.forceFirstChar = true;
    this.isHovered = false;
    var title, str, chars = [];

    this.init = function() {
        title = document.getElementById("beautycam-text");
        str = title.innerText;
        title.innerHTML = "";
        for (var i = 0; i < str.length; i++) {
            var _char = new Char(title, str[i]);
            chars.push(_char);
        }
        this.set();
        window.addEventListener("resize", this.setSize.bind(this));
        
        // 添加hover事件监听
        title.addEventListener('mouseenter', () => {
            this.forceFirstChar = false;
            this.isHovered = true;
        });

        title.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.forceFirstChar = true;
        });
        
        // 页面刷新时恢复默认状态
        window.addEventListener('beforeunload', () => {
            this.forceFirstChar = true;
            this.isHovered = false;
        });
    }

    this.set = function() {
        title.className = "dynamic-text";
        this.setSize();
    }

    this.setSize = function() {
        var containerWidth = title.parentElement.getBoundingClientRect().width - 48; // 减去左右24px的padding
        var fontSize = containerWidth / (str.length / 1.25); // 调整字号计算比例，使字母更宽
        title.style.fontSize = fontSize + "px";
        title.style.letterSpacing = "0.1em"; // 添加固定字间距
    }

    this.animate = function() {
        // 强制设置第一个字母的位置为hover状态
        if(this.forceFirstChar && chars.length > 0) {
            var firstCharPos = chars[0].pos || chars[0].getDist();
            mouse.x = firstCharPos.x + (firstCharPos.width / 1.75);
            mouse.y = firstCharPos.y;
        }
        mouse.x += (cursor.x - mouse.x) / 20;
        mouse.y += (cursor.y - mouse.y) / 20;
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    this.render = function() {
        maxDist = title.getBoundingClientRect().width / 2;
        for (var i = 0; i < chars.length; i++) {
            if (!this.isHovered) {
                // 非hover状态下重置字体样式
                chars[i].wdth = 100;
                chars[i].wght = 400;
                chars[i].alpha = 1;
                chars[i].ital = 0;
                chars[i].draw();
                continue;
            }
            chars[i].update({
                wght: this.weight,
                wdth: this.width,
                ital: this.italic,
                alpha: this.alpha
            });
        }
    }
    this.init();
    this.animate();
    return this;
}

document.addEventListener('DOMContentLoaded', function() {
    var txt = new VFont();
});