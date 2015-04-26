var pointsArray = [];
var normalsArray = [];
var index = 0;
var planets = [];

var pointsCache = new Object();

function Planet(orbitalRadius, size, complexity, color) {
    this.x = 0;
    this.y = 0;
    this.z = orbitalRadius;
    this.theta = Math.floor(Math.random() * 1000) % 360;
    this.size = size;
    this.color = color;
    // If we've already computed the points for a sphere with this complexity, just reuse them
    if (pointsCache[String(complexity)]) {
        this.startIndex = pointsCache[String(complexity)][0];
        this.numPoints = pointsCache[String(complexity)][1];
    } else {
        this.startIndex = pointsArray.length;
        sphere(complexity);
        this.numPoints = pointsArray.length - this.startIndex;
        pointsCache[String(complexity)] = [this.startIndex, this.numPoints];
    }

}

function sphere(nSub) {
    function triangle(a, b, c) {
         pointsArray.push(a);
         pointsArray.push(b);      
         pointsArray.push(c);
        
         // normals are vectors
         
         normalsArray.push(a[0],a[1], a[2], 0.0);
         normalsArray.push(b[0],b[1], b[2], 0.0);
         normalsArray.push(c[0],c[1], c[2], 0.0);

         index += 3;    
    }

    function divideTriangle(a, b, c, count) {
        if ( count > 0 ) {
                    
            var ab = mix( a, b, 0.5);
            var ac = mix( a, c, 0.5);
            var bc = mix( b, c, 0.5);
                    
            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);
                                    
            divideTriangle( a, ab, ac, count - 1 );
            divideTriangle( ab, b, bc, count - 1 );
            divideTriangle( bc, c, ac, count - 1 );
            divideTriangle( ab, bc, ac, count - 1 );
        }
        else { 
            triangle( a, b, c );
        }
    }
    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);
    tetrahedron(va, vb, vc, vd, nSub);
}

var camera = {
    x: 0.0,
    y: -10.0,
    z: -25.0,
    heading: 0.0,
    fovy: 50,
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
    planets.push(new Planet(0, 1.8, 6, [1, 1, 0, 1]));
    planets.push(new Planet(4, 1, 6, [1, 0, 1, 1]));
    planets.push(new Planet(7, 1.2, 6, [1, 0, 0, 1]));
    planets.push(new Planet(10, 1.4, 6, [1, .5, .5, 1]));
    planets.push(new Planet(14, 1, 6, [.1, .5, 1, 1]));
    planets.push(new Planet(14, .5, 6, [.6, .5, .9, 1]));
    planets[planets.length - 1].isMoon = true;
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
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.DYNAMIC_DRAW);

    // Make vPosition point to those points
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


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
            camera.y = -10.0;
            camera.z = -25.0;
            camera.heading = 0;
            camera.fovy = 50.0;
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
            camera.fovy--;
            break;
        case 'w':
            camera.fovy++;
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


function render() {

    // clear the buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far); // Generate proj matrix
    
    
    // Generate the view matrix based off of the translation and rotation of the camera)
    var viewMatrix = mult(rotate(30, [1, 0, 0]), mult(rotate(camera.heading, [0,1,0]),translate(camera.x, camera.y, camera.z)));
    planets.forEach(function(planet, i) {
        var modelViewMatrix;
        if (planet.isMoon)
        {
            var basePlanet = planets[i-1];
            modelViewMatrix = mult(translate(0, 0, 3), scale(planet.size, planet.size, planet.size));
            modelViewMatrix = mult(rotate(planet.theta, [0, 1, 0]), modelViewMatrix);
            modelViewMatrix = mult(translate(basePlanet.x, basePlanet.y, basePlanet.z), modelViewMatrix);
            modelViewMatrix = mult(rotate((i - 1) * basePlanet.theta, [0, 1, 0]), modelViewMatrix);
            modelViewMatrix = mult(viewMatrix, modelViewMatrix);
        }
        else {
            modelViewMatrix = mult(translate(planet.x, planet.y, planet.z), scale(planet.size, planet.size, planet.size));
            modelViewMatrix = mult(rotate(i * planet.theta, [0, 1, 0]), modelViewMatrix);
            modelViewMatrix = mult(viewMatrix, modelViewMatrix);
        }
        if (i > 0) {
            planet.theta += 1 / planet.z * 5;
            if (planet.isMoon)
                planet.theta += .5;
        }
        modelViewMatrix = mult(projectionMatrix, modelViewMatrix);
        gl.uniformMatrix4fv(modelViewProjectionLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(vColorLoc, planet.color);
        gl.drawArrays(gl.TRIANGLES, planet.startIndex, planet.numPoints);
    })
    // for (var i = 0; i < models.length; i++) {
    //     models[i] = mult(viewMatrix, models[i]); // Create the model-view matrix
    //     models[i] = mult(projectionMatrix, models[i]); // Create the model-view-projection matrix
    //     gl.uniformMatrix4fv(modelViewProjectionLoc, false, flatten(models[i])) // Send the model-view-projection matrix
    //     gl.uniform4fv(vColorLoc, [1, i, 0, 1]); // Give each cube a unique color, send to shader
    //     gl.drawArrays(gl.TRIANGLES, 0, index); // Draw the cube with triangle strips based on first 14 points in array
    // }
    requestAnimFrame(render);
}