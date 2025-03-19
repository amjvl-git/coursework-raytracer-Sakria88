//colour uv in box//
document.addEventListener('DOMContentLoaded', function() {
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

        magnitudeSquared() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }

        normalised() {
            let mag = this.magnitude();
            if (mag === 0) return new Vec3(0, 0, 0);
            return this.scale(1 / mag);
        }
    }

    function setPixel(x, y, color, ctx) {
        let imageData = ctx.createImageData(1, 1); // Create new pixel data
        let data = imageData.data;
        data[0] = Math.floor(color.x); // Red
        data[1] = Math.floor(color.y); // Green
        data[2] = Math.floor(color.z); // Blue
        data[3] = 255; // Alpha (fully opaque)
        ctx.putImageData(imageData, x, y);
    }

    function drawUVCoordinates() {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        let colour = new Vec3(0, 0, 0);
        let imageWidth = canvas.width;
        let imageHeight = canvas.height;

        for (let i = 0; i < imageWidth; i++) {
            for (let j = 0; j < imageHeight; j++) { // Changed from <= to < for correct indexing
                let u = i / (imageWidth - 1);
                let v = j / (imageHeight - 1);

                colour.x = u * 255;
                colour.y = v * 255;
                colour.z = 0; // Keeping blue at 0 for a two-color gradient effect

                setPixel(i, j, colour, ctx);
            }
        }
    }

    drawUVCoordinates();
});


//sphere and ray casting architecture//
document.addEventListener('DOMContentLoaded', function() {
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
            return Math.sqrt(this.magnitudeSquared());
        }

        magnitudeSquared() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }

        normalised() {
            let mag = this.magnitude();
            if (mag === 0) return new Vec3(0, 0, 0);
            return this.scale(1 / mag);
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
            let a = ray.direction.dot(ray.direction);
            let b = oc.dot(ray.direction);
            let c = oc.dot(oc) - this.radius * this.radius;
            let discriminant = b * b - a * c;

            if (discriminant > 0) {
                let t1 = (-b - Math.sqrt(discriminant)) / a;
                let t2 = (-b + Math.sqrt(discriminant)) / a;
                return t1 > 0 ? t1 : t2; // Return the nearest positive t-value
            }
            return -1; // No hit
        }
    }

    class RayCastResult {
        constructor(position, normal, t, sphereIndex) {
            this.position = position;
            this.normal = normal;
            this.t = t;
            this.sphereIndex = sphereIndex;
        }
    }

    function rayHit(ray, t, sphereIndex) {
        let intersectionPoint = ray.pointAt(t);
        let intersectionNormal = intersectionPoint.minus(spheres[sphereIndex].center).normalised();
        return new RayCastResult(intersectionPoint, intersectionNormal, t, sphereIndex);
    }

    function miss() {
        return new RayCastResult(new Vec3(0, 0, 0), new Vec3(0, 0, 0), -1, -1);
    }

    function backgroundColour(ray) {
        let white = new Vec3(1, 1, 1);
        let blue = new Vec3(0.3, 0.5, 0.9);
        let t = 0.5 * (ray.direction.y + 1.0);
        return white.scale(1 - t).add(blue.scale(t));
    }

    const spheres = [
        new Sphere(new Vec3(0, 0, -1), 0.3, new Vec3(1, 0, 0)), // Red sphere
        new Sphere(new Vec3(0, 0.2, -0.8), 0.15, new Vec3(0, 0, 1)), // Blue sphere
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0)) // Big green sphere
    ];

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

        if (closestSphereIndex === -1) return miss();

        return rayHit(ray, closestT, closestSphereIndex);
    }

    function rayColor(ray) {
        let castResult = traceRay(ray);

        if (castResult.t < 0) return backgroundColour(ray);

        return spheres[castResult.sphereIndex].color; // Return sphere color
    }

    function setPixel(x, y, color, ctx) {
        let imageData = ctx.createImageData(1, 1);
        let data = imageData.data;
        data[0] = Math.floor(color.x * 255);
        data[1] = Math.floor(color.y * 255);
        data[2] = Math.floor(color.z * 255);
        data[3] = 255; // Alpha (fully opaque)
        ctx.putImageData(imageData, x, y);
    }

    function drawScene() {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        let imageWidth = canvas.width;
        let imageHeight = canvas.height;

        let origin = new Vec3(0, 0, 0);

        for (let i = 0; i < imageWidth; i++) {
            for (let j = 0; j < imageHeight; j++) {
                let u = i / (imageWidth - 1);
                let v = j / (imageHeight - 1);

                let direction = new Vec3(u * 2 - 1, v * 2 - 1, -1);
                let ray = new Ray(origin, direction);
                let color = rayColor(ray);

                setPixel(i, j, color, ctx);
            }
        }
    }

    drawScene();
});


