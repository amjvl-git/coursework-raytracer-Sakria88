const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// Scene setup
const spheres = [
    new Sphere(new Vec3(250, 250, 50), 50, new Vec3(1, 0, 0)) // Red sphere
];
const light = new Vec3(200, 100, 50);
const eye = new Vec3(250, 250, -500);

// Ray-sphere intersection
function intersectRaySphere(ray, sphere) {
    let oc = ray.origin.minus(sphere.centre);
    let a = ray.direction.dot(ray.direction);
    let b = 2.0 * oc.dot(ray.direction);
    let c = oc.dot(oc) - sphere.radius * sphere.radius;
    let discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return -1; // No intersection
    return (-b - Math.sqrt(discriminant)) / (2.0 * a); // Return nearest intersection
}

// Trace ray and return the color
function traceRay(ray) {
    let closestT = Infinity;
    let closestSphere = null;

    for (let i = 0; i < spheres.length; i++) {
        let t = intersectRaySphere(ray, spheres[i]);
        if (t > 0 && t < closestT) {
            closestT = t;
            closestSphere = spheres[i];
        }
    }

    if (closestSphere) {
        let hitPoint = ray.pointAt(closestT);
        let normal = hitPoint.minus(closestSphere.centre).normalised();
        return phongLighting(hitPoint, normal, closestSphere.colour);
    }

    return backgroundColour(ray);
}

// Compute lighting using Phong shading
function phongLighting(point, normal, sphereColor) {
    let lightDir = light.minus(point).normalised();
    let diff = Math.max(normal.dot(lightDir), 0);
    
    return new Vec3(
        Math.min(sphereColor.x * diff, 1),
        Math.min(sphereColor.y * diff, 1),
        Math.min(sphereColor.z * diff, 1)
    );
}

// Render function
function render() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let ray = new Ray(
                eye,
                new Vec3(x - eye.x, y - eye.y, 0 - eye.z).normalised()
            );
            let color = traceRay(ray);
            setPixel(x, y, color.scale(255));
        }
    }
}

render();

