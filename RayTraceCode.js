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

        lerp(target, t) {
            return new Vec3(
                this.x + (target.x - this.x) * t,
                this.y + (target.y - this.y) * t,
                this.z + (target.z - this.z) * t
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
        new Sphere(new Vec3(0.5, 0.2, -1), 0.15, new Vec3(0, 0, 1)), // Blue sphere (movable)
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0, 1, 0)) // Green ground
    ];

    // Light direction
    let lightDirection = new Vec3(-1.1, -1.3, -1.5).normalised();
    let negLightDirection = new Vec3(-lightDirection.x, -lightDirection.y, -lightDirection.z);

    // Mouse variables
    let isDragging = false;
    let targetPosition = spheres[1].center;
    let animationProgress = 1;  // Starts fully complete

    const moveSpeed = 0.1;  // Faster movement: 0.1 seconds

    const canvas = document.getElementById("canvas");

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) {  // Left mouse button
            isDragging = true;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            let rect = canvas.getBoundingClientRect();
            let x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
            let y = 1 - ((event.clientY - rect.top) / canvas.height) * 2;

            let newX = x * (canvas.width / canvas.height);
            let newZ = -1;

            // Keep the blue orbiting around the red sphere
            let redCenter = spheres[0].center;
            let distX = newX - redCenter.x;
            let distZ = newZ - redCenter.z;

            let distance = Math.sqrt(distX * distX + distZ * distZ);

             // Radius around red 
            let orbitRadius = 0.6; 
            if (distance > orbitRadius) {
                let scale = orbitRadius / distance;
                newX = redCenter.x + distX * scale;
                newZ = redCenter.z + distZ * scale;
            }

            targetPosition = new Vec3(newX, spheres[1].center.y, newZ);
            animationProgress = 0;  // Reset animation
        }
    });

    function updateBlueSphere(deltaTime) {
        if (animationProgress < 1) {
            animationProgress += deltaTime / moveSpeed;
            if (animationProgress > 1) {
                animationProgress = 1;
            }

            spheres[1].center = spheres[1].center.lerp(targetPosition, animationProgress);
        }
    }

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

        // Lighting
        let ambient = 0.2;

        let shadowRayOrigin = castResult.position.add(castResult.normal.scale(0.001));
        let shadowRay = new Ray(shadowRayOrigin, negLightDirection);

        let inShadow = false;
        for (let i = 0; i < spheres.length; i++) {
            if (i !== castResult.sphereIndex && spheres[i].rayIntersects(shadowRay) > 0) {
                inShadow = true;
                break;
            }
        }

        let diffuse = inShadow ? 0 : Math.max(castResult.normal.dot(negLightDirection), 0);
        let colour = albedo.scale(diffuse + ambient);

        return colour;
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

    function drawScene(deltaTime) {
        let ctx = canvas.getContext("2d");
        updateBlueSphere(deltaTime);

        for (let j = 0; j < canvas.height; j++) {
            for (let i = 0; i < canvas.width; i++) {
                let direction = new Vec3(i / canvas.width * 2 - 1, 1 - j / canvas.height * 2, -1).normalised();
                let ray = new Ray(new Vec3(0, 0, 0), direction);
                let color = rayColor(ray);
                setPixel(i, j, color, ctx);
            }
        }

        requestAnimationFrame(() => drawScene(1 / 60));
    }

    drawScene(1 / 60);
});


