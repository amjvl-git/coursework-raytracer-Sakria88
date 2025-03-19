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
            return mag > 0 ? this.scale(1 / mag) : new Vec3(0, 0, 0);
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
                return t1 > 0 ? t1 : t2;
            }
            return -1;
        }
    }

    const spheres = [
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0)),  // Green ground
        new Sphere(new Vec3(0, 0, -1), 0.4, new Vec3(1, 0, 0)),         // Red sphere
        new Sphere(new Vec3(0, 0.3, -0.8), 0.2, new Vec3(0, 0, 1))      // Blue sphere
    ];

    let lightDirection = new Vec3(-1.1, -1.3, -1.5).normalised();

    function traceRay(ray) {
        let closestT = Infinity;
        let hitSphere = null;

        for (let sphere of spheres) {
            let t = sphere.rayIntersects(ray);
            if (t > 0 && t < closestT) {
                closestT = t;
                hitSphere = sphere;
            }
        }

        if (!hitSphere) return null;
        return { t: closestT, sphere: hitSphere };
    }

    function rayColor(ray) {
        let hit = traceRay(ray);
        if (!hit) {
            let t = 0.5 * (ray.direction.y + 1.0);
            return new Vec3(1, 1, 1).scale(1 - t).add(new Vec3(0.5, 0.7, 1.0).scale(t));
        }

        let hitPoint = ray.pointAt(hit.t);
        let normal = hitPoint.minus(hit.sphere.center).normalised();
        let diffuse = Math.max(normal.dot(lightDirection), 0);
        return hit.sphere.color.scale(diffuse);
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
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
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
