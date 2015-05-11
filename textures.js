var canvas;
var gl;

var numVertices = 36;

var texSize = 64;

var program;

var pointsArray = [];
var texCoordsArray = [];
var textures = [];

var offset = vec2(0.0, 0.0);

var rotation = true;
var scrolling = true;

var camera = {
    x: 0.0,
    y: 0.0,
    z: -5.0,
    heading: 0.0,
    fovy: 50,
    aspect: undefined,
    near: 1.0,
    far: 300.0
};



var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [0, 0];

var thetaLoc;

function configureTexture(image) {
    var image = document.getElementById("texImage1");
    gl.activeTexture(gl.TEXTURE0)
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    image = document.getElementById("texImage2");
    gl.activeTexture(gl.TEXTURE1)
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
  
}





function generateCube() {
    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];
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
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    camera.aspect = canvas.width / canvas.height; // Set aspect ratio
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    configureTexture();
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    generateCube();


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

    //
    // Initialize a texture
    //

    //var image = new Image();
    //image.onload = function() { 
    //   configureTexture( image );
    //}
    //image.src = "SA2011_black.gif"

    window.onkeypress = function (event) {
        var key = String.fromCharCode(event.keyCode)
            .toLowerCase();
        switch (key) {
        case 'r':
            rotation = !rotation;
            break;
        case 's':
            scrolling = !scrolling;
        }
    };
    

    thetaLoc = gl.getUniformLocation(program, "theta");
    projectionLoc = gl.getUniformLocation(program, "projection");
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    render();

}

var render = function() {
    var projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far); // Generate proj matrix
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));
    var viewMatrix = mult(rotate(camera.heading, [0, 1, 0]), translate(camera.x, camera.y, camera.z));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var models = [
        translate(1, 1, 0),
        translate(-1, -.5, 0)
    ];
    if (scrolling) {
        offset[1] += .005;
        if (offset[1] > 1) offset[1] -= 1.0;
    }
    for (var i = 0; i < models.length; i++) {
        gl.uniform1f(gl.getUniformLocation(program, "texTheta"), !i ? theta[i] : 0);
        gl.uniform2fv(gl.getUniformLocation(program, "offset"), i ? offset : vec2(0,0));
        gl.uniform1i(gl.getUniformLocation(program, "texture"), i);
        if (i == 1) 
            models[i] = mult(models[i], scale(2, 2, 2));
        var modelView = mult(viewMatrix, models[i]);
        modelView = mult(modelView, rotate(theta[i], [i, !i, 0]));
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        if (rotation) theta[i] += 1.0 - i/2.0;
    }
    requestAnimFrame(render);
}