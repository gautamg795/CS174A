var canvas;
var gl;

var points = []; // The array of points to be loaded onto GPU for drawing
var theta = 0; // For rotation of cubes
var thetaLoc, modelViewProjectionLoc, vColorLoc; // For storing of uniform vars for shader
var crosshairs = false; // Toggled to true when crosshairs should be shown

var colorIndex = 0; // Used to put different colors on the cubes and cycle
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
    fovx: 80.0, // 45 degrees for fovy
    fovy: function () {
        return this.fovx/this.aspect;
    },
    aspect: undefined,
    near: 1.0,
    far: 300.0
};

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    generateCubes();
    generateCrosshair();

    gl.viewport(0, 0, canvas.width, canvas.height); // Set viewport settings
    camera.aspect = canvas.width / canvas.height; // Set aspect ratio
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Initialize canvas to black
    gl.enable(gl.DEPTH_TEST); // Enable Z buffer



    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Find where we store the color info
    vColorLoc = gl.getUniformLocation(program, "vColor");

    // Load the points into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Make vPosition point to those points
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Find where we store the rotation angle theta
    thetaLoc = gl.getUniformLocation(program, "theta");
    // Find where we store the model-view-projection matrix
    modelViewProjectionLoc = gl.getUniformLocation(program, "modelViewProjection");

    // Use onkeypress for all non-arrow key events
    window.onkeypress = function (event) {
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
            camera.fovx = 80.0;
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
    // Use onkeydown for arrow keys
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
    // Note that we only create one set of vertices
    var vertices = [
        vec3(-1.0, -1.0, 1.0),
        vec3(-1.0, 1.0, 1.0),
        vec3(1.0, 1.0, 1.0),
        vec3(1.0, -1.0, 1.0),
        vec3(-1.0, -1.0, -1.0),
        vec3(-1.0, 1.0, -1.0),
        vec3(1.0, 1.0, -1.0),
        vec3(1.0, -1.0, -1.0)
    ];

    // The traversal order for triangle strips
    var indices = [0, 4, 7, 6, 3, 2, 1, 6, 5, 4, 1, 0, 3, 7];
    // Push the points for triangle strips
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
    }

    // Order in which to draw the lines separating the cube faces
    indices = [
        0, 1,
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
    ];
    // Push the points for line segments
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
    // enable Z-buffer
    gl.enable(gl.DEPTH_TEST);
    // clear the buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += 6.0; // 60 rpm given 60 fps
    gl.uniform1f(thetaLoc, theta); // Send theta to GPU
    var projectionMatrix = perspective(camera.fovy(), camera.aspect, camera.near, camera.far); // Generate proj matrix
    // The list of instances we want and where
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
    // Generate the view matrix based off of the translation and rotation of the camera)
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
    // Generate crosshairs if enabled
    if (crosshairs) {
        gl.disable(gl.DEPTH_TEST); // Disable depth buffer so nothing comes in front of crosshair (it shouldn't, though)
        gl.uniform1f(thetaLoc, 0); // Send 0 for theta (crosshair shouldn't be rotated or scaled)
        projectionMatrix = ortho(camera.aspect * -3, camera.aspect * 3, 3, -3, 0, 1); // Use orthographic projection
        gl.uniformMatrix4fv(modelViewProjectionLoc, false, flatten(projectionMatrix)); // Send the projection matrix
        gl.drawArrays(gl.LINES, 38, 4); // Draw the crosshairs
    }
    requestAnimFrame(render);
}
