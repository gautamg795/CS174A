var pointsArray = [];
var normalsArray = [];
var index = 0;
var planets = [];

var pointsCache = new Object();

var sunLight = {
    ambient : vec4(0.8, 0.8, 0.8, 1.0),
    diffuse : vec4(1.0, 0.8, 0.0, 1.0),
    specular : vec4(1.0, 0.8, 0.0, 1.0),
}

function Planet(orbitalRadius, size, complexity, shading, material) {
    this.x = 0;
    this.y = 0;
    this.z = orbitalRadius;
    this.theta = Math.floor(Math.random() * 1000) % 360;
    this.size = size;
    this.material = material;
    this.shading = shading;
    // If we've already computed the points for a sphere with this complexity, just reuse them
    if (pointsCache[String(complexity) + "." + String(shading)]) {
        this.startIndex = pointsCache[String(complexity) + "." + String(shading)][0];
        this.numPoints = pointsCache[String(complexity) + "." + String(shading)][1];
    } else {
        this.startIndex = pointsArray.length;
        sphere(complexity, shading);
        this.numPoints = pointsArray.length - this.startIndex;  
        pointsCache[String(complexity) + "." + String(shading)] = [this.startIndex, this.numPoints];
    }
        

}

function sphere(nSub, normals) {
    function triangle(a, b, c) {
        if (normals == 0) {
            var t1 = subtract(b, a);
            var t2 = subtract(c, a);
            var normal = normalize(cross(t2, t1));
            normal = vec4(normal);
            normal[3] = 0.0;
            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);

            pointsArray.push(a);
            pointsArray.push(b);
            pointsArray.push(c);

            index += 3;
        } else {
            pointsArray.push(a);
            pointsArray.push(b);
            pointsArray.push(c);

            // normals are vectors

            normalsArray.push([a[0], a[1], a[2], 0.0]);
            normalsArray.push([b[0], b[1], b[2], 0.0]);
            normalsArray.push([c[0], c[1], c[2], 0.0]);

            index += 3;
        }
    }
    function divideTriangle(a, b, c, count) {
        if (count > 0) {

            var ab = mix(a, b, 0.5);
            var ac = mix(a, c, 0.5);
            var bc = mix(b, c, 0.5);

            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);

            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        } else {
            triangle(a, b, c);
        }
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    tetrahedron(va, vb, vc, vd, nSub);
}

var camera = {
    x: 0.0,
    y: -12.0,
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
    planets.push(new Planet(0, 2.0, 5, 0, {
        ambient : [1.3, 1.2, 0.0, 1.0],
        diffuse : [1.0, 1.7, 0.0, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        shininess : 0.0
    }));
    planets.push(new Planet(4, 1, 3, 0, {
        ambient : [0.6, 0.6, 1.0, 1.0],
        diffuse : [0.8, 0.8, 1.0, 1.0],
        specular: [1.0, 1.0, 1.0, 0.0],
        shininess : 20.0
    }));
    planets.push(new Planet(7, 1.2, 3, 1, {
        ambient : [0.1, 0.3, 0.1, 1.0],
        diffuse : [0.1, 0.5, 0.0, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        shininess : 30.0
    }));
    planets.push(new Planet(10, 1.4, 7, 2, {
        ambient : [0.0, 0.2, 1.0, 1.0],
        diffuse : [0.3, 0.3, 1.0, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        shininess : 100.0
    }));
    planets.push(new Planet(14, 1, 5, 2, {
        ambient : [0.4, 0.2, 0.1, 1.0],
        diffuse : [0.4, 0.2, 0.1, 1.0],
        specular: [0.0, 0.0, 0.0, 0.0],
        shininess : 0.0
    }));
    planets.push(new Planet(14, .5, 4, 2, {
        ambient : [0.3, 0.25, 0.45, 1.0],
        diffuse : [0.6, 0.5, 0.9, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        shininess : 100.0
        }));
    planets[planets.length - 1].isMoon = true;
    gl.viewport(0, 0, canvas.width, canvas.height); // Set viewport settings
    camera.aspect = canvas.width / canvas.height; // Set aspect ratio
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Initialize canvas to black
    gl.enable(gl.DEPTH_TEST); // Enable Z buffer

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Find where we store the color info
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    shininessLoc = gl.getUniformLocation(program, "shininess");
    lightLoc = gl.getUniformLocation(program, "lightPosition")
    isSunLoc = gl.getUniformLocation(program, "isSun");
    shadingLoc = gl.getUniformLocation(program, "vShading");

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.DYNAMIC_DRAW);
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    // Load the points into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.DYNAMIC_DRAW);

    // Make vPosition point to those points
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // Find where we store the model-view-projection matrix
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation(program, "projection");
    // Use onkeypress for all non-arrow key events
    window.onkeypress = function(event) {
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
    window.onkeydown = function(event) {
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
    var viewMatrix = mult(rotate(30, [1, 0, 0]), mult(rotate(camera.heading, [0, 1, 0]), translate(camera.x, camera.y, camera.z)));
    planets.forEach(function(planet, i) {
        var modelViewMatrix;
        if (planet.isMoon) {
            var basePlanet = planets[i - 1];
            modelViewMatrix = mult(translate(0, 0, 2), scale(planet.size, planet.size, planet.size));
            modelViewMatrix = mult(rotate(planet.theta, [0, 1, 0]), modelViewMatrix);
            modelViewMatrix = mult(translate(basePlanet.x, basePlanet.y, basePlanet.z), modelViewMatrix);
            modelViewMatrix = mult(rotate(basePlanet.theta, [0, 1, 0]), modelViewMatrix);
            modelViewMatrix = mult(viewMatrix, modelViewMatrix);
        } else {
            modelViewMatrix = mult(translate(planet.x, planet.y, planet.z), scale(planet.size, planet.size, planet.size));
            modelViewMatrix = mult(rotate((i != 0) * planet.theta, [0, 1, 0]), modelViewMatrix);
            modelViewMatrix = mult(viewMatrix, modelViewMatrix);
            if ( i == 0 ) {
                gl.uniformMatrix4fv(lightLoc, false, flatten(modelViewMatrix));
            }

        }
        if (i > 0) {
            planet.theta += 2 / planet.z * 4;
            if (planet.isMoon)
                planet.theta += 1;
            if (planet.theta > 360)
                planet.theta %= 360;
        }
        gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(ambientProductLoc, mult(sunLight.ambient, planet.material.ambient));
        gl.uniform4fv(diffuseProductLoc, mult(sunLight.diffuse, planet.material.diffuse));
        gl.uniform4fv(specularProductLoc, mult(sunLight.specular, planet.material.specular));
        gl.uniform1f(shininessLoc, planet.material.shininess);
        gl.uniform1i(shadingLoc, planet.shading);
        gl.uniform1i(isSunLoc, i == 0)
        gl.drawArrays(gl.TRIANGLES, planet.startIndex, planet.numPoints);
    })
    requestAnimFrame(render);
}