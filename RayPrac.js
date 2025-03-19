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

        multiply(other) {
            return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
        }

        scale(scalar) {
            return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
        }

        dot(other) {
            return this.x * other.x + this.y * other.y + this.z * other.z;
        }

        magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }

        normalised() {
            let mag = this.magnitude();
            return mag === 0 ? new Vec3(0, 0, 0) : this.scale(1 / mag);
        }

        rotateY(angle) {
            let cos = Math.cos(angle);
            let sin = Math.sin(angle);
            return new Vec3(
                this.x * cos - this.z * sin,
                this.y,
                this.x * sin + this.z * cos
            );
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
            return -1;  // No hit
        }
    }

    const spheres = [
        new Sphere(new Vec3(0, 0, -1), 0.3, new Vec3(1, 0, 0)),   // Red sphere
        new Sphere(new Vec3(0, 0.2, -0.8), 0.15, new Vec3(0, 0, 1)), // Blue sphere
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0)) // Green ground
    ];

    let lightDirection = new Vec3(-1.1, -1.3, -1.5).normalised();
    let angle = 0;

    function traceRay(ray) {
        let closestT = Infinity;
        let closestSphereIndex = -1;

        for (let i = 0; i < spheres.length; i++) {
            let t = spheres[i].rayIntersects(ray);
            if (t > 0 && t < closestT) {
                closestT = t;
                closestSphereIndex = i;
            }
        }

        if (closestSphereIndex === -1) return new Vec3(0.5, 0.7, 1.0);  // Background color

        let hitSphere = spheres[closestSphereIndex];
        let hitPoint = ray.origin.add(ray.direction.scale(closestT));
        let normal = hitPoint.minus(hitSphere.center).normalised();

        // Lighting
        let lightDir = lightDirection.normalised();
        let diffuse = Math.max(normal.dot(lightDir), 0);
        let color = hitSphere.color.scale(diffuse).add(hitSphere.color.scale(0.2));  // Add ambient light

        return color;
    }

    function setPixel(x, y, color, ctx) {
        let imageData = ctx.createImageData(1, 1);
        let data = imageData.data;
        data[0] = Math.floor(color.x * 255);
        data[1] = Math.floor(color.y * 255);
        data[2] = Math.floor(color.z * 255);
        data[3] = 255;  // Alpha (fully opaque)
        ctx.putImageData(imageData, x, y);
    }

    function drawScene() {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        let imageWidth = canvas.width;
        let imageHeight = canvas.height;

        let origin = new Vec3(0, 0, 0);

        // Rotate the sphere position
        angle += 0.02;  // Adjust rotation speed
        spheres[0].center = new Vec3(0, 0, -1).rotateY(angle);

        for (let j = 0; j < imageHeight; j++) {
            for (let i = 0; i < imageWidth; i++) {
                let u = (i / (imageWidth - 1)) * 2 - 1;
                let v = (1 - j / (imageHeight - 1)) * 2 - 1;

                u *= imageWidth / imageHeight;  // Aspect ratio correction

                let direction = new Vec3(u, v, -1).normalised();
                let ray = new Ray(origin, direction);
                let color = traceRay(ray);

                setPixel(i, j, color, ctx);
            }
        }

        requestAnimationFrame(drawScene);
    }

    drawScene();
});
