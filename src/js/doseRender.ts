import { initShaders } from '../lib/InitShaders';
import { getDoseData } from '../utils';
import { initVertexBuffer, setAttributeFromBuffer } from '../lib/webgl_utils';
import { Mat4 } from 'cuon-matrix';
import { drawHelperLine } from '../utils/helper';
const v_shader = `
  attribute vec4 a_Position;
  attribute float a_Value;
  varying float value;
  uniform mat4 u_Matrix;
  void main() {
    if(a_Value > 0.0) {
      gl_Position = a_Position * u_Matrix;
      gl_PointSize = 3.0;
      value = a_Value;
    }
  }
`;

const f_shader = `
  precision mediump float;
  varying float value; 
  void main() {
    if (value > 30.0) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
      }
  }
`;
// 全局数据
const canvas: any = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
let vertices: Float32Array = new Float32Array()
const FSIZE = vertices.BYTES_PER_ELEMENT
let len = 0

export const doseRender = async () => {
  // 初始化
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  if (!initShaders(gl, v_shader, f_shader)) {
    console.error('what`s wrong with me?');
    return false;
  }
  // 获取dose数据
  const data = await getDoseData()
  len = data.length


  vertices = new Float32Array(data)

  initVertexBuffer(gl, vertices)
  setAttributeFromBuffer(gl, 'a_Position', 3, FSIZE * 4, 0)
  setAttributeFromBuffer(gl, 'a_Value', 1, FSIZE * 4, FSIZE * 3)


  // const xformMatrix = new Mat4()

  // xformMatrix.ortho(-1, 1, -1, 1, -1, -0.999999999);
  // xformMatrix.ortho(0, 2, -1, 1, -1, 1);
  // xformMatrix.lookAt(1,1,-0.5,-0.5,-0.5,0.5,0,1,0)
  // xformMatrix.rotate(0,0,0,1)
  // xformMatrix.rotate(90,0,1,0)
  // xformMatrix.setLookAt(1, 0, 0, 0, 0, 0, 0, 1, 0);

  // xformMatrix.lookAt(0,0,0,0,0,1,0,1,0)
  // xformMatrix.ortho(-1, 1, -1, 1, 0, 0.00001);
  // xformMatrix.ortho(-2, 2, -2, 2, -1, 1);
  // const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_Matrix')
  // gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements)

  // gl.drawArrays(gl.POINTS, 0, vertices.length / 4)

  let angle = 0
  // 轴
  let x = 0
  let y = 1
  let z = 0

  let distance = 1
  draw(angle,x,y,z, distance)
  // // 角度旋转
  document.onkeydown = (e:KeyboardEvent) => {
    switch (e.key) {
      case 'w': angle ++; break;
      case 's': angle --; break;
      case 'd': distance+=0.1; break;
      case 'a': distance-=0.1; break;
    }
    draw(angle,x,y,z, distance)
  }
}


const draw = (angle: number, x: number, y: number, z: number,distance: number) => {
  const xformMatrix = new Mat4()
  // console.log(angle,x,y,z);
  xformMatrix.rotate(angle,x,y,z)
  xformMatrix.scale(0.5, 0.5, 0.5)

  console.log(+distance.toFixed(2));

  xformMatrix.lookAt(0,0,0,1,0,0,0,1,0)
  // xformMatrix.lookAt(.5,.5,0,-.5,-.5,-1,0, +distance.toFixed(2),0)
  // drawHelperLine(canvas, xformMatrix)
  // xformMatrix.ortho(-1, 1, -1, 1, 0, 1);
  // xformMatrix.ortho(-1,1, -1, 1, distance, 1 + distance);


  const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_Matrix')
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements)
  //
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // drawHelperLine(canvas, xformMatrix, 0)
  gl.drawArrays(gl.POINTS, 0, len / 4)



}

