const colors = [
    "#eec996",
    "#8fb7d3",
    "#b7d4c6",
    "#c3bedd",
    "#f1d5e4",
    "#cae1d3",
    "#f3c89d",
    "#d0b0c3",
    "#819d53",
    "#c99294",
    "#cec884",
    "#ff8e70",
    "#e0a111",
    "#fffdf6",
    "#cbd7ac",
    "#e8c6c0",
    "#dc9898",
    "#ecc8ba",
]; //用来设置的颜色
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let count = 1;

var ww = window.innerWidth;
var wh = window.innerHeight;

var hearts = [];

function init() {
    requestAnimationFrame(render);
    canvas.width = ww;
    canvas.height = wh;
    for (var i = 0; i < 100; i++) {
        hearts.push(new Heart());
    }
}

function Heart() {
    this.x = Math.random() * ww;
    this.y = Math.random() * wh;
    this.opacity = Math.random() * 0.8 + 0.5;
    this.vel = {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
    };
    this.targetScale = Math.random() * 0.15 + 0.02;
    this.scale = this.targetScale * Math.random();
}

Heart.prototype.update = function (i) {
    this.x += this.vel.x;
    this.y += this.vel.y;

    this.scale += (this.targetScale - this.scale) * 0.01;
    if (this.x - this.width > ww || this.x + this.width < 0) {
        this.scale = 0;
        this.x = Math.random() * ww;
    }
    if (this.y - this.height > wh || this.y + this.height < 0) {
        this.scale = 0;
        this.y = Math.random() * wh;
    }
    this.width = 473.8;
    this.height = 408.6;
};
Heart.prototype.draw = function (i) {
    ctx.globalAlpha = this.opacity;
    ctx.font = `${180 * this.scale}px "微软雅黑"`;
    // ctx.font="20px";
    ctx.fillStyle = colors[i % 18];
    ctx.fillText(
        "刘宇珂，我喜欢你",
        this.x - this.width * 0.5,
        this.y - this.height * 0.5,
        this.width,
        this.height
    );

};

function render() {
    ctx.clearRect(0, 0, ww, wh);
    // ctx.globalAlpha = 1;
    // ctx.fillStyle = "rgba(255,255,255,0.3)";
    // ctx.fillRect(0, 0, ww, wh);
    for (var i = 0; i < 100; i++) {
        hearts[i].update(i);
        hearts[i].draw(i);
    }
    requestAnimationFrame(render);
}
init();

window.addEventListener("resize", function () {
    ww = window.innerWidth;
    wh = window.innerHeight;
});

var settings = {
    particles: {
        length: 500, // maximum amount of particles
        duration: 2, // particle duration in sec
        velocity: 100, // particle velocity in pixels/sec
        effect: -0.75, // play with this for a nice effect
        size: 30, // particle size in pixels
    },
};

/*
 * RequestAnimationFrame polyfill by Erik M?ller
 */
(function () {
    var b = 0;
    var c = ["ms", "moz", "webkit", "o"];
    for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
        window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
        window.cancelAnimationFrame =
            window[c[a] + "CancelAnimationFrame"] ||
            window[c[a] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (h, e) {
            var d = new Date().getTime();
            var f = Math.max(0, 16 - (d - b));
            var g = window.setTimeout(function () {
                h(d + f);
            }, f);
            b = d + f;
            return g;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (d) {
            clearTimeout(d);
        };
    }
})();

/*
 * Point class
 */
var Point = (function () {
    function Point(x, y) {
        this.x = typeof x !== "undefined" ? x : 0;
        this.y = typeof y !== "undefined" ? y : 0;
    }
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.length = function (length) {
        if (typeof length == "undefined")
            return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
    };
    Point.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    };
    return Point;
})();

/*
 * Particle class
 */

var Particle = (function () {
    function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }
    Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };
    Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    };
    Particle.prototype.draw = function (context, image) {
        function ease(t) {
            return --t * t * t + 1;
        }
        var size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(
            image,
            this.position.x - size / 2,
            this.position.y - size / 2,
            size,
            size
        );
    };
    return Particle;
})();

/*
 * ParticlePool class
 */
var ParticlePool = (function () {
    var particles,
        firstActive = 0,
        firstFree = 0,
        duration = settings.particles.duration;

    function ParticlePool(length) {
        // create and populate particle pool
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++)
            particles[i] = new Particle();
    }
    ParticlePool.prototype.add = function (x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);

        // handle circular queue
        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
    };
    ParticlePool.prototype.update = function (deltaTime) {
        var i;

        // update active particles
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
                particles[i].update(deltaTime);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
                particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
        }

        // remove inactive particles
        while (
            particles[firstActive].age >= duration &&
            firstActive != firstFree
            ) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        }
    };
    ParticlePool.prototype.draw = function (context, image) {
        // draw active particles
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
                particles[i].draw(context, image);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
                particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
        }
    };
    return ParticlePool;
})();

/*
 * Putting it all together
 */
(function (canvas) {
    var context = canvas.getContext("2d"),
        particles = new ParticlePool(settings.particles.length),
        particleRate =
            settings.particles.length / settings.particles.duration, // particles/sec
        time;

    // get point on heart with -PI <= t <= PI
    function pointOnHeart(t) {
        return new Point(
            160 * Math.pow(Math.sin(t), 3),
            130 * Math.cos(t) -
            50 * Math.cos(2 * t) -
            20 * Math.cos(3 * t) -
            10 * Math.cos(4 * t) +
            25
        );
    }

    // creating the particle image using a dummy canvas
    var image = (function () {
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");
        canvas.width = settings.particles.size;
        canvas.height = settings.particles.size;
        // helper function to create the path
        function to(t) {
            var point = pointOnHeart(t);
            point.x =
                settings.particles.size / 2 +
                (point.x * settings.particles.size) / 350;
            point.y =
                settings.particles.size / 2 -
                (point.y * settings.particles.size) / 350;
            return point;
        }
        // create the path
        context.beginPath();
        var t = -Math.PI;
        var point = to(t);
        context.moveTo(point.x, point.y);
        while (t < Math.PI) {
            t += 0.01; // baby steps!
            point = to(t);
            context.lineTo(point.x, point.y);
        }
        context.closePath();
        // create the fill
        context.fillStyle = "#ea80b0";
        context.fill();
        // create the image
        var image = new Image();
        image.src = canvas.toDataURL();
        return image;
    })();

    // render that thing!
    function render() {
        // next animation frame
        requestAnimationFrame(render);

        // update time
        var newTime = new Date().getTime() / 1000,
            deltaTime = newTime - (time || newTime);
        time = newTime;

        // clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // create new particles
        var amount = particleRate * deltaTime;
        for (var i = 0; i < amount; i++) {
            var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
            var dir = pos.clone().length(settings.particles.velocity);
            particles.add(
                canvas.width / 2 + pos.x,
                canvas.height / 2 - pos.y,
                dir.x,
                -dir.y
            );
        }

        // update and draw particles
        particles.update(deltaTime);
        particles.draw(context, image);
    }

    // handle (re-)sizing of the canvas
    function onResize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    window.onresize = onResize;

    // delay rendering bootstrap
    setTimeout(function () {
        onResize();
        render();
    }, 10);
})(document.getElementById("pinkboard"));