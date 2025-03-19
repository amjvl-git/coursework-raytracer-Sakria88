class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction.normalized(); // Normalize direction vector
    }

    // Returns the point along the ray at parameter t
    pointAt(t) {
        return this.origin.add(this.direction.scale(t));
    }
}

function gradientBackground(u, v) {
    // Implement a UV-based gradient from white at the top to blue at the bottom
    let color = new Vec3(1 - v, 1 - v, 1);  // A gradient from white (top) to blue (bottom)
    return color;
}


class Camera {
    constructor(lookFrom, lookAt, up, fov, aspectRatio, near, far) {
        this.origin = lookFrom;
        this.lowerLeftCorner = null;
        this.horizontal = null;
        this.vertical = null;
        this.u = null;
        this.v = null;
        this.w = null;

        // Setup camera
        const theta = fov * Math.PI / 180;
        const halfHeight = Math.tan(theta / 2);
        const halfWidth = aspectRatio * halfHeight;

        this.w = lookFrom.minus(lookAt).normalized();   // z-axis
        this.u = up.cross(this.w).normalized();         // x-axis
        this.v = this.w.cross(this.u);                  // y-axis

        this.lowerLeftCorner = this.origin.minus(this.u.scale(halfWidth))
                                          .minus(this.v.scale(halfHeight))
                                          .minus(this.w.scale(near));
        this.horizontal = this.u.scale(2 * halfWidth);
        this.vertical = this.v.scale(2 * halfHeight);
    }

    getRay(u, v) {
        const direction = this.lowerLeftCorner.add(this.horizontal.scale(u))
                                              .add(this.vertical.scale(v))
                                              .minus(this.origin);
        return new Ray(this.origin, direction);
    }
}

class Sphere {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }

    rayIntersects(ray) {
        const oc = ray.origin.minus(this.center);  // Vector from ray origin to sphere center
        const a = ray.direction.dot(ray.direction); // Ray direction squared
        const b = oc.dot(ray.direction);           // Dot product of oc and ray direction
        const c = oc.dot(oc) - this.radius * this.radius; // Distance squared from ray origin to sphere center
        const discriminant = b * b - a * c;

        if (discriminant > 0) {
            const t1 = (-b - Math.sqrt(discriminant)) / a;
            const t2 = (-b + Math.sqrt(discriminant)) / a;
            return t1 < t2 ? t1 : t2; // Return the smallest t-value (first intersection)
        }
        return -1; // No intersection
    }
}

function rayColor(ray, scene, depth) {
    if (depth <= 0) return new Vec3(0, 0, 0);  // Prevent infinite recursion

    let hit = scene.hit(ray);
    if (hit) {
        let normal = hit.normal;
        let lightDir = new Vec3(1, 1, -1).normalized(); // Direction of light source
        let diffuse = Math.max(0, normal.dot(lightDir)); // Diffuse shading

        // Returning the color based on diffuse lighting
        return new Vec3(1, 1, 1).scale(diffuse); // Color based on diffuse
    }
    return new Vec3(0.5, 0.7, 1); // Background color (sky blue)
}

function traceRay(ray, scene, depth) {
    if (depth <= 0) return new Vec3(0, 0, 0);  // Prevent infinite recursion

    let closestT = Infinity;
    let hit = null;

    scene.spheres.forEach(sphere => {
        const t = sphere.rayIntersects(ray);
        if (t > 0 && t < closestT) {
            closestT = t;
            hit = sphere; // Store the closest hit
        }
    });

    if (hit) {
        let intersectionPoint = ray.pointAt(closestT);
        let normal = intersectionPoint.minus(hit.center).normalized();
        return rayColor(ray, hit, normal);
    }

    return new Vec3(0.5, 0.7, 1);  // Background color
}
