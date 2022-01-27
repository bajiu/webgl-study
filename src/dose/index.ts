import {createGl, initVertexBuffer, setAttributeFromBuffer} from "../../lib/webgl_utils";
import {initShaders} from "../../lib/InitShaders";
import {getDoseData} from "../../utils";
import {Mat4} from "cuon-matrix";

const v_shader = `
  attribute vec4 a_Position;
  attribute float a_Value;
  varying float value;
  uniform mat4 u_Matrix;
  void main() {
    if(a_Value > 0.0) {
      gl_Position = vec4(a_Position.x, a_Position.y,a_Position.z, 170.0) * u_Matrix;
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
const gl = createGl()


const render = async () => {

    const program = initShaders(gl, v_shader, f_shader)
    if (!program) {
        console.error('what`s wrong with me?');
    }

// 获取dose数据
    const data = await getDoseData()
    const len = data.length
    const vertices = new Float32Array(data)
    const FSIZE = vertices.BYTES_PER_ELEMENT

    initVertexBuffer(gl, vertices)
    setAttributeFromBuffer(gl, 'a_Position', 3, FSIZE * 4, 0)
    setAttributeFromBuffer(gl, 'a_Value', 1, FSIZE * 4, FSIZE * 3)

    const xformMatrix = new Mat4()
    // xformMatrix.ortho(-2, 2, -2, 2, 0, 0.1)
    // xformMatrix.rotate(45,0,1,0)
    xformMatrix.ortho(-0.5, 0.5, -0.5, 0.5, 0, 0.001)
    // xformMatrix.lookAt(0,0,0.09,0,0,-1,0,1,0)
    const u_xformMatrix = gl.getUniformLocation(program, 'u_Matrix')
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements)


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // drawHelperLine(canvas, xformMatrix, 0)
    gl.drawArrays(gl.POINTS, 0, len / 4)

}

render()

