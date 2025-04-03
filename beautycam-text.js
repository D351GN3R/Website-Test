var maxDist;
var mouse = { x: 0, y: 0 };
var cursor = {
    x: window.innerWidth,
    y: window.innerHeight
};

Math.dist = function(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    return Math.sqrt(Math.pow(dx, 2), Math.pow(dy, 2));
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
    span.style.fontFamily = 'Compressa VF';
    
    // 为不同字母设置不同的默认宽度和字重
    var charWidths = {
        'B': 200,
        'E': 175,
        'A': 150,
        'U': 125,
        'T': 100,
        'Y': 75,
        'C': 50,
        'A': 35,
        'M': 25
    };
    
    var charWeights = {
        'B': 900,
        'E': 800,
        'A': 700,
        'U': 600,
        'T': 500,
        'Y': 400,
        'C': 300,
        'A': 200,
        'M': 100
    };
    
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
        var defaultWidth = charWidths[char] || 100;
        this.wdth = args.wdth ? ~~this.getAttr(dist, defaultWidth, defaultWidth + 100) : defaultWidth;
        var defaultWeight = charWeights[char] || 600;
        this.wght = args.wght ? ~~this.getAttr(dist, 200, 900) : defaultWeight;
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

var VFont = function(elementId) {
    this.scale = false;
    this.flex = true;
    this.alpha = false;
    this.stroke = false;
    this.width = true;
    this.weight = true;
    this.italic = true;
    var title, str, chars = [];

    this.init = function() {
        title = document.getElementById(elementId);
        str = title.innerText;
        title.innerHTML = "";
        for (var i = 0; i < str.length; i++) {
            var _char = new Char(title, str[i]);
            chars.push(_char);
        }
        this.set();
        window.addEventListener("resize", this.setSize.bind(this));
    }

    this.set = function() {
        title.className = "";
        title.className += this.flex ? " flex" : "";
        title.className += this.stroke ? " stroke" : "";
        this.setSize();
    }

    this.setSize = function() {
        var containerWidth = title.parentElement.getBoundingClientRect().width;
        var containerHeight = title.parentElement.getBoundingClientRect().height;
        var fontSize = Math.min(containerWidth / (str.length * 0.8), containerHeight * 0.8);
        title.style = "font-size: " + fontSize + "px; letter-spacing: -0.02em;";
        if (this.scale) {
            var scaleY = (window.innerHeight / title.getBoundingClientRect().height).toFixed(2);
            var lineHeight = scaleY * 0.8;
            title.style = "font-size: " + fontSize + "px; transform: scale(1," + scaleY + "); line-height: " + lineHeight + "em; letter-spacing: -0.02em;";
        }
    }

    this.animate = function() {
        maxDist = Math.max(window.innerWidth, window.innerHeight);
        mouse.x += (cursor.x - mouse.x) / 30;
        mouse.y += (cursor.y - mouse.y) / 30;
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    this.render = function() {
        chars.forEach(function(c) {
            c.update({
                wght: this.weight,
                wdth: this.width,
                ital: this.italic,
                alpha: this.alpha
            });
        }.bind(this));
    }

    this.init();
    this.animate();
    return this;
}

window.addEventListener("load", function() {
    var text = new VFont("beautycam-text");
});