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

        // Rotation around the Y-axis
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
            return -1;  // No hit
        }
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // Initialize spheres
    const spheres = [
        new Sphere(new Vec3(0.7, 0, -1), 0.2, new Vec3(1, 0, 0)),  // Red sphere
        new Sphere(new Vec3(-0.7, 0, -1), 0.2, new Vec3(0, 0, 1)), // Blue sphere
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0))  // Ground
    ];

    let angle = 0;
    let lightAngle = 0;

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

        if (!closestSphere) return new Vec3(0.5, 0.7, 1.0);  // Background color

        let hitPoint = ray.pointAt(closestT);
        let normal = hitPoint.minus(closestSphere.center).normalised();

        // Lighting
        let lightDir = new Vec3(
            Math.cos(lightAngle) * 1.5, 
            -1.3, 
            Math.sin(lightAngle) * 1.5
        ).normalised();

        let diffuse = Math.max(normal.dot(lightDir), 0);
        let color = closestSphere.color.scale(diffuse).add(closestSphere.color.scale(0.2));  // Add ambient

        return color;
    }

    function setPixel(x, y, color) {
        let imageData = ctx.createImageData(1, 1);
        let data = imageData.data;
        data[0] = Math.floor(color.x * 255);
        data[1] = Math.floor(color.y * 255);
        data[2] = Math.floor(color.z * 255);
        data[3] = 255;  // Fully opaque
        ctx.putImageData(imageData, x, y);
    }

    function drawScene() {
        const width = canvas.width;
        const height = canvas.height;

        let origin = new Vec3(0, 0, 0);

        // Rotate the spheres around each other
        let orbitRadius = 0.8;
        let speed = 0.05;  // Increased speed

        angle += speed;  // Rotate faster

        // Red sphere orbits clockwise
        spheres[0].center = new Vec3(
            Math.cos(angle) * orbitRadius,
            0,
            Math.sin(angle) * orbitRadius - 1
        );

        // Blue sphere orbits counter-clockwise
        spheres[1].center = new Vec3(
            Math.cos(-angle) * orbitRadius,
            0,
            Math.sin(-angle) * orbitRadius - 1
        );

        // Lighting follows the rotation
        lightAngle += speed * 0.8;  // Sync lighting speed

        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let u = (i / (width - 1)) * 2 - 1;
                let v = (1 - j / (height - 1)) * 2 - 1;

                u *= width / height;  // Aspect ratio correction

                let direction = new Vec3(u, v, -1).normalised();
                let ray = new Ray(origin, direction);
                let color = traceRay(ray);

                setPixel(i, j, color);
            }
        }

        requestAnimationFrame(drawScene);
    }

    drawScene();
});
