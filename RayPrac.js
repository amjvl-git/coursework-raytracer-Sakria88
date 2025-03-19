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
        new Sphere(new Vec3(0, 0, -1), 0.3, new Vec3(1, 0, 0)),   // Red sphere (stationary)
        new Sphere(new Vec3(0.5, 0.2, -1), 0.15, new Vec3(0, 0, 1)), // Blue sphere (rotating)
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0)) // Green ground
    ];

    // Global light direction
    let lightDirection = new Vec3(-1.1, -1.3, -1.5).normalised();
    let negLightDirection = new Vec3(-lightDirection.x, -lightDirection.y, -lightDirection.z);
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

        if (closestSphereIndex === -1) return miss();

        return rayHit(ray, closestT, closestSphereIndex);
    }

    function rayColor(ray) {
        let castResult = traceRay(ray);

        if (castResult.t < 0) return backgroundColour(ray);

        let albedo = spheres[castResult.sphereIndex].color;

        // Ambient lighting
        let ambient = 0.2;

        // Shadow ray logic
        let shadowRayOrigin = castResult.position.add(castResult.normal.scale(0.001));  // Offset to prevent self-shadowing
        let shadowRay = new Ray(shadowRayOrigin, negLightDirection);

        let inShadow = false;
        for (let i = 0; i < spheres.length; i++) {
            if (i !== castResult.sphereIndex && spheres[i].rayIntersects(shadowRay) > 0) {
                inShadow = true;
                break;
            }
        }

        // Diffuse lighting (disabled if in shadow)
        let diffuse = inShadow ? 0 : Math.max(castResult.normal.dot(negLightDirection), 0);

        // Specular lighting
        let reflection = negLightDirection.minus(
            castResult.normal.scale(2 * negLightDirection.dot(castResult.normal))
        ).normalised();
        let viewDir = ray.direction.scale(-1);
        let specular = inShadow ? 0 : Math.pow(Math.max(reflection.dot(viewDir), 0), 32);

        // Final color calculation
        let colour = albedo.scale(diffuse + ambient).add(new Vec3(1, 1, 1).scale(specular * 0.5));

        return colour;
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

        // Rotate the blue sphere around the red sphere
        angle += 0.02;  // Adjust rotation speed
        let radius = 0.5;
        spheres[1].center = new Vec3(
            Math.cos(angle) * radius,
            0.2,
            Math.sin(angle) * radius - 1
        );

        for (let j = 0; j < imageHeight; j++) {
            for (let i = 0; i < imageWidth; i++) {
                let u = (i / (imageWidth - 1)) * 2 - 1;
                let v = (1 - j / (imageHeight - 1)) * 2 - 1;

                u *= imageWidth / imageHeight;

                let direction = new Vec3(u, v, -1).normalised();
                let ray = new Ray(origin, direction);
                let color = rayColor(ray);

                setPixel(i, j, color, ctx);
            }
        }

        requestAnimationFrame(drawScene);
    }

    drawScene();
});
