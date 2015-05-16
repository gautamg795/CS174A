var canvas;
var gl;
var numVertices = 36;
var program;
var pointsArray = [];
var texCoordsArray = [];
var textures = [];
var offset = vec2(0.0, 0.0);

// Booleans used for cube rotation, texture rotation, and texture scrolling
var rotation = true;
var scrolling = true;
var texRotation = true;


// The camera object
var camera = {
    x: 0.0,
    y: 0.0,
    z: -5.0,
    heading: 0.0,
    fovy: 50,
    aspect: undefined, // set later
    near: 1.0,
    far: 300.0
};



var theta = [0, 0]; // the cubes' rotation thetas
var texTheta = 0; // the texture's rotation theta
var texThetaLoc;

function configureTexture() {
    // Get the first image
    var image = document.getElementById("texImage1");
    // Use texture unit 0
    gl.activeTexture(gl.TEXTURE0)
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    // Nearest neighbor filtering    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // Clamp to edge to make rotation look okay as we are rotating a square image
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    // Get the second image
    image = document.getElementById("texImage2");
    // Use texture unit 1
    gl.activeTexture(gl.TEXTURE1)
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    // Trilinear filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
}





function generateCube(zoom) {
    // If 'zoom' is true, use a different set of texture coordinates
    var texCoord = zoom ? 
        [
            vec2(0, 0),
            vec2(0, 2),
            vec2(2, 2),
            vec2(2, 0)
        ]
    :
        [
            vec2(0, 0),
            vec2(0, 1),
            vec2(1, 1),
            vec2(1, 0)
        ];

    // Cube vertices
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    function quad(a, b, c, d) {
        pointsArray.push(vertices[a]);
        texCoordsArray.push(texCoord[0]);

        pointsArray.push(vertices[b]);
        texCoordsArray.push(texCoord[1]);

        pointsArray.push(vertices[c]);
        texCoordsArray.push(texCoord[2]);

        pointsArray.push(vertices[a]);
        texCoordsArray.push(texCoord[0]);

        pointsArray.push(vertices[c]);
        texCoordsArray.push(texCoord[2]);

        pointsArray.push(vertices[d]);
        texCoordsArray.push(texCoord[3]);
    }
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    // Use a nice background color
    gl.clearColor(0.0, 0.1, .2, 1.0);
    camera.aspect = canvas.width / canvas.height; // Set aspect ratio
    gl.enable(gl.DEPTH_TEST);

    // Load the textures and configure them
    configureTexture();
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Generate first cube
    generateCube();
    // Generate second cube with zoomed textures
    generateCube(true);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Set up key bindings
    window.onkeypress = function (event) {
        var key = String.fromCharCode(event.keyCode || event.which)
            .toLowerCase();
        switch (key) {
        case 'r':
            rotation = !rotation;
            break;
        case 's':
            scrolling = !scrolling;
            break;
        case 't':
            texRotation = !texRotation;
            break;
        case 'i':
            camera.z++;
            break;
        case 'o':
            camera.z--;
            break;
        }
    };
    

    texThetaLoc = gl.getUniformLocation(program, "texTheta");
    projectionLoc = gl.getUniformLocation(program, "projection");
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    render();

}

var render = function() {
    var projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far); // Generate proj matrix
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix)); // Send projection matrix
    var viewMatrix = mult(rotate(camera.heading, [0, 1, 0]), translate(camera.x, camera.y, camera.z)); // Position the view matrix
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set up our instance array
    var models = [
        translate(1.5, .25, 0),
        translate(-1.5, -.25, 0)
    ];
    // If the texture should scroll, increment the offset
    if (scrolling) {
        offset[1] += .01;
        if (offset[1] > 1) offset[1] -= 1.0;
    }
    for (var i = 0; i < models.length; i++) {
        // For the first cube, send a theta for the texture's rotation
        if (i == 0) {
            gl.uniform1f(texThetaLoc, texTheta);
            // Only increment it if the boolean is true, though
            if (texRotation) texTheta += 1.5;
        }
        else // Second cube, texture does not rotate
            gl.uniform1f(texThetaLoc, 0.0);
        // If this is the second cube, send an offset; otherwise send 0
        gl.uniform2fv(gl.getUniformLocation(program, "offset"), i ? vec2(offset[0] + 0.5, offset[1]+0.5): vec2(0,0));
        // Choose the texture unit to use
        gl.uniform1i(gl.getUniformLocation(program, "texture"), i);
        // Make the cubes bigger
        models[i] = mult(models[i], scale(2, 2, 2));
        // Prepare the model-view matrix
        var modelView = mult(viewMatrix, models[i]);
        modelView = mult(modelView, rotate(theta[i], [i, !i, 0]));
        // Send the model-view matrix
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
        // Draw. Cube 0 uses the first 36 vertices, Cube 1 uses the next 36
        gl.drawArrays(gl.TRIANGLES, i * numVertices, numVertices);
        // Increment theta if cubes should be rotating
        if (rotation) theta[i] += 1.0 - i/2.0;
    }
    requestAnimFrame(render);
}