
var canvas;
var gl;

var NumVertices  = 14;

var points = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc, modelViewLoc, vColorLoc;


var projectionLoc;


var colorIndex = 0;
var colors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 1.0, 0.5, 0.25, 1.0 ], // orange
    [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
];

var camera = {
    x : 0.0,
    y : 0.0,
    z : -50.0,
    heading : 0.0,
    fovx : 72,
    fovy : function() { return (2 * Math.atan(Math.tan(radians(this.fovx) / 2) * (1 / this.aspect))) * 180 / Math.PI; },
    aspect : undefined,
    near : 1.0,
    far  : 100.0
};

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    generateCubes();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    camera.aspect =  canvas.width/canvas.height;
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    vColorLoc = gl.getUniformLocation( program, "vColor" );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation( program, "projection");

    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    window.onkeydown = function(event) {
        var key = event.keyCode > 48 ? String.fromCharCode(event.keyCode) : event.keyCode;
        switch (key)
        {
            case 'C':
                colorIndex++;
                break;
            case 'R':
                camera.x = 0.0;
                camera.y = 0.0;
                camera.z = -50.0;
                camera.heading = 0;
                break;
            case 'I':
                var headingRad = radians(camera.heading);
                camera.z += 0.25 * Math.cos(headingRad);
                camera.x -= 0.25 * Math.sin(headingRad);
                break;
            case 'M':
                var headingRad = radians(camera.heading);
                camera.z -= 0.25 * Math.cos(headingRad);
                camera.x += 0.25 * Math.sin(headingRad);
                break;
            case 'J':
                var headingRad = radians(camera.heading);
                camera.x += 0.25 * Math.cos(headingRad);
                camera.z += 0.25 * Math.sin(headingRad);
                break;
            case 'K':
                var headingRad = radians(camera.heading);
                camera.x -= 0.25 * Math.cos(headingRad);
                camera.z -= 0.25 * Math.sin(headingRad);
                break;
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
                camera.heading -=1; // Left arrow key
                break;

        }
    };
        
    render();
    
}



function generateCubes()
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [0, 4, 7, 6, 3 ,2, 1, 6, 5, 4, 1, 0, 3, 7];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
   
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
                   4, 5 ]; // The index order for triangle strips
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 6.0; // 60 rpm?
    gl.uniform3fv(thetaLoc, theta);
    var projectionMatrix = perspective(camera.fovy(), camera.aspect, camera.near, camera.far);
    gl.uniformMatrix4fv( projectionLoc, false, flatten(projectionMatrix) );
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
    for (var i = 0; i < models.length; i++)
    {
        models[i] = mult(viewMatrix, models[i]); // Create the model-view matrix
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(models[i])) // Send the model-view matrix
        gl.uniform4fv(vColorLoc, colors[(colorIndex + i) % colors.length]); // Give each cube a unique color, send to shader
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 14 ); // Draw the cube with triangle strips based on first 14 points in array
        gl.uniform4fv(vColorLoc, [1, 1, 1, 1]); // Send white for the outlines
        gl.drawArrays( gl.LINES, 14, 24 ); // Draw the outlines which are stored in the last 24 points in array
    }
    requestAnimFrame( render );

}

