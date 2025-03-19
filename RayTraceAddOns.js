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
        let imageData = ctx.getImageData(x, y, 1, 1);
        let data = imageData.data;
        data[0] = color.x; // Red
        data[1] = color.y; // Green
        data[2] = color.z; // Blue
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
            for (let j = 0; j <= imageHeight; j++) {
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



