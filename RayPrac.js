document.addEventListener('DOMContentLoaded', function () {
    class Vec3 {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        add(other) {
            return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
        }

        minus(other) {
            return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
        }

        scale(scalar) {
            return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
        }

        multiply(other) {
            return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
        }

        dot(other) {
            return this.x * other.x + this.y * other.y + this.z * other.z;
        }

        normalised() {
            let mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            return mag === 0 ? new Vec3(0, 0, 0) : this.scale(1 / mag);
        }

        clamp(min, max) {
            return new Vec3(
                Math.min(max, Math.max(min, this.x)),
                Math.min(max, Math.max(min, this.y)),
                Math.min(max, Math.max(min, this.z))
            );
        }

        gammaCorrect() {
            return new Vec3(
                Math.pow(this.x, 1 / 2.2),
                Math.pow(this.y, 1 / 2.2),
                Math.pow(this.z, 1 / 2.2)
            );
        }
    }

    class Ray {
        constructor(origin, direction) {
            this.origin = origin;
            this.direction = direction.normalised();
        }

        pointAt(t) {
            return this.origin.add(this.direction.scale(t));
        }
    }

    class Sphere {
        constructor(center, radius, color) {
            this.center = center;
            this.radius = radius;
            this.color = color;
        }

        rayIntersects(ray) {
            let oc = ray.origin.minus(this.center);
            let b = oc.dot(ray.direction);
            let c = oc.dot(oc) - this.radius * this.radius;
            let discriminant = b * b - c;

            if (discriminant > 0) {
                let t1 = -b - Math.sqrt(discriminant);
                let t2 = -b + Math.sqrt(discriminant);
                if (t1 > 0) return t1;
                if (t2 > 0) return t2;
            }
            return -1;
        }
    }

    function backgroundColour(ray) {
        let white = new Vec3(1, 1, 1);
        let blue = new Vec3(0.5, 0.7, 1.0);  // More vibrant background
        let t = 0.5 * (ray.direction.y + 1.0);
        return white.scale(1 - t).add(blue.scale(t));
    }

    // 🎯 Spheres with vivid pink and purple colors
    const spheres = [
        new Sphere(new Vec3(0, 0, -1), 0.3, new Vec3(1, 0, 0.6)),    // Pink sphere
        new Sphere(new Vec3(0, 0.2, -0.8), 0.15, new Vec3(0.5, 0, 1)),  // Purple sphere
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0))    // Green ground
    ];

    let lightDirection = new Vec3(-1, -1, -1).normalised();

    function traceRay(ray) {
        let closestT = Infinity;
        let closestSphere = null;

        for (let sphere of spheres) {
            let t = sphere.rayIntersects(ray);
            if (t > 0 && t < closestT) {
                closestT = t;
                closestSphere = sphere;
            }
        }

        if (!closestSphere) return backgroundColour(ray);

        let hitPoint = ray.pointAt(closestT);
        let normal = hitPoint.minus(closestSphere.center).normalised();

        // ✅ Base color without interference
        let baseColor = closestSphere.color;

        // 🌟 Lighting
        let ambient = 0.1;  // Low ambient for better color contrast
        let diffuse = Math.max(0, normal.dot(lightDirection));

        // 🌑 Shadow ray logic
        let shadowRayOrigin = hitPoint.add(normal.scale(0.001));
        let shadowRay = new Ray(shadowRayOrigin, lightDirection);
        let inShadow = false;

        for (let sphere of spheres) {
            if (sphere !== closestSphere && sphere.rayIntersects(shadowRay) > 0) {
                inShadow = true;
                break;
            }
        }

        if (inShadow) diffuse *= 0.3;

        // ✅ Lighting effect with sharp contrast and no color dulling
        let lightingEffect = new Vec3(diffuse + ambient, diffuse + ambient, diffuse + ambient);

        // ✅ Base color multiplied by lighting without losing vibrancy
        let finalColor = baseColor.multiply(lightingEffect).clamp(0, 1);

        // 🔥 Gamma correction and color boost for vibrancy
        finalColor = finalColor.scale(1.4).clamp(0, 1).gammaCorrect();

        return finalColor;
    }

    function setPixel(x, y, color, ctx) {
        let imageData = ctx.createImageData(1, 1);
        let data = imageData.data;

        data[0] = Math.floor(color.x * 255);
        data[1] = Math.floor(color.y * 255);
        data[2] = Math.floor(color.z * 255);
        data[3] = 255;

        ctx.putImageData(imageData, x, y);
    }

    function drawScene() {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        let imageWidth = canvas.width;
        let imageHeight = canvas.height;

        let origin = new Vec3(0, 0, 0);

        function renderLine(j) {
            for (let i = 0; i < imageWidth; i++) {
                let u = (i / imageWidth) * 2 - 1;
                let v = (1 - j / imageHeight) * 2 - 1;

                u *= imageWidth / imageHeight;

                let direction = new Vec3(u, v, -1).normalised();
                let ray = new Ray(origin, direction);
                let color = traceRay(ray);

                setPixel(i, j, color, ctx);
            }

            if (j < imageHeight - 1) {
                requestAnimationFrame(() => renderLine(j + 1));
            }
        }

        renderLine(0);
    }

    drawScene();
});


