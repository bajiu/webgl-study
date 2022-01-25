import { initVertexBuffer, setAttributeFromBuffer } from '../lib/webgl_utils';
import { initShaders } from '../lib/InitShaders';
import { Mat4 } from 'cuon-matrix';

const drawLine = () => {

};
// 辅助线
export const drawHelperLine = (canvas: any, xformMatrix: Mat4, distance: number) => {
  const v_shader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    uniform mat4 u_Matrix;
    varying float axis;
    void main() {
      gl_Position = a_Position * u_Matrix;
      gl_PointSize = 2.0;
      v_Color = a_Color;
    }
  
  `;
  const f_shader = `
    precision mediump float;
    varying vec4 v_Color; 
    void main() {
      gl_FragColor = v_Color;
    }
  `;

  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  if (!initShaders(gl, v_shader, f_shader)) {
    console.error('what`s wrong with me?');
    return false;
  }

  const arr = [

    // z = -1
    // 0.0, 0, 0.5, 1.0, 0.0, 0.0, // (x,y) (r,g,b)
    // 1, 0, 0.5, 0.5, 1.0, 0.0,
    // 0.5, 1, 0.5, 0.5, 0.0, 1.0,


    // x = -1
    0, 0, 0, 1.0, 0.0, 0.0, // (x,y) (r,g,b)
    0, 1, 0.5, 0.5, 1.0, 0.0,
    0, 0, 1, 0.5, 0.0, 1.0

    // // x
    // 0,0,0,1,0,0,
    // 0.5,0,0,1,0,0,
    // // y
    // 0,0,0,0,1,0,
    // 0,0.5,0,0,1,0,
    // // z
    // 0,0,0,0,0,1,
    // 0,0,0.5,0,0,1,
  ];

  const vertices = new Float32Array(arr);
  const FSIZE = vertices.BYTES_PER_ELEMENT;

  initVertexBuffer(gl, vertices);

  setAttributeFromBuffer(gl, 'a_Position', 3, FSIZE * 6, 0);
  setAttributeFromBuffer(gl, 'a_Color', 3, FSIZE * 6, FSIZE * 3);

  // xformMatrix.setOrtho(-1, 1, -1, 1, 0, -0.5);
  // xformMatrix.lookAt(0.25, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
  console.log(distance);
  const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_Matrix');
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

};

