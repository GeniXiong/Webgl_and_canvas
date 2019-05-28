
/* global params to store points loacation and colors */
var points = [];
var index = [];

/* params to record drawing process */
var prev = 0;
var curr = 0;
var colorIndex = 0;

function main() {
    /* add handle file function to upload button */
    document.getElementById("upload").addEventListener("change", handleFiles, false);
    /* add key down switch function to change between different mode */
    document.addEventListener('keydown', mode);


}

function mode(e) {

    /* Enter file mode (default) */
    if (e.key == "f" || e.key == "F"){

        document.getElementById("title").innerText = "File Mode";
        document.getElementById("file").style.display = "block";
        document.removeEventListener("keydown", drawOption);
        document.getElementById("webgl").removeEventListener("click", getCoordinate);
        clearCanvas();
    }

    /* Enter draw mode */
    if (e.key == "d" || e.key == "D"){

        document.getElementById("title").innerText = "Draw Mode";
        document.getElementById("file").style.display = "none";
        /* add get coordinate function to get coordinates only on draw mode */
        document.getElementById("webgl").addEventListener("click", getCoordinate, false);
        document.addEventListener("keydown", drawOption);
        /* clear canvas to be empty */
        clearCanvas();
    }


}

/* b/B: represents start a new line
*  c/C: represents color change */
function drawOption(e) {
    /* start a new line when draw
    * only at draw mode! */
    if (e.key == "b" || e.key == "B"){
        index.push(curr - prev);
        prev = curr;
    }

    /* change color black -> red -> green -> blue
    * only at draw mode */
    if (e.key == "c" || e.key == "C"){
        changeColors();
    }
}

function handleFiles() {
    clearCanvas();
    /* get file from uploading */
    if (document.getElementById('upload').files.length > 0){
        var file = document.getElementById('upload').files[0];
        var reader = new FileReader();
        reader.onload = function(evt) {
            var contents = evt.target.result;
            parseFile(contents);

            drawImage();
        };
        reader.readAsText(file);
    }
}

function parseFile(f) {
    var viewportString = "";
    var lines = f.split('\n');

    /* if the file is not dino */
    if (f.includes("*")){
        /* the file scene contains many empty lines */
        if (f.includes('scene')){
            viewportString = lines[4];
            lines = lines.slice(7);
        }
        /* other normal files */
        else {
            viewportString = lines[2];
            lines = lines.slice(4);
        }

        /* scale the x, y coordinates according to content extend */
        var view = parseViewport(viewportString);

        for(var i = 0; i < lines.length; i++){
            if(lines[i].length > 0) {
                var line = lines[i].trim();
                var nums = line.split(/[\s,]+/);
                if (nums.length == 2) {
                    points.push(vec4((parseFloat(nums[0]) - view.dx) * view.scale, (parseFloat(nums[1]) - view.dy) * view.scale, 0.0, 1.0));
                }
                if (line.length > 0 && nums.length == 1) {
                    index.push(parseInt(nums[0]));
                }
            }

        }
    }
    /* if the file contains no * it means it's a dino file
    * parse the x, y coordinates and scale it to 640 * 480 */
    else{
        lines = lines.slice(1);

        for (var i = 0; i < lines.length; i++){
            var line = lines[i].trim();
            var nums = line.split(/[\s,]+/);
            if (nums.length == 2) {
                points.push(vec4(parseFloat(nums[0])/330 - 1, parseFloat(nums[1])/440 - 1, 0.0, 1.0));

            }
            if (line.length > 0 && nums.length == 1) {
                index.push(parseInt(nums[0]));
            }
        }
    }
}

function parseViewport(line) {
    line = line.trim();
    var nums = line.split(/[\s,]+/);
    var scale = 1;
    var dw = parseFloat(nums[2]) - parseFloat(nums[0]);
    var dh = parseFloat(nums[1]) - parseFloat(nums[3]);
    scale = Math.min(2/dw, 2/dh);

    return {
        dx: (parseFloat(nums[2]) + parseFloat(nums[0]))/2,
        dy: (parseFloat(nums[1]) + parseFloat(nums[3]))/2,
        scale: scale
    };
}

function clearCanvas() {
    points = [];
    index = [];
    drawImage();
}

function getCoordinate(e) {
    var canvas = document.getElementById("webgl");

    var x = 2 * (e.clientX - canvas.offsetLeft - 200)/canvas.width;
    var y = 2 * (200 - e.clientY + canvas.offsetTop) / canvas.height;

    points.push(vec4(x, y, 0.0, 1.0));
    curr += 1;
    drawImage();
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

    drawImage(c);
}

function drawImage(color = vec4(0.0, 0.0, 0.0, 1.0)) {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height);

    //define the points array
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Define the colors of our points
    var colors = [];
    for (var i = 0; i < points.length; i++){
        colors.push(color);
    }

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);



    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas> by clearing the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw lines
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
