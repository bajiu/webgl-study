import { initShaders } from '../../lib/InitShaders';

export const drawTriangle = () => {
// vertex shader
  var VERTEX_SHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +

    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = 10.0;\n' +
    '   v_Color = a_Color;\n' +
    '}\n';

// fragment shader
  var FRAGMENT_SHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +

    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
    '}\n';

  var canvas: any = document.getElementById('myCanvas');
  var gl = canvas.getContext('webgl');

  if (!initShaders(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)) {
    alert('Failed to init shaders');
  }

  var vertices = new Float32Array([
    0.0, 0.5, 1.0, 0.0, 0.0, // (x,y) (r,g,b)
    0.0, 0.5, 1.0, 0.0, 0.0, // (x,y) (r,g,b)
    -0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, -0.5, 0.0, 0.0, 1.0
  ]);

  initVertexBuffers(gl, vertices);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  function initVertexBuffers(gl: { createBuffer: () => any; bindBuffer: (arg0: any, arg1: any) => void; ARRAY_BUFFER: any; bufferData: (arg0: any, arg1: any, arg2: any) => void; STATIC_DRAW: any; getAttribLocation: (arg0: any, arg1: string) => any; program: any; vertexAttribPointer: (arg0: any, arg1: number, arg2: any, arg3: boolean, arg4: number, arg5: number) => void; FLOAT: any; enableVertexAttribArray: (arg0: any) => void; }, vertices: Float32Array) {
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');

    var BYTES_PER_ELEMENT = vertices.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 5 * BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 5 * BYTES_PER_ELEMENT, 2 * BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(a_Color);
  }
};
