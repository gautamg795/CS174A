var canvas;
var gl;

var NumVertices = 14;

var points = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = 0;

var thetaLoc, modelViewProjectionLoc, vColorLoc;


var projectionLoc;
var crosshairs = false;

var colorIndex = 0;
var colors = [
    [0.2, 0.2, 0.2, 1.0], // black
    [1.0, 0.0, 0.0, 1.0], // red
    [0.5, 0.3, 0.3, 1.0], // brown
    [0.0, 0.8, 0.0, 1.0], // green
    [0.0, 0.0, 1.0, 1.0], // blue
    [1.0, 0.0, 1.0, 1.0], // magenta
    [0.5, 0.2, 1.0, 1.0], // purple
    [0.0, 1.0, 1.0, 1.0] // cyan
];

var camera = {
    x: 0.0,
    y: 0.0,
    z: -50.0,
    heading: 0.0,
    fovx: 73.0, // Approximately 45 degrees for fovy
    fovy: function () {
        if (this.fovx === this.__fovx)
            return this.__fovy; // Cache fovy value to avoid calculating atan/tan every render
        else
            return this.__fovx = this.fovx, this.__fovy = (2 * Math.atan(Math.tan(radians(this.fovx) / 2) * (1 / this.aspect))) * 180 / Math.PI;
    },
    aspect: undefined,
    near: 1.0,
    far: 300.0,
    __fovx: this.fovx,
    __fovy: undefined
};

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    generateCubes();
    generateCrosshair();

    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.aspect = canvas.width / canvas.height;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    vColorLoc = gl.getUniformLocation(program, "vColor");

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    modelViewProjectionLoc = gl.getUniformLocation(program, "modelViewProjection");
    projectionLoc = gl.getUniformLocation(program, "projection");

    window.onkeypress = function (event) {
        // If the key pressed represents an alphanumeric character, convert it; else let the key code pass through
        var key = String.fromCharCode(event.keyCode)
            .toLowerCase();
        switch (key) {
        case 'c':
            colorIndex++;
            break;
        case 'r':
            camera.x = 0.0;
            camera.y = 0.0;
            camera.z = -50.0;
            camera.heading = 0;
            camera.fovx = 73.0;
            break;
        case 'i':
            var headingRad = radians(camera.heading);
            camera.z += 0.25 * Math.cos(headingRad);
            camera.x -= 0.25 * Math.sin(headingRad);
            break;
        case 'm':
            var headingRad = radians(camera.heading);
            camera.z -= 0.25 * Math.cos(headingRad);
            camera.x += 0.25 * Math.sin(headingRad);
            break;
        case 'j':
            var headingRad = radians(camera.heading);
            camera.x += 0.25 * Math.cos(headingRad);
            camera.z += 0.25 * Math.sin(headingRad);
            break;
        case 'k':
            var headingRad = radians(camera.heading);
            camera.x -= 0.25 * Math.cos(headingRad);
            camera.z -= 0.25 * Math.sin(headingRad);
            break;
        case 'n':
            camera.fovx--;
            break;
        case 'w':
            camera.fovx++;
            break;
        case '+':
            crosshairs = !crosshairs;
            break;
        }
    };
    window.onkeydown = function (event) {
        switch (event.keyCode) {
        case 38: // Up arrow key
            camera.y -= 0.25;
            break;
        case 40: //Down arrow key
            camera.y += 0.25;
            break;
        case 39:
            camera.heading += 1; // Right arrow key
            break;
        case 37:
            camera.heading -= 1; // Left arrow key
            break;
        }
    };
    render();

}



function generateCubes() {
    var vertices = [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5)
    ];

    var indices = [0, 4, 7, 6, 3, 2, 1, 6, 5, 4, 1, 0, 3, 7];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);

        // for solid colored faces use 
        //colors.push(vertexColors[a]);
    }
    var indices = [0, 1,
        1, 2,
        2, 3,
        3, 0,
        0, 4,
        4, 7,
        7, 3,
        2, 6,
        6, 7,
        1, 5,
        5, 6,
        4, 5
    ]; // The index order for triangle strips
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
    }
}

function generateCrosshair() {
    var vertices = [
        vec3(0, 1, 0),
        vec3(0, -1, 0),
        vec3(-1, 0, 0),
        vec3(1, 0, 0)
    ];
    vertices.forEach(function (element) {
        points.push(element);
    });
}

function render() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += 6.0; // 60 rpm?
    gl.uniform1f(thetaLoc, theta);
    var projectionMatrix = perspective(camera.fovy(), camera.aspect, camera.near, camera.far);
    var models = [
        translate(10, 10, 10),
        translate(10, 10, -10),
        translate(10, -10, 10),
        translate(10, -10, -10),
        translate(-10, 10, 10),
        translate(-10, 10, -10),
        translate(-10, -10, 10),
        translate(-10, -10, -10)
    ];
    var viewMatrix = mult(rotate(camera.heading, [0, 1, 0]), translate(camera.x, camera.y, camera.z));
    for (var i = 0; i < models.length; i++) {
        models[i] = mult(viewMatrix, models[i]); // Create the model-view matrix
        models[i] = mult(projectionMatrix, models[i]); // Create the model-view-projection matrix
        gl.uniformMatrix4fv(modelViewProjectionLoc, false, flatten(models[i])) // Send the model-view-projection matrix
        gl.uniform4fv(vColorLoc, colors[(colorIndex + i) % colors.length]); // Give each cube a unique color, send to shader
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 14); // Draw the cube with triangle strips based on first 14 points in array
        gl.uniform4fv(vColorLoc, [1, 1, 1, 1]); // Send white for the outlines
        gl.drawArrays(gl.LINES, 14, 24); // Draw the outlines which are stored in the last 24 points in array
    }
    if (crosshairs) {
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1f(thetaLoc, 0);
        projectionMatrix = ortho(camera.aspect * -3, camera.aspect * 3, 3, -3, 0, 1);
        gl.uniformMatrix4fv(modelViewProjectionLoc, false, flatten(projectionMatrix));
        gl.drawArrays(gl.LINES, 38, 4);
    }
    requestAnimFrame(render);

}
