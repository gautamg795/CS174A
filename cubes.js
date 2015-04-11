
var canvas;
var gl;

var NumVertices  = 14;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc, translateLoc, vColorLoc;

var near = 2;
var far = 32.0;

var  fovy = 30.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var pMatrix;
var projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var colorIndex = 0;
var colors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 1.0, 1.0, 1.0, 1.0 ],  // white
    [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
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
    translateLoc = gl.getUniformLocation(program, "translate"); 
    projection = gl.getUniformLocation( program, "projection" );

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

    window.onkeypress = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch (key)
        {
            case 'c':
                colorIndex++;
                break;
        }
    };
        
    render();
    
}



function colorCube()
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

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
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
                   4, 5 ];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    pMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    var translates = [
    	translate(1, -1, -15),
    	translate(1, -1, -5),
    ];
    for (var i = 0; i < translates.length; i++)
    {
        gl.uniformMatrix4fv(translateLoc, false, flatten(translates[i]))
        gl.uniform4fv(vColorLoc, colors[(colorIndex + i) % colors.length]);
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 14 );
        gl.uniform4fv(vColorLoc, [1, 1, 1, 1]);
        gl.drawArrays( gl.LINES, 14, 24 );
    }
    requestAnimFrame( render );

}

