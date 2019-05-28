var points = [];
var colors = [];
var index = [];
var prev = 0;
var curr = 0;
var colorIndex = 0;

function main() {
    document.addEventListener('keydown', mode);
    document.getElementById("webgl").addEventListener("click", getCoordinate, false);
}

function mode(e) {
    if (e.key == "f" || e.key == "F"){
        window.location.href = "index.html";
    }

    if (e.key == "b" || e.key == "B"){
        // console.log("b success");
        index.push(curr - prev);
        prev = curr;
    }

    if (e.key == "c" || e.key == "C"){
        changeColors();
        drawImage();
    }
}

function changeColors() {
    var c;
    colorIndex = (colorIndex + 1) % 4;
    switch (colorIndex) {
        case 1:
            c = vec4(1.0, 0.0, 0.0, 1.0);
            break;
        case 2:
            c = vec4(0.0, 1.0, 0.0, 1.0);
            break;
        case 3:
            c = vec4(0.0, 0.0, 1.0, 1.0);
            break;
        default:
            c = vec4(0.0, 0.0, 0.0, 1.0);
    }
    colors = [];
    for (var i = 0; i < points.length; i++){
        colors.push(c);
    }
}

function getCoordinate(e) {
    var canvas = document.getElementById("webgl");
    // var x = e.clientX - canvas.offsetLeft;
    // var y = e.clientY + canvas.offsetTop;
    var x = 2 * (e.clientX - canvas.offsetLeft - 200)/canvas.width;
    var y = 2 * (200 - e.clientY + canvas.offsetTop) / canvas.height;
    var coords = "X coords: " + x + ", Y coords: " + y;
    document.getElementById("demo").innerHTML = coords;
    points.push(vec4(x, y, 0.0, 1.0));
    colors.push(vec4(0.0, 0.0, 0.0, 1.0));
    curr += 1;
    drawImage();
}


function drawImage() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    // gl.viewport(0, 0, canvas.width, canvas.height);

    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas> by clearning the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw a lines
    if (index.length == 0){
        gl.drawArrays(gl.LINE_STRIP, 0, points.length);
    }
    else{
        var start = 0;
        for (var i = 0; i < index.length; i++){
            gl.drawArrays(gl.LINE_STRIP, start, index[i]);
            start = start + index[i];
        }
        gl.drawArrays(gl.LINE_STRIP, start, points.length - start);

    }
}
