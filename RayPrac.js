class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Add another vector to this one
    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    // Subtract another vector from this one
    minus(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    // Multiply this vector by another vector component-wise
    multiply(other) {
        return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
    }

    // Scale this vector by a scalar
    scale(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    // Calculate the dot product with another vector
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    // Calculate the magnitude of this vector
    magnitude() {
        return Math.sqrt(this.magnitudeSquared());
    }

    // Calculate the squared magnitude (avoiding the costly square root)
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

testVec3();

