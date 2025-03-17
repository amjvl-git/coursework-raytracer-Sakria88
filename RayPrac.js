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

    // Return a normalized version of this vector
    normalised() {
        let mag = this.magnitude();
        if (mag === 0) return new Vec3(0, 0, 0);
        return this.scale(1 / mag);
    }
}

// Test the Vec3 class
function testVec3() {
    let v1 = new Vec3(1, 2, 3);
    let v2 = new Vec3(4, 5, 6);

    console.log("Addition:", v1.add(v2));
    console.log("Subtraction:", v1.minus(v2));
    console.log("Multiplication:", v1.multiply(v2));
    console.log("Scaling (by 2):", v1.scale(2));
    console.log("Dot Product:", v1.dot(v2));
    console.log("Magnitude of v1:", v1.magnitude());
    console.log("Normalized v1:", v1.normalised());
}

// Example test
let ball = new Vec3(3, 4, 0);
let lineStart = new Vec3(0, 0, 0);
let lineEnd = new Vec3(6, 0, 0);

console.log("Ball-Line Distance Squared:", ballLineDistanceSquared(ball, lineStart, lineEnd));

document.body.innerHTML += `<p>Ball-Line Distance Squared: ${ballLineDistanceSquared(ball, lineStart, lineEnd)}</p>`;

});